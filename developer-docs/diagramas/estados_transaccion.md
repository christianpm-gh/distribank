# Diagrama de Estados — Transacciones

```mermaid
stateDiagram-v2
    [*] --> PENDING : Transaction creada

    PENDING --> COMPLETED : Intra-node exitoso<br/>o Cross-node crédito exitoso
    PENDING --> ROLLED_BACK : Cross-node falla +<br/>compensación aplicada
    PENDING --> FAILED : Error sin compensación<br/>(estado intermedio raro)

    COMPLETED --> [*]
    ROLLED_BACK --> [*]
    FAILED --> [*]

    note right of PENDING
        La transacción está en progreso.
        En intra-node, este estado es efímero
        (se crea directamente como COMPLETED).
        En cross-node, persiste mientras se
        ejecuta la fase de crédito en el
        nodo destino.
    end note

    note right of COMPLETED
        Transferencia exitosa.
        Ambos saldos actualizados.
        4 log events: INITIATED →
        DEBIT_APPLIED → CREDIT_APPLIED →
        COMPLETED
    end note

    note left of ROLLED_BACK
        Falló el crédito en nodo destino.
        El débito fue compensado (revertido).
        4 log events: INITIATED →
        DEBIT_APPLIED → FAILED →
        COMPENSATED
    end note
```

## Eventos del Transaction Log

```mermaid
flowchart LR
    subgraph "Flujo exitoso"
        I1[INITIATED] --> D1[DEBIT_APPLIED] --> C1[CREDIT_APPLIED] --> CO1[COMPLETED]
    end

    subgraph "Flujo con rollback"
        I2[INITIATED] --> D2[DEBIT_APPLIED] --> F2[FAILED] --> CM2[COMPENSATED]
    end

    subgraph "Flujo pendiente (cross-node en progreso)"
        I3[INITIATED] --> D3[DEBIT_APPLIED]
    end
```

## Relación estado ↔ eventos

| Status | Eventos esperados | Significado |
|--------|-------------------|-------------|
| `COMPLETED` | INITIATED → DEBIT_APPLIED → CREDIT_APPLIED → COMPLETED | Todo exitoso |
| `PENDING` | INITIATED → DEBIT_APPLIED | Esperando crédito en destino |
| `FAILED` | INITIATED → DEBIT_APPLIED → FAILED | Error sin compensar (raro) |
| `ROLLED_BACK` | INITIATED → DEBIT_APPLIED → FAILED → COMPENSATED | Error + compensación |

Fuente: `packages/backend/src/transfers/transfers.service.ts:78-206`
