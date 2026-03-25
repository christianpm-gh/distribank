# DistriBank Backend

API NestJS para el sistema bancario distribuido DistriBank.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | NestJS 11 + TypeScript strict |
| Auth | Passport.js + JWT |
| Validación | class-validator |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL 16 (3 nodos distribuidos) |

## Setup

```bash
# Desde la raíz del monorepo
npm install

# Configurar variables de entorno
cd packages/backend
cp .env.example .env
# Editar .env con URLs de PostgreSQL reales

# Generar cliente Prisma
npx prisma generate

# Aplicar DDL a la base de datos
# (usar scripts en packages/frontend/docs/ddl_data_distribank/)

# Seed de datos de demo
npm run seed

# Iniciar servidor
npm run start:dev
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/login | Autenticación |
| GET | /api/customers/:id/profile | Perfil financiero |
| GET | /api/customers/:id/cards | Tarjetas del cliente |
| PATCH | /api/cards/:id/toggle | Bloquear/desbloquear tarjeta |
| GET | /api/accounts/:id/transactions | Historial de movimientos |
| GET | /api/transactions/:uuid | Detalle de transacción |
| POST | /api/transfers | Nueva transferencia |

## Arquitectura distribuida

```
Backend NestJS (coordinador)
    ├── Nodo A (PostgreSQL) → customer_id % 3 = 0
    ├── Nodo B (PostgreSQL) → customer_id % 3 = 1
    └── Nodo C (Supabase)   → customer_id % 3 = 2
```

Transferencias cross-nodo se orquestan con patrón SAGA.
