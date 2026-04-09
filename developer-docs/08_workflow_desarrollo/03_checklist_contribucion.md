# 08 Workflow > Checklist de Contribución

> Usa esta lista antes de hacer push de tus cambios.

## Antes de commitear

- [ ] `npm run build` pasa sin errores en `packages/frontend`
- [ ] `npm run lint` pasa sin warnings en `packages/frontend`
- [ ] Si tocaste backend: `npm run build` pasa en `packages/backend`
- [ ] El commit sigue el formato Conventional Commits: `tipo(scope): descripción`
- [ ] La descripción está en español, imperativo
- [ ] El commit es atómico (una unidad lógica)
- [ ] Si cambiaste UI: actualicé `docs/02_component_system.md` en el mismo commit

## Verificación funcional

- [ ] Login con `natalia.ruiz@distribank.mx` / `Distribank2025!` funciona
- [ ] La funcionalidad que modifiqué funciona correctamente
- [ ] No rompí funcionalidad existente (navegar por las pantallas principales)
- [ ] Los mocks MSW están actualizados si agregué/modifiqué endpoints

## Si modifiqué el backend

- [ ] Los DTOs tienen decoradores de validación apropiados
- [ ] Los errores se retornan en español
- [ ] El CVV nunca se incluye en respuestas
- [ ] BigInt y Decimal se serializan a Number
- [ ] Las queries usan `nodeRouter.getPrismaForCustomer()` (no acceso directo)

## Si agregué una página nueva

- [ ] Ruta registrada en `src/router/index.tsx`
- [ ] Mock MSW actualizado si necesita datos nuevos
- [ ] Hook creado o reutilizado para data fetching
- [ ] Componentes reutilizan átomos existentes (StatusBadge, SignedAmount, etc.)

## Documentos relacionados

- [Convenciones de commits](01_convenciones_commits.md)
- [Guías comunes](../09_guias_comunes/01_agregar_pagina.md) — paso a paso para tareas comunes
