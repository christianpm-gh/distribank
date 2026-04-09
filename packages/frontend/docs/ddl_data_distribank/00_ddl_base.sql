-- =============================================================================
-- DistriBank — DDL Base (Fase Distribuida)
-- Aplicar en: Nodo A, Nodo B, Nodo C (schema public)
-- SGBD: PostgreSQL 15+
-- Criterio de partición: customer_id % 3
--   Nodo A → customer_id % 3 = 0
--   Nodo B → customer_id % 3 = 1
--   Nodo C → customer_id % 3 = 2  (Supabase — también aloja schema VIP)
-- =============================================================================
-- NOTA DISTRIBUIDA: La FK fk_transactions_to_account sobre to_account_id
-- se mantiene aquí porque los datos de seed son intra-nodo.
-- En producción, las transacciones cross-nodo (origen y destino en nodos
-- distintos) requieren eliminar o deferir esta FK, delegando la integridad
-- referencial al coordinador de transacciones distribuidas (2PC/SAGA).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- -----------------------------------------------------------------------------
-- TABLA: customers
-- Particionada por customer_id % 3. Cada nodo almacena su subconjunto.
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    curp        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100),
    password    VARCHAR(100)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_customers_curp   UNIQUE (curp),
    CONSTRAINT uq_customers_email  UNIQUE (email)
);

COMMENT ON TABLE customers IS
    'Particionada por customer_id % 3. Cada nodo almacena su subconjunto de clientes.';


-- -----------------------------------------------------------------------------
-- TABLA: accounts
-- Cada cuenta pertenece al cliente propietario; se almacena en su nodo.
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

    CONSTRAINT uq_accounts_account_number
        UNIQUE (account_number),

    CONSTRAINT chk_accounts_account_type
        CHECK (account_type IN ('CHECKING', 'CREDIT')),

    CONSTRAINT chk_accounts_status
        CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),

    CONSTRAINT chk_accounts_balance_non_negative
        CHECK (balance >= 0 OR account_type = 'CREDIT'),

    CONSTRAINT chk_accounts_type_fields
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
    'Cuentas CHECKING y CREDIT. Co-ubicadas en el nodo del cliente propietario.';


-- -----------------------------------------------------------------------------
-- TABLA: customer_accounts
-- Tabla puente. Sigue al cliente: mismo nodo que customers.
-- -----------------------------------------------------------------------------
CREATE TABLE customer_accounts (
    customer_id         BIGINT  NOT NULL,
    checking_account_id BIGINT,
    credit_account_id   BIGINT,

    CONSTRAINT pk_customer_accounts
        PRIMARY KEY (customer_id),

    CONSTRAINT fk_customer_accounts_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_customer_accounts_checking
        FOREIGN KEY (checking_account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_customer_accounts_credit
        FOREIGN KEY (credit_account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_customer_accounts_at_least_one
        CHECK (checking_account_id IS NOT NULL OR credit_account_id IS NOT NULL),

    CONSTRAINT uq_customer_accounts_checking
        UNIQUE (checking_account_id),

    CONSTRAINT uq_customer_accounts_credit
        UNIQUE (credit_account_id)
);

COMMENT ON TABLE customer_accounts IS
    'Tabla puente 1-a-1. Co-ubicada con customers en el mismo nodo.';


-- -----------------------------------------------------------------------------
-- TABLA: cards
-- Co-ubicada con la cuenta a la que pertenece.
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

    CONSTRAINT uq_cards_card_number
        UNIQUE (card_number),

    CONSTRAINT fk_cards_account
        FOREIGN KEY (account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_cards_card_type
        CHECK (card_type IN ('DEBIT', 'CREDIT')),

    CONSTRAINT chk_cards_status
        CHECK (status IN ('ACTIVE', 'BLOCKED', 'EXPIRED', 'CANCELLED'))
);

COMMENT ON TABLE cards IS
    'Tarjetas físicas y virtuales. Co-ubicadas con la cuenta propietaria.';


-- -----------------------------------------------------------------------------
-- TABLA: transactions
-- Se almacena en el nodo del cliente propietario de from_account.
-- FK sobre to_account_id se mantiene para datos intra-nodo del seed.
-- En transacciones cross-nodo, esta FK debe eliminarse o gestionarse
-- mediante un mecanismo de transacciones distribuidas (2PC / SAGA).
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

    CONSTRAINT uq_transactions_uuid
        UNIQUE (transaction_uuid),

    CONSTRAINT fk_transactions_from_account
        FOREIGN KEY (from_account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Para datos intra-nodo del seed. Eliminar en despliegue distribuido real
    -- si se requiere soporte de transacciones cross-nodo a nivel DDL.
    CONSTRAINT fk_transactions_to_account
        FOREIGN KEY (to_account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_transactions_card
        FOREIGN KEY (card_id)
        REFERENCES cards (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_transactions_amount_positive
        CHECK (amount > 0),

    CONSTRAINT chk_transactions_different_accounts
        CHECK (from_account_id <> to_account_id),

    CONSTRAINT chk_transactions_type
        CHECK (transaction_type IN ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PURCHASE')),

    CONSTRAINT chk_transactions_status
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'))
);

COMMENT ON TABLE transactions IS
    'Almacenada en el nodo del propietario de from_account. '
    'transaction_uuid garantiza idempotencia para SAGA / 2PC.';


-- -----------------------------------------------------------------------------
-- TABLA: transaction_log
-- Co-ubicada con su transacción propietaria (fragmentación derivada).
-- -----------------------------------------------------------------------------
CREATE TABLE transaction_log (
    id             BIGSERIAL   PRIMARY KEY,
    transaction_id BIGINT      NOT NULL,
    event_type     VARCHAR(30) NOT NULL,
    details        JSONB,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transaction_log_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_transaction_log_event_type
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
    'Event log inmutable. Fragmentación derivada de transactions. '
    'Co-ubicado con la transacción propietaria.';


-- -----------------------------------------------------------------------------
-- TRIGGERS
-- -----------------------------------------------------------------------------

-- Trigger 1: coherencia card_type ↔ account_type
CREATE OR REPLACE FUNCTION fn_cards_validate_type_match()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_account_type accounts.account_type%TYPE;
BEGIN
    SELECT account_type INTO v_account_type
    FROM accounts WHERE id = NEW.account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'cards: account_id=% no existe en accounts', NEW.account_id;
    END IF;

    IF (NEW.card_type = 'DEBIT'  AND v_account_type <> 'CHECKING') OR
       (NEW.card_type = 'CREDIT' AND v_account_type <> 'CREDIT')
    THEN
        RAISE EXCEPTION
            'cards: card_type=% incompatible con account_type=% (account_id=%)',
            NEW.card_type, v_account_type, NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cards_validate_type_match
BEFORE INSERT OR UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION fn_cards_validate_type_match();


-- Trigger 2: card_id pertenece a from_account_id en transactions
CREATE OR REPLACE FUNCTION fn_transactions_validate_card_ownership()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_card_account_id cards.account_id%TYPE;
BEGIN
    IF NEW.card_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT account_id INTO v_card_account_id
    FROM cards WHERE id = NEW.card_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'transactions: card_id=% no existe en cards', NEW.card_id;
    END IF;

    IF v_card_account_id <> NEW.from_account_id THEN
        RAISE EXCEPTION
            'transactions: card_id=% pertenece a account_id=%, no a from_account_id=%',
            NEW.card_id, v_card_account_id, NEW.from_account_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transactions_validate_card_ownership
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION fn_transactions_validate_card_ownership();


-- -----------------------------------------------------------------------------
-- ÍNDICES
-- -----------------------------------------------------------------------------

CREATE INDEX idx_customers_email             ON customers (email);

CREATE INDEX idx_accounts_status             ON accounts (status);
CREATE INDEX idx_accounts_week_transactions  ON accounts (week_transactions);
CREATE INDEX idx_accounts_last_increase      ON accounts (last_limit_increase_at);

CREATE INDEX idx_customer_accounts_checking  ON customer_accounts (checking_account_id);
CREATE INDEX idx_customer_accounts_credit    ON customer_accounts (credit_account_id);

CREATE INDEX idx_cards_account_id            ON cards (account_id);
CREATE INDEX idx_cards_status                ON cards (status);
CREATE INDEX idx_cards_expiration            ON cards (expiration_date, status);

CREATE INDEX idx_transactions_from_account   ON transactions (from_account_id);
CREATE INDEX idx_transactions_to_account     ON transactions (to_account_id);
CREATE INDEX idx_transactions_card_id        ON transactions (card_id);
CREATE INDEX idx_transactions_status_time    ON transactions (status, initiated_at);

CREATE INDEX idx_transaction_log_txn         ON transaction_log (transaction_id, created_at);
CREATE INDEX idx_transaction_log_event_type  ON transaction_log (event_type);
CREATE INDEX idx_transaction_log_created_at  ON transaction_log (created_at);

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transactions_to_account;