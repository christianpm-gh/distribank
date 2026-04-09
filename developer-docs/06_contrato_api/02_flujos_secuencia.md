# 06 Contrato API > Flujos de Secuencia

> Prerrequisitos: [Catálogo de endpoints](01_catalogo_endpoints.md)

## Diagramas disponibles

Los diagramas de secuencia detallados están en el directorio `diagramas/`:

| Flujo | Diagrama | Componentes involucrados |
|-------|----------|-------------------------|
| **Login completo** | [flujo_login.md](../diagramas/flujo_login.md) | LoginPage → Zod → useLogin → Axios → AuthController → AuthService → bcrypt → JWT → Zustand → sessionStorage |
| **Transferencia** | [flujo_transferencia.md](../diagramas/flujo_transferencia.md) | TransferPage → TransferConfirmPage → useTransfer → TransfersService → NodeRouter → SAGA intra/cross |
| **Toggle tarjeta** | [flujo_toggle_tarjeta.md](../diagramas/flujo_toggle_tarjeta.md) | CardDetailPage → CardControlSwitch → Modal → useToggleCard → CardsService → invalidate cache |

## Flujo genérico de datos

```mermaid
flowchart LR
    subgraph "Frontend"
        P[Página] --> H[Hook<br/>React Query]
        H --> S[Servicio<br/>Axios]
    end

    subgraph "Red"
        S -->|"Bearer token"| API["/api/*"]
    end

    subgraph "Backend"
        API --> G[JwtAuthGuard]
        G --> C[Controller]
        C --> SV[Service]
        SV --> NR[NodeRouter]
        NR --> PR[Prisma]
    end

    subgraph "BD"
        PR --> PG[(PostgreSQL<br/>nodo correcto)]
    end

    PG -->|"data"| PR
    PR -->|"serialize"| SV
    SV -->|"JSON"| C
    C -->|"HTTP 200"| S
    S -->|"cache"| H
    H -->|"render"| P
```

## Flujo de carga inicial (HomePage)

```mermaid
sequenceDiagram
    participant HP as HomePage
    participant PQ as useProfile (query)
    participant RQ as React Query Cache
    participant AX as Axios
    participant BE as Backend

    HP->>PQ: useProfile()
    PQ->>RQ: queryKey: ['profile', 27]

    alt Cache fresco (< 5 min)
        RQ-->>PQ: Datos del cache
        PQ-->>HP: { data: profile }
    else Cache stale o vacío
        RQ->>AX: GET /api/customers/27/profile
        AX->>BE: Con Bearer token
        BE-->>AX: { customer, accounts }
        AX-->>RQ: Almacenar en cache
        RQ-->>PQ: { data: profile }
        PQ-->>HP: Renderizar
    end
```

## Documentos relacionados

- [Hooks React Query](../03_frontend/05_hooks_react_query.md) — query keys y invalidación
- [Capa de servicios](../03_frontend/04_capa_servicios.md) — Axios interceptor
- [Catálogo de endpoints](01_catalogo_endpoints.md) — detalle de cada endpoint
