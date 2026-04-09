# Información de Acceso y Esquemas Externos

## Información de Acceso por Roles

El sistema define tres roles operativos con perímetros de acceso diferenciados. Cada rol representa un perfil de interacción distinto con la base de datos, y sus esquemas externos —las vistas y operaciones que cada uno puede invocar— reflejan tanto las necesidades funcionales del negocio como los principios de mínimo privilegio sobre la información financiera.

En la arquitectura distribuida, el acceso por roles opera sobre el nodo propietario del cliente. Las consultas que involucran datos *cross-nodo* —por ejemplo, el historial de transacciones donde la cuenta destino pertenece a un nodo distinto— requieren que el backend coordine la recuperación de información entre nodos antes de presentarla al rol solicitante. Esta coordinación es responsabilidad de la capa de aplicación, no de la base de datos.

---

### Usuario (Cliente)

El usuario accede al sistema a través del portal web o aplicación móvil para consultar el estado de sus productos financieros y ejercer control operativo sobre sus instrumentos de pago. Su perímetro de acceso se limita estrictamente a la información asociada a su propio `customer_id`; el sistema no debe exponer datos de otros clientes bajo ninguna circunstancia.

**Información consultable:**

- Detalle monetario de sus cuentas: saldo disponible, límite de crédito autorizado, crédito disponible y límite de sobregiro, según el tipo de cuenta (*checking* o *credit*).
- Estado y detalle de las tarjetas vinculadas a sus cuentas: número enmascarado, tipo, fecha de vencimiento, estado operativo (`ACTIVE`, `BLOCKED`, `EXPIRED`, `CANCELLED`) y límite diario configurado.
- Historial de transacciones asociadas a sus cuentas, tanto como cuenta de origen como de destino, incluyendo monto, tipo de transacción, estado y marcas temporales.

**Operaciones ejecutables:**

- Bloqueo y desbloqueo de tarjetas propias (modificación del campo `status` en `cards`).
- Iniciación de transferencias entre cuentas propias o hacia cuentas de terceros.

**Esquemas externos asociados:** `v_perfil_financiero_cliente`, `v_tarjetas_cliente`, `v_historial_transacciones_cuenta`, operación `op_bloqueo_tarjeta`.

---

### Ejecutivo

El ejecutivo opera desde sucursal o *backoffice* y es responsable de la gestión del ciclo de vida de los productos financieros: apertura de cuentas, emisión y vinculación de tarjetas, y ajuste de condiciones crediticias. Su acceso abarca la información de cualquier cliente del sistema, pero se restringe a operaciones de provisión y configuración de productos —no tiene visibilidad sobre el detalle de eventos transaccionales ni sobre el log de auditoría.

**Información consultable:**

- Perfil completo de cualquier cliente: datos personales, cuentas asociadas y sus detalles monetarios.
- Estado de tarjetas y sus configuraciones (límites diarios, fechas de vencimiento).
- Cuentas de crédito candidatas a aumento de línea, filtradas por antigüedad del último incremento y nivel de actividad transaccional.
- Tarjetas próximas a vencer que requieren gestión de renovación.

**Operaciones ejecutables:**

- Apertura de cuentas (*checking* y/o *credit*) y vinculación al cliente mediante `customer_accounts`.
- Emisión de tarjetas (principal, adicional o de extensión) y vinculación a la cuenta correspondiente.
- Aumento de línea de crédito: modificación de `credit_limit` y `available_credit` en cuentas de tipo `CREDIT`.

**Esquemas externos asociados:** `v_perfil_financiero_cliente`, `v_tarjetas_cliente`, `v_candidatas_aumento_credito`, `v_tarjetas_proximas_vencer`, operaciones `op_apertura_cuenta`, `op_emision_tarjeta`, `op_aumento_linea_credito`.

---

### Soporte

El rol de soporte se enfoca en la investigación y resolución de incidencias transaccionales. Su acceso está orientado a la trazabilidad: puede consultar el estado y el log de eventos completo de cualquier transacción del sistema, incluyendo los metadatos operativos registrados en el campo `details` de `transaction_log`. No tiene permisos para modificar saldos, emitir tarjetas ni alterar condiciones crediticias.

**Información consultable:**

- Transacciones en estado `FAILED`, `ROLLED_BACK` o `PENDING`, con su log de eventos completo para diagnóstico de la causa raíz.
- Detalle de eventos de compensación (`COMPENSATED`) para transacciones revertidas vía SAGA, incluyendo los saldos restaurados registrados en `details`.
- Historial de transacciones de cualquier cuenta, con capacidad de filtrado por rango temporal, tipo de transacción y estado.
- Información de cuentas involucradas en una transacción específica (origen y destino), para verificar depósitos a cuentas equivocadas.

**Operaciones ejecutables:** Ninguna operación de escritura directa sobre datos financieros. Las acciones correctivas (reversiones, compensaciones) se ejecutan a través de procesos controlados que generan nuevas transacciones con su propio ciclo de vida en el log.

**Esquemas externos asociados:** `v_transacciones_fallidas_revertidas`, `v_transacciones_pendientes`, `v_historial_transacciones_cuenta`, `v_detalle_transaccion_completo`.

---

## Diseño de Vistas y Operaciones

Las siguientes vistas y operaciones representan los esquemas externos del sistema: las consultas que la capa de interfaz ejecuta sobre la base de datos para cada flujo funcional. En la arquitectura distribuida, estas vistas se ejecutan localmente en el nodo propietario del cliente. Para datos *cross-nodo*, el backend materializa la vista combinando resultados de múltiples nodos antes de presentarlos al cliente.

---

### Consultas de lectura

#### `v_perfil_financiero_cliente`

**Propósito funcional:** Obtener en una sola consulta la información monetaria esencial de todas las cuentas de un cliente. Esta vista es el esquema externo más frecuentemente invocado del sistema —se ejecuta en cada acceso al portal, en cada operación de punto de venta y en cada consulta de cajero automático— y corresponde directamente al requisito de acceso inmediato a los detalles monetarios.

**Información que recupera:** Para un `customer_id` dado, retorna el nombre del cliente junto con el detalle de cada cuenta asociada: número de cuenta, tipo (`CHECKING` o `CREDIT`), saldo actual, límite de crédito autorizado (si aplica), crédito disponible (si aplica), límite de sobregiro (si aplica) y estado de la cuenta. La consulta resuelve la indirección a través de `customer_accounts` para presentar ambas cuentas (o la única existente) en un solo resultado.

```sql
SELECT
    c.id               AS customer_id,
    c.name             AS customer_name,
    a.account_number,
    a.account_type,
    a.balance,
    a.credit_limit,
    a.available_credit,
    a.overdraft_limit,
    a.status
FROM customers c
JOIN customer_accounts ca ON ca.customer_id = c.id
LEFT JOIN accounts a
       ON a.id = ca.checking_account_id
       OR a.id = ca.credit_account_id
WHERE c.id = :customer_id;
```

**Roles que la utilizan:** Usuario, Ejecutivo.

**Nota distribuida:** Esta consulta es siempre local al nodo propietario del cliente (`customer_id % 3`). No requiere coordinación inter-nodo.

---

#### `v_tarjetas_cliente`

**Propósito funcional:** Mostrar al cliente (o al ejecutivo que lo atiende) el estado de todos los instrumentos de pago vinculados a sus cuentas, incluyendo tarjetas de extensión. Esta vista soporta tanto la funcionalidad de consulta en el portal como el flujo de control de estado operativo de tarjetas descrito en los requisitos del sistema.

**Información que recupera:** Para un `customer_id` dado, retorna cada tarjeta asociada a sus cuentas con: número de tarjeta (enmascarado en la capa de aplicación), tipo de tarjeta, fecha de vencimiento, estado operativo, límite diario configurado, y el número y tipo de la cuenta a la que pertenece. La consulta atraviesa `customer_accounts` → `accounts` → `cards` para reunir tarjetas de ambos tipos de cuenta.

```sql
SELECT
    cr.id              AS card_id,
    cr.card_number,
    cr.card_type,
    cr.expiration_date,
    cr.status          AS card_status,
    cr.daily_limit,
    a.account_number,
    a.account_type
FROM customers c
JOIN customer_accounts ca ON ca.customer_id = c.id
JOIN accounts a
       ON a.id = ca.checking_account_id
       OR a.id = ca.credit_account_id
JOIN cards cr ON cr.account_id = a.id
WHERE c.id = :customer_id
ORDER BY a.account_type, cr.issued_at;
```

**Roles que la utilizan:** Usuario, Ejecutivo.

---

#### `v_historial_transacciones_cuenta`

**Propósito funcional:** Presentar el historial de movimientos financieros de una cuenta específica, ordenado cronológicamente. Esta vista cubre el caso de uso más común en banca móvil —consultar los últimos movimientos— y el caso de uso de soporte para rastrear el flujo monetario de una cuenta involucrada en una incidencia. Incluye transacciones donde la cuenta participa tanto como origen como destino para ofrecer una visión completa del flujo de valor.

**Información que recupera:** Para un `account_id` dado, retorna cada transacción asociada con: UUID de la transacción, rol de la cuenta en la operación (origen o destino), número de la cuenta contraparte, monto, tipo de transacción, estado, y marcas temporales de inicio y finalización. Opcionalmente filtrable por rango de fechas y estado.

```sql
SELECT
    t.transaction_uuid,
    CASE
        WHEN t.from_account_id = :account_id THEN 'ORIGEN'
        ELSE 'DESTINO'
    END AS rol_cuenta,
    CASE
        WHEN t.from_account_id = :account_id THEN a_dest.account_number
        ELSE a_orig.account_number
    END AS cuenta_contraparte,
    t.amount,
    t.transaction_type,
    t.status,
    t.initiated_at,
    t.completed_at
FROM transactions t
JOIN accounts a_orig ON a_orig.id = t.from_account_id
JOIN accounts a_dest ON a_dest.id = t.to_account_id
WHERE t.from_account_id = :account_id
   OR t.to_account_id   = :account_id
ORDER BY t.initiated_at DESC;
```

**Roles que la utilizan:** Usuario, Soporte.

**Nota distribuida:** En transacciones *cross-nodo*, la cuenta contraparte puede no existir en el nodo local. El backend debe complementar el resultado con información del nodo remoto para resolver `cuenta_contraparte` correctamente.

---

#### `v_transacciones_fallidas_revertidas`

**Propósito funcional:** Proveer al equipo de soporte una vista consolidada de todas las transacciones que requieren atención: aquellas que fallaron, fueron revertidas mediante compensación, o permanecen en estado pendiente más allá de un umbral temporal razonable. Esta vista es el punto de entrada principal para la investigación de incidencias transaccionales e incluye el log de eventos completo de cada transacción para facilitar el diagnóstico de causa raíz.

**Información que recupera:** Retorna las transacciones en estado `FAILED`, `ROLLED_BACK` o `PENDING` junto con las cuentas de origen y destino (número de cuenta y tipo), el monto, las marcas temporales, y el log de eventos asociado ordenado cronológicamente. El campo `details` del log provee los metadatos operativos —como códigos de rechazo, saldos previos y posteriores, e identificadores de lote— necesarios para el diagnóstico.

```sql
SELECT
    t.id               AS transaction_id,
    t.transaction_uuid,
    t.transaction_type,
    t.amount,
    t.status,
    t.initiated_at,
    t.completed_at,
    a_from.account_number  AS cuenta_origen,
    a_to.account_number    AS cuenta_destino,
    tl.event_type,
    tl.details,
    tl.created_at          AS event_time
FROM transactions t
JOIN accounts a_from     ON a_from.id = t.from_account_id
JOIN accounts a_to       ON a_to.id   = t.to_account_id
JOIN transaction_log tl  ON tl.transaction_id = t.id
WHERE t.status IN ('FAILED', 'ROLLED_BACK', 'PENDING')
ORDER BY t.initiated_at DESC, tl.created_at ASC;
```

**Roles que la utilizan:** Soporte.

---

#### `v_candidatas_aumento_credito`

**Propósito funcional:** Identificar las cuentas de crédito que son candidatas a un aumento de línea de crédito, basándose en criterios de actividad transaccional y antigüedad del último incremento. Esta vista soporta el proceso periódico de revisión de líneas de crédito que los ejecutivos ejecutan como parte de la gestión comercial del producto crediticio.

**Información que recupera:** Retorna las cuentas de tipo `CREDIT` en estado `ACTIVE` cuyo último aumento de línea ocurrió hace más de 6 meses (o nunca se ha incrementado), ordenadas por volumen de transacciones semanales en forma descendente. Incluye el nombre del cliente titular, el límite actual, el crédito disponible y la fecha del último incremento.

```sql
SELECT
    c.id               AS customer_id,
    c.name             AS customer_name,
    a.account_number,
    a.credit_limit,
    a.available_credit,
    a.week_transactions,
    a.last_limit_increase_at
FROM accounts a
JOIN customer_accounts ca ON ca.credit_account_id = a.id
JOIN customers c          ON c.id = ca.customer_id
WHERE a.account_type = 'CREDIT'
  AND a.status       = 'ACTIVE'
  AND (
        a.last_limit_increase_at IS NULL
        OR a.last_limit_increase_at < NOW() - INTERVAL '6 months'
      )
ORDER BY a.week_transactions DESC;
```

**Roles que la utilizan:** Ejecutivo.

---

#### `v_tarjetas_proximas_vencer`

**Propósito funcional:** Listar las tarjetas activas cuya fecha de vencimiento se encuentra dentro de un horizonte de 90 días, para que el ejecutivo gestione proactivamente el proceso de renovación. Esta vista corresponde directamente al índice compuesto `idx_cards_expiration` sobre `(expiration_date, status)` definido en el esquema.

**Información que recupera:** Retorna las tarjetas en estado `ACTIVE` con vencimiento inminente, junto con el nombre del cliente titular, el número y tipo de cuenta asociada, y los días restantes hasta el vencimiento.

```sql
SELECT
    cr.id                                          AS card_id,
    cr.card_number,
    cr.card_type,
    cr.expiration_date,
    (cr.expiration_date - CURRENT_DATE)            AS dias_restantes,
    a.account_number,
    a.account_type,
    c.name                                         AS customer_name
FROM cards cr
JOIN accounts a          ON a.id  = cr.account_id
JOIN customer_accounts ca ON ca.checking_account_id = a.id
                          OR ca.credit_account_id   = a.id
JOIN customers c         ON c.id  = ca.customer_id
WHERE cr.status        = 'ACTIVE'
  AND cr.expiration_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY cr.expiration_date ASC;
```

**Roles que la utilizan:** Ejecutivo.

---

#### `v_detalle_transaccion_completo`

**Propósito funcional:** Recuperar el detalle exhaustivo de una transacción individual, incluyendo la secuencia completa de eventos del log con sus metadatos. Esta vista se utiliza cuando soporte necesita investigar una transacción específica reportada por un cliente —por ejemplo, un depósito que llegó a una cuenta equivocada— y requiere reconstruir exactamente qué ocurrió en cada paso del ciclo de vida de la operación.

**Información que recupera:** Para un `transaction_uuid` dado, retorna la información completa de la transacción (cuentas involucradas con sus números, tarjeta utilizada si aplica, monto, tipo, estado) y la secuencia cronológica de eventos del log con el campo `details` completo.

```sql
SELECT
    t.transaction_uuid,
    t.transaction_type,
    t.amount,
    t.status           AS transaction_status,
    t.initiated_at,
    t.completed_at,
    a_from.account_number  AS cuenta_origen,
    a_from.account_type    AS tipo_cuenta_origen,
    a_to.account_number    AS cuenta_destino,
    a_to.account_type      AS tipo_cuenta_destino,
    cr.card_number,
    tl.event_type,
    tl.details,
    tl.created_at          AS event_time
FROM transactions t
JOIN accounts a_from     ON a_from.id = t.from_account_id
JOIN accounts a_to       ON a_to.id   = t.to_account_id
LEFT JOIN cards cr       ON cr.id     = t.card_id
JOIN transaction_log tl  ON tl.transaction_id = t.id
WHERE t.transaction_uuid = :transaction_uuid
ORDER BY tl.created_at ASC;
```

**Roles que la utilizan:** Soporte.

---

### Operaciones de escritura

#### `op_apertura_cuenta`

**Propósito funcional:** Registrar una nueva cuenta (*checking* o *credit*) en el sistema y vincularla al cliente correspondiente en `customer_accounts`. Esta operación es atómica: la cuenta y su vinculación al cliente deben completarse dentro de la misma transacción de base de datos para evitar estados intermedios donde exista una cuenta huérfana.

**Información que modifica:** Inserta un registro en `accounts` con los atributos correspondientes al tipo de cuenta solicitado y actualiza el registro del cliente en `customer_accounts`, asignando el `id` de la nueva cuenta en la columna correspondiente (`checking_account_id` o `credit_account_id`).

**Roles que la ejecutan:** Ejecutivo.

**Nota distribuida:** Esta operación es local al nodo propietario del cliente. No requiere coordinación inter-nodo en el caso nominal.

---

#### `op_emision_tarjeta`

**Propósito funcional:** Registrar una nueva tarjeta en el sistema y vincularla a la cuenta correspondiente. La operación valida que el tipo de tarjeta sea coherente con el tipo de cuenta destino antes de insertar.

**Información que modifica:** Inserta un registro en `cards` con los atributos de la nueva tarjeta, referenciando el `account_id` de la cuenta destino.

**Roles que la ejecutan:** Ejecutivo.

---

#### `op_bloqueo_tarjeta`

**Propósito funcional:** Modificar el estado operativo de una tarjeta entre `ACTIVE` y `BLOCKED`, habilitando el control directo del cliente sobre sus instrumentos de pago desde la aplicación móvil. La operación valida que la transición de estado sea coherente: solo se permite bloquear tarjetas activas y desbloquear tarjetas bloqueadas.

**Información que modifica:** Actualiza el campo `status` en la tabla `cards` para la tarjeta especificada.

```sql
UPDATE cards
SET status = :new_status
WHERE id     = :card_id
  AND status = CASE
                 WHEN :new_status = 'BLOCKED' THEN 'ACTIVE'
                 WHEN :new_status = 'ACTIVE'  THEN 'BLOCKED'
               END;
```

**Roles que la ejecutan:** Usuario.

---

#### `op_aumento_linea_credito`

**Propósito funcional:** Incrementar el límite de crédito autorizado de una cuenta de tipo `CREDIT` y actualizar el crédito disponible en consecuencia. La operación registra el timestamp del incremento en `last_limit_increase_at` para que la vista `v_candidatas_aumento_credito` pueda filtrar correctamente en el próximo ciclo de revisión.

**Información que modifica:** Actualiza `credit_limit`, `available_credit` y `last_limit_increase_at` en la tabla `accounts` para la cuenta especificada.

```sql
UPDATE accounts
SET credit_limit           = :new_limit,
    available_credit       = available_credit + (:new_limit - credit_limit),
    last_limit_increase_at = NOW()
WHERE id           = :account_id
  AND account_type = 'CREDIT'
  AND status       = 'ACTIVE';
```

**Roles que la ejecutan:** Ejecutivo.
