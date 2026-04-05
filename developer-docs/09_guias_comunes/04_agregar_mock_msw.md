# 09 Guías > Agregar un Mock MSW

## Paso a paso

### 1. Agregar datos (si necesarios)

En `src/mocks/data/natalia.ts`, exportar los datos nuevos:

```typescript
export const misDatos = [
  { id: 1, nombre: 'Dato ejemplo' },
]
```

### 2. Crear handler

En `src/mocks/handlers/mi.handlers.ts`:

```typescript
import { http, HttpResponse, delay } from 'msw'

export const miHandlers = [
  http.get('/api/mi-recurso/:id', async ({ params }) => {
    await delay(300)  // Simular latencia de red

    const id = Number(params.id)
    // Importar datos
    const { misDatos } = await import('../data/natalia')
    const dato = misDatos.find(d => d.id === id)

    if (!dato) {
      return HttpResponse.json(
        { message: 'Recurso no encontrado', statusCode: 404 },
        { status: 404 }
      )
    }

    return HttpResponse.json(dato)
  }),
]
```

### Delays recomendados

| Tipo de operación | Delay | Referencia |
|------------------|-------|-----------|
| Lectura simple | 300ms | accounts, cards, transactions |
| Login | 500ms | auth |
| Toggle/mutación simple | 600ms | card toggle |
| Operación compleja | 1000ms | transfers |

### 3. Registrar handler

En `src/mocks/browser.ts`:

```typescript
import { miHandlers } from './handlers/mi.handlers'

export const worker = setupWorker(
  ...authHandlers,
  ...accountsHandlers,
  ...cardsHandlers,
  ...transactionsHandlers,
  ...transferHandlers,
  ...miHandlers,         // Agregar aquí
)
```

### 4. Verificar

1. Abrir DevTools → Network
2. Verificar que la request tiene "(from service worker)" en la columna Size
3. Verificar que la respuesta tiene los datos esperados

## Commit

```
feat(msw): agregar mock de <endpoint>
```
