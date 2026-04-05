# Resumen de Integración Frontend ↔ Backend

## Stack del backend objetivo

| Capa | Tecnología |
|---|---|
| Framework | NestJS + TypeScript strict |
| Autenticación | Passport.js + JWT (guards por rol) |
| Validación | class-validator (DTOs tipados) |
| ORM | Prisma (soporte multi-schema PostgreSQL) |
| Driver directo | pg (queries SAGA inter-nodo) |
| Base de datos | PostgreSQL 17 — 3 nodos Supabase en distintas regiones |

## Stack del frontend (ya implementado)

| Capa | Tecnología |
|---|---|
| Framework | React 19 + TypeScript strict |
| HTTP | Axios con interceptor Bearer |
| Data fetching | TanStack React Query |
| Estado auth | Zustand (sessionStorage) |
| Mocks | MSW (Mock Service Worker) |

## Cómo el frontend consume la API

### Base URL

```
Producción:  VITE_API_BASE_URL (default: http://localhost:3000/api)
Desarrollo:  /api (interceptado por MSW cuando VITE_ENABLE_MSW=true)
```

El backend NestJS debe exponer todos los endpoints bajo el prefijo `/api`.

### Flujo de autenticación

```
1. Usuario envía POST /api/auth/login con { email, password }
2. Backend valida credenciales, genera JWT
3. Frontend recibe { access_token, customer_id, role, expires_in }
4. Frontend almacena token en sessionStorage
5. Todas las requests subsecuentes llevan header:
   Authorization: Bearer <access_token>
6. Backend valida JWT en cada request protegida
7. customer_id del JWT se usa como filtro en todas las queries
```

### Interceptor Axios

El frontend tiene un interceptor que automáticamente agrega el header `Authorization` a toda request:

```typescript
// src/services/api.ts
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### React Query — caching y invalidación

| Query Key | Endpoint | Invalidado cuando |
|---|---|---|
| `['profile', customerId]` | GET /customers/:id/profile | — (staleTime: 5min) |
| `['cards', customerId]` | GET /customers/:id/cards | Después de toggle exitoso |
| `['transactions', accountId]` | GET /accounts/:id/transactions | — |
| `['transaction', uuid]` | GET /transactions/:uuid | — |

### Tiempos de respuesta esperados

Los mocks MSW simulan estos delays. El backend real debería estar dentro de estos rangos:

| Endpoint | Delay MSW | Expectativa real |
|---|---|---|
| POST /auth/login | 500ms | < 500ms |
| GET /customers/:id/profile | 300ms | < 300ms |
| GET /customers/:id/cards | 300ms | < 300ms |
| PATCH /cards/:id/toggle | 600ms | < 1s |
| GET /accounts/:id/transactions | 300ms | < 500ms |
| GET /transactions/:uuid | 300ms | < 300ms |
| POST /transfers | 1000ms | < 3s (SAGA cross-nodo) |

## Rol del usuario

El frontend implementa **un solo rol: Cliente** (usuario normal). No hay dashboard de admin ni rol de Soporte en este frontend. El campo `role` del JWT se espera como `"customer"`.

## Variables de entorno del backend

```env
# Conexión directa Supabase (puerto 5432, sslmode=require obligatorio)
NODE_A_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF-A].supabase.co:5432/postgres?sslmode=require
NODE_B_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF-B].supabase.co:5432/postgres?sslmode=require
NODE_C_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.cllzymmcacyohsjuwibe.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=...
JWT_EXPIRES_IN=3600
```

Ver `packages/backend/.env.example` para el template completo con instrucciones.

## Idioma

Todos los mensajes de error del backend deben estar en **español** para que el frontend los muestre directamente al usuario (ej: "Credenciales inválidas", "Tarjeta no encontrada").
