# DistriBank — Monorepo

Monorepo multipaquete para **DistriBank** — sistema bancario distribuido académico.

## Estructura

```
distribank/
├── packages/
│   ├── frontend/    → React 19 + Vite + Tailwind CSS (SPA)
│   └── backend/     → NestJS + Prisma + PostgreSQL distribuido
└── package.json     → npm workspaces root
```

## Inicio rápido

```bash
# Instalar dependencias (ambos packages)
npm install

# Backend (puerto 3000)
cd packages/backend
cp .env.example .env  # configurar URLs de PostgreSQL
npm run start:dev

# Frontend (puerto 5173)
cd packages/frontend
npm run dev
```

## Credenciales de demo

| Campo | Valor |
|---|---|
| Email | `natalia.ruiz@distribank.mx` |
| Contraseña | `Distribank2025!` |

## Packages

| Package | Stack | Puerto |
|---|---|---|
| `packages/frontend` | React 19, Vite 8, Tailwind v4, MSW | 5173 |
| `packages/backend` | NestJS 11, Prisma 6, PostgreSQL 16 | 3000 |

## Base de datos distribuida

3 nodos PostgreSQL particionados por `customer_id % 3`:
- **Nodo A** (local): `customer_id % 3 = 0` (incluye Natalia, id=27)
- **Nodo B** (local): `customer_id % 3 = 1`
- **Nodo C** (Supabase): `customer_id % 3 = 2` + schema VIP

Ver `packages/frontend/docs/backend-specs/` para especificación completa.
