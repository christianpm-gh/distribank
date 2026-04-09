# Estrategia de Fragmentación mediante Álgebra Relacional

## Consideraciones Preliminares

La fragmentación de una base de datos distribuida consiste en dividir las relaciones del esquema centralizado en fragmentos que puedan asignarse a nodos distintos. Cada estrategia de fragmentación debe satisfacer tres propiedades formales: **completitud** (todo dato de la relación original pertenece a al menos un fragmento), **reconstrucción** (la relación original puede obtenerse a partir de sus fragmentos) y **disyunción** (los fragmentos no contienen datos redundantes entre sí, salvo la clave primaria en fragmentación vertical).

Las estrategias presentadas a continuación se definen sobre el esquema centralizado de DistriBank y se expresan mediante los operadores estándar del álgebra relacional: σ (selección), π (proyección), ⋈ (join), ⋉ (semi-join) y ∪ (unión). Cada estrategia incluye la justificación de su valor para el entorno distribuido y las expresiones formales de fragmentación y reconstrucción.

La fragmentación principal del sistema es **horizontal primaria** sobre `customers`, que se propaga como **fragmentación horizontal derivada** al resto de las tablas dependientes. Adicionalmente, se aplica una **fragmentación mixta** (horizontal → vertical) sobre `accounts` para optimizar el almacenamiento por tipo de producto financiero. Estas dos estrategias se documentan a continuación.

---

## Fragmentación Horizontal Primaria — `customers`

### Justificación

La tabla `customers` es la raíz del esquema: toda entidad del sistema —cuenta, tarjeta, transacción— puede trazarse hasta un cliente. Fragmentarla horizontalmente por `customer_id % 3` distribuye la carga de clientes en tres particiones iguales, asignando a cada nodo la propiedad de un tercio de la base de clientes. Este criterio tiene tres ventajas concretas para el entorno distribuido. Primera, la función de partición es determinista y de costo constante —dado cualquier `customer_id`, el nodo propietario se calcula en O(1) sin necesidad de un directorio centralizado. Segunda, la distribución es uniforme por diseño aritmético, independiente de la distribución demográfica de los clientes. Tercera, al fragmentar en `customers` y propagar la fragmentación hacia las tablas dependientes, todas las entidades de un cliente quedan colocaladas en el mismo nodo, eliminando la necesidad de *distributed joins* para las consultas de perfil —el caso de acceso más frecuente del sistema.

### Definición formal

Sean los tres fragmentos horizontales de `customers`:

```
customers_A = σ(id % 3 = 0)(customers)
customers_B = σ(id % 3 = 1)(customers)
customers_C = σ(id % 3 = 2)(customers)
```

Donde `id % 3` denota el residuo de la división entera de `id` entre 3.

### Verificación de propiedades

**Completitud:** Los predicados `id % 3 = 0`, `id % 3 = 1` e `id % 3 = 2` cubren exhaustivamente el dominio de los enteros positivos. Todo registro de `customers` pertenece exactamente a uno de los tres fragmentos.

**Reconstrucción:** La relación original se obtiene mediante la unión de los tres fragmentos:

```
customers = customers_A ∪ customers_B ∪ customers_C
```

**Disyunción:** Los predicados son mutuamente excluyentes. Un entero no puede arrojar simultáneamente residuos 0, 1 y 2 al dividirse entre 3, por lo que ningún registro aparece en más de un fragmento.

### Asignación a nodos

| Fragmento | Predicado | Nodo |
|---|---|---|
| `customers_A` | `id % 3 = 0` | Nodo A (Laptop/VM) |
| `customers_B` | `id % 3 = 1` | Nodo B (Laptop/VM) |
| `customers_C` | `id % 3 = 2` | Nodo C (Supabase) |

---

## Fragmentación Horizontal Derivada — Tablas dependientes

### Justificación

Las tablas `customer_accounts`, `accounts`, `cards`, `transactions` y `transaction_log` no tienen un atributo de partición propio que permita una fragmentación horizontal primaria significativa. Sin embargo, todas son alcanzables desde `customers` a través de una cadena de *foreign keys*. Fragmentarlas de forma derivada —siguiendo la partición de `customers`— garantiza la colocalación: todos los datos de un cliente residen en el mismo nodo, y las consultas de perfil son siempre locales.

### Definición formal

La fragmentación derivada se define mediante semi-join (⋉) con el fragmento correspondiente de `customers`. Para cada nodo *n* ∈ {A, B, C}:

**`customer_accounts`:**
```
ca_n = customer_accounts ⋉ customers_n
     = customer_accounts donde customer_id ∈ π(id)(customers_n)
```

**`accounts`:**
```
accounts_n = accounts ⋉ ca_n
           = accounts donde id ∈ π(checking_account_id)(ca_n)
                          ∪ π(credit_account_id)(ca_n)
```

**`cards`:**
```
cards_n = cards ⋉ accounts_n
        = cards donde account_id ∈ π(id)(accounts_n)
```

**`transactions`:**
```
transactions_n = transactions ⋉ accounts_n
               = transactions donde from_account_id ∈ π(id)(accounts_n)
```

> **Nota sobre transacciones *cross-nodo*:** Para las transacciones cuyo `from_account_id` pertenece al nodo *n* pero cuyo `to_account_id` pertenece a un nodo distinto *m*, el registro de la transacción se almacena en el nodo del origen (`from_account_id`). Los eventos del `transaction_log` generados en el nodo destino se almacenan localmente en ese nodo y se correlacionan mediante `transaction_uuid`.

**`transaction_log`:**
```
tl_n = transaction_log ⋉ transactions_n
     = transaction_log donde transaction_id ∈ π(id)(transactions_n)
```

### Reconstrucción

Cada tabla se reconstruye mediante la unión de sus tres fragmentos:

```
customer_accounts = ca_A ∪ ca_B ∪ ca_C
accounts          = accounts_A ∪ accounts_B ∪ accounts_C
cards             = cards_A ∪ cards_B ∪ cards_C
transactions      = transactions_A ∪ transactions_B ∪ transactions_C
transaction_log   = tl_A ∪ tl_B ∪ tl_C
```

---

## Fragmentación Mixta (Horizontal → Vertical) — `accounts`

### Justificación

La tabla `accounts` presenta una característica estructural que la convierte en candidata natural para fragmentación mixta: el constraint `chk_accounts_type_fields` impone una invariante que hace que ciertos campos sean sistemáticamente `NULL` dependiendo del tipo de cuenta. Para cuentas `CHECKING`, los campos `credit_limit` y `available_credit` son obligatoriamente `NULL`; para cuentas `CREDIT`, el campo `overdraft_limit` es obligatoriamente `NULL`. Esta invariante, codificada en el DDL, significa que cada registro de `accounts` transporta columnas que no almacenan información útil —un desperdicio de espacio que se amplifica en un entorno distribuido donde cada *byte* transmitido entre nodos tiene costo de red.

La estrategia mixta aplica primero una fragmentación horizontal por `account_type`, separando los dos productos financieros del sistema, y luego una fragmentación vertical sobre cada fragmento horizontal para eliminar las columnas garantizadas nulas. El resultado son dos fragmentos donde cada uno contiene exclusivamente los atributos semánticamente relevantes para su tipo de producto.

En el entorno distribuido, esta fragmentación tiene valor adicional más allá de la optimización de almacenamiento. Los dos productos financieros tienen patrones operativos diferentes: las cuentas `CHECKING` reciben la mayor carga de transacciones de punto de venta y cajero automático (alta frecuencia, baja latencia), mientras que las cuentas `CREDIT` son el foco de procesos periódicos como revisión de líneas de crédito (`v_candidatas_aumento_credito`) y gestión del ciclo de facturación. Asignar cada fragmento a un nodo permite ajustar la configuración de cada uno —*buffer pools*, políticas de *vacuuming*, estrategias de indexación— al perfil de carga específico de su tipo de producto financiero. Además, la vista `v_candidatas_aumento_credito` opera exclusivamente sobre cuentas `CREDIT`, y tras la fragmentación su ejecución se resuelve localmente en el nodo de crédito sin necesidad de filtrar registros `CHECKING` irrelevantes.

### Definición formal

**Paso 1 — Fragmentación horizontal por `account_type`:**

```
accounts_checking = σ(account_type = 'CHECKING')(accounts)
accounts_credit   = σ(account_type = 'CREDIT')(accounts)
```

**Paso 2 — Fragmentación vertical sobre cada fragmento horizontal:**

Para `accounts_checking`, se eliminan `credit_limit` y `available_credit` (garantizados `NULL` por `chk_accounts_type_fields`):

```
accounts_checking_final = π(id, account_number, account_type, balance,
                             overdraft_limit, last_limit_increase_at,
                             status, week_transactions, created_at)
                           (accounts_checking)
```

Para `accounts_credit`, se elimina `overdraft_limit` (garantizado `NULL` por `chk_accounts_type_fields`):

```
accounts_credit_final = π(id, account_number, account_type, balance,
                           credit_limit, available_credit,
                           last_limit_increase_at, status,
                           week_transactions, created_at)
                         (accounts_credit)
```

**Expresiones compuestas (sustituyendo el Paso 1 en el Paso 2):**

```
accounts_checking_final = π(id, account_number, account_type, balance,
                             overdraft_limit, last_limit_increase_at,
                             status, week_transactions, created_at)
                           (σ(account_type = 'CHECKING')(accounts))

accounts_credit_final   = π(id, account_number, account_type, balance,
                             credit_limit, available_credit,
                             last_limit_increase_at, status,
                             week_transactions, created_at)
                           (σ(account_type = 'CREDIT')(accounts))
```

### Reconstrucción

La reconstrucción requiere una unión externa (*outer union*): cada fragmento debe extenderse con las columnas ausentes (asignándoles valor `NULL`) antes de aplicar la unión.

Sea:
```
accounts_checking_extended = accounts_checking_final extendida con
                              credit_limit = NULL, available_credit = NULL

accounts_credit_extended   = accounts_credit_final extendida con
                              overdraft_limit = NULL
```

Entonces:
```
accounts = accounts_checking_extended ∪ accounts_credit_extended
```

### Verificación de propiedades

**Completitud (horizontal):** Los predicados `account_type = 'CHECKING'` y `account_type = 'CREDIT'` cubren exhaustivamente el dominio definido por `chk_accounts_account_type`. Todo registro pertenece exactamente a uno de los dos fragmentos horizontales.

**Completitud (vertical):** Cada fragmento vertical retiene todos los atributos que pueden contener valores no nulos para su tipo, más la clave primaria y los atributos compartidos. Los atributos eliminados son demostrablemente `NULL` por el constraint `chk_accounts_type_fields`, por lo que su eliminación no pierde información.

**Reconstrucción:** La *outer union* de ambos fragmentos extendidos restituye la relación original con todos sus atributos y tuplas.

**Disyunción (horizontal):** Los predicados de `account_type` son mutuamente excluyentes. La disyunción entre los dos fragmentos mixtos finales se hereda de la disyunción horizontal.

---

## Resumen de la estrategia de fragmentación

| Tabla | Tipo de fragmentación | Criterio | Resultado |
|---|---|---|---|
| `customers` | Horizontal primaria | `id % 3` | 3 fragmentos → Nodo A, B, C |
| `customer_accounts` | Horizontal derivada | Sigue a `customers` | 3 fragmentos colocalados |
| `accounts` | Horizontal derivada + Vertical (mixta) | Sigue a `customers`; luego por `account_type` | 6 fragmentos (3 nodos × 2 tipos) |
| `cards` | Horizontal derivada | Sigue a `accounts` | 3 fragmentos colocalados |
| `transactions` | Horizontal derivada | Sigue a `accounts` (`from_account_id`) | 3 fragmentos colocalados |
| `transaction_log` | Horizontal derivada | Sigue a `transactions` | 3 fragmentos colocalados |
