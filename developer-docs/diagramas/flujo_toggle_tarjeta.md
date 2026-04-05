# Diagrama de Secuencia — Toggle de Tarjeta

```mermaid
sequenceDiagram
    actor U as Usuario
    participant CD as CardDetailPage
    participant CS as CardControlSwitch
    participant MOD as Modal Confirmación
    participant TM as useToggleCard (mutation)
    participant SV as cards.service.ts
    participant BE as CardsController
    participant BS as CardsService
    participant NR as NodeRouterService
    participant DB as PostgreSQL

    U->>CD: Navega a /cards/:cardId
    CD->>CD: useCards() → encuentra card
    CD->>CS: Renderiza switch (checked = status === "ACTIVE")

    alt Tarjeta EXPIRED o CANCELLED
        CS-->>U: Switch deshabilitado (read-only)
    end

    U->>CS: Click en switch
    CS->>MOD: Abre modal de confirmación
    Note over MOD: "¿Deseas [bloquear/activar] esta tarjeta?"

    alt Usuario cancela
        MOD-->>CS: Cierra modal, sin acción
    end

    U->>MOD: Confirma acción
    MOD->>TM: mutate({ cardId, new_status })
    TM->>SV: toggleCardStatus(cardId, new_status)
    SV->>BE: PATCH /api/cards/:id/toggle { new_status }

    BE->>BS: toggle(customerId, cardId, newStatus)
    BS->>NR: getPrismaForCustomer(customerId)
    NR-->>BS: prisma (nodo correcto)
    BS->>DB: cards.findUnique({ id: cardId })

    alt Tarjeta no encontrada
        BS-->>BE: throw NotFoundException
        BE-->>SV: 404
    end

    alt Transición inválida (EXPIRED→ACTIVE, etc.)
        BS-->>BE: throw ConflictException
        BE-->>SV: 409
    end

    BS->>DB: cards.update({ status: new_status })
    DB-->>BS: card actualizada
    BS-->>BE: { id, status, card_number, ... }
    BE-->>SV: 200 OK
    SV-->>TM: response

    TM->>TM: queryClient.invalidateQueries(["cards", customerId])
    Note over TM: Invalida cache → refetch automático
    TM-->>CS: Switch refleja nuevo estado
    CS-->>U: UI actualizada
```

## Transiciones de estado válidas

Solo `ACTIVE ↔ BLOCKED` es una transición válida. Ver [estados_tarjeta.md](estados_tarjeta.md).

| Estado actual | → ACTIVE | → BLOCKED | → EXPIRED | → CANCELLED |
|--------------|----------|-----------|-----------|-------------|
| ACTIVE | - | OK | Solo sistema | Solo sistema |
| BLOCKED | OK | - | Solo sistema | Solo sistema |
| EXPIRED | 409 | 409 | - | - |
| CANCELLED | 409 | 409 | - | - |
