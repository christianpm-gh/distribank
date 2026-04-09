# Diagrama de Navegación del SPA

```mermaid
flowchart TD
    LOGIN["/login<br/>S-01 LoginPage"]
    HOME["/<br/>S-02 HomePage"]
    DEBIT["/accounts/debit<br/>S-03 AccountDebitPage"]
    CREDIT["/accounts/credit<br/>S-04 AccountCreditPage"]
    TX_HIST["/accounts/:id/transactions<br/>S-05 TransactionHistoryPage"]
    TX_ALL["/transactions<br/>AllTransactionsPage"]
    TX_DET["/transactions/:uuid<br/>S-06 TransactionDetailPage"]
    CARDS["/cards<br/>S-07 CardsPage"]
    CARD_DET["/cards/:cardId<br/>S-08 CardDetailPage"]
    TRANSFER["/transfer<br/>S-09 TransferPage"]
    CONFIRM["/transfer/confirm<br/>S-10 TransferConfirmPage"]
    RESULT["/transfer/result<br/>S-11 TransferResultPage"]

    LOGIN -->|"login exitoso"| HOME

    HOME -->|"click cuenta débito"| DEBIT
    HOME -->|"click cuenta crédito"| CREDIT
    HOME -->|"sidebar: Tarjetas"| CARDS
    HOME -->|"sidebar: Transferir"| TRANSFER
    HOME -->|"sidebar: Transacciones"| TX_ALL

    DEBIT -->|"Ver transacciones"| TX_HIST
    CREDIT -->|"Ver transacciones"| TX_HIST

    TX_HIST -->|"click transacción"| TX_DET
    TX_ALL -->|"click transacción"| TX_DET

    CARDS -->|"click tarjeta"| CARD_DET

    TRANSFER -->|"Continuar"| CONFIRM
    CONFIRM -->|"Confirmar"| RESULT
    CONFIRM -->|"Volver"| TRANSFER
    RESULT -->|"Nueva transferencia"| TRANSFER
    RESULT -->|"Ir al inicio"| HOME

    TX_DET -->|"← Volver"| TX_HIST
    CARD_DET -->|"← Volver"| CARDS
    DEBIT -->|"← Volver"| HOME
    CREDIT -->|"← Volver"| HOME
```

## Protección de rutas

```mermaid
flowchart LR
    REQ["Request a ruta protegida"] --> PR{PrivateRoute<br/>¿token en Zustand?}
    PR -->|"null"| REDIR["Redirect → /login"]
    PR -->|"existe"| SHELL["AppShell<br/>(SidebarNav + Outlet)"]
    SHELL --> PAGE["Página solicitada"]
```

## Mapa de rutas completo

| Ruta | Página | Spec | Protegida |
|------|--------|------|-----------|
| `/login` | LoginPage | S-01 | No |
| `/` | HomePage | S-02 | Sí |
| `/accounts/debit` | AccountDebitPage | S-03 | Sí |
| `/accounts/credit` | AccountCreditPage | S-04 | Sí |
| `/accounts/:accountId/transactions` | TransactionHistoryPage | S-05 | Sí |
| `/transactions` | AllTransactionsPage | — | Sí |
| `/transactions/:uuid` | TransactionDetailPage | S-06 | Sí |
| `/cards` | CardsPage | S-07 | Sí |
| `/cards/:cardId` | CardDetailPage | S-08 | Sí |
| `/transfer` | TransferPage | S-09 | Sí |
| `/transfer/confirm` | TransferConfirmPage | S-10 | Sí |
| `/transfer/result` | TransferResultPage | S-11 | Sí |

Fuente: `packages/frontend/src/router/index.tsx`
