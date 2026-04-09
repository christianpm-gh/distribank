# DistriBank Backend

API NestJS para el sistema bancario distribuido DistriBank.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | NestJS 11 + TypeScript strict |
| Auth | Passport.js + JWT |
| Validación | class-validator |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL 17 — 3 nodos Supabase en regiones distintas |

## Infraestructura de base de datos

| Nodo | Variable de entorno | Región | Criterio |
|---|---|---|---|
| Nodo A | `NODE_A_DATABASE_URL` | South America (São Paulo) | `customer_id % 3 = 0` |
| Nodo B | `NODE_B_DATABASE_URL` | US East (N. Virginia) | `customer_id % 3 = 1` |
| Nodo C | `NODE_C_DATABASE_URL` | (existente) | `customer_id % 3 = 2` + VIP schema |

## Setup con Supabase

### 1. Crear los proyectos Supabase

Crear 2 proyectos nuevos en https://supabase.com/dashboard (Nodo A y Nodo B).
El Nodo C (`cllzymmcacyohsjuwibe.supabase.co`) ya existe.

> **Nota free tier:** Supabase permite 2 proyectos activos por organización.
> Para 3 nodos: Pro plan o crear proyectos en organizaciones gratuitas separadas.

### 2. Aplicar DDL a Nodo A y Nodo B

En el **SQL Editor** de cada nuevo proyecto (Dashboard → SQL Editor):

```sql
-- Paso 1: ejecutar el contenido completo de:
-- packages/frontend/docs/ddl_data_distribank/00_ddl_base.sql

-- Paso 2: eliminar FK cross-nodo (obligatorio para transacciones entre nodos)
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transactions_to_account;
```

> El Nodo C ya tiene la FK eliminada.

### 3. Configurar variables de entorno

```bash
cd packages/backend
cp .env.example .env
```

Obtener la connection string de cada proyecto en:
**Supabase Dashboard → Settings → Database → Connection string → URI (Direct connection)**

El formato es:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### 4. Instalar dependencias y generar cliente Prisma

```bash
# Desde la raíz del monorepo
npm install

cd packages/backend
npx prisma generate
```

### 5. Cargar datos de demo

```bash
npm run seed
```

Esto carga los datos de Natalia Ruiz Castillo (customer_id=27) en **Nodo A**.

Tras el seed, ejecutar en Nodo A (SQL Editor de Supabase) para resetear secuencias:

```sql
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers) + 100);
SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts) + 100);
SELECT setval('cards_id_seq', (SELECT MAX(id) FROM cards) + 100);
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions) + 100);
SELECT setval('transaction_log_id_seq', (SELECT MAX(id) FROM transaction_log) + 100);
```

### 6. Iniciar el servidor

```bash
npm run start:dev
```

El backend inicia en `http://localhost:3000/api`.

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
    ├── Nodo A (Supabase São Paulo)    → customer_id % 3 = 0
    ├── Nodo B (Supabase US East)      → customer_id % 3 = 1
    └── Nodo C (Supabase, existente)   → customer_id % 3 = 2 + VIP schema
```

Transferencias cross-nodo se orquestan con patrón SAGA.
Ver `docs/backend-specs/05_contexto_distribuido.md` para el flujo completo.
