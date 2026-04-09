# Reglas de Negocio y Validaciones

## 1. Autenticación

- Email debe existir en `customers.email`
- Password se valida contra `customers.password` (bcrypt hash)
- JWT incluye `customer_id` y `role` en el payload
- Token expira según `expires_in` (recomendado: 3600 segundos)

## 2. Aislamiento de datos (invariante de seguridad)

**Regla:** Toda query lleva el `customer_id` del JWT como filtro primario. El backend NUNCA debe confiar en un `customer_id` enviado por el cliente en el body o URL si difiere del JWT.

Validaciones por endpoint:
- `GET /customers/:id/profile` → `:id` debe ser igual a JWT `customer_id`
- `GET /customers/:id/cards` → idem
- `PATCH /cards/:id/toggle` → la tarjeta debe pertenecer a una cuenta del cliente del JWT
- `GET /accounts/:id/transactions` → la cuenta debe pertenecer al cliente del JWT
- `GET /transactions/:uuid` → al menos una cuenta de la transacción debe pertenecer al cliente
- `POST /transfers` → `from_account_id` debe pertenecer al cliente del JWT

## 3. Tarjetas — transiciones de estado

| Estado actual | Puede cambiar a | Notas |
|---|---|---|
| ACTIVE | BLOCKED | Via toggle endpoint |
| BLOCKED | ACTIVE | Via toggle endpoint |
| EXPIRED | — | Solo lectura, sin switch |
| CANCELLED | — | Solo lectura, sin switch |

**Implementación SQL:**
```sql
UPDATE cards SET status = :new_status
WHERE id = :card_id
  AND status = CASE
    WHEN :new_status = 'BLOCKED' THEN 'ACTIVE'
    WHEN :new_status = 'ACTIVE'  THEN 'BLOCKED'
  END;
```
Si `affected_rows = 0` → responder 409 Conflict.

## 4. Transferencias — validación de monto

### Cuenta CHECKING (débito)
```
monto_máximo = balance + overdraft_limit
```
Si `amount > monto_máximo`:
> "Saldo insuficiente. Tienes $X + $Y de sobregiro disponible."

### Cuenta CREDIT (crédito)
```
monto_máximo = available_credit
```
Si `amount > monto_máximo`:
> "Crédito insuficiente. Tienes $X disponibles en tu línea de crédito."

### Validaciones generales
- `amount > 0`
- `from_account_id ≠ to_account_id` (CHECK constraint en tabla `transactions`)
- `to_account_number` debe existir en algún nodo
- Formato: `/^DIST(CHK|CRD)\d{10}$/`
- `description` opcional, máximo 100 caracteres

## 5. Transferencias — idempotencia

El frontend genera `transaction_uuid` (UUIDv4) **antes** del submit.

**Comportamiento esperado:**
1. Si el UUID no existe → crear nueva transacción
2. Si el UUID ya existe → retornar el estado de la transacción existente (sin crear duplicado)
3. Esto soporta retries seguros cuando el usuario reenvía por timeout de red

## 6. Transferencias — ciclo de vida SAGA

### Intra-nodo (origen y destino en el mismo nodo)

```
INITIATED → DEBIT_APPLIED → CREDIT_APPLIED → COMPLETED
```
Todo en una transacción local. Status final: `COMPLETED`.

### Cross-nodo (origen y destino en nodos distintos)

```
Nodo origen: INITIATED → DEBIT_APPLIED
Nodo destino: CREDIT_APPLIED
Coordinador: COMPLETED
```
Status puede quedar en `PENDING` mientras se completa.

### Fallo con compensación

```
INITIATED → DEBIT_APPLIED → FAILED → COMPENSATED
```
El débito se revierte. Status final: `ROLLED_BACK`.

### Eventos del transaction_log

| event_type | Significado | Nodo |
|---|---|---|
| `INITIATED` | Operación creada | Nodo origen |
| `DEBIT_APPLIED` | Débito aplicado a cuenta origen | Nodo origen |
| `CREDIT_APPLIED` | Crédito aplicado a cuenta destino | Nodo destino |
| `COMPLETED` | Ambos lados confirmados | Coordinador |
| `FAILED` | Error en algún paso | Nodo que falló |
| `COMPENSATED` | Reversión aplicada | Nodo origen |

## 7. VIP — lógica de badge

**Criterio:** `week_transactions >= 3` evaluado sobre cada cuenta `ACTIVE` del cliente.

- El frontend evalúa directamente `accounts.week_transactions` del nodo propietario
- El schema `distribank_vip_customers` en Nodo C puede tener retraso de 6-8 horas
- El backend debe devolver `week_transactions` actualizado en tiempo real desde el nodo primario

## 8. Enmascaramiento de datos sensibles

| Campo | Regla |
|---|---|
| `cards.card_number` | Se devuelve completo; el frontend enmascara. Alternativa: enmascarar en backend |
| `cards.cvv` | NUNCA incluir en ninguna respuesta |
| `customers.password` | NUNCA incluir en responses de perfil |
| `customers.curp` | No se expone en el frontend actual |
| `transaction_log.details` | Solo para rol Soporte; excluir en rol Cliente |

## 9. Cuentas — estados y restricciones de UI

| Estado | Transferencias | Tarjetas | Visible en Home |
|---|---|---|---|
| ACTIVE | Sí | Sí | Sí |
| INACTIVE | No | Solo lectura | Sí (badge rojo) |
| FROZEN | No | Solo lectura | Sí (badge azul) |
| CLOSED | No | No | No |

**Nota DDL:** El DDL actual tiene CHECK `status IN ('ACTIVE', 'FROZEN', 'CLOSED')` — no incluye `INACTIVE`. El frontend sí contempla `INACTIVE` como posible estado. Alinear la restricción según sea necesario.
