# 03 Frontend > Sistema de Rutas

> Prerrequisitos: [Entrada de la aplicación](01_entrada_aplicacion.md)

Fuente: `packages/frontend/src/router/index.tsx`

## Mapa de rutas

Ver [diagrama de navegación](../diagramas/navegacion_spa.md).

```typescript
createBrowserRouter([
  { path: '/login',   element: <LoginPage /> },          // Pública
  {
    element: <PrivateRoute />,                            // Guarda
    children: [{
      element: <AppShell />,                              // Layout
      children: [
        { path: '/',                              element: <HomePage /> },
        { path: '/accounts/debit',                element: <AccountDebitPage /> },
        { path: '/accounts/credit',               element: <AccountCreditPage /> },
        { path: '/accounts/:accountId/transactions', element: <TransactionHistoryPage /> },
        { path: '/transactions',                  element: <AllTransactionsPage /> },
        { path: '/transactions/:uuid',            element: <TransactionDetailPage /> },
        { path: '/cards',                         element: <CardsPage /> },
        { path: '/cards/:cardId',                 element: <CardDetailPage /> },
        { path: '/transfer',                      element: <TransferPage /> },
        { path: '/transfer/confirm',              element: <TransferConfirmPage /> },
        { path: '/transfer/result',               element: <TransferResultPage /> },
      ],
    }],
  },
])
```

## PrivateRoute (`src/router/PrivateRoute.tsx`)

```typescript
function PrivateRoute() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
```

- Lee el token de Zustand (que se inicializa desde sessionStorage)
- Si no hay token → redirige a `/login`
- Si hay token → renderiza `<Outlet />` (las rutas hijas)

## AppShell (`src/components/layout/AppShell.tsx`)

Layout principal que envuelve todas las páginas protegidas:

```
┌─────────────────────────────────────────┐
│ SidebarNav (240px / 64px collapsed)     │ Contenido (<Outlet />)
│                                         │
│ - Inicio (/)                            │  ┌────────────────────────┐
│ - Transacciones (/transactions)         │  │    Página actual       │
│ - Tarjetas (/cards)                     │  │                        │
│ - Transferir (/transfer)                │  │                        │
│                                         │  └────────────────────────┘
│ - Cerrar sesión                         │
└─────────────────────────────────────────┘
```

- Sidebar colapsable en desktop (240px ↔ 64px)
- Drawer en mobile
- `<Outlet />` renderiza la página de la ruta actual

## Tabla de rutas

| Ruta | Página | Spec | Params | Hooks usados |
|------|--------|------|--------|-------------|
| `/login` | LoginPage | S-01 | — | useLogin |
| `/` | HomePage | S-02 | — | useProfile |
| `/accounts/debit` | AccountDebitPage | S-03 | — | useProfile |
| `/accounts/credit` | AccountCreditPage | S-04 | — | useProfile |
| `/accounts/:accountId/transactions` | TransactionHistoryPage | S-05 | accountId | useTransactions |
| `/transactions` | AllTransactionsPage | — | — | useTransactions (ambas cuentas) |
| `/transactions/:uuid` | TransactionDetailPage | S-06 | uuid | useTransactionDetail |
| `/cards` | CardsPage | S-07 | — | useCards |
| `/cards/:cardId` | CardDetailPage | S-08 | cardId | useCards, useToggleCard |
| `/transfer` | TransferPage | S-09 | — | useProfile |
| `/transfer/confirm` | TransferConfirmPage | S-10 | — | useTransfer |
| `/transfer/result` | TransferResultPage | S-11 | — | — (usa location state) |

## Navegación programática

Las páginas usan `useNavigate()` para transiciones:

```typescript
const navigate = useNavigate()
navigate('/')                                           // Ir a home
navigate(-1)                                            // Volver atrás
navigate('/transfer/confirm', { state: transferData })  // Pasar datos vía state
```

El flujo de transferencia pasa datos entre páginas usando `location.state` en vez de URL params.

## Documentos relacionados

- [Diagrama de navegación](../diagramas/navegacion_spa.md) — flowchart visual
- [Páginas detalle](09_paginas_detalle.md) — cada página con sus componentes
- [Estado global auth](03_estado_global_auth.md) — cómo se verifica el token
