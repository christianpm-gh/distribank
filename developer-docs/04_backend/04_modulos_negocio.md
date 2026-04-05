# 04 Backend > Módulos de Negocio

> Prerrequisitos: [Arquitectura NestJS](01_arquitectura_nestjs.md), [Módulo Database](03_modulo_database.md)

## CustomersModule

### Endpoint

```
GET /api/customers/:id/profile
Authorization: Bearer <token>
```

### Controller (`src/customers/customers.controller.ts`)

- Guard: `JwtAuthGuard`
- Parsea `id` con `ParseIntPipe`
- Pasa `customerId` desde `req.user`

### Service (`src/customers/customers.service.ts`)

**`getProfile(customerId)`:**

1. Obtiene prisma del nodo: `nodeRouter.getPrismaForCustomer(customerId)`
2. Query: `customers.findUnique` con include `customer_accounts → checking_account + credit_account`
3. Si no existe: `throw NotFoundException('Cliente no encontrado')`
4. Serializa cuentas con `serializeAccount()`:
   - BigInt → `Number()` (id, week_transactions)
   - Decimal → `Number()` (balance, credit_limit, etc.)
   - DateTime → `.toISOString()`
   - Nullables: `?? null`

**Response:**
```json
{
  "customer": { "id": 27, "name": "Natalia Ruiz Castillo", "email": "natalia.ruiz@distribank.mx" },
  "accounts": [
    { "id": 27, "account_number": "DISTCHK0000000027", "account_type": "CHECKING", "balance": 56000, ... },
    { "id": 43, "account_number": "DISTCRD0000000013", "account_type": "CREDIT", "balance": 12000, ... }
  ]
}
```

**Nota:** El balance de la cuenta CREDIT se retorna **positivo** (12000 = adeuda $12K). Los mocks MSW del frontend lo devuelven como **negativo** (-12000). Esta inconsistencia es conocida.

---

## CardsModule

### Endpoints

```
GET /api/customers/:id/cards
Authorization: Bearer <token>
```

```
PATCH /api/cards/:id/toggle
Authorization: Bearer <token>
Body: { "new_status": "ACTIVE" | "BLOCKED" }
```

### Service (`src/cards/cards.service.ts`)

**`getCards(customerId)`:**

1. Busca `customer_accounts` para obtener IDs de cuenta
2. Query: `cards.findMany` donde `account_id IN [checking_id, credit_id]`
3. Include: `account` (para obtener account_number y account_type)
4. Ordena: por account_type ASC, luego por issued_at ASC
5. Serializa: BigInt/Decimal → Number, expiration_date → `toISOString().slice(0, 7)` (formato "YYYY-MM")
6. **CVV nunca se incluye** en la respuesta

**`toggleCard(customerId, cardId, newStatus)`:**

1. Busca card por ID, include account
2. Si no existe: `throw NotFoundException('Tarjeta no encontrada')`
3. Valida transición: si `newStatus = 'BLOCKED'`, espera que el estado actual sea `'ACTIVE'`, y viceversa
4. Si transición inválida: `throw ConflictException('No fue posible actualizar...')`
5. Update card status
6. Retorna card serializada

---

## TransactionsModule

### Endpoints

```
GET /api/accounts/:id/transactions
Authorization: Bearer <token>
```

```
GET /api/transactions/:uuid
Authorization: Bearer <token>
```

### Service (`src/transactions/transactions.service.ts`)

**`getByAccount(customerId, accountId)`:**

1. Query: `transactions.findMany` donde `from_account_id = accountId OR to_account_id = accountId`
2. Include: `from_account` y `to_account` (solo account_number)
3. Ordena: `initiated_at DESC`
4. **Calcula campos dinámicos:**
   - `rol_cuenta`: `isOrigin ? 'ORIGEN' : 'DESTINO'` (basado en `from_account_id === accountId`)
   - `counterpart_account`: número de la cuenta contraria

**`getDetail(customerId, uuid)`:**

1. Query: `transactions.findUnique` por `transaction_uuid`
2. Include: from_account, to_account, card, transaction_log (ordenado por created_at ASC)
3. Si no existe: `throw NotFoundException('Transacción no encontrada')`
4. Log events se transforman: `created_at → occurred_at`, `details.node_id → node_id`

**Limitación conocida:** En `getDetail()` línea 67, `isOrigin` está hardcodeado como `true`. Esto significa que `rol_cuenta` siempre es `'ORIGEN'` en el detalle, independientemente de la cuenta desde la cual se consulta.

**Otra limitación:** `description` se retorna como `null` en ambos métodos (líneas 36 y 82), aunque la transacción pueda tener description en la BD.

## Documentos relacionados

- [Transferencias SAGA](05_modulo_transfers_saga.md) — el módulo más complejo
- [Catálogo de endpoints](../06_contrato_api/01_catalogo_endpoints.md) — todos los endpoints con request/response
- [Serialización de respuestas](07_serializacion_respuestas.md) — conversión de tipos
