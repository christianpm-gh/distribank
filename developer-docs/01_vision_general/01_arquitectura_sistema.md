# 01 Visión General > Arquitectura del Sistema

> Prerrequisitos: Ninguno — este es el punto de partida.

## Qué es DistriBank

DistriBank es un **simulador bancario académico** de banca minorista (estilo Coppel/Liverpool) construido como ejercicio de sistemas distribuidos. Permite a un cliente consultar cuentas, tarjetas, transacciones y realizar transferencias entre cuentas que pueden residir en diferentes nodos de base de datos.

## Arquitectura de alto nivel

Ver [diagrama completo](../diagramas/arquitectura_general.md).

El sistema tiene 3 capas principales:

### 1. Frontend (SPA React)
- **React 19** con Vite como bundler, servido por Vercel en producción
- Aplicación de página única (SPA) con routing del lado del cliente
- **Dark mode only**, desktop-first, UI en español
- Puede funcionar **standalone** con MSW (Mock Service Worker) — no necesita backend para desarrollo frontend

### 2. Backend (API REST NestJS)
- **NestJS 11** con TypeScript strict, prefijo global `/api`
- Autenticación JWT stateless (Passport.js), 1 hora de TTL
- **NodeRouterService** — componente central que enruta cada request al nodo PostgreSQL correcto según `customer_id % 3`
- Patrón SAGA para transferencias cross-nodo con compensación automática

### 3. Base de datos distribuida (3 nodos PostgreSQL)
- **Nodo A** (local): clientes con `id % 3 = 0` (ej: Natalia, id=27)
- **Nodo B** (local): clientes con `id % 3 = 1`
- **Nodo C** (Supabase): clientes con `id % 3 = 2`
- Los 3 nodos tienen el **mismo schema** (6 tablas), pero datos particionados por cliente

## Flujo de una request típica

```
Browser → React Query → Axios (Bearer token) → NestJS /api/* → JwtAuthGuard
  → Controller → Service → NodeRouterService → Prisma → PostgreSQL (nodo correcto)
  → response JSON → React Query cache → componente React → UI
```

1. El usuario interactúa con la UI
2. React Query dispara un fetch (o usa cache si los datos son frescos — staleTime: 5 min)
3. Axios añade `Authorization: Bearer <token>` al header
4. NestJS valida el JWT y extrae `customerId` del payload
5. El service usa `NodeRouterService.getPrismaForCustomer(customerId)` para obtener la conexión al nodo correcto
6. Prisma ejecuta la query y devuelve los datos
7. React Query almacena en cache y actualiza la UI

## Comunicación entre capas

| De → A | Protocolo | Autenticación |
|--------|-----------|---------------|
| Browser → Frontend | HTTPS (Vercel) / HTTP (dev :5173) | — |
| Frontend → Backend | HTTP REST JSON | Bearer JWT |
| Backend → PostgreSQL | TCP (Prisma Client) | Connection string con password |

## Puertos en desarrollo

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | `http://localhost:5173` |
| Backend (NestJS) | 3000 | `http://localhost:3000/api` |
| PostgreSQL Nodo A | 5432 | `localhost:5432/distribank_nodo_a` |
| PostgreSQL Nodo B | 5433 | `localhost:5433/distribank_nodo_b` |
| PostgreSQL Nodo C | (Supabase) | URL externa en `.env` |

## Documentos relacionados

- [Stack tecnológico](02_stack_tecnologico.md) — versiones exactas de cada dependencia
- [Estructura del monorepo](03_estructura_monorepo.md) — árbol de directorios
- [Diagrama de arquitectura](../diagramas/arquitectura_general.md) — diagrama Mermaid interactivo
- [Distribución de nodos](../05_base_datos/03_distribucion_nodos.md) — detalle de la partición
