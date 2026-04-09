# Catálogo de Endpoints

Todos los endpoints se sirven bajo el prefijo `/api`. Los endpoints protegidos requieren `Authorization: Bearer <token>`.

---

## AUTH

### POST `/api/auth/login`

**Acceso:** Público (sin token)

**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuestas:**

| Status | Body | Descripción |
|---|---|---|
| 200 | `{ access_token, customer_id, role, expires_in }` | Login exitoso |
| 401 | `{ message: "Credenciales inválidas" }` | Email o password incorrectos |

**Response 200:**
```json
{
  "access_token": "eyJhbG...",
  "customer_id": 27,
  "role": "customer",
  "expires_in": 3600
}
```

**Notas:**
- `password` se valida contra hash bcrypt en `customers.password`
- `customer_id` se incluye en el payload del JWT
- `role` para este frontend siempre es `"customer"`
- `expires_in` en segundos

---

## PERFIL FINANCIERO

### GET `/api/customers/:customerId/profile`

**Acceso:** Protegido (Bearer token)

**Path params:** `customerId` (number) — debe coincidir con el `customer_id` del JWT

**Respuesta 200:**
```json
{
  "customer": {
    "id": 27,
    "name": "Natalia Ruiz Castillo",
    "email": "natalia.ruiz@distribank.mx"
  },
  "accounts": [
    {
      "id": 27,
      "account_number": "DISTCHK0000000027",
      "account_type": "CHECKING",
      "balance": 56000.00,
      "credit_limit": null,
      "available_credit": null,
      "overdraft_limit": 1500.00,
      "status": "ACTIVE",
      "week_transactions": 8,
      "created_at": "2024-01-08T00:00:00Z",
      "last_limit_increase_at": null
    },
    {
      "id": 43,
      "account_number": "DISTCRD0000000013",
      "account_type": "CREDIT",
      "balance": -12000.00,
      "credit_limit": 20000.00,
      "available_credit": 8000.00,
      "overdraft_limit": null,
      "status": "ACTIVE",
      "week_transactions": 4,
      "created_at": "2024-03-15T00:00:00Z",
      "last_limit_increase_at": "2025-02-10T00:00:00Z"
    }
  ]
}
```

**Respuestas de error:**

| Status | Body | Descripción |
|---|---|---|
| 404 | `{ message: "Cliente no encontrado" }` | customerId no existe |
| 401 | — | Token inválido o expirado |
| 403 | — | customerId no coincide con JWT |

**Implementación backend:**
- Consulta `customers` + `customer_accounts` + `accounts` (JOIN)
- Equivale a la vista `v_perfil_financiero_cliente` del spec
- Filtra por `customer_id` del JWT (nunca confiar en el param del URL si difiere)

---

## TARJETAS

### GET `/api/customers/:customerId/cards`

**Acceso:** Protegido

**Respuesta 200:** `Card[]`

```json
[
  {
    "id": 1,
    "card_number": "4000000000000010",
    "card_type": "DEBIT",
    "expiration_date": "2028-09",
    "status": "ACTIVE",
    "daily_limit": 15000.00,
    "account_id": 27,
    "account_number": "DISTCHK0000000027",
    "account_type": "CHECKING"
  }
]
```

**Notas:**
- El frontend enmascara `card_number` — solo muestra últimos 4 dígitos
- Pero el backend sí devuelve el número completo (el enmascaramiento es responsabilidad del frontend)
- `cvv` **NUNCA** se incluye en la respuesta
- Equivale a la vista `v_tarjetas_cliente`
- Ordenar por `account_type`, `issued_at`

---

### PATCH `/api/cards/:cardId/toggle`

**Acceso:** Protegido

**Request body:**
```json
{
  "new_status": "BLOCKED"
}
```

`new_status` solo puede ser `"ACTIVE"` o `"BLOCKED"`.

**Respuestas:**

| Status | Body | Descripción |
|---|---|---|
| 200 | `Card` (objeto actualizado) | Toggle exitoso |
| 404 | `{ message: "Tarjeta no encontrada" }` | cardId no existe |
| 409 | `{ message: "No fue posible actualizar el estado de la tarjeta. Intenta de nuevo." }` | Transición inválida (ej: EXPIRED → BLOCKED) |

**Transiciones válidas:**
- `ACTIVE` → `BLOCKED` (bloqueo)
- `BLOCKED` → `ACTIVE` (desbloqueo)
- Cualquier otra combinación: 409

**SQL equivalente:**
```sql
UPDATE cards
SET status = :new_status
WHERE id = :card_id
  AND status = CASE
    WHEN :new_status = 'BLOCKED' THEN 'ACTIVE'
    WHEN :new_status = 'ACTIVE'  THEN 'BLOCKED'
  END;
-- Si affected_rows = 0 → 409
```

---

## TRANSACCIONES

### GET `/api/accounts/:accountId/transactions`

**Acceso:** Protegido

**Path params:** `accountId` (number) — ID de la cuenta (no del cliente)

**Respuesta 200:** `Transaction[]`

```json
[
  {
    "id": 4,
    "transaction_uuid": "00000000-0000-4000-8000-000000000004",
    "from_account_id": 27,
    "to_account_id": 18,
    "amount": 12000.00,
    "transaction_type": "TRANSFER",
    "status": "COMPLETED",
    "description": null,
    "card_id": null,
    "initiated_at": "2025-06-04T09:00:00Z",
    "completed_at": "2025-06-04T09:00:04Z",
    "rol_cuenta": "ORIGEN",
    "counterpart_account": "DISTCHK0000000018"
  }
]
```

**Campo `rol_cuenta`:** Calculado por el backend:
```sql
CASE WHEN from_account_id = :account_id THEN 'ORIGEN' ELSE 'DESTINO' END
```

**Campo `counterpart_account`:** El `account_number` de la otra cuenta involucrada.

**Ordenamiento:** `initiated_at DESC` (más recientes primero)

**Notas:**
- La cuenta solicitada puede estar tanto en `from_account_id` como en `to_account_id`
- El backend debe verificar que la cuenta pertenece al cliente autenticado

---

### GET `/api/transactions/:uuid`

**Acceso:** Protegido

**Path params:** `uuid` (string) — `transaction_uuid`

**Respuesta 200:**
```json
{
  "transaction": { /* Transaction object */ },
  "from_account": {
    "account_number": "DISTCHK0000000027",
    "account_type": "CHECKING"
  },
  "to_account": {
    "account_number": "DISTCHK0000000018",
    "account_type": "CHECKING"
  },
  "card": {
    "card_number": "4000000000000017"
  },
  "log_events": [
    {
      "id": 1,
      "event_type": "INITIATED",
      "occurred_at": "2025-06-04T09:00:00Z",
      "node_id": "nodo-a"
    }
  ]
}
```

**Respuesta 404:** `{ message: "Transacción no encontrada" }`

**Notas:**
- `card` es `null` si la transacción no usó tarjeta
- `log_events` incluye los eventos del `transaction_log` **sin** el campo `details` (restringido a rol Soporte)
- El campo `node_id` indica en qué nodo se ejecutó cada paso
- El backend debe verificar que al menos una de las cuentas pertenece al cliente autenticado

---

## TRANSFERENCIAS

### POST `/api/transfers`

**Acceso:** Protegido

**Request body:**
```json
{
  "transaction_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "from_account_id": 27,
  "to_account_number": "DISTCHK0000000018",
  "amount": 12000.00,
  "description": "Pago de renta"
}
```

**Respuestas:**

| Status | Body | Descripción |
|---|---|---|
| 200 | `{ transaction_uuid, status, initiated_at }` | Transferencia iniciada |
| 400 | `{ message: "..." }` | Validación fallida |

**Respuesta 200:**
```json
{
  "transaction_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "initiated_at": "2025-06-10T15:30:00Z"
}
```

El `status` puede ser:
- `"COMPLETED"` — operación intra-nodo exitosa
- `"PENDING"` — operación cross-nodo en proceso
- `"FAILED"` — error en procesamiento
- `"ROLLED_BACK"` — SAGA revertida

**Errores 400 conocidos:**
- `"La cuenta origen y destino no pueden ser la misma"`
- `"Saldo insuficiente"`
- `"Cuenta destino no encontrada"`

**Notas de idempotencia:**
- `transaction_uuid` lo genera el frontend (UUIDv4) antes del submit
- Si el backend recibe un UUID duplicado, debe retornar el estado de la transacción existente sin crear una nueva
- Esto soporta retries seguros en caso de timeout

**Operación backend:**
1. Validar que `from_account_id` pertenece al cliente autenticado
2. Validar formato de `to_account_number` (regex: `DIST(CHK|CRD)\d{10}`)
3. Validar que from ≠ to
4. Verificar saldo suficiente (ver reglas en `03_reglas_negocio.md`)
5. Insertar en `transactions` con status `INITIATED`
6. Insertar primer evento en `transaction_log`
7. Ejecutar SAGA según nodo destino (intra-nodo o cross-nodo)
8. Retornar estado final o `PENDING` si cross-nodo
