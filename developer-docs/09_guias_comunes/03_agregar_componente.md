# 09 Guías > Agregar un Componente

## Decidir la capa

| Capa | Directorio | Cuándo usar |
|------|-----------|------------|
| **ui/** | `src/components/ui/` | Componente base sin lógica de datos (badge, chip, indicator) |
| **cards/** | `src/components/cards/` | Relacionado con cuentas o tarjetas |
| **transactions/** | `src/components/transactions/` | Relacionado con transacciones |
| **layout/** | `src/components/layout/` | Navegación, layout, shell |

## Crear el componente

En `src/components/<capa>/MiComponente.tsx`:

```typescript
type Props = {
  dato: string
  variante?: 'default' | 'compact'
}

export default function MiComponente({ dato, variante = 'default' }: Props) {
  return (
    <div className="rounded-[var(--radius-md)] bg-surface-card p-4">
      <span className="font-[family-name:var(--font-sora)] text-text-primary">
        {dato}
      </span>
    </div>
  )
}
```

## Convenciones

- **Props:** Definir como `type Props = { ... }` en el mismo archivo
- **Export:** `export default function` (no arrow function)
- **Styling:** Clases Tailwind inline usando los design tokens
- **Iconos:** Usar Lucide React (`import { IconName } from 'lucide-react'`)
- **Animaciones:** Usar Framer Motion si necesita animación
- **Idioma UI:** Texto visible en **español**

## Usar design tokens

```typescript
// Colores
className="bg-surface-card text-text-primary"
className="text-status-success"
className="bg-brand-primary"

// Tipografía
className="font-[family-name:var(--font-sora)]"
className="font-[family-name:var(--font-mono)]"

// Radius
className="rounded-[var(--radius-md)]"

// Spacing
className="p-[var(--content-padding)]"
```

## Actualizar documentación (obligatorio)

Agregar el nuevo componente en `docs/02_component_system.md`:
- Nombre, ID (C-XX)
- Props y variantes
- Tokens usados
- Comportamiento

**Esto debe ir en el mismo commit que el código** (regla de doc sync).

## Commit

```
feat(components): agregar componente MiComponente
```
