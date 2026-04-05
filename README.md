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
cp .env.example .env  # completar con URLs de Supabase
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
| `packages/backend` | NestJS 11, Prisma 6, PostgreSQL 17 | 3000 |

## Base de datos distribuida

3 proyectos Supabase en regiones distintas, particionados por `customer_id % 3`:

| Nodo | Región | Criterio | Proyecto |
|---|---|---|---|
| **Nodo A** | South America (São Paulo) | `customer_id % 3 = 0` — incluye Natalia (id=27) | Por crear |
| **Nodo B** | US East (N. Virginia) | `customer_id % 3 = 1` | Por crear |
| **Nodo C** | Actual | `customer_id % 3 = 2` + schema VIP | `cllzymmcacyohsjuwibe` ✓ |

Ver `packages/backend/README.md` para instrucciones de setup de los 3 nodos.
