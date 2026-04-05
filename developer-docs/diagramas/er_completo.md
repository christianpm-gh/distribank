# Diagrama Entidad-Relación

```mermaid
erDiagram
    customers ||--o| customer_accounts : "tiene"
    customer_accounts |o--|| accounts : "checking_account"
    customer_accounts |o--|| accounts : "credit_account"
    accounts ||--o{ cards : "tiene"
    accounts ||--o{ transactions : "from_account"
    accounts ||--o{ transactions : "to_account"
    cards ||--o{ transactions : "usada_en"
    transactions ||--o{ transaction_log : "genera"

    customers {
        BigInt id PK "autoincrement"
        VarChar100 name
        VarChar100 curp UK
        VarChar100 email UK "nullable"
        VarChar100 password "bcrypt hash"
        DateTime created_at "default now()"
    }

    customer_accounts {
        BigInt customer_id PK_FK "→ customers.id"
        BigInt checking_account_id FK_UK "→ accounts.id, nullable"
        BigInt credit_account_id FK_UK "→ accounts.id, nullable"
    }

    accounts {
        BigInt id PK "autoincrement"
        VarChar20 account_number UK "DIST(CHK|CRD)dddddddddd"
        VarChar10 account_type "CHECKING | CREDIT"
        Decimal15_2 balance "default 0"
        Decimal15_2 credit_limit "nullable, solo CREDIT"
        Decimal15_2 available_credit "nullable, solo CREDIT"
        Decimal15_2 overdraft_limit "nullable, solo CHECKING"
        VarChar10 status "default ACTIVE"
        BigInt week_transactions "default 0"
        DateTime created_at "default now()"
        DateTime last_limit_increase_at "nullable"
    }

    cards {
        BigInt id PK "autoincrement"
        BigInt account_id FK "→ accounts.id"
        VarChar16 card_number UK
        VarChar10 card_type "DEBIT | CREDIT"
        VarChar4 cvv "nunca expuesto en API"
        Date expiration_date "formato YYYY-MM"
        VarChar10 status "default ACTIVE"
        Decimal15_2 daily_limit "nullable"
        DateTime issued_at "default now()"
    }

    transactions {
        BigInt id PK "autoincrement"
        UUID transaction_uuid UK "default uuid()"
        BigInt from_account_id FK "→ accounts.id"
        BigInt to_account_id FK "→ accounts.id"
        BigInt card_id FK "→ cards.id, nullable"
        Decimal15_2 amount
        VarChar20 transaction_type "TRANSFER | PURCHASE | DEPOSIT"
        VarChar15 status "default PENDING"
        DateTime initiated_at "default now()"
        DateTime completed_at "nullable"
    }

    transaction_log {
        BigInt id PK "autoincrement"
        BigInt transaction_id FK "→ transactions.id"
        VarChar30 event_type "INITIATED | DEBIT_APPLIED | ..."
        Json details "nullable, contiene node_id"
        DateTime created_at "default now()"
    }
```

## Notas

- **customer_accounts** es tabla puente 1:1 — cada cliente tiene exactamente una cuenta de cheques y una de crédito
- **accounts.account_number** sigue el formato regex `/^DIST(CHK|CRD)\d{10}$/`
- **cards.cvv** se almacena pero NUNCA se incluye en respuestas de la API
- **transactions.transaction_uuid** es la clave de idempotencia — generada por el frontend antes de enviar
- **transaction_log.details** es JSONB; contiene `{ node_id: "nodo-a" }` para rastrear en qué nodo ocurrió cada evento
