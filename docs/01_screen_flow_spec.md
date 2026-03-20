# DistriBank — Especificación de Flujos de Pantalla
## Rol: Cliente (Usuario Normal)
### Perfil de demo: cliente con cuenta débito + crédito

---

## 0. Contexto y alcance

Este documento especifica el conjunto exhaustivo de pantallas y transiciones de navegación para el rol **Usuario/Cliente** de DistriBank, orientado a servir como *source of truth* para el diseño Figma bajo metodología *spec-driven*. Cada pantalla se define con su propósito funcional, su fuente de datos canónica en la base de datos distribuida, los campos exactos que expone, las interacciones disponibles y los estados de error relevantes.

El alcance del MVP de demo cubre el caso de un cliente con **una cuenta de débito (*checking*) y una cuenta de crédito activas**, con al menos tres tarjetas asociadas (incluyendo una en estado `BLOCKED`) y un historial de transacciones con estados heterogéneos (`COMPLETED`, `PENDING`, `FAILED`, `ROLLED_BACK`). Este perfil garantiza que la demo recorra la totalidad de las funcionalidades del rol sin omitir ningún estado de la UI.

**Cliente de referencia para la demo — Natalia Ruiz Castillo (`customer_id = 27`, Nodo A):**

| Recurso | Identificador | Datos clave |
|---|---|---|
| Cuenta débito | `DISTCHK0000000027` | Saldo $56,000.00 · Sobregiro $1,500.00 · 8 tx/semana |
| Cuenta crédito | `DISTCRD0000000013` | Saldo −$12,000.00 · Límite $20,000.00 · Disponible $8,000.00 |
| Tarjeta débito titular | `****0010` | DEBIT · ACTIVE · Límite diario $15,000 · Vence 2028-09 |
| Tarjeta débito adicional | `****0011` | DEBIT · ACTIVE · Límite diario $5,000 · Vence 2027-03 |
| Tarjeta crédito titular | `****0017` | CREDIT · ACTIVE · Límite diario $20,000 · Vence 2028-09 |
| Tarjeta crédito extensión | `****0018` | CREDIT · **BLOCKED** · Límite diario $10,000 · Vence 2027-09 |

---

## 1. Mapa de navegación

```
S-01 Login
  └── S-02 Home / Panel Principal
        ├── S-03 Detalle Cuenta Débito
        │     ├── S-05 Historial de Movimientos (cuenta débito)
        │     │     └── S-06 Detalle de Movimiento
        │     └── S-09 Nueva Transferencia [desde débito]
        │           ├── S-10 Confirmación de Transferencia
        │           │     └── S-11 Resultado de Transferencia
        │           └── ← Cancelar → S-03
        ├── S-04 Detalle Cuenta Crédito
        │     ├── S-05 Historial de Movimientos (cuenta crédito)
        │     │     └── S-06 Detalle de Movimiento
        │     └── S-09 Nueva Transferencia [desde crédito]
        │           ├── S-10 Confirmación de Transferencia
        │           │     └── S-11 Resultado de Transferencia
        │           └── ← Cancelar → S-04
        └── S-07 Mis Tarjetas
              └── S-08 Detalle + Control de Tarjeta
                    └── Modal de confirmación (bloqueo/desbloqueo)
```

---

## 2. Pantallas

---

### S-01 — Login

**Propósito:** Punto de entrada al sistema. Autentica al cliente y establece el `customer_id` de sesión que se inyecta como parámetro en todas las consultas posteriores.

**Fuente de datos:** `customers` · campo `email` y `password` (bcrypt hash).

#### Campos del formulario

| Campo | Tipo | Validación | Nota de implementación |
|---|---|---|---|
| Email | `input[type=email]` | Formato email, requerido | Clave de búsqueda en `customers.email` |
| Contraseña | `input[type=password]` | Mínimo 8 caracteres, requerido | Verificación contra `customers.password` (bcrypt) |

#### Acciones

| Acción | Condición de habilitación | Resultado éxito | Resultado error |
|---|---|---|---|
| Iniciar sesión | Ambos campos válidos | Navega a S-02; `customer_id` persiste en sesión | Toast de error: credenciales inválidas |

#### Estados de pantalla

- **Default:** Formulario vacío, botón deshabilitado.
- **Loading:** Botón en estado de carga; inputs deshabilitados.
- **Error:** Mensaje inline bajo el campo afectado o mensaje genérico de credenciales.

#### Datos para demo

- Email: `natalia.ruiz@distribank.mx`
- Contraseña: cualquier string (entorno demo, bcrypt no se valida en frontend)

---

### S-02 — Home / Panel Principal

**Propósito:** Vista de aterrizaje post-login. Presenta el resumen financiero consolidado del cliente en una sola pantalla de alto impacto, cubriendo ambas cuentas simultáneamente. Es la pantalla de mayor frecuencia de acceso del sistema.

**Fuente de datos:** `v_perfil_financiero_cliente` con `:customer_id` de sesión.

```sql
-- Vista ejecutada en cada carga del Home
SELECT c.name, a.account_number, a.account_type,
       a.balance, a.credit_limit, a.available_credit,
       a.overdraft_limit, a.status
FROM customers c
JOIN customer_accounts ca ON ca.customer_id = c.id
LEFT JOIN accounts a ON a.id = ca.checking_account_id OR a.id = ca.credit_account_id
WHERE c.id = :customer_id;
```

#### Campos mostrados

**Header global:**

| Campo | Origen DB | Formato de display |
|---|---|---|
| Nombre del cliente | `customers.name` | "Bienvenida, Natalia" (solo primer nombre) |
| Inicial / Avatar | `customers.name` | Letra inicial para avatar placeholder |

**Tarjeta de cuenta débito (`account_type = 'CHECKING'`):**

| Campo | Origen DB | Formato de display |
|---|---|---|
| Número de cuenta | `accounts.account_number` | Enmascarado: "•••• 0027" (últimos 4) |
| Tipo | `accounts.account_type` | Etiqueta: "Cuenta Débito" |
| Saldo disponible | `accounts.balance` | `$56,000.00` (moneda MXN con separadores) |
| Límite de sobregiro | `accounts.overdraft_limit` | Texto secundario: "Sobregiro hasta $1,500.00" |
| Estado | `accounts.status` | Badge: ACTIVE → "Activa" (verde) |

**Tarjeta de cuenta crédito (`account_type = 'CREDIT'`):**

| Campo | Origen DB | Formato de display |
|---|---|---|
| Número de cuenta | `accounts.account_number` | Enmascarado: "•••• 0013" |
| Tipo | `accounts.account_type` | Etiqueta: "Cuenta Crédito" |
| Saldo utilizado | `accounts.balance` | `$12,000.00` (valor absoluto; el signo negativo es interno) |
| Crédito disponible | `accounts.available_credit` | `$8,000.00` — destacado visualmente |
| Límite total | `accounts.credit_limit` | Texto secundario: "Límite $20,000.00" |
| Barra de uso de crédito | Calculado: `(credit_limit - available_credit) / credit_limit` | Barra de progreso: 60% utilizado |
| Estado | `accounts.status` | Badge: "Activa" (verde) |

#### Acciones y navegación

| Acción | Trigger | Destino |
|---|---|---|
| Tap en tarjeta débito | Tap en componente | S-03 Detalle Cuenta Débito |
| Tap en tarjeta crédito | Tap en componente | S-04 Detalle Cuenta Crédito |
| CTA "Transferir" (acción rápida global) | Botón flotante o área de acciones rápidas | S-09 Nueva Transferencia (cuenta de origen por definir en S-09) |
| Icono "Tarjetas" en nav bar | Tap | S-07 Mis Tarjetas |
| Logout | Icono de perfil / menú | Destruye sesión → S-01 |

#### Estados de pantalla

- **Loading:** Skeleton loaders en ambas tarjetas de cuenta.
- **Error de red:** Banner informativo: "No se pudo cargar tu información. Intenta de nuevo."
- **Cuenta inactiva (status = 'INACTIVE' o 'FROZEN'):** Badge rojo en la tarjeta afectada; CTA de transferencia deshabilitado para esa cuenta.

---

### S-03 — Detalle Cuenta Débito

**Propósito:** Vista expandida de la cuenta *checking*. Expone todos los campos monetarios de la cuenta y sirve como punto de entrada a las operaciones y al historial asociado específicamente a esta cuenta.

**Fuente de datos:** `v_perfil_financiero_cliente` filtrado por `account_type = 'CHECKING'` · Fila correspondiente a la cuenta débito del cliente.

#### Campos mostrados

| Campo | Origen DB | Formato |
|---|---|---|
| Número de cuenta (completo) | `accounts.account_number` | `DISTCHK0000000027` — texto pequeño copiable |
| Saldo actual | `accounts.balance` | `$56,000.00` — cifra principal, tipografía grande |
| Límite de sobregiro | `accounts.overdraft_limit` | "$1,500.00 disponibles como sobregiro" |
| Estado de cuenta | `accounts.status` | Badge: "Activa" |
| Fecha de apertura | `accounts.created_at` | "Abierta el 8 ene 2024" |
| Transacciones esta semana | `accounts.week_transactions` | "8 movimientos esta semana" — con lógica VIP detallada abajo |

#### Indicador de actividad semanal — lógica VIP

El campo `week_transactions` expone un comportamiento diferenciado según el umbral VIP (`week_transactions >= 3`, criterio canónico del schema `distribank_vip_customers`):

**Cliente con `week_transactions >= 3` (cliente VIP):**
- Badge dorado con ícono de estrella o corona: "⭐ VIP · 8 mov. esta semana"
- El componente completo del indicador aplica una **animación de vibración** (*shake* o *pulse*) que se ejecuta:
  - Al cargar la pantalla S-03 por primera vez (una sola vez, auto-trigger)
  - De forma recurrente cada ~8 segundos mientras el usuario permanece en la pantalla
- Propósito funcional: gamificación mínima que refuerza el comportamiento transaccional; el cliente VIP recibe feedback positivo continuo sobre su estatus
- La animación debe ser sutil (amplitud ≤ 3px, duración ~400ms, 2–3 ciclos) — no disruptiva, perceptible

**Cliente con `week_transactions < 3` (cliente no-VIP):**
- Indicador estándar sin badge: "8 mov. esta semana"
- Sin animación — presentación estática

**Umbral de evaluación:** Se evalúa sobre la suma de `week_transactions` de las cuentas `ACTIVE` del cliente. Para el perfil de demo (Natalia, `customer_id = 27`): débito tiene `week_transactions = 8` → badge VIP activo en S-03. La cuenta crédito (`week_transactions = 4`) también supera el umbral → badge VIP activo en S-04.

**Nota distribuida:** El estado VIP del cliente en el schema `distribank_vip_customers` puede estar desfasado hasta 6–8 horas respecto al nodo primario (consistencia eventual). La evaluación para este badge debe hacerse **directamente sobre `accounts.week_transactions` del nodo propietario**, no sobre la réplica VIP, para garantizar que refleje el estado más reciente.
| Nueva transferencia | Botón "Transferir" | S-09 (origen preseleccionado: cuenta débito) |
| Gestionar tarjetas | Link o botón secundario | S-07 Mis Tarjetas (filtrado por esta cuenta) |
| Volver | Flecha de regreso | S-02 Home |

#### Sección de movimientos recientes

Muestra los últimos **3 movimientos** de `v_historial_transacciones_cuenta` para `account_id = 27`, con enlace "Ver todos →" a S-05. Cada fila muestra: ícono de dirección (entrada/salida), monto, tipo, y fecha relativa ("hace 2 días").

---

### S-04 — Detalle Cuenta Crédito

**Propósito:** Vista expandida de la cuenta de crédito. Expone los campos específicos del producto crediticio y comunica claramente el estado de utilización del límite.

**Fuente de datos:** `v_perfil_financiero_cliente` filtrado por `account_type = 'CREDIT'`.

#### Campos mostrados

| Campo | Origen DB | Formato |
|---|---|---|
| Número de cuenta (completo) | `accounts.account_number` | `DISTCRD0000000013` |
| Saldo adeudado | `accounts.balance` | `$12,000.00` (absoluto) — cifra principal |
| Crédito disponible | `accounts.available_credit` | `$8,000.00` — destacado con color positivo |
| Límite de crédito | `accounts.credit_limit` | `$20,000.00` |
| Barra de utilización | Calculado | Visual de barra segmentada: 60% usado / 40% disponible |
| Estado de cuenta | `accounts.status` | Badge: "Activa" |
| Transacciones esta semana | `accounts.week_transactions` | "4 movimientos esta semana" |
| Último aumento de límite | `accounts.last_limit_increase_at` | "Última revisión de límite: 10 feb 2025" |

> **Nota de diseño:** La diferencia semántica clave entre S-03 y S-04 es que en crédito el "saldo" representa deuda (número negativo en DB), no disponibilidad. El diseño debe comunicar esto con claridad: `balance` se muestra como importe adeudado, y `available_credit` como el valor que el cliente puede seguir utilizando.

#### Acciones

| Acción | Trigger | Destino |
|---|---|---|
| Ver historial completo | Botón | S-05 (Historial, `account_id` = 43) |
| Nueva transferencia / compra | Botón "Usar crédito" | S-09 (origen: cuenta crédito) |
| Gestionar tarjetas de crédito | Link secundario | S-07 (filtrado por crédito) |
| Volver | Flecha | S-02 Home |

---

### S-05 — Historial de Movimientos

**Propósito:** Lista cronológica completa de transacciones asociadas a una cuenta específica. El cliente puede participar como origen (`from_account_id`) o como destino (`to_account_id`). La pantalla es **reutilizada** para ambas cuentas — el `account_id` se pasa como parámetro de contexto desde S-03 o S-04.

**Fuente de datos:** `v_historial_transacciones_cuenta` con `:account_id` correspondiente.

```sql
-- Parámetro: :account_id (27 para débito, 43 para crédito)
SELECT t.transaction_uuid, 
       CASE WHEN t.from_account_id = :account_id THEN 'ORIGEN' ELSE 'DESTINO' END AS rol_cuenta,
       [cuenta_contraparte], t.amount, t.transaction_type, t.status,
       t.initiated_at, t.completed_at
FROM transactions t ...
WHERE t.from_account_id = :account_id OR t.to_account_id = :account_id
ORDER BY t.initiated_at DESC;
```

#### Estructura de cada fila de movimiento

| Elemento | Origen DB | Descripción |
|---|---|---|
| Ícono de dirección | `rol_cuenta` | Flecha saliente (ORIGEN) o entrante (DESTINO) |
| Tipo de transacción | `transaction_type` | Etiqueta: "Transferencia", "Compra", "Depósito" |
| Cuenta contraparte | `cuenta_contraparte` | Número enmascarado: "•••• 0018" |
| Monto | `amount` | Prefijo "−" si ORIGEN, "+" si DESTINO. Color rojo/verde respectivamente |
| Estado | `status` | Badge coloreado: COMPLETED (gris neutro), PENDING (amarillo), FAILED (rojo), ROLLED_BACK (naranja) |
| Fecha | `initiated_at` | Formato relativo si < 7 días; absoluto si más antiguo |

#### Datos para demo — Cuenta débito (account_id = 27)

| UUID | Rol | Contraparte | Monto | Tipo | Estado |
|---|---|---|---|---|---|
| ...000004 | ORIGEN | •••• 0018 | −$12,000.00 | Transferencia | ✅ Completada |
| ...000009 | ORIGEN | •••• 0030 | −$5,500.00 | Transferencia | ✅ Completada |
| ...000011 | DESTINO | •••• 0013 | +$4,500.00 | Compra | ✅ Completada |

#### Datos para demo — Cuenta crédito (account_id = 43)

| UUID | Rol | Contraparte | Monto | Tipo | Estado |
|---|---|---|---|---|---|
| ...000011 | ORIGEN | •••• 0027 | −$4,500.00 | Compra (Coppel Satélite) | ✅ Completada |

#### Filtros y controles (fase MVP — opcionales para demo)

- **Filtro por estado:** Todos / Completadas / Pendientes / Fallidas
- **Rango de fecha:** Selector de mes

#### Acciones

| Acción | Trigger | Destino |
|---|---|---|
| Tap en fila de movimiento | Tap | S-06 Detalle de Movimiento (con `transaction_uuid`) |
| Volver | Flecha | S-03 o S-04 (según `account_id` de contexto) |

#### Estados de pantalla

- **Lista vacía:** "Esta cuenta no tiene movimientos registrados aún."
- **Loading:** Skeleton de lista.
- **Error:** Banner de error con opción de reintentar.

---

### S-06 — Detalle de Movimiento

**Propósito:** Vista de detalle de una transacción individual. Expone la información completa del movimiento, incluyendo el estado de cada etapa del ciclo de vida (log de eventos) para los casos no-COMPLETED.

**Fuente de datos:**
- Para datos básicos: fila de `transactions` JOIN `accounts` (origen y destino).
- Para el log de eventos: `transaction_log` filtrado por `transaction_id`, usado en estados PENDING / FAILED / ROLLED_BACK para mostrar la línea de tiempo del evento.

> **Nota:** La vista `v_detalle_transaccion_completo` está definida como esquema externo del rol Soporte. Para el rol Usuario, el backend expone un subconjunto sin los campos `details` del log (que contienen metadatos operativos internos como IPs y saldos previos).

#### Campos mostrados

**Sección principal:**

| Campo | Origen DB | Formato |
|---|---|---|
| UUID de transacción | `transactions.transaction_uuid` | Texto monoespaciado, copiable, truncado: "0000...0004" |
| Tipo | `transactions.transaction_type` | "Transferencia" / "Compra" / "Depósito" |
| Monto | `transactions.amount` | Cifra grande con signo según `rol_cuenta` |
| Estado | `transactions.status` | Badge prominente |
| Fecha de inicio | `transactions.initiated_at` | Timestamp completo: "4 jun 2025, 09:00:00" |
| Fecha de completado | `transactions.completed_at` | Si es NULL → "—" |

**Sección cuentas involucradas:**

| Campo | Origen DB | Formato |
|---|---|---|
| Cuenta origen | `a_from.account_number` | Número enmascarado + tipo de cuenta |
| Cuenta destino | `a_to.account_number` | Número enmascarado + tipo de cuenta |
| Tarjeta utilizada | `cards.card_number` (si `card_id IS NOT NULL`) | "Pago con tarjeta •••• 0017" |

**Sección línea de tiempo — animada con control Play/Stop (solo para status ≠ COMPLETED):**

Para transacciones en estado `PENDING`, `FAILED` o `ROLLED_BACK`, la secuencia de eventos del `transaction_log` se presenta como una **línea de tiempo animada dirigida** (from → to), controlada por un botón **Play / Stop** en la UI.

**Comportamiento del control:**

| Estado del control | Comportamiento |
|---|---|
| **Stop (estado inicial)** | La línea de tiempo muestra todos los eventos en estado "final" — sin animación; snapshot estático del ciclo de vida |
| **Play (activado)** | Los nodos de la línea de tiempo se revelan secuencialmente, uno a uno, con un intervalo configurable (~600ms entre nodos). El conector visual entre nodos se "dibuja" con una animación de trazo (stroke-dashoffset) de izquierda a derecha |
| **Stop (mientras reproduce)** | Detiene la reproducción en el nodo actual; el progreso se mantiene visible |
| **Replay (completado)** | Al terminar la secuencia completa, el botón cambia a "Reproducir de nuevo" y resetea la animación al inicio |

**Estructura visual de la línea de tiempo:**

```
[INITIATED] ——▶ [DEBIT_APPLIED] ——▶ [CREDIT_APPLIED] ——▶ [COMPLETED / FAILED / COMPENSATED]
     ↑
  nodo activo (highlight animado)
```

- Cada nodo: círculo con ícono + label + timestamp relativo
- Conector entre nodos: línea con animación de trazo dirigido
- Nodo en estado terminal de error (`FAILED`, `COMPENSATED`): color rojo/naranja con ícono diferenciado
- La animación de "dibujo del conector" refuerza visualmente el flujo de valor monetario between accounts

**Eventos del log mapeados a nodos de la timeline:**

| Evento DB | Ícono | Label UI | Color nodo |
|---|---|---|---|
| `INITIATED` | Reloj | "Operación iniciada" | Azul neutro |
| `DEBIT_APPLIED` | Flecha saliente | "Débito aplicado" | Naranja |
| `CREDIT_APPLIED` | Flecha entrante | "Crédito aplicado" | Verde |
| `COMPLETED` | Check doble | "Completada" | Verde sólido |
| `COMPENSATED` | Reversión | "Revertida — monto restaurado" | Naranja |
| `FAILED` | X | "Error en procesamiento" | Rojo |

**Ubicación del botón Play/Stop:** Encabezado de la sección "Línea de tiempo", alineado a la derecha del título. Para transacciones `COMPLETED` esta sección no se renderiza (el historial COMPLETED solo muestra los campos de resumen sin timeline).

#### Datos para demo — Transacción T4

- UUID: `00000000-0000-4000-8000-000000000004`
- Tipo: Transferencia · Estado: Completada
- Monto: $12,000.00 (salida desde débito de Natalia)
- Origen: `DISTCHK0000000027` · Destino: `DISTCHK0000000018`
- Iniciada: 4 jun 2025 09:00 · Completada: 09:00:04

#### Acciones

| Acción | Trigger | Resultado |
|---|---|---|
| Copiar UUID | Ícono de copia junto al UUID | Copy al clipboard |
| Volver | Flecha | S-05 (conserva posición de scroll) |

---

### S-07 — Mis Tarjetas

**Propósito:** Vista centralizada de todos los instrumentos de pago del cliente, organizados por cuenta. Permite al cliente visualizar el estado de cada tarjeta y navegar al control operativo de cualquiera de ellas.

**Fuente de datos:** `v_tarjetas_cliente` con `:customer_id` de sesión.

```sql
SELECT cr.id, cr.card_number, cr.card_type, cr.expiration_date,
       cr.status AS card_status, cr.daily_limit,
       a.account_number, a.account_type
FROM customers c
JOIN customer_accounts ca ON ca.customer_id = c.id
JOIN accounts a ON a.id = ca.checking_account_id OR a.id = ca.credit_account_id
JOIN cards cr ON cr.account_id = a.id
WHERE c.id = :customer_id
ORDER BY a.account_type, cr.issued_at;
```

#### Organización de la pantalla

Las tarjetas se agrupan por cuenta (`account_type`), con separadores visuales:

**Grupo "Tarjetas de Débito" (account_type = 'CHECKING'):**

| Campo por tarjeta | Origen DB |
|---|---|
| Número enmascarado | `cr.card_number` → últimos 4 dígitos con prefijo "••••" |
| Tipo | `cr.card_type` → "Débito" |
| Estado | `cr.status` → Badge: ACTIVE / BLOCKED / EXPIRED / CANCELLED |
| Vencimiento | `cr.expiration_date` → "Vence 09/2028" |
| Límite diario | `cr.daily_limit` → "$15,000.00 / día" |
| Cuenta asociada | `a.account_number` → enmascarado |

**Grupo "Tarjetas de Crédito" (account_type = 'CREDIT'):**
(mismos campos, con `card_type` = "Crédito")

#### Datos para demo — Natalia

| Tarjeta | Tipo | Estado | Límite diario | Vence |
|---|---|---|---|---|
| •••• 0010 | Débito | ✅ ACTIVE | $15,000 | 09/2028 |
| •••• 0011 | Débito (adicional) | ✅ ACTIVE | $5,000 | 03/2027 |
| •••• 0017 | Crédito | ✅ ACTIVE | $20,000 | 09/2028 |
| •••• 0018 | Crédito (extensión) | 🔴 BLOCKED | $10,000 | 09/2027 |

> La tarjeta `••••0018` en estado BLOCKED es el caso de uso principal de la pantalla S-08 para la demo de desbloqueo.

#### Acciones

| Acción | Trigger | Destino |
|---|---|---|
| Tap en cualquier tarjeta | Tap en fila/card | S-08 Detalle + Control de Tarjeta (`card_id` como parámetro) |
| Volver | Flecha o nav bar | S-02 Home |

#### Reglas de presentación por estado

| Status DB | Badge | Acciones disponibles en S-08 |
|---|---|---|
| `ACTIVE` | Verde "Activa" | Bloquear tarjeta |
| `BLOCKED` | Rojo "Bloqueada" | Desbloquear tarjeta |
| `EXPIRED` | Gris "Vencida" | Solo lectura — sin acciones |
| `CANCELLED` | Gris "Cancelada" | Solo lectura — sin acciones |

---

### S-08 — Detalle + Control de Tarjeta

**Propósito:** Vista de detalle de una tarjeta individual. Punto de ejecución de la operación `op_bloqueo_tarjeta` — la única operación de escritura disponible para el rol Usuario.

**Fuente de datos (lectura):** `v_tarjetas_cliente` filtrado por `card_id`.

**Operación de escritura:** `op_bloqueo_tarjeta`:

```sql
UPDATE cards
SET status = :new_status          -- 'BLOCKED' o 'ACTIVE'
WHERE id     = :card_id
  AND status = CASE
                 WHEN :new_status = 'BLOCKED' THEN 'ACTIVE'
                 WHEN :new_status = 'ACTIVE'  THEN 'BLOCKED'
               END;
```

> El constraint de transición de estado está en la query misma: solo se puede bloquear una ACTIVE, solo se puede desbloquear una BLOCKED. Si el `UPDATE` retorna 0 filas, el backend debe retornar un error indicando que el estado actual no permite la operación.

#### Campos mostrados

| Campo | Origen DB | Formato |
|---|---|---|
| Número completo enmascarado | `cr.card_number` | "•••• •••• •••• 0018" |
| Tipo | `cr.card_type` | "Tarjeta de Crédito — Extensión" (inferible de `issued_at` vs cuenta) |
| Estado actual | `cr.status` | Badge prominente, con comunicación clara del significado |
| Vencimiento | `cr.expiration_date` | "09 / 2027" en formato visual de tarjeta |
| Límite diario | `cr.daily_limit` | "$10,000.00 por día" |
| Cuenta asociada | `a.account_number` + `a.account_type` | "Cuenta Crédito •••• 0013" |

#### Control de estado — Switch component

El control de bloqueo se implementa como un **switch toggle** (componente de activación/desactivación), no como un botón CTA. Este patrón comunica de forma más directa e intuitiva el estado binario ACTIVE/BLOCKED y es coherente con la interacción esperada en apps de banca móvil de referencia (BBVA, Nu, Mercado Pago).

| Estado actual | Estado del switch | Label junto al switch | Acción al togglear |
|---|---|---|---|
| `ACTIVE` | ON (encendido) | "Tarjeta activa" | Abre modal de confirmación → `new_status = 'BLOCKED'` |
| `BLOCKED` | OFF (apagado) | "Tarjeta bloqueada" | Abre modal de confirmación → `new_status = 'ACTIVE'` |
| `EXPIRED` | Switch **oculto** — solo badge | — | Sin interacción; badge "Vencida" es el único indicador |
| `CANCELLED` | Switch **oculto** — solo badge | — | Sin interacción; badge "Cancelada" es el único indicador |

**Especificación visual del switch:**
- Ancho mínimo: 52dp · Alto: 28dp (proporciones estándar mobile)
- Estado ON: color accent del sistema (verde) · Estado OFF: gris neutro
- Transición: animación de deslizamiento del thumb ~150ms ease-in-out
- El switch debe estar visualmente separado del badge de estado — el badge comunica el estado canónico de DB; el switch es el control operativo

**Nota de implementación:** Para `EXPIRED` y `CANCELLED`, el switch no se renderiza en el árbol de componentes (no solo `disabled`). El badge de estado permanece visible como único elemento informativo de estado en esa sección.

#### Modal de confirmación (sub-flujo inline)

Aparece sobre S-08 al presionar el CTA. No es pantalla independiente.

**Caso bloqueo (ACTIVE → BLOCKED):**
> "¿Bloquear tarjeta •••• 0018? La tarjeta no podrá utilizarse para ninguna transacción mientras esté bloqueada. Puedes desbloquearla en cualquier momento."
> [Cancelar] [Bloquear tarjeta]

**Caso desbloqueo (BLOCKED → ACTIVE):**
> "¿Desbloquear tarjeta •••• 0018? La tarjeta quedará habilitada para realizar transacciones inmediatamente."
> [Cancelar] [Desbloquear tarjeta]

#### Estados post-operación

| Resultado | UI |
|---|---|
| Éxito | S-08 se actualiza reflejando el nuevo `status` · Toast: "Tarjeta bloqueada / desbloqueada correctamente" |
| Error (0 filas afectadas) | Toast de error: "No fue posible actualizar el estado de la tarjeta. Intenta de nuevo." |
| Error de red | Toast de error con opción de reintentar |

#### Acciones de navegación

| Acción | Destino |
|---|---|
| Volver | S-07 Mis Tarjetas |

---

### S-09 — Nueva Transferencia — Formulario

**Propósito:** Pantalla de composición de una transferencia. Cubre el caso de transferencia entre cuentas propias y hacia cuentas de terceros (número de cuenta de destino libre). La pantalla es reutilizable para cualquier tipo de cuenta de origen; el `from_account_id` se pre-popula desde el contexto de navegación (S-03, S-04 o el CTA global de S-02).

**Fuente de datos (lectura):** `v_perfil_financiero_cliente` — para mostrar el saldo disponible de la cuenta de origen en tiempo real y habilitar validación de fondos suficientes en el cliente antes del envío.

**Operación de escritura:** Iniciación de transacción → `INSERT INTO transactions` + primer evento `INITIATED` en `transaction_log` (ejecutado por el backend como parte del patrón SAGA).

#### Campos del formulario

| Campo | Tipo | Origen del valor | Validación |
|---|---|---|---|
| Cuenta de origen | Selector (dropdown o toggle) | Pre-poblado desde contexto; editable si el cliente tiene ambas cuentas activas | Requerido · Solo cuentas `ACTIVE` |
| Saldo disponible (informativo) | Solo lectura | `accounts.balance` de la cuenta seleccionada | — |
| Cuenta de destino | `input[type=text]` | Ingreso manual del número de cuenta | Requerido · Formato DISTCHK/DISTCRD + 10 dígitos · No igual a cuenta origen |
| Monto | `input[type=number]` | Ingreso manual | Requerido · > 0 · ≤ saldo disponible + `overdraft_limit` (si aplica) |
| Concepto / descripción | `input[type=text]` | Opcional | Máximo 100 caracteres |

> **Constraint crítico visible en la UI:** Si `from_account_id = to_account_id`, el sistema debe rechazar antes del submit (`from_account_id != to_account_id` está definido como CHECK en la tabla `transactions`). Validar en el frontend para evitar el round-trip.

#### Reglas de validación de monto por tipo de cuenta de origen

| Tipo | Máximo permitido | Mensaje de error si excede |
|---|---|---|
| `CHECKING` | `balance + overdraft_limit` | "Saldo insuficiente. Tienes $56,000.00 + $1,500.00 de sobregiro disponible." |
| `CREDIT` | `available_credit` | "Crédito insuficiente. Tienes $8,000.00 disponibles en tu línea de crédito." |

#### Acciones

| Acción | Condición | Destino |
|---|---|---|
| Continuar | Todos los campos válidos | S-10 Confirmación de Transferencia |
| Cancelar | Siempre | Regresa a la pantalla de origen (S-03, S-04 o S-02) |

---

### S-10 — Confirmación de Transferencia

**Propósito:** Pantalla de resumen antes de ejecutar la operación. Permite al usuario revisar todos los datos ingresados antes de comprometer la transacción. **No ejecuta ninguna operación de DB** — es un paso de validación de UX.

**Fuente de datos:** Estado local del formulario completado en S-09 (no requiere nueva consulta a DB).

#### Campos mostrados (resumen de la operación)

| Campo | Origen | Formato |
|---|---|---|
| De | `from_account_id` resuelto | "Cuenta Débito •••• 0027 — Saldo $56,000.00" |
| Para | `to_account_number` ingresado | "DISTCHK0000000018" (o enmascarado si ya se resolvió) |
| Monto | `amount` | "$12,000.00" — cifra grande, tipografía prominente |
| Concepto | `description` o "Sin concepto" | Texto |
| Fecha estimada | Calculada | "Hoy, [hora actual]" |

#### Acciones

| Acción | Trigger | Resultado |
|---|---|---|
| Confirmar y transferir | Botón principal | Ejecuta la operación → navega a S-11 |
| Editar | Botón secundario / volver | Regresa a S-09 con datos pre-cargados |

#### Estado de carga

Al confirmar: botón en estado loading, pantalla bloqueada para prevenir doble envío. El `transaction_uuid` se genera en el frontend (UUIDv4) antes del submit para soporte de idempotencia en retries.

---

### S-11 — Resultado de Transferencia

**Propósito:** Pantalla de retroalimentación post-operación. Comunica el resultado de la transacción al cliente e informa el estado inicial registrado en el sistema.

**Fuente de datos:** Respuesta del backend tras la operación de iniciación. El backend devuelve:
- `transaction_uuid` — generado o confirmado
- `status` inicial — típicamente `COMPLETED` si la operación es intra-nodo, o `PENDING` si es *cross-nodo*
- `initiated_at` — timestamp del evento `INITIATED` en `transaction_log`

#### Estados posibles y su presentación

**Estado: COMPLETED (caso nominal intra-nodo)**

- Ícono: Check animado (verde)
- Título: "Transferencia exitosa"
- Detalle: Monto, cuenta destino, timestamp
- UUID: Texto copiable para soporte
- CTAs: "Ir al inicio" · "Ver detalle" (→ S-06 con el `transaction_uuid`)

**Estado: PENDING (operación cross-nodo o en cola)**

- Ícono: Reloj (amarillo)
- Título: "Transferencia en proceso"
- Detalle: "Tu operación está siendo procesada. Recibirás confirmación en breve."
- UUID: Texto copiable
- CTAs: "Ir al inicio" · "Ver estado" (→ S-06)

**Estado: FAILED (error en el procesamiento)**

- Ícono: X (rojo)
- Título: "No se pudo completar la transferencia"
- Detalle: Mensaje genérico de error orientado al usuario (sin metadatos técnicos internos)
- UUID: Texto copiable (para reportar a soporte)
- CTAs: "Intentar de nuevo" (→ S-09 con datos pre-cargados) · "Ir al inicio"

**Estado: ROLLED_BACK (reversión SAGA)**

- Ícono: Reversión (naranja)
- Título: "Transferencia revertida"
- Detalle: "La operación no pudo completarse y el monto fue restaurado a tu cuenta."
- CTAs: "Ir al inicio" · "Ver detalle"

#### Acciones de navegación

| Acción | Destino |
|---|---|
| Ir al inicio | S-02 Home |
| Ver detalle | S-06 (con `transaction_uuid` del resultado) |
| Intentar de nuevo | S-09 (con datos pre-cargados del intento fallido) |

---

## 3. Resumen de vistas y operaciones DB por pantalla

| Pantalla | Vista / Operación | Parámetro |
|---|---|---|
| S-02 Home | `v_perfil_financiero_cliente` | `:customer_id` |
| S-03 Detalle Débito | `v_perfil_financiero_cliente` | `:customer_id` (fila CHECKING) |
| S-04 Detalle Crédito | `v_perfil_financiero_cliente` | `:customer_id` (fila CREDIT) |
| S-05 Historial | `v_historial_transacciones_cuenta` | `:account_id` (27 o 43) |
| S-06 Detalle Movimiento | `transactions` + `transaction_log` | `:transaction_uuid` |
| S-07 Mis Tarjetas | `v_tarjetas_cliente` | `:customer_id` |
| S-08 Control Tarjeta | `v_tarjetas_cliente` (lectura) + `op_bloqueo_tarjeta` (escritura) | `:card_id` |
| S-09 Nueva Transferencia | `v_perfil_financiero_cliente` (validación saldo) | `:customer_id` |
| S-10 Confirmación | Estado local (sin consulta DB) | — |
| S-11 Resultado | Respuesta de backend (operación de escritura) | — |

---

## 4. Invariantes de seguridad del rol

Las siguientes restricciones deben respetarse en **todas** las pantallas sin excepción:

1. **Aislamiento de datos:** Toda consulta lleva el `:customer_id` de la sesión activa como filtro primario. El backend no debe aceptar un `customer_id` diferente al autenticado, independientemente del valor que envíe el cliente.

2. **Número de tarjeta:** `cards.card_number` se expone siempre enmascarado (solo últimos 4 dígitos). El campo `cvv` nunca se incluye en ninguna respuesta de la API del cliente.

3. **Transaction log restringido:** El campo `details` del `transaction_log` (que contiene IPs, saldos previos y metadatos operativos) no se expone en ninguna pantalla del rol Usuario. Solo el rol Soporte accede a ese campo vía `v_detalle_transaccion_completo`.

4. **Validación de transición de estado en tarjetas:** La operación `op_bloqueo_tarjeta` valida la transición en la query misma. El frontend debe también deshabilitar el CTA para estados `EXPIRED` y `CANCELLED`.

5. **Idempotencia en transferencias:** El `transaction_uuid` se genera en el cliente antes del submit. Si el usuario reenvía por timeout, el backend detecta el UUID duplicado y devuelve el estado de la transacción existente sin crear una nueva.

---

## 5. Guía de estados de cuenta para el diseño visual

| `accounts.status` | Etiqueta ES | Color badge sugerido | Restricciones funcionales en UI |
|---|---|---|---|
| `ACTIVE` | Activa | Verde | Todas las acciones habilitadas |
| `INACTIVE` | Inactiva | Gris | Sin transferencias; solo lectura |
| `FROZEN` | Congelada | Azul oscuro / hielo | Sin transferencias; solo lectura |
| `CLOSED` | Cerrada | Gris oscuro | No aparece en Home; accesible solo en historial |

| `cards.status` | Etiqueta ES | Color badge sugerido |
|---|---|---|
| `ACTIVE` | Activa | Verde |
| `BLOCKED` | Bloqueada | Rojo |
| `EXPIRED` | Vencida | Gris |
| `CANCELLED` | Cancelada | Gris oscuro |

| `transactions.status` | Etiqueta ES | Color badge sugerido |
|---|---|---|
| `COMPLETED` | Completada | Gris neutro / texto muted |
| `PENDING` | En proceso | Amarillo / ámbar |
| `FAILED` | Fallida | Rojo |
| `ROLLED_BACK` | Revertida | Naranja |

---

*Fin del documento — DistriBank Customer Screen Flow Spec v1.0*
*Revisión pendiente: flujos de error de red y estados de carga para cada pantalla (fase iterativa siguiente)*
