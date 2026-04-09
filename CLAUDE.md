# CLAUDE.md — DistriBank Monorepo

## Identidad del proyecto
Repositorio: `distribank` (monorepo)
Estructura: npm workspaces con 2 packages
- `packages/frontend` — SPA React 19 + Vite + TypeScript strict + Tailwind CSS
- `packages/backend` — API NestJS + Prisma + PostgreSQL distribuido

## Convención de commits — Conventional Commits (obligatorio)

Formato: `<tipo>(<scope>): <descripción en imperativo, español>`

Scopes: auth | home | accounts | cards | transactions | transfer | components | tokens | msw | router | deploy | backend | monorepo | frontend

## Deploy
- **Frontend:** Vercel (repo: `christianpm-gh/distribank`, Root Directory: `packages/frontend`)
- **Backend:** Pendiente (NestJS en puerto 3000)
- Branch de producción: `main`

## Variables de entorno
### Frontend (`packages/frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MSW=true
```

### Backend (`packages/backend/.env`)
```
NODE_A_DATABASE_URL=postgresql://...
NODE_B_DATABASE_URL=postgresql://...
NODE_C_DATABASE_URL=postgresql://...
JWT_SECRET=...
```
