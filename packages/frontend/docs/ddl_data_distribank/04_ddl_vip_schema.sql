-- =============================================================================
-- DistriBank — DDL Schema VIP
-- Schema: distribank_vip_customers
-- Nodo: C (Supabase) — además del schema public del Nodo C
-- =============================================================================
-- PROPÓSITO: schema de réplica que consolida todos los clientes clasificados
-- como VIP (suma de week_transactions de cuentas ACTIVE ≥ 3) provenientes
-- de los tres nodos. Sirve como respaldo de alta disponibilidad para
-- operaciones críticas y como punto de failover coordinado por el backend.
--
-- DIFERENCIA RESPECTO AL DDL BASE:
--   La FK fk_transactions_to_account (to_account_id → accounts.id) es
--   ELIMINADA deliberadamente. La réplica consolida transacciones cuya
--   cuenta destino puede no ser VIP y, por tanto, no existir en este schema.
--   La integridad referencial sobre to_account_id es responsabilidad del
--   coordinador de replicación, no de la BD.
--
-- FRECUENCIA DE SINCRONIZACIÓN: cada 6-8 horas.
--   En cada ciclo el predicado VIP se reevalúa: clientes que caen por debajo
--   del umbral son removidos del schema; clientes que superan el umbral son
--   incorporados.
--
-- MODO FAILOVER: cuando el nodo primario de un cliente VIP no responde,
--   el backend redirige escrituras a este schema marcando cada operación
--   con un flag de pendiente de reconciliación. Al recuperarse el primario,
--   un proceso de reconciliación aplica las operaciones en orden cronológico.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear schema VIP. IF NOT EXISTS permite re-ejecución idempotente.
CREATE SCHEMA IF NOT EXISTS distribank_vip_customers;

-- Todas las sentencias posteriores operan sobre este schema.
SET search_path TO distribank_vip_customers;


-- -----------------------------------------------------------------------------
-- TABLA: customers  (réplica de subconjunto VIP)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    curp        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100),
    password    VARCHAR(100)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_vip_customers_curp   UNIQUE (curp),
    CONSTRAINT uq_vip_customers_email  UNIQUE (email)
);

COMMENT ON TABLE customers IS
    'Réplica de clientes VIP consolidados desde los tres nodos. '
    'Predicado VIP: SUM(week_transactions) de cuentas ACTIVE ≥ 3. '
    'Sincronización cada 6-8 horas; entrada y salida dinámica.';


-- -----------------------------------------------------------------------------
-- TABLA: accounts  (réplica de cuentas de clientes VIP)
-- -----------------------------------------------------------------------------
CREATE TABLE accounts (
    id                      BIGSERIAL       PRIMARY KEY,
    account_number          VARCHAR(20)     NOT NULL,
    account_type            VARCHAR(10)     NOT NULL,
    balance                 DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    credit_limit            DECIMAL(15,2),
    available_credit        DECIMAL(15,2),
    overdraft_limit         DECIMAL(15,2),
    last_limit_increase_at  TIMESTAMP,
    status                  VARCHAR(10)     NOT NULL DEFAULT 'ACTIVE',
    week_transactions       BIGINT          DEFAULT 0,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_vip_accounts_account_number
        UNIQUE (account_number),

    CONSTRAINT chk_vip_accounts_account_type
        CHECK (account_type IN ('CHECKING', 'CREDIT')),

    CONSTRAINT chk_vip_accounts_status
        CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),

    CONSTRAINT chk_vip_accounts_balance_non_negative
        CHECK (balance >= 0 OR account_type = 'CREDIT'),

    CONSTRAINT chk_vip_accounts_type_fields
        CHECK (
            (
                account_type = 'CREDIT'
                AND credit_limit       IS NOT NULL
                AND available_credit   IS NOT NULL
                AND overdraft_limit    IS NULL
            )
            OR
            (
                account_type = 'CHECKING'
                AND credit_limit       IS NULL
                AND available_credit   IS NULL
                AND overdraft_limit    IS NOT NULL
            )
        )
);

COMMENT ON TABLE accounts IS
    'Réplica de todas las cuentas (CHECKING y CREDIT) de clientes VIP. '
    'Incluye cuentas de los tres nodos.';


-- -----------------------------------------------------------------------------
-- TABLA: customer_accounts  (réplica de tabla puente VIP)
-- -----------------------------------------------------------------------------
CREATE TABLE customer_accounts (
    customer_id         BIGINT  NOT NULL,
    checking_account_id BIGINT,
    credit_account_id   BIGINT,

    CONSTRAINT pk_vip_customer_accounts
        PRIMARY KEY (customer_id),

    CONSTRAINT fk_vip_ca_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_vip_ca_checking
        FOREIGN KEY (checking_account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_vip_ca_credit
        FOREIGN KEY (credit_account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_vip_ca_at_least_one
        CHECK (checking_account_id IS NOT NULL OR credit_account_id IS NOT NULL),

    CONSTRAINT uq_vip_ca_checking
        UNIQUE (checking_account_id),

    CONSTRAINT uq_vip_ca_credit
        UNIQUE (credit_account_id)
);

COMMENT ON TABLE customer_accounts IS
    'Réplica de la tabla puente. Un cliente VIP mantiene exactamente '
    'una cuenta CHECKING y/o una CREDIT.';


-- -----------------------------------------------------------------------------
-- TABLA: cards  (réplica de tarjetas de cuentas VIP)
-- -----------------------------------------------------------------------------
CREATE TABLE cards (
    id              BIGSERIAL       PRIMARY KEY,
    account_id      BIGINT          NOT NULL,
    card_number     VARCHAR(16)     NOT NULL,
    card_type       VARCHAR(10)     NOT NULL,
    cvv             VARCHAR(4)      NOT NULL,
    expiration_date DATE            NOT NULL,
    status          VARCHAR(10)     NOT NULL DEFAULT 'ACTIVE',
    daily_limit     DECIMAL(15,2),
    issued_at       TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_vip_cards_card_number
        UNIQUE (card_number),

    CONSTRAINT fk_vip_cards_account
        FOREIGN KEY (account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_vip_cards_card_type
        CHECK (card_type IN ('DEBIT', 'CREDIT')),

    CONSTRAINT chk_vip_cards_status
        CHECK (status IN ('ACTIVE', 'BLOCKED', 'EXPIRED', 'CANCELLED'))
);

COMMENT ON TABLE cards IS
    'Réplica de tarjetas asociadas a cuentas de clientes VIP. '
    'Incluye tarjetas titulares y extensiones.';


-- -----------------------------------------------------------------------------
-- TABLA: transactions
-- NOTA CRÍTICA: fk_vip_transactions_to_account es OMITIDA intencionalmente.
-- Las transacciones replicadas pueden tener como destino cuentas de clientes
-- no-VIP que no existen en este schema. La integridad referencial sobre
-- to_account_id la gestiona el coordinador de replicación (backend).
-- La FK sobre from_account_id se mantiene porque los datos fuente de
-- transacciones son siempre cuentas VIP que sí existen en este schema.
-- -----------------------------------------------------------------------------
CREATE TABLE transactions (
    id               BIGSERIAL       PRIMARY KEY,
    transaction_uuid UUID            NOT NULL DEFAULT gen_random_uuid(),
    from_account_id  BIGINT          NOT NULL,
    to_account_id    BIGINT          NOT NULL,
    card_id          BIGINT,
    amount           DECIMAL(15,2)   NOT NULL,
    transaction_type VARCHAR(20)     NOT NULL,
    status           VARCHAR(15)     NOT NULL DEFAULT 'PENDING',
    initiated_at     TIMESTAMP       NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMP,

    CONSTRAINT uq_vip_transactions_uuid
        UNIQUE (transaction_uuid),

    CONSTRAINT fk_vip_transactions_from_account
        FOREIGN KEY (from_account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- fk_vip_transactions_to_account: OMITIDA (ver comentario de tabla)

    CONSTRAINT fk_vip_transactions_card
        FOREIGN KEY (card_id)
        REFERENCES cards (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_vip_transactions_amount_positive
        CHECK (amount > 0),

    CONSTRAINT chk_vip_transactions_different_accounts
        CHECK (from_account_id <> to_account_id),

    CONSTRAINT chk_vip_transactions_type
        CHECK (transaction_type IN ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PURCHASE')),

    CONSTRAINT chk_vip_transactions_status
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'))
);

COMMENT ON TABLE transactions IS
    'Réplica de transacciones originadas en cuentas VIP. '
    'to_account_id puede referenciar cuentas fuera de este schema (no-VIP): '
    'la FK sobre dicha columna es gestionada por el coordinador de replicación.';


-- -----------------------------------------------------------------------------
-- TABLA: transaction_log  (réplica de event log de transacciones VIP)
-- -----------------------------------------------------------------------------
CREATE TABLE transaction_log (
    id             BIGSERIAL   PRIMARY KEY,
    transaction_id BIGINT      NOT NULL,
    event_type     VARCHAR(30) NOT NULL,
    details        JSONB,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vip_transaction_log_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_vip_transaction_log_event_type
        CHECK (event_type IN (
            'INITIATED',
            'DEBIT_APPLIED',
            'CREDIT_APPLIED',
            'COMPLETED',
            'COMPENSATED',
            'FAILED'
        ))
);

COMMENT ON TABLE transaction_log IS
    'Réplica del event log inmutable. Cubre el audit trail completo '
    'de todas las transacciones VIP consolidadas.';


-- -----------------------------------------------------------------------------
-- TRIGGERS  (misma lógica que el DDL base, funciones prefijadas _vip_)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION distribank_vip_customers.fn_vip_cards_validate_type_match()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_account_type distribank_vip_customers.accounts.account_type%TYPE;
BEGIN
    SELECT account_type INTO v_account_type
    FROM distribank_vip_customers.accounts
    WHERE id = NEW.account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'vip_cards: account_id=% no existe en distribank_vip_customers.accounts',
            NEW.account_id;
    END IF;

    IF (NEW.card_type = 'DEBIT'  AND v_account_type <> 'CHECKING') OR
       (NEW.card_type = 'CREDIT' AND v_account_type <> 'CREDIT')
    THEN
        RAISE EXCEPTION
            'vip_cards: card_type=% incompatible con account_type=% (account_id=%)',
            NEW.card_type, v_account_type, NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vip_cards_validate_type_match
BEFORE INSERT OR UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION distribank_vip_customers.fn_vip_cards_validate_type_match();


CREATE OR REPLACE FUNCTION distribank_vip_customers.fn_vip_transactions_validate_card_ownership()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_card_account_id distribank_vip_customers.cards.account_id%TYPE;
BEGIN
    IF NEW.card_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT account_id INTO v_card_account_id
    FROM distribank_vip_customers.cards
    WHERE id = NEW.card_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'vip_transactions: card_id=% no existe en distribank_vip_customers.cards',
            NEW.card_id;
    END IF;

    IF v_card_account_id <> NEW.from_account_id THEN
        RAISE EXCEPTION
            'vip_transactions: card_id=% pertenece a account_id=%, no a from_account_id=%',
            NEW.card_id, v_card_account_id, NEW.from_account_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vip_transactions_validate_card_ownership
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION distribank_vip_customers.fn_vip_transactions_validate_card_ownership();


-- -----------------------------------------------------------------------------
-- ÍNDICES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_vip_customers_email            ON customers (email);

CREATE INDEX idx_vip_accounts_status            ON accounts (status);
CREATE INDEX idx_vip_accounts_week_transactions ON accounts (week_transactions);
CREATE INDEX idx_vip_accounts_last_increase     ON accounts (last_limit_increase_at);

CREATE INDEX idx_vip_ca_checking                ON customer_accounts (checking_account_id);
CREATE INDEX idx_vip_ca_credit                  ON customer_accounts (credit_account_id);

CREATE INDEX idx_vip_cards_account_id           ON cards (account_id);
CREATE INDEX idx_vip_cards_status               ON cards (status);
CREATE INDEX idx_vip_cards_expiration           ON cards (expiration_date, status);

CREATE INDEX idx_vip_transactions_from_account  ON transactions (from_account_id);
CREATE INDEX idx_vip_transactions_to_account    ON transactions (to_account_id);
CREATE INDEX idx_vip_transactions_card_id       ON transactions (card_id);
CREATE INDEX idx_vip_transactions_status_time   ON transactions (status, initiated_at);

CREATE INDEX idx_vip_txlog_txn                  ON transaction_log (transaction_id, created_at);
CREATE INDEX idx_vip_txlog_event_type           ON transaction_log (event_type);
CREATE INDEX idx_vip_txlog_created_at           ON transaction_log (created_at);

-- Restaurar search_path al valor por defecto al terminar.
RESET search_path;
