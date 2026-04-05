# 05 Base de Datos > Esquema Entidad-Relación

> Prerrequisitos: [Arquitectura del sistema](../01_vision_general/01_arquitectura_sistema.md)

## Diagrama ER

Ver [diagrama ER completo](../diagramas/er_completo.md) con todos los campos y tipos.

## Resumen de tablas

```
customers ──1:1──> customer_accounts ──1:1──> accounts (checking)
                                      ──1:1──> accounts (credit)

accounts ──1:N──> cards
accounts ──1:N──> transactions (como from_account)
accounts ──1:N──> transactions (como to_account)
cards    ──1:N──> transactions (opcional, para PURCHASE)

transactions ──1:N──> transaction_log
```

## 6 tablas del sistema

| # | Tabla | Propósito | Registros clave (demo) |
|---|-------|-----------|----------------------|
| 1 | `customers` | Datos del cliente (nombre, email, password bcrypt) | Natalia (id=27) |
| 2 | `accounts` | Cuentas bancarias (débito y crédito) | id=27 CHECKING, id=43 CREDIT |
| 3 | `customer_accounts` | Puente 1:1 entre cliente y sus 2 cuentas | customer_id=27 → accounts 27, 43 |
| 4 | `cards` | Tarjetas físicas asociadas a cuentas | 4 tarjetas (2 débito, 2 crédito) |
| 5 | `transactions` | Registro de operaciones financieras | 6 transacciones con 4 estados |
| 6 | `transaction_log` | Eventos de auditoría (event sourcing) | 13 log events |

## Relaciones clave

### customer_accounts (tabla puente)
Cada cliente tiene exactamente **una cuenta de cheques** y **una de crédito**, vinculadas a través de `customer_accounts`:

```
customer_accounts.customer_id → customers.id      (PK, 1:1)
customer_accounts.checking_account_id → accounts.id (UNIQUE, 1:1)
customer_accounts.credit_account_id → accounts.id   (UNIQUE, 1:1)
```

### transactions (doble FK a accounts)
Una transacción siempre tiene cuenta origen y destino:

```
transactions.from_account_id → accounts.id  (relación "from_account")
transactions.to_account_id → accounts.id    (relación "to_account")
transactions.card_id → cards.id             (opcional, solo PURCHASE)
```

### transaction_log (audit trail)
Cada evento del ciclo de vida de una transacción se registra:

```
transaction_log.transaction_id → transactions.id
transaction_log.details → JSONB con { node_id: "nodo-a" }
```

## Fuente de verdad

- **Prisma Schema:** `packages/backend/prisma/schema.prisma` — define modelos, relaciones y tipos
- **DDL SQL:** `packages/frontend/docs/ddl_data_distribank/00_ddl_base.sql` — DDL base con constraints

## Documentos relacionados

- [Diagrama ER completo](../diagramas/er_completo.md)
- [Diccionario de datos](02_diccionario_datos.md) — cada columna en detalle
- [Distribución de nodos](03_distribucion_nodos.md) — cómo se particiona
