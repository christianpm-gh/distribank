# Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Cliente"
        Browser["Navegador Web<br/>Desktop-first"]
    end

    subgraph "Frontend — Vercel"
        SPA["React 19 SPA<br/>Vite 8 + Tailwind v4<br/>Puerto 5173 (dev)"]
        RQ["React Query<br/>staleTime: 5min"]
        ZS["Zustand Store<br/>sessionStorage"]
        AX["Axios<br/>Bearer Interceptor"]
        MSW["MSW Mocks<br/>(solo dev)"]
    end

    subgraph "Backend — NestJS 11"
        API["API REST<br/>Prefijo /api<br/>Puerto 3000"]
        AUTH["AuthModule<br/>JWT + Passport"]
        GUARD["JwtAuthGuard<br/>@UseGuards"]
        ROUTER["NodeRouterService<br/>customer_id % 3"]
        MODULES["CustomersModule<br/>CardsModule<br/>TransactionsModule<br/>TransfersModule"]
    end

    subgraph "Base de Datos Distribuida — PostgreSQL 16"
        NA["Nodo A (local)<br/>customer_id % 3 = 0<br/>Ej: Natalia (id=27)"]
        NB["Nodo B (local)<br/>customer_id % 3 = 1"]
        NC["Nodo C (Supabase)<br/>customer_id % 3 = 2"]
    end

    Browser -->|"HTTPS"| SPA
    SPA --> RQ
    SPA --> ZS
    RQ --> AX
    AX -->|"Authorization: Bearer token"| API
    AX -.->|"VITE_ENABLE_MSW=true"| MSW
    API --> AUTH
    AUTH -->|"JWT payload: sub + role"| GUARD
    GUARD --> MODULES
    MODULES --> ROUTER
    ROUTER -->|"mod 0"| NA
    ROUTER -->|"mod 1"| NB
    ROUTER -->|"mod 2"| NC
```

## Flujo de una request típica

1. **Browser** renderiza la SPA React servida por Vercel (o Vite dev server)
2. **React Query** gestiona el ciclo de vida del dato (cache, stale, refetch)
3. **Axios** inyecta el `Bearer token` desde Zustand y envía la request
4. En desarrollo, **MSW** intercepta la request antes de que salga del navegador
5. En producción, la request llega al **Backend NestJS** en `/api/*`
6. **JwtAuthGuard** valida el token y extrae `{ customerId, role }` al `req.user`
7. El controller delega al service, que usa **NodeRouterService** para obtener la instancia Prisma correcta
8. **Prisma** ejecuta la query contra el **nodo PostgreSQL** correspondiente
9. La respuesta recorre el camino inverso: Service → Controller → HTTP → Axios → React Query cache → UI
