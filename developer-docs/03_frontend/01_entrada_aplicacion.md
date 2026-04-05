# 03 Frontend > Entrada de la Aplicación

> Prerrequisitos: [Estructura del monorepo](../01_vision_general/03_estructura_monorepo.md)

## Cadena de arranque

```
index.html → main.tsx → enableMocking() → App.tsx → QueryClientProvider → RouterProvider
```

### 1. `index.html`

- Carga Google Fonts: **Sora** (headings), **Inter** (body), **JetBrains Mono** (mono)
- Define `<div id="root">`
- Script entry: `/src/main.tsx`

### 2. `src/main.tsx`

```typescript
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return    // Skip si no hay MSW
  const { worker } = await import('./mocks/browser')         // Import dinámico
  return worker.start({ onUnhandledRequest: 'bypass' })      // No interceptar requests desconocidos
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>
  )
})
```

**Punto clave:** MSW se inicializa **antes** del render. Esto garantiza que los mocks estén activos cuando React Query dispare las primeras queries.

### 3. `src/App.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutos
      retry: 1,                    // 1 reintento en caso de error
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

- **staleTime 5 min:** Las queries no se refetchen automáticamente durante 5 minutos
- **retry 1:** Un solo reintento antes de mostrar error
- No hay `Suspense`, `ErrorBoundary` ni providers adicionales

### 4. `src/index.css`

Define los **design tokens** del sistema de diseño usando Tailwind v4 `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #1A56DB;
  --color-surface-base: #0F172A;
  --font-sora: "Sora", sans-serif;
  /* ... 30+ tokens más */
}

body {
  background-color: var(--color-surface-base);  /* Dark mode always */
  font-family: var(--font-inter);
  font-size: 14px;
}
```

## Documentos relacionados

- [Sistema de rutas](02_sistema_rutas.md) — qué rutas define el router
- [Sistema de diseño](07_sistema_diseno.md) — todos los design tokens
- [Mocks MSW](08_mocks_msw.md) — cómo funciona el mocking
