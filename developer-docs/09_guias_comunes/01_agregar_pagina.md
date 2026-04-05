# 09 Guías > Agregar una Página Nueva

## Archivos a crear/modificar

### 1. Crear la página

```
src/pages/MiNuevaPage.tsx
```

```typescript
import Header from '@/components/layout/Header'

export default function MiNuevaPage() {
  return (
    <div>
      <Header title="Mi Nueva Página" onBack={() => window.history.back()} />
      <div className="p-[var(--content-padding)]">
        {/* Contenido */}
      </div>
    </div>
  )
}
```

### 2. Registrar la ruta

En `src/router/index.tsx`:

```typescript
import MiNuevaPage from '@/pages/MiNuevaPage'

// Dentro del children de AppShell:
{ path: '/mi-nueva', element: <MiNuevaPage /> },
```

Si es una ruta protegida (la mayoría lo son), colocarla dentro del children de `PrivateRoute > AppShell`.

### 3. Si necesita datos: crear o reusar hook

En `src/hooks/useMiDato.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { getMiDato } from '@/services/mi.service'

export function useMiDato(id: number) {
  return useQuery({
    queryKey: ['mi-dato', id],
    queryFn: () => getMiDato(id),
    enabled: !!id,
  })
}
```

### 4. Si necesita servicio nuevo

En `src/services/mi.service.ts`:

```typescript
import api from './api'

export const getMiDato = (id: number) =>
  api.get(`/mi-recurso/${id}`).then(r => r.data)
```

### 5. Si necesita tipos nuevos

Agregar en `src/types/api.types.ts`.

### 6. Si necesita mock MSW

Crear handler en `src/mocks/handlers/mi.handlers.ts` y registrarlo en `src/mocks/browser.ts`.

### 7. Actualizar docs

- `docs/01_screen_flow_spec.md` — agregar spec de la nueva pantalla
- `docs/03_navigation_diagram.md` — actualizar diagrama Mermaid

### 8. Commit

```
feat(<scope>): agregar página de <nombre>
```
