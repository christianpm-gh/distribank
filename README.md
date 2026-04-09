# DistriBank — Monorepo

[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

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
cp .env.example .env  # completar con URLs de Supabase y BD local
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

Tres nodos independientes particionados por `customer_id % 3`:

| Nodo | Infraestructura | Criterio |
|---|---|---|
| **Nodo A** | Supabase — South America (São Paulo) | `customer_id % 3 = 0` — incluye Natalia (id=27) |
| **Nodo B** | PostgreSQL local (`localhost:5432`) | `customer_id % 3 = 1` |
| **Nodo C** | Supabase — nube (proyecto existente) | `customer_id % 3 = 2` + schema VIP |

Ver `packages/backend/README.md` para instrucciones de configuración de los tres nodos.

## Licencia

Copyright © 2026 [christianpm-gh](https://github.com/christianpm-gh)

Este trabajo está licenciado bajo **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International** ([CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)).

Se permite su consulta y cita con atribución explícita al autor. Queda prohibida su reproducción total o parcial, modificación o uso con fines comerciales sin autorización escrita del autor. Ver [`LICENSE`](./LICENSE) para el texto completo.
