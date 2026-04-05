# 03 Frontend > Páginas en Detalle

> Prerrequisitos: [Sistema de rutas](02_sistema_rutas.md), [Hooks React Query](05_hooks_react_query.md)

Spec de referencia: `packages/frontend/docs/01_screen_flow_spec.md`

## S-01: LoginPage (`/login`)

- **Hooks:** `useLogin()`
- **Validación:** Zod schema — email formato válido, password >= 8 chars
- **Flujo:** Form submit → Zod validate → mutation → onSuccess: store.login() + navigate('/')
- **Error:** Muestra mensaje de "Credenciales inválidas" del backend

## S-02: HomePage (`/`)

- **Hooks:** `useProfile()`
- **Componentes:** AccountCard (x2), VIPBadge (condicional)
- **Datos:** `profile.customer.name`, `profile.accounts[0]` (CHECKING), `profile.accounts[1]` (CREDIT)
- **VIP badge:** Se muestra si `account.week_transactions >= 3`
- **Navegación:** Click en account → `/accounts/debit` o `/accounts/credit`

## S-03: AccountDebitPage (`/accounts/debit`)

- **Hooks:** `useProfile()`
- **Componentes:** AccountCard (full), Header con back
- **Datos:** Filtra `accounts.find(a => a.account_type === 'CHECKING')`
- **Muestra:** Saldo, sobregiro, transacciones semanales
- **Navegación:** "Ver transacciones" → `/accounts/27/transactions`

## S-04: AccountCreditPage (`/accounts/credit`)

- **Hooks:** `useProfile()`
- **Componentes:** AccountCard (full), CreditUsageBar, Header con back
- **Datos:** Filtra `accounts.find(a => a.account_type === 'CREDIT')`
- **Muestra:** Adeudo, límite, disponible, barra de uso
- **CreditUsageBar:** `used = Math.abs(balance)`, `limit = credit_limit`

## S-05: TransactionHistoryPage (`/accounts/:accountId/transactions`)

- **Hooks:** `useTransactions(accountId)`
- **Componentes:** TransactionRow (list variant), Header con back
- **Params:** `accountId` desde URL
- **Datos:** Lista de transacciones ordenadas por `initiated_at` DESC
- **Navegación:** Click en transacción → `/transactions/:uuid`

## AllTransactionsPage (`/transactions`)

- **Hooks:** `useProfile()`, `useTransactions()` (para ambas cuentas)
- **Componentes:** TransactionRow (table variant)
- **No está en el spec original** (S-01 a S-11) — es una adición
- **Muestra:** Todas las transacciones de ambas cuentas combinadas

## S-06: TransactionDetailPage (`/transactions/:uuid`)

- **Hooks:** `useTransactionDetail(uuid)`
- **Componentes:** TransactionTimeline, StatusBadge, SignedAmount, Header
- **Params:** `uuid` desde URL
- **Datos:** transaction + from_account + to_account + card? + log_events
- **Timeline:** Reproduce visualmente los log events con animación
- **Estados visuales:**
  - COMPLETED: timeline completa (4 nodos verdes)
  - PENDING: timeline parcial (2 nodos, último pulsando)
  - FAILED/ROLLED_BACK: nodos rojos/naranjas

## S-07: CardsPage (`/cards`)

- **Hooks:** `useCards()`
- **Componentes:** PhysicalCard (list variant), Header
- **Datos:** Lista de 4 tarjetas agrupadas visualmente por tipo (DEBIT primero)
- **Navegación:** Click en tarjeta → `/cards/:cardId`

## S-08: CardDetailPage (`/cards/:cardId`)

- **Hooks:** `useCards()`, `useToggleCard()`
- **Componentes:** PhysicalCard (detail variant), CardControlSwitch, Header con back
- **Params:** `cardId` desde URL, busca en array de cards
- **CardControlSwitch:**
  - ACTIVE/BLOCKED: switch habilitado con modal de confirmación
  - EXPIRED/CANCELLED: switch deshabilitado
- **Mutation:** `useToggleCard` → invalida cache de cards

## S-09: TransferPage (`/transfer`)

- **Hooks:** `useProfile()`
- **Componentes:** Form con selects e inputs, Header
- **Campos:** Cuenta origen (select), cuenta destino (input), monto (input), descripción (optional)
- **Validación:** Cuenta destino formato `DIST(CHK|CRD)\d{10}`, monto > 0
- **Genera UUID v4** para idempotencia antes de navegar
- **Navegación:** "Continuar" → `/transfer/confirm` via `navigate` con `state`

## S-10: TransferConfirmPage (`/transfer/confirm`)

- **Hooks:** `useTransfer()`
- **Datos:** Lee de `location.state` (pasados desde TransferPage)
- **Muestra:** Resumen de la transferencia (no ejecuta nada todavía)
- **Acciones:** "Confirmar" → ejecuta mutation → navega a `/transfer/result`; "Volver" → `-1`

## S-11: TransferResultPage (`/transfer/result`)

- **Datos:** Lee resultado de `location.state`
- **Estados visuales:**
  - COMPLETED: icono verde, mensaje de éxito
  - ROLLED_BACK: icono naranja, mensaje de rollback
  - FAILED: icono rojo, mensaje de error
  - PENDING: icono amarillo, mensaje de procesando
- **CTAs:** "Nueva transferencia" → `/transfer`; "Ir al inicio" → `/`

## Documentos relacionados

- [Screen Flow Spec](../../packages/frontend/docs/01_screen_flow_spec.md) — especificación formal
- [Diagrama de navegación](../diagramas/navegacion_spa.md) — flujo entre páginas
- [Sistema de componentes](06_sistema_componentes.md) — componentes usados
