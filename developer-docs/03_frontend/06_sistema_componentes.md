# 03 Frontend > Sistema de Componentes

> Prerrequisitos: [Sistema de rutas](02_sistema_rutas.md)

Referencia detallada del diseño: `packages/frontend/docs/02_component_system.md`

## Capas de componentes

```
src/components/
├── ui/               ← Átomos: componentes base sin lógica de datos
├── cards/            ← Moléculas: tarjetas y cuentas
├── transactions/     ← Moléculas: transacciones y timeline
├── transfer/         ← Formulario de transferencia
└── layout/           ← Layout: shell, sidebar, header, nav
```

## ui/ — Átomos

| Componente | Props principales | Descripción |
|-----------|------------------|-------------|
| **StatusBadge** | `status: string` | Badge con color e icono según estado (ACTIVE verde, BLOCKED rojo, PENDING amarillo, etc.) |
| **VIPBadge** | `weekTransactions: number` | Muestra badge dorado si `weekTransactions >= 3`. Animación shake con Framer Motion cada 8 segundos. |
| **SignedAmount** | `amount: number, role: TransactionRole` | Formato moneda con signo: ORIGEN muestra `-$12,000.00` (rojo), DESTINO muestra `+$4,500.00` (verde) |
| **AccountTypeBadge** | `type: AccountType` | Badge pequeño: CHECKING (azul, "Cheques"), CREDIT (dorado, "Crédito") |
| **DirectionIndicator** | `role: TransactionRole` | Flecha: ORIGEN = ↗ rojo, DESTINO = ↙ verde |
| **TransactionTypeChip** | `type: TransactionType` | Chip: TRANSFER (azul), PURCHASE (morado), DEPOSIT (verde) |

## cards/ — Tarjetas y cuentas

| Componente | Props principales | Descripción |
|-----------|------------------|-------------|
| **AccountCard** | `account: Account, size?: 'full' \| 'compact'` | Card con balance, tipo de cuenta, estado. Tamaño `full` para página de detalle, `compact` para home. |
| **PhysicalCard** | `card: Card, variant?: 'list' \| 'detail'` | Representación visual de tarjeta física con gradiente. BLOCKED: overlay de candado. EXPIRED/CANCELLED: grayscale. |
| **CreditUsageBar** | `used: number, limit: number` | Barra de progreso de uso de crédito. < 60% azul, 60-80% ámbar, > 80% rojo. |
| **CardControlSwitch** | `card: Card, onToggle: fn` | Toggle switch (52x28px) para ACTIVE ↔ BLOCKED. Muestra modal de confirmación antes de ejecutar. Deshabilitado para EXPIRED/CANCELLED. |

## transactions/ — Transacciones

| Componente | Props principales | Descripción |
|-----------|------------------|-------------|
| **TransactionRow** | `transaction: Transaction, variant: 'list' \| 'table' \| 'card'` | Fila de transacción adaptable. `list`: layout horizontal compacto. `table`: fila para tabla. `card`: tarjeta independiente. Muestra StatusBadge, SignedAmount, DirectionIndicator. |
| **TransactionTimeline** | `events: TransactionLogEvent[]` | Timeline animada con reproductor (play/pause/replay). Cada evento se muestra con un nodo y conector. Intervalo de 600ms entre eventos. Estados: idle → playing → paused → completed. |

## layout/ — Layout y navegación

| Componente | Props principales | Descripción |
|-----------|------------------|-------------|
| **AppShell** | — (usa Outlet) | Layout principal: SidebarNav + contenido. Gestiona estado collapsed del sidebar. |
| **SidebarNav** | `collapsed: boolean, onToggle: fn` | Sidebar desktop: 240px expandido / 64px colapsado. Mobile: drawer overlay. Links: Inicio, Transacciones, Tarjetas, Transferir, Cerrar sesión. |
| **Header** | `title: string, onBack?: fn, action?: ReactNode` | Header de página con botón back opcional y acción derecha opcional. |
| **BottomNav** | — | Navegación inferior para mobile (deprecado en favor de sidebar). |

## Convenciones de componentes

- **Functional components** con TypeScript
- **Props** definidas como `type Props = { ... }` en el mismo archivo
- **Sin `forwardRef`** — componentes simples
- **Framer Motion** para animaciones (VIPBadge shake, timeline transitions)
- **Lucide React** para iconos
- **Tailwind classes** inline (no CSS modules)

## Documentos relacionados

- [Sistema de diseño](07_sistema_diseno.md) — tokens de color, tipografía, spacing
- [Component System spec](../../packages/frontend/docs/02_component_system.md) — fuente de verdad formal
- [Guía: agregar componente](../09_guias_comunes/03_agregar_componente.md)
