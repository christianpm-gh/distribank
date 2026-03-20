# DistriBank — Sistema de Componentes Base
## Especificación para diseño Figma (Rol: Cliente)

---

## 0. Tokens de diseño

Estos tokens son el contrato entre spec y Figma. Toda decisión de componente referencia estos valores — no se hardcodean colores ni espaciados directamente.

### Paleta de color

| Token | Valor hex | Uso |
|---|---|---|
| `color.brand.primary` | `#1A56DB` | CTAs primarios, links, elementos de acción principal |
| `color.brand.accent` | `#F7A440` | Badges VIP, highlights, elementos premium |
| `color.surface.base` | `#0F172A` | Fondo global (dark mode nativo — contexto bancario) |
| `color.surface.card` | `#1E293B` | Superficie de tarjetas / contenedores |
| `color.surface.elevated` | `#273549` | Modales, drawers, elementos sobre cards |
| `color.text.primary` | `#F1F5F9` | Texto principal |
| `color.text.secondary` | `#94A3B8` | Labels secundarios, metadatos, fechas |
| `color.text.muted` | `#475569` | Placeholders, texto deshabilitado |
| `color.status.success` | `#22C55E` | ACTIVE, COMPLETED, switch ON |
| `color.status.warning` | `#F59E0B` | PENDING, alertas no críticas |
| `color.status.error` | `#EF4444` | FAILED, BLOCKED, acciones destructivas |
| `color.status.neutral` | `#64748B` | EXPIRED, CANCELLED, estados inactivos |
| `color.status.rollback` | `#F97316` | ROLLED_BACK, COMPENSATED — naranja diferenciado |
| `color.credit.bar.used` | `#3B82F6` | Segmento "usado" en barra de crédito |
| `color.credit.bar.available` | `#1E3A5F` | Segmento "disponible" en barra de crédito |
| `color.vip.gold` | `#F7A440` | Badge VIP y estrella |
| `color.vip.glow` | `rgba(247,164,64,0.15)` | Halo/glow detrás del badge VIP |

### Tipografía

| Token | Familia | Peso | Tamaño | Uso |
|---|---|---|---|---|
| `type.display` | Sora | 700 | 32px | Cifras monetarias principales |
| `type.heading.lg` | Sora | 600 | 20px | Títulos de sección / pantalla |
| `type.heading.sm` | Sora | 600 | 16px | Subtítulos, labels de tarjeta |
| `type.body` | Inter | 400 | 14px | Texto de cuerpo general |
| `type.body.medium` | Inter | 500 | 14px | Labels de campos, etiquetas |
| `type.caption` | Inter | 400 | 12px | Metadatos, fechas, texto muted |
| `type.mono` | JetBrains Mono | 400 | 12px | UUIDs, números de cuenta completos |

### Espaciado (escala 4px)

| Token | Valor | Uso |
|---|---|---|
| `space.1` | 4px | Gaps mínimos entre elementos inline |
| `space.2` | 8px | Padding interno de badges y chips |
| `space.3` | 12px | Gaps entre componentes relacionados |
| `space.4` | 16px | Padding horizontal de cards, padding de sección |
| `space.5` | 20px | Separación entre secciones |
| `space.6` | 24px | Padding interno de cards principales |
| `space.8` | 32px | Separación entre grupos visuales |

### Radio de borde

| Token | Valor | Uso |
|---|---|---|
| `radius.sm` | 6px | Badges, chips, inputs |
| `radius.md` | 12px | Cards secundarias, botones |
| `radius.lg` | 16px | Cards principales (cuenta, tarjeta) |
| `radius.xl` | 24px | Modales, bottom sheets |
| `radius.full` | 9999px | Switch, avatares, badges pill |

---

## 1. Componentes atómicos

---

### C-01 — Badge de estado (`StatusBadge`)

Componente de una sola responsabilidad: comunicar el estado de una entidad (cuenta, tarjeta, transacción). Aparece en S-02, S-03, S-04, S-05, S-07, S-08.

**Variantes por `status`:**

| Variante | Token de color | Label ES | Ícono |
|---|---|---|---|
| `active` | `color.status.success` | "Activa" | — |
| `blocked` | `color.status.error` | "Bloqueada" | 🔒 (12px) |
| `expired` | `color.status.neutral` | "Vencida" | — |
| `cancelled` | `color.status.neutral` | "Cancelada" | — |
| `completed` | `color.text.muted` | "Completada" | — |
| `pending` | `color.status.warning` | "En proceso" | — |
| `failed` | `color.status.error` | "Fallida" | — |
| `rolled_back` | `color.status.rollback` | "Revertida" | — |

**Anatomía:**

```
[  ● Label  ]
  ↑
  dot de 6px con color.status.*
  border-radius: radius.full
  padding: space.1 space.2
  background: color.status.* con opacity 15%
  font: type.caption, peso 500
```

**Especificación de tamaño:**
- Alto: 20px
- Padding horizontal: 8px · Padding vertical: 2px
- Gap entre dot y label: 4px

---

### C-02 — Badge VIP (`VIPBadge`)

Componente de identidad de estatus. Aparece en S-03 y S-04 como parte del indicador de actividad semanal. Condicional: solo se renderiza si `week_transactions >= 3`.

**Anatomía:**

```
[ ⭐  VIP  ·  {n} mov. esta semana ]
   ↑
   Estrella: color.vip.gold, 12px
   "VIP": type.caption, peso 700, color.vip.gold
   Separador "·": color.text.muted
   Contador: type.caption, peso 500, color.text.secondary
   background: color.vip.glow
   border: 1px solid color.vip.gold con opacity 40%
   border-radius: radius.full
   padding: space.1 space.2
```

**Animación de vibración (auto-trigger + ciclo cada 8s):**

```css
@keyframes vip-shake {
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-2px) rotate(-1deg); }
  40%  { transform: translateX(2px) rotate(1deg); }
  60%  { transform: translateX(-2px) rotate(-0.5deg); }
  80%  { transform: translateX(1px) rotate(0.5deg); }
  100% { transform: translateX(0); }
}
/* Duración: 400ms · Timing: ease-in-out · Iteraciones: 3 */
/* El componente gestiona el trigger internamente con un interval */
```

**Nota de handoff para Figma:** Definir como componente con propiedad booleana `isVIP`. Cuando `isVIP = false`, el componente renderiza únicamente el contador de texto plano sin badge ni animación.

---

### C-03 — Chip de tipo de transacción (`TransactionTypeChip`)

Aparece en S-05 (fila de movimiento) y S-06 (detalle). Comunica el tipo de operación.

**Variantes:**

| `transaction_type` | Label | Ícono |
|---|---|---|
| `TRANSFER` | "Transferencia" | ↔ |
| `PURCHASE` | "Compra" | 🛒 |
| `DEPOSIT` | "Depósito" | ↓ |

**Estilo:** Sin color de fondo diferenciado — solo borde sutil (`color.surface.elevated`) y texto `type.caption`. El color del monto en la fila (`±`) es el elemento cromático que comunica dirección, no este chip.

---

### C-04 — Indicador de dirección de movimiento (`DirectionIndicator`)

Aparece en cada fila de S-05 y en S-06.

**Variantes:**

| `rol_cuenta` | Ícono | Color | Significado |
|---|---|---|---|
| `ORIGEN` | ↑ o flecha saliente | `color.status.error` (rojo suave) | El cliente pagó / transfirió |
| `DESTINO` | ↓ o flecha entrante | `color.status.success` (verde suave) | El cliente recibió |

**Tamaño:** Contenedor circular 32×32px · Ícono 16px centrado · Background: color de variante con opacity 12%.

---

### C-05 — Monto con signo (`SignedAmount`)

Aparece en S-05 (filas), S-06 (detalle), S-10 (confirmación), S-11 (resultado).

**Reglas de formato:**

| Condición | Prefijo | Color del texto | Ejemplo |
|---|---|---|---|
| `rol_cuenta = ORIGEN` | − | `color.status.error` | −$12,000.00 |
| `rol_cuenta = DESTINO` | + | `color.status.success` | +$4,500.00 |
| En S-09/S-10 (neutro) | Sin prefijo | `color.text.primary` | $12,000.00 |

**Formato de número:** Separador de miles con coma · Dos decimales siempre · Prefijo "MXN $" en contextos donde la moneda no es implícita (S-06 detalle).

**Variantes de tamaño:**
- `sm`: `type.body` (filas de historial)
- `lg`: `type.display` (detalle de movimiento, pantalla de resultado)

---

## 2. Componentes moleculares

---

### C-06 — Tarjeta de cuenta (`AccountCard`)

Componente de mayor densidad visual del sistema. Aparece como elemento central en S-02 y como header en S-03 y S-04.

**Variantes por `account_type`:**

#### Variante CHECKING (débito)

```
┌─────────────────────────────────────────┐
│  Cuenta Débito          [Badge: Activa] │  ← type.heading.sm + StatusBadge C-01
│  •••• 0027                              │  ← type.caption, color.text.muted
│                                         │
│  $56,000.00                             │  ← type.display, color.text.primary
│                                         │
│  Sobregiro hasta $1,500.00              │  ← type.caption, color.text.secondary
│                                         │
│  [VIPBadge · 8 mov. esta semana]        │  ← C-02, solo si week_tx ≥ 3
└─────────────────────────────────────────┘
```

- Background: `color.surface.card`
- Border: 1px solid `color.surface.elevated`
- Border-radius: `radius.lg`
- Padding: `space.6`
- Sombra: `0 4px 24px rgba(0,0,0,0.3)`

#### Variante CREDIT (crédito)

```
┌─────────────────────────────────────────┐
│  Cuenta Crédito         [Badge: Activa] │
│  •••• 0013                              │
│                                         │
│  $12,000.00 adeudados                   │  ← "adeudados" en color.text.secondary
│                                         │
│  ████████████░░░░░░░░  60%              │  ← CreditBar C-07
│  $8,000.00 disponibles de $20,000.00    │  ← type.caption
│                                         │
│  [VIPBadge · 4 mov. esta semana]        │
└─────────────────────────────────────────┘
```

**Propiedad de tamaño:**
- `size=full` (S-02): ancho 100% del contenedor · altura ~160px
- `size=compact` (header en S-03/S-04): altura ~100px, sin barra de crédito expandida

---

### C-07 — Barra de utilización de crédito (`CreditUsageBar`)

Parte del `AccountCard` variante CREDIT. Componente independiente para reutilización en S-04.

**Anatomía:**

```
Segmento usado [████████████] Segmento disponible [░░░░░░░░]
               ↑                                   ↑
        color.credit.bar.used            color.credit.bar.available
```

- Alto de la barra: 6px
- Border-radius: `radius.full`
- La proporción de segmentos se calcula: `(credit_limit - available_credit) / credit_limit`
- Para Natalia: `(20000 - 8000) / 20000 = 60%` → segmento usado ocupa 60% del ancho
- Porcentaje en label derecho: `type.caption`, `color.text.secondary`

**Umbrales de color del segmento usado:**

| Utilización | Color del segmento usado |
|---|---|
| < 60% | `color.credit.bar.used` (azul) |
| 60%–80% | `color.status.warning` (ámbar) |
| > 80% | `color.status.error` (rojo) |

---

### C-08 — Fila de movimiento (`TransactionRow`)

Componente de lista. Se repite en S-05 (historial) y en la sección de movimientos recientes de S-03/S-04.

**Anatomía:**

```
[DirectionIndicator C-04] [Tipo + Contraparte]     [SignedAmount C-05]
                          [TransactionTypeChip C-03] [StatusBadge C-01]
                          [Fecha relativa]
```

**Layout:** Flexbox horizontal. Columna izquierda: `DirectionIndicator` (32px fijo). Columna central: flex-grow. Columna derecha: `SignedAmount` + `StatusBadge` alineados a la derecha.

**Separación entre filas:** Divider de 1px `color.surface.elevated` · sin padding extra.

**Estado hover/pressed:** Background `color.surface.elevated` con transición 100ms.

**Variante `size=compact`** (movimientos recientes en S-03/S-04): sin `TransactionTypeChip`, sin `StatusBadge` — solo `DirectionIndicator`, concepto, monto y fecha.

---

### C-09 — Tarjeta física (`PhysicalCard`)

Representación visual de una tarjeta bancaria. Aparece en S-07 (lista) y S-08 (detalle).

**Anatomía — variante lista (S-07):**

```
┌─────────────────────────────────────────┐
│  [Ícono tipo]  •••• 0010   [StatusBadge]│
│  Débito · Vence 09/2028                 │
│  Límite diario $15,000.00               │
└─────────────────────────────────────────┘
```

**Anatomía — variante detalle (S-08):**

```
┌─────────────────────────────────────────┐
│                                         │
│  •••• •••• •••• 0017                    │  ← type.mono, mayor tamaño
│                                         │
│  NATALIA RUIZ          09/2028          │
│  Crédito Titular                        │
│                                         │
│  Límite diario: $20,000.00              │
└─────────────────────────────────────────┘
```

**Estilo visual diferenciado por tipo:**
- DEBIT: gradiente sutil `#1E293B → #273549`, acento azul
- CREDIT: gradiente `#1A1A3E → #2D2B55`, acento dorado tenue

**Overlay de estado bloqueado (solo `status = BLOCKED`):**
- Overlay semitransparente rojo sobre la card: `rgba(239, 68, 68, 0.08)`
- Ícono de candado centrado, 24px, `color.status.error`
- El gradiente de fondo se desatura visualmente (filter: saturate(40%))

**Estado EXPIRED / CANCELLED:**
- Toda la card en escala de grises: filter: `grayscale(80%)`
- Sin overlay — solo la desaturación comunica inactividad

---

### C-10 — Switch de control de tarjeta (`CardControlSwitch`)

Componente exclusivo de S-08. Controla `op_bloqueo_tarjeta`.

**Anatomía:**

```
Tarjeta activa     [  ●──  ]   ← switch ON, color.status.success
Tarjeta bloqueada  [  ──●  ]   ← switch OFF, color.text.muted
```

- Dimensiones del track: 52×28px
- Thumb: 22×22px · centrado verticalmente · margin interno 3px
- Transición del thumb: 150ms ease-in-out
- Label a la izquierda del switch: `type.body.medium`
- Cuando `status = EXPIRED` o `CANCELLED`: el componente completo no se renderiza; solo permanece el `StatusBadge C-01`

**Sub-componente — Modal de confirmación inline:**

No es una pantalla independiente — es un `bottom sheet` (mobile) o un `dialog` centrado (web) que se eleva sobre S-08.

```
┌─────────────────────────────────┐
│  ¿[Bloquear / Desbloquear]      │  ← type.heading.sm
│  tarjeta •••• 0018?             │
│                                 │
│  [Texto explicativo]            │  ← type.body, color.text.secondary
│                                 │
│  [Cancelar]   [Confirmar acción]│  ← botones secundario + primario
└─────────────────────────────────┘
```

- Botón "Confirmar acción": variante destructiva si es bloqueo, constructiva si es desbloqueo
- Backdrop: overlay oscuro con `rgba(0,0,0,0.6)` y blur(4px)

---

### C-11 — Timeline de transacción (`TransactionTimeline`)

Componente exclusivo de S-06. Solo se renderiza para transacciones con `status IN ('PENDING', 'FAILED', 'ROLLED_BACK')`.

**Anatomía de un nodo:**

```
●── [Ícono 16px]  [Label evento]            [Timestamp]
│
│  (conector vertical animado)
│
●── ...
```

**Nodo:**
- Círculo: 32×32px · border 2px · background `color.surface.elevated`
- Ícono: 16px centrado
- Color del borde y del ícono según el tipo de evento (ver tabla en spec S-06)
- Nodo terminal de error (`FAILED`, `COMPENSATED`): borde `color.status.error`, glow `box-shadow: 0 0 8px color.status.error`

**Conector entre nodos:**
- Línea vertical de 2px · `color.surface.elevated` como estado base
- Animación Play: `stroke-dashoffset` de arriba hacia abajo, duración 500ms por segmento, timing `ease-in-out`

**Control Play/Stop:**

```
Línea de tiempo   [▶ Reproducir]   ← alineado a la derecha del título de sección
                  [⏸ Pausar]       ← mientras reproduce
                  [↺ Reproducir de nuevo] ← al completar la secuencia
```

- Botón: `type.caption`, borde sutil `color.surface.elevated`, `radius.sm`
- Icono + label inline

**Estados del reproductor:**

| Estado | Botón visible | Comportamiento |
|---|---|---|
| Inicial | ▶ Reproducir | Todos los nodos visibles en estado final estático |
| Reproduciendo | ⏸ Pausar | Nodos se revelan secuencialmente; conectores se animan |
| Pausado | ▶ Continuar | Congelado en el nodo actual |
| Completado | ↺ Reproducir de nuevo | Resetea al estado inicial y vuelve a reproducir |

---

## 3. Componentes de layout

---

### C-12 — Bottom Navigation Bar

Presente en todas las pantallas post-login excepto S-09, S-10, S-11 (flujo modal de transferencia).

**Ítems de navegación:**

| Ítem | Ícono | Pantalla destino | Estado activo |
|---|---|---|---|
| Inicio | Casa | S-02 | Underline + `color.brand.primary` |
| Tarjetas | Tarjeta | S-07 | Underline + `color.brand.primary` |
| Transferir | Flecha doble | S-09 | — (acción, no destino) |

- Alto: 64px + safe area inferior (dispositivos con notch)
- Background: `color.surface.card` + border-top 1px `color.surface.elevated`
- El ítem "Transferir" actúa como CTA rápido global — no tiene estado activo, solo estado pressed

### C-13 — Header de pantalla

Presente en S-03 al S-11.

**Variantes:**

- `with-back`: Flecha ← + Título centrado. Aparece en S-03, S-04, S-06, S-08, S-10
- `with-back-action`: Flecha ← + Título + acción secundaria derecha. Aparece en S-05 (acción: filtro)
- `modal`: Sin flecha, sin título fijo — solo ×. Para S-11

---

## 4. Inventario de componentes por pantalla

| Pantalla | Componentes usados |
|---|---|
| S-01 Login | Inputs, botón primario |
| S-02 Home | C-06 AccountCard ×2, C-12 Nav Bar, C-02 VIPBadge (condicional) |
| S-03 Detalle Débito | C-06 (compact), C-08 TransactionRow ×3, C-02 VIPBadge, C-13 Header |
| S-04 Detalle Crédito | C-06 (compact), C-07 CreditUsageBar, C-08 ×3, C-02 VIPBadge, C-13 Header |
| S-05 Historial | C-08 TransactionRow (lista), C-01 StatusBadge, C-13 Header |
| S-06 Detalle Movimiento | C-05 SignedAmount (lg), C-01, C-11 TransactionTimeline, C-13 Header |
| S-07 Mis Tarjetas | C-09 PhysicalCard (lista), C-01, C-12 Nav Bar, C-13 Header |
| S-08 Control Tarjeta | C-09 PhysicalCard (detalle), C-10 CardControlSwitch, C-01, C-13 Header |
| S-09 Transferencia | C-06 (mini selector), inputs, C-13 Header |
| S-10 Confirmación | C-05 SignedAmount, resumen estático, C-13 Header |
| S-11 Resultado | C-05 SignedAmount (lg), ícono de estado animado, CTAs |

---

*DistriBank Component System v1.0 — base para Figma*
*Pendiente: definición de estados de error y skeleton loaders por componente (iteración siguiente)*
