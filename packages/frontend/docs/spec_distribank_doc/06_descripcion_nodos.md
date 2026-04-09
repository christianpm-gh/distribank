# Descripción de los Nodos del SBDD

DistriBank implementa una arquitectura de base de datos distribuida compuesta por tres nodos independientes. La fragmentación es *horizontal* por `customer_id % 3`: cada nodo es propietario de un tercio de los clientes y almacena localmente todas las tablas relacionadas —`customer_accounts`, `accounts`, `cards`, `transactions` y `transaction_log`— que correspondan a esos clientes. Todos los nodos ejecutan el mismo DDL base (`schema public`), garantizando homogeneidad estructural entre los fragmentos. Nodo C tiene responsabilidad adicional al alojar el schema de réplica VIP (`distribank_vip_customers`).

---

## Nodo A

| Atributo | Valor |
|---|---|
| **Infraestructura** | Laptop / VM local |
| **SGBD** | PostgreSQL 16 |
| **Criterio de asignación** | `customer_id % 3 = 0` |
| **Schema** | `public` |

### Clientes propietarios

Nodo A es propietario de los 10 clientes cuyos `id` son divisibles entre 3: Sofía (3), Miguel (6), Camila (9), Andrés (12), Elena (15), Ricardo (18), Patricia (21), Alberto (24), Natalia (27) y Raúl (30).

### Contenido almacenado

Nodo A almacena los registros de `customers` correspondientes a sus 10 clientes propietarios, junto con la totalidad de sus `customer_accounts`, `accounts`, `cards`, `transactions` y `transaction_log`. Las transacciones cuyos dos extremos —cuenta origen y cuenta destino— pertenecen a clientes de Nodo A se procesan y registran íntegramente en este nodo. Las transacciones *cross-nodo* donde una de las cuentas pertenece a Nodo A generan entradas en `transaction_log` de este nodo que deben correlacionarse con el log del nodo remoto mediante `transaction_uuid`.

### Rol en el SBDD

Nodo A no tiene un rol de coordinación especial en la topología. Actúa como nodo participante en el protocolo de transacciones distribuidas —ya sea SAGA o 2PC— cuando una operación involucra cuentas de clientes de otros nodos. En esos casos, el `transaction_log` local registra los eventos `INITIATED`, `DEBIT_APPLIED` o `CREDIT_APPLIED` correspondientes a la parte de la transacción que ejecuta este nodo, y el evento `COMPENSATED` si la operación debe revertirse.

### Clientes VIP originados en este nodo

Sofía (3) y Miguel (6) están clasificados como *VIP* (`week_transactions ≥ 3` en sus cuentas activas). Sus datos son replicados periódicamente hacia el schema `distribank_vip_customers` en Nodo C para soportar el modo de *failover* coordinado.

---

## Nodo B

| Atributo | Valor |
|---|---|
| **Infraestructura** | Laptop / VM local |
| **SGBD** | PostgreSQL 16 |
| **Criterio de asignación** | `customer_id % 3 = 1` |
| **Schema** | `public` |

### Clientes propietarios

Nodo B es propietario de los 10 clientes cuyos `id` arrojan residuo 1 al dividirse entre 3: Ana (1), Roberto (4), Valentina (5) —nota: Valentina tiene `id=5`, `5 % 3 = 2`, por lo que pertenece a Nodo C—, y los clientes con `id` 1, 4, 7, 10, 13, 16, 19, 22, 25 y 28: Ana (1), Roberto (4), Lucía (7), Diego (10), Jorge (13), Mónica (16), Iván (19), Gabriela (22), Tomás (25) y Silvia (28).

> **Criterio exacto:** `customer_id % 3 = 1` → IDs: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28.

### Contenido almacenado

Nodo B almacena los registros de `customers` correspondientes a sus 10 clientes propietarios, junto con la totalidad de sus `customer_accounts`, `accounts`, `cards`, `transactions` y `transaction_log`. La lógica de almacenamiento y coordinación es idéntica a la de Nodo A.

### Rol en el SBDD

Nodo B actúa como nodo participante en el protocolo de transacciones distribuidas. Al igual que Nodo A, no tiene rol de coordinación especial y delega en la capa de aplicación (*backend*) la orquestación de operaciones *cross-nodo*.

### Clientes VIP originados en este nodo

Ana (1) y Diego (10) están clasificados como *VIP*. Sus datos son replicados periódicamente hacia el schema `distribank_vip_customers` en Nodo C.

---

## Nodo C

| Atributo | Valor |
|---|---|
| **Infraestructura** | Supabase (PostgreSQL gestionado en la nube) |
| **SGBD** | PostgreSQL 15+ (gestionado por Supabase) |
| **Criterio de asignación** | `customer_id % 3 = 2` |
| **Schemas** | `public` (fragmento local) + `distribank_vip_customers` (réplica VIP) |

### Clientes propietarios

Nodo C es propietario de los 10 clientes cuyos `id` arrojan residuo 2 al dividirse entre 3: Carlos (2), Valentina (5), Fernando (8), Beatriz (11), Jorge (14), Mónica (17), Iván (20), Gabriela (23), Tomás (26) y Silvia (29).

> **Criterio exacto:** `customer_id % 3 = 2` → IDs: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29.

### Contenido almacenado — Schema `public`

En su schema `public`, Nodo C almacena los registros de `customers` correspondientes a sus 10 clientes propietarios, junto con la totalidad de sus `customer_accounts`, `accounts`, `cards`, `transactions` y `transaction_log`. La infraestructura Supabase provee acceso mediante PostgreSQL estándar con las mismas capacidades de DDL, triggers y extensiones que los nodos locales, con la excepción de que operaciones que requieren superusuario —como `ALTER TABLE ... DISABLE TRIGGER ALL`— deben sustituirse por `SET session_replication_role = replica` para la carga masiva de datos en RLS-aware environments.

### Contenido almacenado — Schema `distribank_vip_customers`

El schema `distribank_vip_customers` es una réplica consolidada de todos los clientes clasificados como *VIP* a través de los tres nodos —aquellos cuya suma de `week_transactions` sobre cuentas `ACTIVE` alcanza o supera 3. Este schema contiene las mismas seis tablas del esquema base con una diferencia estructural deliberada: la FK `fk_transactions_to_account` sobre `to_account_id` es eliminada, dado que la cuenta destino de una transacción VIP puede pertenecer a un cliente no-VIP inexistente en esta réplica. La integridad referencial sobre `to_account_id` es responsabilidad del coordinador de replicación, no de la base de datos.

**Clientes VIP en la réplica:**

| Cliente | Nodo primario | Origen del dato |
|---|---|---|
| Ana (1) | Nodo B | Replicado desde Nodo B |
| Carlos (2) | Nodo C | Nativo en Nodo C, también en réplica |
| Sofía (3) | Nodo A | Replicado desde Nodo A |
| Valentina (5) | Nodo C | Nativa en Nodo C, también en réplica |
| Miguel (6) | Nodo A | Replicado desde Nodo A |
| Fernando (8) | Nodo C | Nativo en Nodo C, también en réplica |
| Diego (10) | Nodo B | Replicado desde Nodo B |

### Frecuencia de sincronización

La réplica VIP se sincroniza cada 6–8 horas en operación normal. En cada ciclo, el predicado VIP se reevalúa sobre los tres nodos: los clientes que caen por debajo del umbral de `week_transactions` son removidos del schema; los que superan el umbral son incorporados. Esta sincronización introduce una ventana de inconsistencia documentada y aceptada como *trade-off* académico.

### Modo de failover

Cuando el nodo primario de un cliente VIP no responde, el *backend* redirige las escrituras al schema `distribank_vip_customers` de Nodo C, marcando cada operación con un flag de pendiente de reconciliación en `transaction_log` (campo `details`). Al recuperarse el nodo primario, un proceso de reconciliación aplica las operaciones en orden cronológico, resolviendo posibles conflictos de escritura. Este escenario expone el problema de *write conflicts* cuando el primario vuelve con estado divergente respecto a la réplica.

### Rol en el SBDD

Nodo C tiene un rol dual: es nodo participante en el protocolo de transacciones distribuidas para sus clientes propietarios, y es el nodo concentrador de la réplica VIP para toda la arquitectura. Esta dualidad lo convierte en el nodo de mayor criticidad operativa del sistema —su indisponibilidad afecta tanto a los clientes propietarios de `customer_id % 3 = 2` como al mecanismo de *failover* VIP para clientes de los otros dos nodos.
