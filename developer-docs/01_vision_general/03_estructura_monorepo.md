# 01 Visión General > Estructura del Monorepo

> Prerrequisitos: [Arquitectura del sistema](01_arquitectura_sistema.md)

## Raíz del monorepo

```
distribank-fe/
├── package.json                    ← npm workspaces: packages/*
├── CLAUDE.md                       ← Convenciones de desarrollo (scopes, commits)
├── README.md                       ← Overview del monorepo
├── .gitignore                      ← node_modules, dist, .env, .claude/
├── packages/
│   ├── frontend/                   ← SPA React
│   └── backend/                    ← API NestJS
└── developer-docs/                 ← Esta documentación (local, fuera del repo)
```

El `package.json` raíz solo define workspaces — no tiene dependencias propias:
```json
{ "workspaces": ["packages/*"] }
```

## Frontend (`packages/frontend/`)

```
packages/frontend/
├── index.html                      ← Entry HTML, carga Google Fonts (Sora, Inter, JetBrains Mono)
├── package.json                    ← Dependencias frontend
├── vite.config.ts                  ← Plugins: react(), tailwindcss(). Alias: @/ → src/
├── vercel.json                     ← Rewrites SPA: todas las rutas → /index.html
├── tsconfig.json                   ← References: tsconfig.app.json + tsconfig.node.json
├── tsconfig.app.json               ← Target ES2023, strict, JSX react-jsx, alias @/
├── eslint.config.js                ← ESLint con react-hooks
├── .env                            ← VITE_API_BASE_URL, VITE_ENABLE_MSW
├── CLAUDE.md                       ← Contrato de desarrollo frontend
├── README.md                       ← Especificación completa del SPA
│
├── public/
│   └── mockServiceWorker.js        ← Worker de MSW (generado)
│
├── src/
│   ├── main.tsx                    ← Entry point: enableMocking() → render App
│   ├── App.tsx                     ← QueryClient + RouterProvider
│   ├── index.css                   ← Design tokens (@theme): colores, tipografía, spacing
│   │
│   ├── router/
│   │   ├── index.tsx               ← createBrowserRouter con 12 rutas
│   │   └── PrivateRoute.tsx        ← Guarda: redirige a /login si no hay token
│   │
│   ├── store/
│   │   └── authStore.ts            ← Zustand: { token, customerId, role } + sessionStorage
│   │
│   ├── services/
│   │   ├── api.ts                  ← Axios instance + Bearer interceptor
│   │   ├── auth.service.ts         ← login(email, password)
│   │   ├── accounts.service.ts     ← getProfile(customerId)
│   │   ├── cards.service.ts        ← getCards(customerId), toggleCardStatus(cardId, status)
│   │   ├── transactions.service.ts ← getTransactions(accountId), getTransactionDetail(uuid)
│   │   └── transfer.service.ts     ← createTransfer(data)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              ← useLogin() mutation
│   │   ├── useAccounts.ts          ← useProfile() query
│   │   ├── useCards.ts             ← useCards() query, useToggleCard() mutation
│   │   ├── useTransactions.ts      ← useTransactions(accountId), useTransactionDetail(uuid)
│   │   └── useTransfer.ts          ← useTransfer() mutation
│   │
│   ├── types/
│   │   └── api.types.ts            ← Todos los tipos TypeScript de la API (126 líneas)
│   │
│   ├── lib/
│   │   └── utils.ts                ← formatCurrency, maskCardNumber, formatDate, etc.
│   │
│   ├── components/
│   │   ├── ui/                     ← Átomos (componentes base)
│   │   │   ├── StatusBadge.tsx     ← Badge de estado con color e icono
│   │   │   ├── VIPBadge.tsx        ← Badge VIP con animación shake cada 8s
│   │   │   ├── SignedAmount.tsx     ← Monto con signo (+/-) y color según rol
│   │   │   ├── AccountTypeBadge.tsx ← Badge CHECKING (azul) / CREDIT (dorado)
│   │   │   ├── DirectionIndicator.tsx ← Flecha de dirección (ORIGEN/DESTINO)
│   │   │   └── TransactionTypeChip.tsx ← Chip de tipo (TRANSFER/PURCHASE/DEPOSIT)
│   │   │
│   │   ├── cards/                  ← Componentes de tarjetas y cuentas
│   │   │   ├── AccountCard.tsx     ← Card de cuenta con balance y datos
│   │   │   ├── PhysicalCard.tsx    ← Representación visual de tarjeta física
│   │   │   ├── CreditUsageBar.tsx  ← Barra de uso de crédito
│   │   │   └── CardControlSwitch.tsx ← Toggle ACTIVE↔BLOCKED con modal
│   │   │
│   │   ├── transactions/           ← Componentes de transacciones
│   │   │   ├── TransactionRow.tsx  ← Fila de transacción (variantes: list, table, card)
│   │   │   └── TransactionTimeline.tsx ← Timeline animada de log events
│   │   │
│   │   ├── transfer/               ← Componentes del flujo de transferencia
│   │   │
│   │   └── layout/                 ← Layout y navegación
│   │       ├── AppShell.tsx        ← Layout principal: sidebar + contenido
│   │       ├── SidebarNav.tsx      ← Sidebar colapsable (240px / 64px)
│   │       ├── Header.tsx          ← Header de página con botón back
│   │       └── BottomNav.tsx       ← Nav inferior (mobile)
│   │
│   ├── pages/                      ← Páginas (targets de las rutas)
│   │   ├── LoginPage.tsx           ← S-01: Login con validación Zod
│   │   ├── HomePage.tsx            ← S-02: Resumen de cuentas + VIP badge
│   │   ├── AccountDebitPage.tsx    ← S-03: Detalle cuenta débito
│   │   ├── AccountCreditPage.tsx   ← S-04: Detalle cuenta crédito
│   │   ├── TransactionHistoryPage.tsx ← S-05: Historial por cuenta
│   │   ├── AllTransactionsPage.tsx ← Historial global (no en spec original)
│   │   ├── TransactionDetailPage.tsx ← S-06: Detalle con timeline
│   │   ├── CardsPage.tsx           ← S-07: Listado de tarjetas
│   │   ├── CardDetailPage.tsx      ← S-08: Control de tarjeta
│   │   ├── TransferPage.tsx        ← S-09: Formulario de transferencia
│   │   ├── TransferConfirmPage.tsx ← S-10: Confirmación
│   │   └── TransferResultPage.tsx  ← S-11: Resultado
│   │
│   ├── mocks/                      ← MSW (Mock Service Worker)
│   │   ├── browser.ts             ← setupWorker() con todos los handlers
│   │   ├── data/
│   │   │   └── natalia.ts         ← Datos demo de Natalia Ruiz Castillo
│   │   └── handlers/
│   │       ├── auth.handlers.ts    ← POST /api/auth/login (500ms delay)
│   │       ├── accounts.handlers.ts ← GET /api/customers/:id/profile (300ms)
│   │       ├── cards.handlers.ts   ← GET cards + PATCH toggle (300ms/600ms)
│   │       ├── transactions.handlers.ts ← GET list + GET detail (300ms)
│   │       └── transfer.handlers.ts ← POST /api/transfers (1000ms)
│   │
│   └── assets/                     ← Logo e imágenes
│
└── docs/                           ← Especificaciones del proyecto
    ├── 01_screen_flow_spec.md      ← Spec de 11 pantallas (~700 líneas)
    ├── 02_component_system.md      ← Sistema de diseño: tokens + 16 componentes
    ├── 03_navigation_diagram.md    ← Mermaid flowchart de navegación
    ├── backend-specs/              ← Especificaciones del backend
    │   ├── 00_resumen_integracion.md
    │   ├── 01_catalogo_endpoints.md
    │   ├── 02_tipos_y_dtos.md
    │   └── 03_reglas_negocio.md
    ├── spec_distribank_doc/        ← Documentación académica del sistema distribuido
    │   ├── 01_descripcion_general.md
    │   ├── 02_esquema_conceptual.md
    │   ├── 03_diccionario_datos.md
    │   ├── 04_requisitos_sbdd.md
    │   ├── 05_acceso_esquemas_externos.md
    │   ├── 06_descripcion_nodos.md
    │   └── 07_fragmentacion_algebra.md
    └── ddl_data_distribank/        ← SQL para crear y poblar las 3 bases de datos
        ├── 00_ddl_base.sql         ← DDL base (6 tablas, aplicar en los 3 nodos)
        ├── 01_nodo_a_data.sql      ← Datos del Nodo A
        ├── 02_nodo_b_data.sql      ← Datos del Nodo B
        ├── 03_nodo_c_data.sql      ← Datos del Nodo C
        ├── 04_ddl_vip_schema.sql   ← Schema VIP en Nodo C
        └── 05_nodo_c_vip_data.sql  ← Datos VIP
```

## Backend (`packages/backend/`)

```
packages/backend/
├── package.json                    ← Dependencias backend
├── tsconfig.json                   ← Target ES2023, strict, CommonJS, decorators
├── nest-cli.json                   ← sourceRoot: src
├── .env.example                    ← Template de variables de entorno
│
├── prisma/
│   ├── schema.prisma               ← 6 modelos: customers, accounts, customer_accounts,
│   │                                  cards, transactions, transaction_log
│   └── seed.ts                     ← Datos demo de Natalia (customer_id=27)
│
└── src/
    ├── main.ts                     ← Bootstrap: globalPrefix("/api"), CORS, ValidationPipe
    ├── app.module.ts               ← Root module: 7 imports
    │
    ├── database/                   ← Módulo de base de datos distribuida (@Global)
    │   ├── database.module.ts      ← 3 PrismaService factories + NodeRouterService
    │   ├── prisma.service.ts       ← Extends PrismaClient con URL dinámica
    │   └── node-router.service.ts  ← Routing: customer_id % 3 → nodo-a/b/c
    │
    ├── auth/                       ← Autenticación
    │   ├── auth.module.ts          ← JwtModule + PassportModule
    │   ├── auth.controller.ts      ← POST /api/auth/login
    │   ├── auth.service.ts         ← Busca email en 3 nodos, bcrypt, JWT sign
    │   ├── dto/
    │   │   └── login.dto.ts        ← @IsEmail, @MinLength(8)
    │   ├── guards/
    │   │   └── jwt-auth.guard.ts   ← extends AuthGuard("jwt")
    │   └── strategies/
    │       └── jwt.strategy.ts     ← Bearer extraction, payload → { customerId, role }
    │
    ├── customers/                  ← Perfil del cliente
    │   ├── customers.module.ts
    │   ├── customers.controller.ts ← GET /api/customers/:id/profile
    │   └── customers.service.ts    ← Query customer + accounts, serialización BigInt
    │
    ├── cards/                      ← Gestión de tarjetas
    │   ├── cards.module.ts
    │   ├── cards.controller.ts     ← GET cards, PATCH toggle
    │   ├── cards.service.ts        ← Validación transiciones ACTIVE↔BLOCKED
    │   └── dto/
    │       └── toggle-card.dto.ts  ← @IsIn(["ACTIVE", "BLOCKED"])
    │
    ├── transactions/               ← Consulta de transacciones
    │   ├── transactions.module.ts
    │   ├── transactions.controller.ts ← GET by account, GET detail by uuid
    │   └── transactions.service.ts ← Calcula rol_cuenta, serializa log events
    │
    └── transfers/                  ← Ejecución de transferencias
        ├── transfers.module.ts
        ├── transfers.controller.ts ← POST /api/transfers
        ├── transfers.service.ts    ← SAGA: intra-node + cross-node + compensación
        └── dto/
            └── create-transfer.dto.ts ← @IsUUID, @Matches regex, @Min(0.01)
```

## Convención de nombres

- **Módulos NestJS**: `<nombre>.module.ts` — siempre con sufijo `.module`
- **Controladores**: `<nombre>.controller.ts` — endpoints HTTP
- **Servicios**: `<nombre>.service.ts` — lógica de negocio
- **DTOs**: `dto/<nombre>.dto.ts` — validación de entrada
- **Páginas React**: `<Nombre>Page.tsx` — componentes de ruta
- **Componentes React**: `<NombrePascal>.tsx` — componentes reutilizables
- **Hooks**: `use<Nombre>.ts` — hooks personalizados
- **Servicios frontend**: `<nombre>.service.ts` — llamadas API

## Documentos relacionados

- [Arquitectura del sistema](01_arquitectura_sistema.md)
- [Setup frontend](../02_inicio_rapido/02_setup_frontend.md)
- [Setup backend](../02_inicio_rapido/03_setup_backend.md)
