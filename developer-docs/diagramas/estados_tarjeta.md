# Diagrama de Estados — Tarjetas

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : Tarjeta emitida

    ACTIVE --> BLOCKED : Usuario solicita bloqueo<br/>PATCH /api/cards/:id/toggle
    BLOCKED --> ACTIVE : Usuario solicita activación<br/>PATCH /api/cards/:id/toggle

    ACTIVE --> EXPIRED : Sistema (fecha vencida)
    BLOCKED --> EXPIRED : Sistema (fecha vencida)

    ACTIVE --> CANCELLED : Proceso administrativo
    BLOCKED --> CANCELLED : Proceso administrativo

    EXPIRED --> [*]
    CANCELLED --> [*]

    note right of ACTIVE
        Estado operacional normal.
        Permite todas las operaciones.
        UI: Switch habilitado, posición ON.
    end note

    note right of BLOCKED
        Bloqueada por el usuario.
        No permite operaciones.
        UI: Switch habilitado, posición OFF.
        Overlay de candado en PhysicalCard.
    end note

    note left of EXPIRED
        Vencida por fecha.
        Solo lectura en la UI.
        UI: Switch deshabilitado.
        PhysicalCard en escala de grises.
    end note

    note left of CANCELLED
        Cancelada administrativamente.
        Solo lectura en la UI.
        UI: Switch deshabilitado.
        PhysicalCard en escala de grises.
    end note
```

## Reglas de transición

| Transición | Iniciada por | Endpoint | HTTP Error si inválida |
|-----------|-------------|----------|----------------------|
| ACTIVE → BLOCKED | Usuario | `PATCH /api/cards/:id/toggle` | — |
| BLOCKED → ACTIVE | Usuario | `PATCH /api/cards/:id/toggle` | — |
| ACTIVE → EXPIRED | Sistema | Automático por fecha | — |
| BLOCKED → EXPIRED | Sistema | Automático por fecha | — |
| EXPIRED → ACTIVE | No permitida | — | 409 Conflict |
| EXPIRED → BLOCKED | No permitida | — | 409 Conflict |
| CANCELLED → * | No permitida | — | 409 Conflict |

## UI en CardDetailPage

- **ACTIVE/BLOCKED**: `CardControlSwitch` habilitado con modal de confirmación
- **EXPIRED/CANCELLED**: `CardControlSwitch` deshabilitado (read-only)
- **BLOCKED**: `PhysicalCard` muestra overlay con icono de candado
- **EXPIRED/CANCELLED**: `PhysicalCard` muestra filtro grayscale

Fuente: `packages/backend/src/cards/cards.service.ts`, `packages/frontend/src/components/cards/CardControlSwitch.tsx`
