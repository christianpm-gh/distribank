# 03 Frontend > Mocks MSW

> Prerrequisitos: [Entrada de la aplicación](01_entrada_aplicacion.md)

## Arquitectura

MSW (Mock Service Worker) intercepta requests HTTP **dentro del navegador** usando un Service Worker. No necesitas backend para desarrollo frontend.

```
Componente → React Query → Axios → MSW (intercepta) → handler → datos mock
                                    ↳ (si MSW desactivado) → Backend real
```

## Archivos

```
src/mocks/
├── browser.ts              ← setupWorker() con todos los handlers
├── data/
│   └── natalia.ts          ← Datos demo de Natalia Ruiz Castillo
└── handlers/
    ├── auth.handlers.ts        ← POST /api/auth/login
    ├── accounts.handlers.ts    ← GET /api/customers/:id/profile
    ├── cards.handlers.ts       ← GET cards + PATCH toggle
    ├── transactions.handlers.ts ← GET transactions + GET detail
    └── transfer.handlers.ts    ← POST /api/transfers
```

## Activación

En `main.tsx`:
```typescript
if (import.meta.env.VITE_ENABLE_MSW !== 'true') return  // Desactivado
const { worker } = await import('./mocks/browser')       // Import dinámico
return worker.start({ onUnhandledRequest: 'bypass' })    // No interceptar otros requests
```

## Handlers por endpoint

| Handler | Ruta | Delay | Comportamiento |
|---------|------|-------|---------------|
| `auth.handlers.ts` | `POST /api/auth/login` | 500ms | Valida email y password contra `natalia.ts` |
| `accounts.handlers.ts` | `GET /api/customers/:id/profile` | 300ms | Retorna customer + 2 accounts |
| `cards.handlers.ts` | `GET /api/customers/:id/cards` | 300ms | Retorna 4 cards |
| `cards.handlers.ts` | `PATCH /api/cards/:id/toggle` | 600ms | Toggle ACTIVE ↔ BLOCKED in memory |
| `transactions.handlers.ts` | `GET /api/accounts/:id/transactions` | 300ms | Filtra por account_id |
| `transactions.handlers.ts` | `GET /api/transactions/:uuid` | 300ms | Retorna detail con log events |
| `transfer.handlers.ts` | `POST /api/transfers` | 1000ms | Siempre retorna COMPLETED |

## Datos demo (`data/natalia.ts`)

El archivo exporta todos los datos de Natalia tipados:

- `customer` — Customer: id=27, Natalia Ruiz Castillo
- `DEMO_PASSWORD` — `'Distribank2025!'`
- `accounts` — 2 accounts (CHECKING id=27, CREDIT id=43)
- `cards` — 4 cards (2 debit, 2 credit, una BLOCKED)
- `checkingTransactions` — 6 transacciones de la cuenta débito
- `creditTransactions` — 1 transacción de la cuenta crédito
- `transactionDetails` — Record<uuid, TransactionDetail> con 6 entries
- Log events por estado: T4 (COMPLETED, 4 events), T15 (PENDING, 2), T20 (FAILED, 3), T25 (ROLLED_BACK, 4)

## Diferencia MSW vs Backend real

| Aspecto | MSW | Backend real |
|---------|-----|-------------|
| Balance CREDIT | `-12000` (negativo) | `12000` (positivo) |
| `description` | Tiene valor en T11 | Siempre `null` |
| Toggle card | In-memory (se pierde al recargar) | Persistente en BD |
| Transfer | Siempre COMPLETED | Puede ser COMPLETED o ROLLED_BACK |
| `isOrigin` en detail | Correctamente calculado | Hardcodeado como `true` |

## Documentos relacionados

- [Datos de Natalia](../05_base_datos/05_seed_datos_demo.md) — datos equivalentes en la BD
- [Verificación demo](../02_inicio_rapido/04_verificacion_demo.md) — checklist
- [Guía: agregar mock](../09_guias_comunes/04_agregar_mock_msw.md) — paso a paso
