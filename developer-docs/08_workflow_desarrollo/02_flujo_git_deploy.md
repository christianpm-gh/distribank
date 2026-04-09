# 08 Workflow > Flujo Git y Deploy

## Branch principal

- **`main`** — branch de producción
- No hay branches de feature documentados — el flujo es simple push a main

## Deploy del frontend

| Aspecto | Detalle |
|---------|---------|
| Plataforma | Vercel |
| Repo GitHub | `christianpm-gh/distribank` |
| Root Directory | `packages/frontend` |
| Branch de producción | `main` |
| Trigger | Push a `main` → deploy automático |
| SPA config | `vercel.json` con rewrite `/**` → `/index.html` |

### Flujo de deploy

```
git push origin main → GitHub → Vercel webhook → build → deploy
```

Vercel ejecuta `npm run build` dentro de `packages/frontend/`, que hace:
1. `tsc -b` — TypeScript type check
2. `vite build` — Bundling de producción

## Deploy del backend

**Estado actual:** Pendiente. El backend se ejecuta localmente en desarrollo.

## Verificación pre-push

```bash
cd packages/frontend && npm run build   # Verifica TypeScript + build
cd packages/frontend && npm run lint    # Verifica ESLint
```

## Documentos relacionados

- [Convenciones de commits](01_convenciones_commits.md)
- [Checklist de contribución](03_checklist_contribucion.md)
