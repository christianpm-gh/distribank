# 06 Contrato API > Tipos Compartidos

> Prerrequisitos: [Catálogo de endpoints](01_catalogo_endpoints.md)

## Mapeo de tipos: Frontend ↔ Backend ↔ Base de datos

### Auth

| Frontend (`api.types.ts`) | Backend (DTO/Response) | BD (Prisma) |
|---------------------------|----------------------|-------------|
| `LoginRequest { email, password }` | `LoginDto { @IsEmail email, @MinLength(8) password }` | — |
| `AuthResponse { access_token, customer_id, role, expires_in }` | Objeto literal en `AuthService.login()` | `customers.id`, `customers.password` |

### Customer / Profile

| Frontend | Backend | BD |
|----------|---------|-----|
| `Customer { id, name, email }` | Serializado en `CustomersService.getProfile()` | `customers { id: BigInt, name, email }` |
| `CustomerProfile { customer, accounts[] }` | Compuesto en `getProfile()` | `customers + customer_accounts + accounts` (JOIN) |

### Account

| Frontend | Backend | BD |
|----------|---------|-----|
| `Account { id, account_number, account_type, balance, credit_limit?, available_credit?, overdraft_limit?, status, week_transactions, created_at, last_limit_increase_at? }` | `serializeAccount()` convierte BigInt/Decimal/DateTime | `accounts { id: BigInt, balance: Decimal(15,2), week_transactions: BigInt, ... }` |
| `AccountType = 'CHECKING' \| 'CREDIT'` | `String @db.VarChar(10)` | VARCHAR(10) |
| `AccountStatus = 'ACTIVE' \| 'INACTIVE' \| 'FROZEN' \| 'CLOSED'` | String | VARCHAR(10) |

**Inconsistencia conocida:** `balance` para CREDIT es positivo en BD/backend (12000 = adeuda $12K), pero negativo en MSW (-12000).

### Card

| Frontend | Backend | BD |
|----------|---------|-----|
| `Card { id, card_number, card_type, expiration_date, status, daily_limit, account_id, account_number, account_type }` | Serializado en `CardsService.getCards()` | `cards` JOIN `accounts` |
| — | **CVV excluido** | `cards.cvv` (VARCHAR) — nunca en respuesta |
| `expiration_date: string` ("YYYY-MM") | `.toISOString().slice(0, 7)` | `DATE` |
| `CardType = 'DEBIT' \| 'CREDIT'` | String | VARCHAR(10) |
| `CardStatus = 'ACTIVE' \| 'BLOCKED' \| 'EXPIRED' \| 'CANCELLED'` | String | VARCHAR(10) |

### Transaction

| Frontend | Backend | BD |
|----------|---------|-----|
| `Transaction { id, transaction_uuid, from_account_id, to_account_id, amount, transaction_type, status, description?, card_id?, initiated_at, completed_at?, rol_cuenta, counterpart_account }` | Serializado en `TransactionsService` | `transactions` + campos calculados |
| `rol_cuenta: TransactionRole` | **Calculado:** `isOrigin ? 'ORIGEN' : 'DESTINO'` | No existe en BD |
| `counterpart_account: string` | **Calculado:** número de cuenta contraria | No existe en BD |
| `description` | **Hardcodeado `null`** (líneas 36, 82) | Existe en schema pero no se lee |

### TransactionDetail

| Frontend | Backend | BD |
|----------|---------|-----|
| `TransactionDetail { transaction, from_account, to_account, card?, log_events[] }` | Compuesto en `getDetail()` | `transactions` + relations |

### TransactionLogEvent

| Frontend | Backend | BD |
|----------|---------|-----|
| `TransactionLogEvent { id, event_type, occurred_at, node_id }` | Mapeado de `transaction_log` | `transaction_log { created_at → occurred_at, details.node_id → node_id }` |
| `LogEventType = 'INITIATED' \| 'DEBIT_APPLIED' \| 'CREDIT_APPLIED' \| 'COMPLETED' \| 'COMPENSATED' \| 'FAILED'` | String | VARCHAR(30) |

### Transfer

| Frontend | Backend | BD |
|----------|---------|-----|
| `TransferRequest { transaction_uuid, from_account_id, to_account_number, amount, description? }` | `CreateTransferDto` con validadores | — |
| `TransferResponse { transaction_uuid, status, initiated_at }` | Objeto literal en `TransfersService.create()` | `transactions` |

## Fuentes

- Frontend types: `packages/frontend/src/types/api.types.ts` (126 líneas)
- Backend DTOs: `packages/backend/src/*/dto/*.dto.ts`
- Prisma schema: `packages/backend/prisma/schema.prisma`

## Documentos relacionados

- [Serialización de respuestas](../04_backend/07_serializacion_respuestas.md) — conversiones BigInt, Decimal, Date
- [Diccionario de datos](../05_base_datos/02_diccionario_datos.md) — tipos de la BD
