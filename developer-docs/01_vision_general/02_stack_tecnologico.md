# 01 Visión General > Stack Tecnológico

> Prerrequisitos: [Arquitectura del sistema](01_arquitectura_sistema.md)

## Frontend (`packages/frontend/package.json`)

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| Framework | React | ^19.2.4 | UI declarativa con hooks |
| DOM | React DOM | ^19.2.4 | Renderizado al DOM |
| Build | Vite | ^8.0.1 | Bundler + HMR + dev server |
| CSS | Tailwind CSS | ^4.2.2 | Utility-first CSS (v4 con `@theme`) |
| Routing | React Router DOM | ^7.13.1 | Client-side routing con `createBrowserRouter` |
| Data fetching | @tanstack/react-query | ^5.91.2 | Server state, cache, mutations |
| HTTP | Axios | ^1.13.6 | Cliente HTTP con interceptores |
| Estado global | Zustand | ^5.0.12 | Store minimalista (solo auth) |
| Validación | Zod | ^4.3.6 | Schema validation en formularios |
| Animaciones | Framer Motion | ^12.38.0 | Animaciones declarativas (VIP badge, timeline) |
| Iconos | Lucide React | ^0.577.0 | Iconos SVG como componentes React |
| TypeScript | TypeScript | ^5.9.3 | Tipado estricto (`strict: true`) |
| Linting | ESLint | ^9.31.0 | Calidad de código |
| Mocks | MSW | ^2.12.13 | Mock de API en el navegador (dev only) |

### Nota sobre versiones en documentación existente

El `CLAUDE.md` del frontend indica "React 18 + React Router v6", pero las versiones **reales** instaladas son React 19.2.4 y React Router 7.13.1. Esta documentación usa las versiones del `package.json`.

## Backend (`packages/backend/package.json`)

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| Framework | NestJS (common, core, platform-express) | ^11.1.17 | Framework server-side modular |
| Config | @nestjs/config | ^4.0.3 | Variables de entorno con `ConfigModule` |
| JWT | @nestjs/jwt | ^11.0.0 | Firma y verificación de tokens |
| Passport | @nestjs/passport | ^11.0.5 | Estrategias de autenticación |
| Passport Core | passport | ^0.7.0 | Framework de auth |
| JWT Strategy | passport-jwt | ^4.0.1 | Estrategia Bearer JWT |
| ORM | @prisma/client | ^6.19.2 | Query builder type-safe |
| Prisma CLI | prisma | ^6.19.2 | Generación de cliente y migraciones |
| DB Driver | pg | ^8.16.0 | Driver PostgreSQL nativo |
| Password | bcrypt | ^6.0.0 | Hashing con salt (10 rounds) |
| Validación | class-validator | ^0.14.2 | Decoradores de validación en DTOs |
| Transform | class-transformer | ^0.5.1 | Transformación de objetos (con ValidationPipe) |
| TypeScript | TypeScript | ^5.8.3 | Tipado estricto |
| Metadata | reflect-metadata | ^0.2.2 | Requerido por NestJS para decoradores |
| Reactive | rxjs | ^7.8.2 | Requerido por NestJS |

## Herramientas de desarrollo

| Herramienta | Uso |
|-------------|-----|
| npm workspaces | Monorepo — `npm install` desde la raíz instala todo |
| Vite dev server | Frontend HMR en puerto 5173 |
| `nest start --watch` | Backend hot-reload en puerto 3000 |
| ESLint | Linting en frontend |
| Prisma Studio | Explorador visual de la BD (`npx prisma studio`) |

## Deploy

| Capa | Plataforma | Estado |
|------|-----------|--------|
| Frontend | Vercel (repo: `christianpm-gh/distribank`) | Activo, root: `packages/frontend` |
| Backend | Pendiente | En desarrollo local |
| Base de datos | PostgreSQL 16 local + Supabase (Nodo C) | Configurado |

## Documentos relacionados

- [Arquitectura del sistema](01_arquitectura_sistema.md)
- [Variables de entorno](../02_inicio_rapido/05_variables_entorno.md)
