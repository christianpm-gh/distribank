# 06 Contrato API > Catálogo de Endpoints

> Prerrequisitos: [Arquitectura NestJS](../04_backend/01_arquitectura_nestjs.md)

Base URL: `http://localhost:3000/api`

## 1. Login

```
POST /api/auth/login
```

| Aspecto | Detalle |
|---------|---------|
| Auth | Pública (sin token) |
| Body | `{ "email": "natalia.ruiz@distribank.mx", "password": "Distribank2025!" }` |
| Response 200 | `{ "access_token": "eyJ...", "customer_id": 27, "role": "customer", "expires_in": 3600 }` |
| Error 401 | `{ "message": "Credenciales inválidas", "statusCode": 401 }` |
| Controller | `src/auth/auth.controller.ts` |

## 2. Perfil del cliente

```
GET /api/customers/:customerId/profile
Authorization: Bearer <token>
```

| Aspecto | Detalle |
|---------|---------|
| Auth | JWT (JwtAuthGuard) |
| Params | `customerId` (number) |
| Response 200 | `{ "customer": { "id": 27, "name": "...", "email": "..." }, "accounts": [{ ... }, { ... }] }` |
| Error 404 | `{ "message": "Cliente no encontrado" }` |
| Controller | `src/customers/customers.controller.ts` |

## 3. Listar tarjetas

```
GET /api/customers/:customerId/cards
Authorization: Bearer <token>
```

| Aspecto | Detalle |
|---------|---------|
| Auth | JWT |
| Response 200 | `Card[]` — array de 4 tarjetas (sin CVV). Incluye `account_number` y `account_type` del JOIN. |
| Controller | `src/cards/cards.controller.ts` |

## 4. Toggle estado de tarjeta

```
PATCH /api/cards/:cardId/toggle
Authorization: Bearer <token>
Body: { "new_status": "ACTIVE" | "BLOCKED" }
```

| Aspecto | Detalle |
|---------|---------|
| Auth | JWT |
| Response 200 | Card actualizada |
| Error 404 | `"Tarjeta no encontrada"` |
| Error 409 | `"No fue posible actualizar el estado de la tarjeta. Intenta de nuevo."` |
| Controller | `src/cards/cards.controller.ts` |

## 5. Transacciones por cuenta

```
GET /api/accounts/:accountId/transactions
Authorization: Bearer <token>
```

| Aspecto | Detalle |
|---------|---------|
| Auth | JWT |
| Params | `accountId` (number) |
| Response 200 | `Transaction[]` — incluye campos calculados `rol_cuenta` y `counterpart_account` |
| Controller | `src/transactions/transactions.controller.ts` |

## 6. Detalle de transacción

```
GET /api/transactions/:uuid
Authorization: Bearer <token>
```

| Aspecto | Detalle |
|---------|---------|
| Auth | JWT |
| Params | `uuid` (string, UUID) |
| Response 200 | `TransactionDetail` — transaction + from_account + to_account + card? + log_events |
| Error 404 | `"Transacción no encontrada"` |
| Controller | `src/transactions/transactions.controller.ts` |
| Nota | `rol_cuenta` hardcodeado como `'ORIGEN'` (limitación conocida) |

## 7. Crear transferencia

```
POST /api/transfers
Authorization: Bearer <token>
Body: {
  "transaction_uuid": "uuid-v4",
  "from_account_id": 27,
  "to_account_number": "DISTCHK0000000018",
  "amount": 1000,
  "description": "Pago renta"
}
```

| Aspecto | Detalle |
|---------|---------|
| Auth | JWT |
| Response 201 | `{ "transaction_uuid": "...", "status": "COMPLETED" \| "ROLLED_BACK", "initiated_at": "..." }` |
| Error 400 | `"Cuenta origen no encontrada"`, `"Saldo insuficiente..."`, `"Cuenta destino no encontrada"`, `"La cuenta origen y destino no pueden ser la misma"` |
| Controller | `src/transfers/transfers.controller.ts` |
| Idempotencia | Si `transaction_uuid` ya existe, retorna resultado existente sin re-ejecutar |

## Documentos relacionados

- [Flujos de secuencia](02_flujos_secuencia.md) — diagramas de interacción
- [Tipos compartidos](03_tipos_compartidos.md) — mapeo de tipos
- [Manejo de errores](04_manejo_errores.md) — todos los códigos de error
