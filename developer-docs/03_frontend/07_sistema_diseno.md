# 03 Frontend > Sistema de Diseño

> Prerrequisitos: [Sistema de componentes](06_sistema_componentes.md)

Fuente: `packages/frontend/src/index.css`

## Design Tokens

Definidos con Tailwind v4 `@theme` — accesibles como clases Tailwind y CSS variables:

### Colores de marca

| Token | Hex | Uso | Clase Tailwind |
|-------|-----|-----|---------------|
| `--color-brand-primary` | `#1A56DB` | Botones primarios, links activos | `bg-brand-primary` |
| `--color-brand-accent` | `#F7A440` | Acentos, badge VIP, cuenta crédito | `text-brand-accent` |

### Superficies (dark mode)

| Token | Hex | Uso | Clase Tailwind |
|-------|-----|-----|---------------|
| `--color-surface-base` | `#0F172A` | Fondo del body | `bg-surface-base` |
| `--color-surface-card` | `#1E293B` | Fondo de cards | `bg-surface-card` |
| `--color-surface-elevated` | `#273549` | Hover states, elementos elevados | `bg-surface-elevated` |

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-text-primary` | `#F1F5F9` | Texto principal |
| `--color-text-secondary` | `#94A3B8` | Labels, subtítulos |
| `--color-text-muted` | `#475569` | Texto deshabilitado |

### Estados

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-status-success` | `#22C55E` | ACTIVE, COMPLETED, DESTINO |
| `--color-status-warning` | `#F59E0B` | PENDING, crédito 60-80% |
| `--color-status-error` | `#EF4444` | BLOCKED, FAILED, ORIGEN |
| `--color-status-neutral` | `#64748B` | EXPIRED, CANCELLED |
| `--color-status-rollback` | `#F97316` | ROLLED_BACK |

### VIP

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-vip-gold` | `#F7A440` | Badge VIP |
| `--color-vip-glow` | `rgba(247, 164, 64, 0.15)` | Glow del badge VIP |

### Crédito

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-credit-used` | `#3B82F6` | Barra de crédito usado |
| `--color-credit-available` | `#1E3A5F` | Barra de crédito disponible |

## Tipografía

| Token | Familia | Uso |
|-------|---------|-----|
| `--font-sora` | Sora, sans-serif | Headings, display text, nombre del usuario |
| `--font-inter` | Inter, sans-serif | Body text, labels, párrafos (font default del body) |
| `--font-mono` | JetBrains Mono, monospace | Números de cuenta, montos, UUIDs |

Las fuentes se cargan desde Google Fonts en `index.html`.

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 6px | Badges, chips |
| `--radius-md` | 12px | Cards, inputs |
| `--radius-lg` | 16px | Modales |
| `--radius-xl` | 24px | Containers grandes |
| `--radius-full` | 9999px | Avatares, pills |

## Layout

| Token | Valor | Uso |
|-------|-------|-----|
| `--sidebar-width` | 240px | Sidebar expandido |
| `--sidebar-collapsed` | 64px | Sidebar colapsado |
| `--content-max-width` | 1280px | Ancho máximo del contenido |
| `--panel-sm/md/lg/xl` | 280-420px | Paneles laterales |
| `--content-padding` | 24px | Padding del contenido |

## Responsividad

| Breakpoint | Ancho | Comportamiento |
|-----------|-------|---------------|
| **< 768px (sm)** | Mobile | Sidebar como drawer, 1 columna |
| **768px (md)** | Tablet | Sidebar colapsado, 1-2 columnas |
| **1024px (lg)** | Desktop | Sidebar expandido, 2 columnas |
| **1280px (xl)** | Desktop wide | Max-width del contenido, 2-3 columnas |

**Enfoque:** Desktop-first (el diseño principal es para 1280px+).

## Dark mode

El sistema es **dark-mode only** — no hay tema claro. El `body` siempre tiene `background-color: var(--color-surface-base)` (#0F172A).

## Documentos relacionados

- [Component System spec](../../packages/frontend/docs/02_component_system.md) — tokens formales
- [Sistema de componentes](06_sistema_componentes.md) — cómo usan los tokens
