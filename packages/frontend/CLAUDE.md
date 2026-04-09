# CLAUDE.md — DistriBank Frontend

## Identidad del proyecto
Repositorio: `distribank-fe`
Descripción: Frontend SPA para DistriBank — sistema bancario distribuido académico.
Stack: React 18 + Vite + TypeScript strict + Tailwind CSS + Framer Motion +
       React Router v6 + React Query + Axios + Zustand + Zod + MSW

## Documentación de referencia
Toda decisión de UI, componente o flujo debe trazarse a uno de estos documentos:
- `docs/01_screen_flow_spec.md`   — pantallas, campos, fuentes de datos, estados
- `docs/02_component_system.md`   — tokens, átomos, moléculas, layout
- `docs/03_navigation_diagram.md` — mapa de navegación (Mermaid)

## Idioma
La interfaz de usuario es obligatoriamente en **español**.
Esto incluye: labels, placeholders, mensajes de error, toasts, tooltips y
cualquier texto visible al usuario final.
Código, nombres de variables, comentarios técnicos y rutas: inglés.

## Convención de commits — Conventional Commits (obligatorio)

Formato: `<tipo>(<scope>): <descripción en imperativo, español>`

Tipos permitidos:
- feat     — nueva funcionalidad
- fix      — corrección de bug
- style    — cambios de estilo/CSS sin lógica
- refactor — refactor sin cambio de comportamiento
- test     — tests
- chore    — setup, configuración, dependencias
- docs     — documentación

Scopes sugeridos (uno por commit):
auth | home | accounts | cards | transactions | transfer | components | tokens | msw | router | deploy

Ejemplos válidos:
  feat(auth): implementar formulario de login con validación Zod
  feat(cards): agregar switch de control de tarjeta con modal de confirmación
  style(tokens): aplicar paleta de color dark mode desde sistema de componentes
  chore(deps): instalar y configurar MSW para mocks de API
  chore(deploy): agregar configuración de Vercel

## Commits atómicos — regla estricta
Un commit = una unidad lógica de trabajo indivisible.
NO agrupar múltiples componentes en un solo commit.
NO commitear trabajo incompleto que rompa el build.
Cada commit debe dejar el proyecto en estado funcional.

## Estrategia de mocks — MSW (Mock Service Worker)
Todos los endpoints del backend se mockean con MSW en `src/mocks/`.
Estructura:
  src/mocks/
    handlers/
      auth.handlers.ts
      accounts.handlers.ts
      cards.handlers.ts
      transactions.handlers.ts
      transfer.handlers.ts
    browser.ts          ← setup del service worker
    data/
      natalia.ts        ← datos del cliente de demo (customer_id=27, Nodo A)

Los mocks deben usar los datos exactos de Natalia Ruiz Castillo definidos
en `docs/01_screen_flow_spec.md` sección "Cliente de referencia para la demo".

El contrato de autenticación es:
  POST /api/auth/login
  Body: { email: string, password: string }
  Response: { access_token: string, customer_id: number, role: string, expires_in: number }

Todas las rutas protegidas llevan header:
  Authorization: Bearer <access_token>

## Estructura de directorios objetivo
src/
  assets/
  components/
    ui/           ← átomos: StatusBadge, VIPBadge, SignedAmount, etc.
    layout/       ← Header, BottomNav
    cards/        ← AccountCard, PhysicalCard
    transactions/ ← TransactionRow, TransactionTimeline
    transfer/     ← formulario, confirmación
  pages/
    LoginPage.tsx
    HomePage.tsx
    AccountDebitPage.tsx
    AccountCreditPage.tsx
    TransactionHistoryPage.tsx
    TransactionDetailPage.tsx
    CardsPage.tsx
    CardDetailPage.tsx
    TransferPage.tsx
    TransferConfirmPage.tsx
    TransferResultPage.tsx
  hooks/
    useAuth.ts
    useAccounts.ts
    useCards.ts
    useTransactions.ts
    useTransfer.ts
  store/
    authStore.ts    ← Zustand: { token, customerId, role }
  services/
    api.ts          ← instancia Axios con interceptor Bearer
    auth.service.ts
    accounts.service.ts
    cards.service.ts
    transactions.service.ts
    transfer.service.ts
  router/
    index.tsx       ← React Router v6, rutas protegidas
    PrivateRoute.tsx
  mocks/            ← MSW (ver arriba)
  types/
    api.types.ts    ← tipos TypeScript de todos los responses
  lib/
    utils.ts        ← formatCurrency, maskAccountNumber, formatDate

## Variables de entorno
VITE_API_BASE_URL=http://localhost:3000/api    ← backend NestJS futuro
VITE_ENABLE_MSW=true                           ← toggle para deshabilitar mocks en prod

## Deploy
Plataforma: Vercel
El proyecto incluye `vercel.json` con configuración de SPA (rewrites a index.html).
El deploy se conecta al repo GitHub `christianpm-gh/distribank-fe`.
Branch de producción: `main`.

## Instrucción final
Al terminar la implementación completa:
1. Verificar que `npm run build` pasa sin errores de TypeScript
2. Hacer push de todos los commits a `origin main`
3. Confirmar que Vercel detecta el push y genera el preview URL

## Skills activas

Las siguientes skills definen criterios de diseño y deben leerse antes de
cualquier tarea de UI:

- `.claude/skills/frontend-design.md` — criterios estéticos, desktop-first,
  y regla de sync con docs/02_component_system.md

## Contrato documental

`docs/02_component_system.md` es la fuente de verdad de tokens, anatomía y
comportamiento de todos los componentes. Todo cambio de UI se refleja en este
archivo en el mismo commit donde ocurre el cambio de código.
```