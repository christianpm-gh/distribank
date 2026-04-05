# Diagrama de Secuencia — Transferencias

## Transferencia Intra-Nodo (ambas cuentas en el mismo nodo)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant TP as TransferPage
    participant CP as TransferConfirmPage
    participant TM as useTransfer (mutation)
    participant TS as transfer.service.ts
    participant BE as TransfersController
    participant SV as TransfersService
    participant NR as NodeRouterService
    participant DB as Nodo Origen (PostgreSQL)

    U->>TP: Llena formulario (cuenta origen, destino, monto)
    TP->>TP: Genera UUID v4 (idempotencia)
    TP->>CP: navigate("/transfer/confirm", { state })
    U->>CP: Confirma transferencia
    CP->>TM: mutate(transferData)
    TM->>TS: createTransfer({ transaction_uuid, from_account_id, to_account_number, amount })
    TS->>BE: POST /api/transfers

    BE->>SV: create(customerId, dto)
    SV->>DB: findUnique({ transaction_uuid })
    Note over SV,DB: Check idempotencia

    alt UUID ya existe
        DB-->>SV: existing transaction
        SV-->>BE: { uuid, status, initiated_at }
        Note over SV: Retorna resultado existente sin re-ejecutar
    end

    SV->>DB: findUnique({ id: from_account_id })
    SV->>SV: Validar saldo (CHECKING: balance + overdraft, CREDIT: available_credit)
    SV->>NR: findAccountNodeByNumber(to_account_number)
    NR-->>SV: { node: "nodo-a", prisma }
    SV->>SV: Comparar nodo origen vs destino → INTRA-NODE

    rect rgb(34, 197, 94, 0.1)
        Note over SV,DB: Ejecución Intra-Nodo (todo en mismo nodo)
        SV->>DB: transactions.create(status: COMPLETED)
        SV->>DB: transaction_log.createMany([INITIATED, DEBIT_APPLIED, CREDIT_APPLIED, COMPLETED])
        SV->>DB: accounts.update(from: decrement amount)
        SV->>DB: accounts.update(to: increment amount)
    end

    SV-->>BE: { uuid, status: "COMPLETED", initiated_at }
    BE-->>TS: 201
    TS-->>TM: TransferResponse
    TM->>U: navigate("/transfer/result", { state })
```

## Transferencia Cross-Nodo (cuentas en nodos diferentes)

```mermaid
sequenceDiagram
    participant SV as TransfersService
    participant NR as NodeRouterService
    participant NO as Nodo Origen
    participant ND as Nodo Destino

    SV->>NR: getNodeForCustomer(customerId) → "nodo-a"
    SV->>NR: findAccountNodeByNumber(destNumber) → "nodo-b"
    Note over SV: nodo-a ≠ nodo-b → CROSS-NODE

    rect rgb(59, 130, 246, 0.1)
        Note over SV,ND: Fase 1: Preparación en nodo origen
        SV->>NO: transactions.create(status: PENDING)
        SV->>NO: transaction_log.createMany([INITIATED, DEBIT_APPLIED])
        SV->>NO: accounts.update(from: decrement amount)
    end

    rect rgb(34, 197, 94, 0.1)
        Note over SV,ND: Fase 2: Crédito en nodo destino (try)
        SV->>ND: accounts.update(to: increment amount)
    end

    alt Crédito exitoso
        rect rgb(34, 197, 94, 0.1)
            Note over SV,NO: Fase 3a: Completar
            SV->>NO: transaction_log.createMany([CREDIT_APPLIED, COMPLETED])
            SV->>NO: transactions.update(status: COMPLETED)
        end
        SV-->>SV: return { status: "COMPLETED" }

    else Error en nodo destino (catch)
        rect rgb(239, 68, 68, 0.1)
            Note over SV,NO: Fase 3b: Compensación (rollback)
            SV->>NO: accounts.update(from: increment amount) ← Revertir débito
            SV->>NO: transaction_log.createMany([FAILED, COMPENSATED])
            SV->>NO: transactions.update(status: ROLLED_BACK)
        end
        SV-->>SV: return { status: "ROLLED_BACK" }
    end
```

## Eventos del Transaction Log por escenario

| Escenario | Eventos | Nodos involucrados |
|-----------|---------|-------------------|
| Intra-node OK | INITIATED → DEBIT_APPLIED → CREDIT_APPLIED → COMPLETED | Mismo nodo para todos |
| Cross-node OK | INITIATED → DEBIT_APPLIED → CREDIT_APPLIED → COMPLETED | Origen, Origen, Destino, Origen |
| Cross-node FAIL | INITIATED → DEBIT_APPLIED → FAILED → COMPENSATED | Origen, Origen, Destino, Origen |

Los timestamps de los log events se espacian 1 segundo entre sí (`transfers.service.ts:93-99`).
