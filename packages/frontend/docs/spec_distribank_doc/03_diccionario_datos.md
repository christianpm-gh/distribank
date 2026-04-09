# Diccionario de Datos — Base de Datos Centralizada

## Índice de tablas

- [customers](#customers)
- [customer\_accounts](#customer_accounts)
- [accounts](#accounts)
- [cards](#cards)
- [transactions](#transactions)
- [transaction\_log](#transaction_log)

---

## `customers`

Representa a los titulares de productos financieros dentro del sistema. Cada registro corresponde a una persona física identificada de forma única por su CURP y correo electrónico. Es el punto de entrada del modelo: todo producto (cuenta, tarjeta) se ancla, directa o indirectamente, a un cliente registrado aquí.

| Columna | Tipo | Nulabilidad | Restricciones | Descripción |
|---|---|---|---|---|
| `id` | `bigserial` | NOT NULL | PK, auto-incremental | Identificador interno único del cliente. |
| `name` | `varchar(100)` | NOT NULL | — | Nombre completo del cliente. |
| `curp` | `varchar(100)` | NOT NULL | UNIQUE | Clave Única de Registro de Población. Identificador oficial del titular. |
| `email` | `varchar(100)` | NULL | UNIQUE, INDEX | Correo electrónico del cliente. Usado como credencial de acceso. |
| `password` | `varchar(100)` | NOT NULL | — | Contraseña de acceso. En producción debe almacenarse como hash seguro (bcrypt / argon2). |
| `created_at` | `timestamp` | NOT NULL | DEFAULT `now()` | Fecha y hora de registro del cliente en el sistema. |

### Índices

| Nombre | Columnas | Tipo |
|---|---|---|
| *(PK)* | `id` | B-tree |
| `customers_email_key` | `email` | B-tree / UNIQUE |
| `customers_curp_key` | `curp` | B-tree / UNIQUE |

---

## `customer_accounts`

Tabla puente que asocia a cada cliente con sus cuentas activas. Actúa como un directorio de productos por titular, garantizando las reglas de negocio: un cliente puede tener como máximo una cuenta *checking* y como máximo una cuenta de crédito, pero debe poseer al menos una de las dos. Al separar esta relación de la tabla `accounts`, se mantiene la cardinalidad controlada y las consultas de perfil de cliente son *lookups* puntuales sin necesidad de filtrar tablas de alta cardinalidad.

| Columna | Tipo | Nulabilidad | Restricciones | Descripción |
|---|---|---|---|---|
| `customer_id` | `bigint` | NOT NULL | PK, FK → `customers.id` | Identificador del cliente titular de las cuentas. |
| `checking_account_id` | `bigint` | NULL | UNIQUE (parcial), FK → `accounts.id` | ID de la cuenta de débito (*checking*) del cliente. NULL si no posee este producto. |
| `credit_account_id` | `bigint` | NULL | UNIQUE (parcial), FK → `accounts.id` | ID de la cuenta de crédito del cliente. NULL si no posee este producto. |

### Índices

| Nombre | Columnas | Tipo |
|---|---|---|
| *(PK)* | `customer_id` | B-tree |
| *(idx)* | `checking_account_id` | B-tree |
| *(idx)* | `credit_account_id` | B-tree |

### Constraints adicionales

| Constraint | Expresión | Propósito |
|---|---|---|
| CHECK de presencia | `checking_account_id IS NOT NULL OR credit_account_id IS NOT NULL` | Todo cliente debe tener al menos un producto activo. |
| UNIQUE parcial | `UNIQUE (checking_account_id) WHERE checking_account_id IS NOT NULL` | Una cuenta *checking* solo puede pertenecer a un cliente. |
| UNIQUE parcial | `UNIQUE (credit_account_id) WHERE credit_account_id IS NOT NULL` | Una cuenta de crédito solo puede pertenecer a un cliente. |

---

## `accounts`

Núcleo financiero del sistema. Almacena tanto cuentas de débito (`CHECKING`) como cuentas de crédito (`CREDIT`) bajo un mismo esquema, utilizando atributos condicionados por tipo. Los constraints `CHECK` hacen cumplir las reglas semánticas de cada producto directamente en la base de datos, sin depender de validaciones en capa de aplicación. Toda tarjeta y toda transacción del sistema referencia, en última instancia, a un registro de esta tabla.

| Columna | Tipo | Nulabilidad | Restricciones | Descripción |
|---|---|---|---|---|
| `id` | `bigserial` | NOT NULL | PK, auto-incremental | Identificador interno único de la cuenta. |
| `account_number` | `varchar(20)` | NOT NULL | UNIQUE, INDEX | Número de cuenta visible al cliente (ej. CLABE o número corto). |
| `account_type` | `varchar(10)` | NOT NULL | CHECK (`CHECKING` o `CREDIT`) | Tipo de producto financiero de la cuenta. |
| `balance` | `decimal(15,2)` | NOT NULL | DEFAULT `0.00`, CHECK ≥ 0 salvo crédito | Saldo actual. Puede ser negativo únicamente en cuentas `CREDIT` cuando hay crédito dispuesto. |
| `credit_limit` | `decimal(15,2)` | NULL | NOT NULL si `CREDIT`, NULL si `CHECKING` | Límite de crédito autorizado. Solo aplica a cuentas `CREDIT`. |
| `available_credit` | `decimal(15,2)` | NULL | NOT NULL si `CREDIT`, NULL si `CHECKING` | Crédito disponible en este momento. Se reduce con cada disposición. Solo aplica a `CREDIT`. |
| `overdraft_limit` | `decimal(15,2)` | NULL | NOT NULL si `CHECKING`, NULL si `CREDIT` | Límite de sobregiro autorizado. Solo aplica a `CHECKING`. |
| `last_limit_increase_at` | `timestamp` | NULL | INDEX | Timestamp del último aumento de límite de crédito o sobregiro. Usado por procesos *batch* de revisión periódica. |
| `status` | `varchar(10)` | NOT NULL | DEFAULT `ACTIVE`, INDEX | Estado operativo de la cuenta. Valores válidos: `ACTIVE`, `FROZEN`, `CLOSED`. |
| `week_transactions` | `bigint` | NULL | INDEX | Contador de transacciones de la semana en curso. Soporta detección de actividad inusual y revisión de límites. |
| `created_at` | `timestamp` | NOT NULL | DEFAULT `now()` | Fecha y hora de apertura de la cuenta. |

### Índices

| Nombre | Columnas | Tipo |
|---|---|---|
| *(PK)* | `id` | B-tree |
| *(idx)* | `account_number` | B-tree / UNIQUE |
| *(idx)* | `status` | B-tree |
| *(idx)* | `week_transactions` | B-tree |
| `idx_accounts_last_increase` | `last_limit_increase_at` | B-tree |

### Constraints adicionales

| Constraint | Expresión | Propósito |
|---|---|---|
| CHECK de balance | `balance >= 0 OR account_type = 'CREDIT'` | Solo cuentas de crédito pueden operar con saldo negativo. |
| CHECK de coherencia por tipo | `(account_type = 'CREDIT' AND credit_limit IS NOT NULL AND available_credit IS NOT NULL AND overdraft_limit IS NULL) OR (account_type = 'CHECKING' AND credit_limit IS NULL AND available_credit IS NULL AND overdraft_limit IS NOT NULL)` | Garantiza que cada tipo de cuenta tenga exactamente los atributos que le corresponden. |

---

## `cards`

Registra las tarjetas físicas o virtuales asociadas a las cuentas. Una cuenta puede tener múltiples tarjetas activas (titular, adicionales, virtuales), y el ciclo de vida de cada tarjeta se gestiona de forma independiente mediante el campo `status`. El constraint de tipo garantiza la coherencia entre el instrumento de pago y el producto financiero al que está vinculado: una tarjeta de débito solo puede existir sobre una cuenta *checking*, y una tarjeta de crédito solo sobre una cuenta `CREDIT`.

| Columna | Tipo | Nulabilidad | Restricciones | Descripción |
|---|---|---|---|---|
| `id` | `bigserial` | NOT NULL | PK, auto-incremental | Identificador interno único de la tarjeta. |
| `account_id` | `bigint` | NOT NULL | FK → `accounts.id`, INDEX | Cuenta a la que pertenece esta tarjeta. |
| `card_number` | `varchar(16)` | NOT NULL | UNIQUE, INDEX | Número de 16 dígitos de la tarjeta. En producción debe estar tokenizado o cifrado. |
| `card_type` | `varchar(10)` | NOT NULL | CHECK (`DEBIT` o `CREDIT`) | Tipo de tarjeta. Debe coincidir con el `account_type` de la cuenta asociada. |
| `cvv` | `varchar(4)` | NOT NULL | — | Código de verificación. En producción requiere *hashing* o tokenización; almacenarlo en claro es un riesgo de seguridad. |
| `expiration_date` | `date` | NOT NULL | INDEX compuesto | Fecha de vencimiento de la tarjeta. Usada por procesos automáticos de renovación. |
| `status` | `varchar(10)` | NOT NULL | DEFAULT `ACTIVE` | Estado de la tarjeta. Valores válidos: `ACTIVE`, `BLOCKED`, `EXPIRED`, `CANCELLED`. |
| `daily_limit` | `decimal(15,2)` | NULL | — | Límite diario de transacciones para esta tarjeta específica. NULL implica sin límite propio (rige el de la cuenta). |
| `issued_at` | `timestamp` | NOT NULL | DEFAULT `now()` | Fecha y hora de emisión de la tarjeta. |

### Índices

| Nombre | Columnas | Tipo |
|---|---|---|
| *(PK)* | `id` | B-tree |
| *(idx)* | `account_id` | B-tree |
| *(idx)* | `card_number` | B-tree / UNIQUE |
| *(idx)* | `status` | B-tree |
| `idx_cards_expiration` | `(expiration_date, status)` | B-tree compuesto |

### Constraints adicionales

| Constraint | Expresión | Propósito |
|---|---|---|
| CHECK de tipo | `(card_type = 'DEBIT' AND account_id IN (SELECT id FROM accounts WHERE account_type = 'CHECKING')) OR (card_type = 'CREDIT' AND account_id IN (SELECT id FROM accounts WHERE account_type = 'CREDIT'))` | Impide asociar un instrumento de pago a un tipo de cuenta incompatible. |

---

## `transactions`

Registra cada movimiento financiero del sistema como un evento atómico con estado rastreable. Cada transacción genera un `transaction_uuid` en el momento de su creación, lo que habilita el control de idempotencia ante reintentos de red. El modelo soporta cuatro tipos de operación (`TRANSFER`, `DEPOSIT`, `WITHDRAWAL`, `PURCHASE`) y un ciclo de vida de cinco estados. Los constraints operacionales de esta tabla cierran vectores de abuso como montos cero, transacciones circulares y uso de tarjetas ajenas.

| Columna | Tipo | Nulabilidad | Restricciones | Descripción |
|---|---|---|---|---|
| `id` | `bigserial` | NOT NULL | PK, auto-incremental | Identificador interno secuencial de la transacción. |
| `transaction_uuid` | `uuid` | NOT NULL | UNIQUE, DEFAULT `gen_random_uuid()`, INDEX | Identificador universal único generado al iniciar la transacción. Permite detectar reintentos duplicados de forma idempotente. |
| `from_account_id` | `bigint` | NOT NULL | FK → `accounts.id`, INDEX | Cuenta de origen (débito). |
| `to_account_id` | `bigint` | NOT NULL | FK → `accounts.id`, INDEX | Cuenta de destino (crédito). |
| `card_id` | `bigint` | NULL | FK → `cards.id`, INDEX | Tarjeta utilizada en la operación. NULL si la transacción no involucra tarjeta (ej. transferencia bancaria). |
| `amount` | `decimal(15,2)` | NOT NULL | CHECK > 0 | Monto de la transacción. Siempre positivo; la dirección del flujo la determinan `from_account_id` y `to_account_id`. |
| `transaction_type` | `varchar(20)` | NOT NULL | — | Tipo de operación. Valores válidos: `TRANSFER`, `DEPOSIT`, `WITHDRAWAL`, `PURCHASE`. |
| `status` | `varchar(15)` | NOT NULL | DEFAULT `PENDING`, INDEX compuesto | Estado actual de la transacción. Valores válidos: `PENDING`, `COMPLETED`, `FAILED`, `ROLLED_BACK`. |
| `initiated_at` | `timestamp` | NOT NULL | DEFAULT `now()`, INDEX compuesto | Timestamp de inicio de la transacción. |
| `completed_at` | `timestamp` | NULL | — | Timestamp de finalización (éxito o fallo definitivo). NULL mientras esté en estado `PENDING`. |

### Índices

| Nombre | Columnas | Tipo |
|---|---|---|
| *(PK)* | `id` | B-tree |
| *(idx)* | `transaction_uuid` | B-tree / UNIQUE |
| *(idx)* | `from_account_id` | B-tree |
| *(idx)* | `to_account_id` | B-tree |
| *(idx)* | `card_id` | B-tree |
| `idx_transactions_status_time` | `(status, initiated_at)` | B-tree compuesto |

### Constraints adicionales

| Constraint | Expresión | Propósito |
|---|---|---|
| CHECK de monto | `amount > 0` | Bloquea inserciones con monto cero o negativo. |
| CHECK anti-circular | `from_account_id != to_account_id` | Previene transacciones donde origen y destino son la misma cuenta. |
| CHECK de tarjeta | `card_id IS NULL OR card_id IN (SELECT id FROM cards WHERE account_id = from_account_id)` | Garantiza que la tarjeta usada pertenezca a la cuenta de origen. |

---

## `transaction_log`

Log de eventos del ciclo de vida de cada transacción. Actúa como *audit trail* inmutable: registra cada cambio de estado con su timestamp y metadatos opcionales en formato JSONB. Esta tabla es el soporte técnico de los patrones de transacción distribuida (SAGA y 2PC): los eventos `COMPENSATED` permiten revertir operaciones parciales en arquitecturas multi-nodo, y el campo `details` absorbe metadatos heterogéneos por tipo de evento sin necesidad de alterar el esquema.

| Columna | Tipo | Nulabilidad | Restricciones | Descripción |
|---|---|---|---|---|
| `id` | `bigserial` | NOT NULL | PK, auto-incremental | Identificador interno secuencial del registro de log. |
| `transaction_id` | `bigint` | NOT NULL | FK → `transactions.id`, INDEX compuesto | Referencia a la transacción cuyo ciclo de vida se está registrando. |
| `event_type` | `varchar(30)` | NOT NULL | INDEX | Tipo de evento ocurrido. Valores válidos: `INITIATED`, `DEBIT_APPLIED`, `CREDIT_APPLIED`, `COMPLETED`, `COMPENSATED`, `FAILED`. |
| `details` | `jsonb` | NULL | — | Metadatos adicionales del evento en formato semiestructurado. Ejemplos: saldo previo en `DEBIT_APPLIED`, ID de transacción origen en `COMPENSATED`, código de error en `FAILED`. |
| `created_at` | `timestamp` | NOT NULL | DEFAULT `now()`, INDEX | Timestamp exacto del evento. Permite reconstruir la línea de tiempo de una transacción. |

### Índices

| Nombre | Columnas | Tipo |
|---|---|---|
| *(PK)* | `id` | B-tree |
| `idx_transaction_log_txn` | `(transaction_id, created_at)` | B-tree compuesto |
| *(idx)* | `event_type` | B-tree |
| *(idx)* | `created_at` | B-tree |

### Valores del campo `event_type` y su semántica

| Valor | Descripción |
|---|---|
| `INITIATED` | La transacción fue recibida y registrada. Estado inicial. |
| `DEBIT_APPLIED` | El cargo fue aplicado exitosamente en la cuenta de origen. |
| `CREDIT_APPLIED` | El abono fue aplicado exitosamente en la cuenta de destino. |
| `COMPLETED` | La transacción finalizó de forma exitosa y completa. |
| `COMPENSATED` | Se ejecutó una transacción compensatoria para revertir un estado parcial (patrón SAGA). |
| `FAILED` | La transacción falló. El campo `details` puede contener el código y descripción del error. |
