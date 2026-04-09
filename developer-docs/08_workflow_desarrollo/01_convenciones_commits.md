# 08 Workflow > Convenciones de Commits

> Fuente: `CLAUDE.md` (raíz) y `packages/frontend/CLAUDE.md`

## Formato: Conventional Commits

```
<tipo>(<scope>): <descripción en imperativo, español>
```

## Tipos permitidos

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva funcionalidad | `feat(auth): implementar formulario de login` |
| `fix` | Corrección de bug | `fix(cards): corregir transición de estado BLOCKED→ACTIVE` |
| `style` | Cambios de CSS/estilo sin lógica | `style(tokens): aplicar paleta dark mode` |
| `refactor` | Refactor sin cambio de comportamiento | `refactor(services): extraer interceptor Bearer` |
| `test` | Tests | `test(auth): agregar test de login con credenciales inválidas` |
| `chore` | Setup, config, dependencias | `chore(deps): instalar y configurar MSW` |
| `docs` | Documentación | `docs(monorepo): actualizar README con estructura` |

## Scopes

| Scope | Área |
|-------|------|
| `auth` | Login, JWT, guards |
| `home` | HomePage |
| `accounts` | Cuentas (debit/credit pages) |
| `cards` | Tarjetas y card control |
| `transactions` | Historial y detalle de transacciones |
| `transfer` | Flujo de transferencia |
| `components` | Componentes compartidos |
| `tokens` | Design tokens CSS |
| `msw` | Mock Service Worker |
| `router` | Rutas y navegación |
| `deploy` | Vercel, CI/CD |
| `backend` | Cualquier cosa del backend |
| `monorepo` | Configuración raíz |
| `frontend` | Configuración general del frontend |

## Reglas estrictas

1. **Commits atómicos:** Un commit = una unidad lógica indivisible
2. **No agrupar:** NO múltiples componentes en un solo commit
3. **Estado funcional:** Cada commit debe dejar el proyecto con `npm run build` pasando
4. **Descripción en español:** Imperativo ("agregar", "implementar", "corregir")
5. **Doc sync:** Cambios de UI + actualización de `docs/02_component_system.md` en el **mismo commit**

## Documentos relacionados

- [Flujo git y deploy](02_flujo_git_deploy.md)
- [Checklist de contribución](03_checklist_contribucion.md)
