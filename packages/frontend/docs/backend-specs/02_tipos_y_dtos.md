# Tipos del Frontend → DTOs del Backend

Este documento mapea los tipos TypeScript del frontend (`src/types/api.types.ts`) a DTOs de NestJS con decoradores `class-validator`.

---

## Autenticación

### Frontend type
```typescript
type LoginRequest = { email: string; password: string }
type AuthResponse = { access_token: string; customer_id: number; role: string; expires_in: number }
```

### NestJS DTO
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Ingresa un email válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  password: string;
}
```

---

## Cuentas

### Frontend type
```typescript
type AccountType = 'CHECKING' | 'CREDIT'
type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED'

type Account = {
  id: number
  account_number: string
  account_type: AccountType
  balance: number
  credit_limit?: number
  available_credit?: number
  overdraft_limit?: number
  status: AccountStatus
  week_transactions: number
  created_at: string
  last_limit_increase_at?: string
}
```

### Notas para Prisma
```prisma
model accounts {
  id                     BigInt    @id @default(autoincrement())
  account_number         String    @unique @db.VarChar(20)
  account_type           String    @db.VarChar(10)  // 'CHECKING' | 'CREDIT'
  balance                Decimal   @default(0) @db.Decimal(15, 2)
  credit_limit           Decimal?  @db.Decimal(15, 2)
  available_credit       Decimal?  @db.Decimal(15, 2)
  overdraft_limit        Decimal?  @db.Decimal(15, 2)
  last_limit_increase_at DateTime?
  status                 String    @default("ACTIVE") @db.VarChar(10)
  week_transactions      BigInt    @default(0)
  created_at             DateTime  @default(now())
}
```

**Nota sobre `balance` en CREDIT:** En la BD es un valor positivo que representa la deuda. El frontend recibe el valor como negativo (ej: -12000). El backend debe devolver el balance como negativo para cuentas CREDIT: `balance * -1` en la serialización, o almacenarlo negativo directamente.

> **Verificar DDL:** En `00_ddl_base.sql` el CHECK es `balance >= 0 OR account_type = 'CREDIT'`. El frontend espera `balance` negativo para CREDIT. Definir la convención y ser consistente.

---

## Tarjetas

### Frontend type
```typescript
type CardType = 'DEBIT' | 'CREDIT'
type CardStatus = 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'CANCELLED'

type Card = {
  id: number
  card_number: string
  card_type: CardType
  expiration_date: string    // "YYYY-MM"
  status: CardStatus
  daily_limit: number
  account_id: number
  account_number: string     // JOIN con accounts
  account_type: AccountType  // JOIN con accounts
}
```

### NestJS DTO — Toggle
```typescript
import { IsIn, IsString } from 'class-validator';

export class ToggleCardDto {
  @IsString()
  @IsIn(['ACTIVE', 'BLOCKED'], { message: 'Estado inválido' })
  new_status: 'ACTIVE' | 'BLOCKED';
}
```

### Notas
- `card_number` se devuelve completo; el frontend lo enmascara
- `cvv` NUNCA se incluye en ninguna respuesta
- `account_number` y `account_type` vienen de un JOIN con `accounts`
- `expiration_date` se almacena como `DATE` en DB pero se serializa como `"YYYY-MM"`

---

## Transacciones

### Frontend type
```typescript
type TransactionType = 'TRANSFER' | 'PURCHASE' | 'DEPOSIT'
type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'ROLLED_BACK'
type TransactionRole = 'ORIGEN' | 'DESTINO'

type Transaction = {
  id: number
  transaction_uuid: string
  from_account_id: number
  to_account_id: number
  amount: number
  transaction_type: TransactionType
  status: TransactionStatus
  description?: string
  card_id?: number
  initiated_at: string
  completed_at?: string
  rol_cuenta: TransactionRole       // Calculado
  counterpart_account: string       // Calculado
}
```

### Campos calculados (no almacenados)
- `rol_cuenta`: se calcula según qué cuenta solicitó el historial
- `counterpart_account`: se resuelve con JOIN a `accounts`

Estos campos **no** existen en la tabla `transactions`. El backend los calcula al serializar.

---

## Transaction Log Events

### Frontend type
```typescript
type LogEventType = 'INITIATED' | 'DEBIT_APPLIED' | 'CREDIT_APPLIED' | 'COMPLETED' | 'COMPENSATED' | 'FAILED'

type TransactionLogEvent = {
  id: number
  event_type: LogEventType
  occurred_at: string
  node_id: string
}
```

### Notas
- El campo `details` (JSON) de `transaction_log` **no se expone** al rol Cliente
- Solo se envían `id`, `event_type`, `occurred_at`, `node_id`
- El rol Soporte (futuro) sí accede a `details`

---

## Detalle de transacción

### Frontend type
```typescript
type TransactionDetail = {
  transaction: Transaction
  from_account: { account_number: string; account_type: AccountType }
  to_account: { account_number: string; account_type: AccountType }
  card?: { card_number: string }
  log_events: TransactionLogEvent[]
}
```

Este es un response compuesto. El backend lo construye con:
1. Query a `transactions` por UUID
2. JOINs a `accounts` para from/to
3. JOIN opcional a `cards` si `card_id IS NOT NULL`
4. Query a `transaction_log` filtrado por `transaction_id`

---

## Transferencia

### Frontend types
```typescript
type TransferRequest = {
  transaction_uuid: string
  from_account_id: number
  to_account_number: string
  amount: number
  description?: string
}

type TransferResponse = {
  transaction_uuid: string
  status: TransactionStatus
  initiated_at: string
}
```

### NestJS DTO
```typescript
import { IsUUID, IsNumber, IsString, IsOptional, Matches, Min, MaxLength } from 'class-validator';

export class CreateTransferDto {
  @IsUUID('4')
  transaction_uuid: string;

  @IsNumber()
  from_account_id: number;

  @IsString()
  @Matches(/^DIST(CHK|CRD)\d{10}$/, { message: 'Formato de cuenta inválido' })
  to_account_number: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  description?: string;
}
```

---

## Perfil del cliente

### Frontend type
```typescript
type Customer = { id: number; name: string; email: string }
type CustomerProfile = { customer: Customer; accounts: Account[] }
```

### Notas
- `Customer` no incluye `password`, `curp`, ni `created_at`
- Solo se exponen `id`, `name`, `email`
- Las cuentas vienen como array (máximo 2: una CHECKING, una CREDIT)
