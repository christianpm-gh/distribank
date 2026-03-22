# DistriBank Frontend

<p align="center">
  <img src="src/assets/distribank-logo-readme.svg" alt="DistriBank" width="720" />
</p>

Frontend SPA para **DistriBank** — sistema bancario distribuido académico.

Aplicación completa del rol **Cliente** con dark mode nativo, mocks MSW y lista para conectarse a un backend NestJS.

## Stack tecnológico

| Categoría | Tecnología |
|---|---|
| Framework | React 19 + TypeScript strict |
| Build | Vite 8 |
| Estilos | Tailwind CSS v4 (dark mode nativo) |
| Animaciones | Framer Motion |
| Routing | React Router v6 |
| Data fetching | React Query (TanStack Query) |
| HTTP | Axios (interceptor Bearer) |
| Estado global | Zustand |
| Validación | Zod |
| Mocks | MSW (Mock Service Worker) |
| Deploy | Vercel |

## Inicio rápido

```bash
# Clonar el repositorio
git clone https://github.com/christianpm-gh/distribank-fe.git
cd distribank-fe

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación se abre en `http://localhost:5173`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (TypeScript + Vite) |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Linting con ESLint |

## Estructura del proyecto

```
src/
  components/
    ui/              # Átomos: StatusBadge, VIPBadge, SignedAmount, etc.
    layout/          # Header, BottomNav
    cards/           # AccountCard, PhysicalCard, CreditUsageBar, CardControlSwitch
    transactions/    # TransactionRow, TransactionTimeline
  pages/
    LoginPage.tsx          # S-01 — Autenticación
    HomePage.tsx           # S-02 — Panel principal con resumen financiero
    AccountDebitPage.tsx   # S-03 — Detalle cuenta débito
    AccountCreditPage.tsx  # S-04 — Detalle cuenta crédito
    TransactionHistoryPage.tsx  # S-05 — Historial de movimientos
    TransactionDetailPage.tsx   # S-06 — Detalle con timeline animada
    CardsPage.tsx          # S-07 — Lista de tarjetas
    CardDetailPage.tsx     # S-08 — Control de bloqueo/desbloqueo
    TransferPage.tsx       # S-09 — Formulario de transferencia
    TransferConfirmPage.tsx     # S-10 — Confirmación
    TransferResultPage.tsx      # S-11 — Resultado de operación
  hooks/             # React Query hooks por dominio
  store/             # Zustand auth store
  services/          # Axios services por dominio
  router/            # React Router v6 con rutas protegidas
  mocks/
    handlers/        # MSW handlers por dominio
    data/            # Datos de demo (Natalia Ruiz Castillo)
  types/             # Tipos TypeScript de todos los contratos API
  lib/               # Utilidades: formatCurrency, maskAccountNumber, formatDate
```

## Flujo de navegación

```
Login → Home
         ├── Cuenta Débito → Historial → Detalle movimiento (timeline)
         ├── Cuenta Crédito → Historial → Detalle movimiento
         ├── Tarjetas → Detalle tarjeta (bloqueo/desbloqueo)
         └── Transferir → Confirmar → Resultado
```

## Perfil de demo — Natalia Ruiz Castillo

| Recurso | Identificador | Datos clave |
|---|---|---|
| Cliente | `customer_id = 27` | Nodo A |
| Cuenta débito | `DISTCHK0000000027` | Saldo $56,000.00 · Sobregiro $1,500.00 |
| Cuenta crédito | `DISTCRD0000000013` | Adeudo $12,000.00 · Disponible $8,000.00 |
| Tarjeta débito titular | `****0010` | ACTIVE · Vence 09/2028 |
| Tarjeta débito adicional | `****0011` | ACTIVE · Vence 03/2027 |
| Tarjeta crédito titular | `****0017` | ACTIVE · Vence 09/2028 |
| Tarjeta crédito extensión | `****0018` | BLOCKED · Vence 09/2027 |

El historial incluye transacciones en estados COMPLETED, PENDING, FAILED y ROLLED_BACK con log events para la timeline animada.

## Sistema de diseño

La interfaz usa **dark mode nativo** con tokens de diseño definidos en `src/index.css`:

- **Tipografía:** Sora (display/headings), Inter (body), JetBrains Mono (datos)
- **Paleta:** Superficies oscuras (#0F172A → #1E293B → #273549) con acentos azul (#1A56DB) y dorado (#F7A440)
- **Componentes clave:**
  - `VIPBadge` con animación de vibración cíclica cada 8s (clientes con ≥3 transacciones/semana)
  - `TransactionTimeline` con reproducción secuencial Play/Pause/Replay
  - `CardControlSwitch` con modal de confirmación inline
  - `CreditUsageBar` con umbrales de color por utilización

## Variables de entorno

```env
VITE_API_BASE_URL=http://localhost:3000/api    # Backend NestJS (futuro)
VITE_ENABLE_MSW=true                           # Toggle mocks (desactivar en producción)
```

## Deploy

El proyecto está configurado para Vercel con `vercel.json` (SPA rewrites).

```bash
# Build de producción
npm run build

# Push a producción
git push origin main
```

Branch de producción: `main`. Vercel detecta el push automáticamente.

## Documentación de referencia

| Documento | Contenido |
|---|---|
| `docs/01_screen_flow_spec.md` | Pantallas, campos, fuentes de datos, estados |
| `docs/02_component_system.md` | Tokens, átomos, moléculas, layout |
| `docs/03_navigation_diagram.md` | Mapa de navegación (Mermaid) |

## Interfaz en español

Toda la UI está en **español**: labels, placeholders, mensajes de error, toasts y textos visibles al usuario. El código fuente (variables, comentarios, rutas) está en inglés.
