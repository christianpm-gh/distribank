# 05 Base de Datos > Diccionario de Datos

> Prerrequisitos: [Esquema ER](01_esquema_er.md)

Fuente: `packages/backend/prisma/schema.prisma`

## customers

| Columna | Tipo Prisma | Tipo PostgreSQL | Constraints | Descripción |
|---------|-------------|-----------------|-------------|-------------|
| `id` | BigInt | BIGSERIAL | PK, autoincrement | Identificador del cliente |
| `name` | String | VARCHAR(100) | NOT NULL | Nombre completo |
| `curp` | String | VARCHAR(100) | UNIQUE, NOT NULL | Clave Única de Registro de Población (México) |
| `email` | String? | VARCHAR(100) | UNIQUE, nullable | Correo electrónico (login) |
| `password` | String | VARCHAR(100) | NOT NULL | Hash bcrypt (10 salt rounds) |
| `created_at` | DateTime | TIMESTAMP | default now() | Fecha de creación |

## accounts

| Columna | Tipo Prisma | Tipo PostgreSQL | Constraints | Descripción |
|---------|-------------|-----------------|-------------|-------------|
| `id` | BigInt | BIGSERIAL | PK, autoincrement | Identificador de cuenta |
| `account_number` | String | VARCHAR(20) | UNIQUE, NOT NULL | Formato: `DIST(CHK\|CRD)\d{10}` |
| `account_type` | String | VARCHAR(10) | NOT NULL | `CHECKING` o `CREDIT` |
| `balance` | Decimal | DECIMAL(15,2) | default 0 | Saldo. CHECKING: positivo. CREDIT: monto adeudado. |
| `credit_limit` | Decimal? | DECIMAL(15,2) | nullable | Solo CREDIT: límite de crédito |
| `available_credit` | Decimal? | DECIMAL(15,2) | nullable | Solo CREDIT: crédito disponible |
| `overdraft_limit` | Decimal? | DECIMAL(15,2) | nullable | Solo CHECKING: límite de sobregiro |
| `status` | String | VARCHAR(10) | default 'ACTIVE' | `ACTIVE`, `INACTIVE`, `FROZEN`, `CLOSED` |
| `week_transactions` | BigInt | BIGINT | default 0 | Conteo de transacciones en la semana (para VIP) |
| `created_at` | DateTime | TIMESTAMP | default now() | Fecha de apertura |
| `last_limit_increase_at` | DateTime? | TIMESTAMP | nullable | Último incremento de límite |

**Regla VIP:** `week_transactions >= 3` en cualquier cuenta ACTIVE dispara el badge VIP en el frontend.

**Nota sobre `balance` en CREDIT:** En la BD (seed), se almacena como positivo (ej: 12000 = adeuda $12K). En los mocks MSW del frontend se devuelve como negativo (-12000). El backend real devuelve positivo.

## customer_accounts

| Columna | Tipo Prisma | Tipo PostgreSQL | Constraints | Descripción |
|---------|-------------|-----------------|-------------|-------------|
| `customer_id` | BigInt | BIGINT | PK, FK → customers.id | ID del cliente |
| `checking_account_id` | BigInt? | BIGINT | UNIQUE, nullable, FK → accounts.id | Cuenta de cheques |
| `credit_account_id` | BigInt? | BIGINT | UNIQUE, nullable, FK → accounts.id | Cuenta de crédito |

Tabla puente 1:1. Cada cliente tiene una cuenta de cada tipo.

## cards

| Columna | Tipo Prisma | Tipo PostgreSQL | Constraints | Descripción |
|---------|-------------|-----------------|-------------|-------------|
| `id` | BigInt | BIGSERIAL | PK, autoincrement | ID de tarjeta |
| `account_id` | BigInt | BIGINT | FK → accounts.id | Cuenta asociada |
| `card_number` | String | VARCHAR(16) | UNIQUE, NOT NULL | Número completo (16 dígitos) |
| `card_type` | String | VARCHAR(10) | NOT NULL | `DEBIT` o `CREDIT` |
| `cvv` | String | VARCHAR(4) | NOT NULL | Código de seguridad — **NUNCA expuesto en API** |
| `expiration_date` | DateTime | DATE | NOT NULL | Fecha de vencimiento. Frontend muestra como "YYYY-MM" |
| `status` | String | VARCHAR(10) | default 'ACTIVE' | `ACTIVE`, `BLOCKED`, `EXPIRED`, `CANCELLED` |
| `daily_limit` | Decimal? | DECIMAL(15,2) | nullable | Límite diario de operaciones |
| `issued_at` | DateTime | TIMESTAMP | default now() | Fecha de emisión |

## transactions

| Columna | Tipo Prisma | Tipo PostgreSQL | Constraints | Descripción |
|---------|-------------|-----------------|-------------|-------------|
| `id` | BigInt | BIGSERIAL | PK, autoincrement | ID de transacción |
| `transaction_uuid` | String | UUID | UNIQUE, default uuid() | Clave de idempotencia (generada por frontend) |
| `from_account_id` | BigInt | BIGINT | FK → accounts.id | Cuenta origen |
| `to_account_id` | BigInt | BIGINT | FK → accounts.id | Cuenta destino |
| `card_id` | BigInt? | BIGINT | FK → cards.id, nullable | Tarjeta usada (solo PURCHASE) |
| `amount` | Decimal | DECIMAL(15,2) | NOT NULL | Monto de la operación |
| `transaction_type` | String | VARCHAR(20) | NOT NULL | `TRANSFER`, `PURCHASE`, `DEPOSIT` |
| `status` | String | VARCHAR(15) | default 'PENDING' | `PENDING`, `COMPLETED`, `FAILED`, `ROLLED_BACK` |
| `initiated_at` | DateTime | TIMESTAMP | default now() | Inicio de la operación |
| `completed_at` | DateTime? | TIMESTAMP | nullable | Fin de la operación (null si PENDING/FAILED) |

**Campos calculados** (no existen en la BD, se computan en el backend):
- `rol_cuenta`: `'ORIGEN'` o `'DESTINO'` — según si `from_account_id` o `to_account_id` coincide con la cuenta consultada
- `counterpart_account`: número de la cuenta contraria

## transaction_log

| Columna | Tipo Prisma | Tipo PostgreSQL | Constraints | Descripción |
|---------|-------------|-----------------|-------------|-------------|
| `id` | BigInt | BIGSERIAL | PK, autoincrement | ID del evento |
| `transaction_id` | BigInt | BIGINT | FK → transactions.id | Transacción asociada |
| `event_type` | String | VARCHAR(30) | NOT NULL | Tipo de evento (ver abajo) |
| `details` | Json? | JSONB | nullable | Metadatos: `{ node_id: "nodo-a" }` |
| `created_at` | DateTime | TIMESTAMP | default now() | Momento del evento |

**Tipos de evento:**

| event_type | Significado |
|-----------|-------------|
| `INITIATED` | Transacción creada |
| `DEBIT_APPLIED` | Débito aplicado a cuenta origen |
| `CREDIT_APPLIED` | Crédito aplicado a cuenta destino |
| `COMPLETED` | Transacción finalizada exitosamente |
| `FAILED` | Error en nodo destino |
| `COMPENSATED` | Compensación aplicada (rollback del débito) |

## Documentos relacionados

- [Esquema ER](01_esquema_er.md)
- [Distribución de nodos](03_distribucion_nodos.md)
- [Tipos compartidos](../06_contrato_api/03_tipos_compartidos.md) — mapeo BD ↔ DTO ↔ TypeScript
