# 09 Guías > Agregar un Hook React Query

## Query (lectura)

En `src/hooks/useMiDato.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { getMiDato } from '@/services/mi.service'
import { useAuthStore } from '@/store/authStore'

export function useMiDato(id: number) {
  return useQuery({
    queryKey: ['mi-dato', id],           // Clave única para el cache
    queryFn: () => getMiDato(id),         // Función que fetcha los datos
    enabled: !!id,                        // No ejecutar si id es falsy
  })
}
```

### Query keys

Convención: `[nombre-recurso, ...identificadores]`

| Patrón | Ejemplo | Cuándo invalidar |
|--------|---------|-----------------|
| `['recurso']` | `['profile', 27]` | Al mutear el perfil |
| `['recurso', id]` | `['transactions', 27]` | Al crear nueva transacción de esa cuenta |
| `['recurso-detalle', uuid]` | `['transaction', 'abc-123']` | Al mutar esa transacción |

## Mutation (escritura)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearMiRecurso } from '@/services/mi.service'
import { useAuthStore } from '@/store/authStore'

export function useCrearMiRecurso() {
  const queryClient = useQueryClient()
  const customerId = useAuthStore((s) => s.customerId)

  return useMutation({
    mutationFn: (data: MiRequest) => crearMiRecurso(data),
    onSuccess: () => {
      // Invalidar cache relacionado para forzar refetch
      queryClient.invalidateQueries({ queryKey: ['mi-dato', customerId] })
    },
  })
}
```

## Uso en componente

```typescript
function MiPagina() {
  const { data, isLoading, isError, error } = useMiDato(27)
  const mutation = useCrearMiRecurso()

  if (isLoading) return <div>Cargando...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div>
      <p>{data.nombre}</p>
      <button
        onClick={() => mutation.mutate({ campo: 'valor' })}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}
```

## Checklist

- [ ] Query key es descriptivo y único
- [ ] `enabled` previene queries innecesarias
- [ ] Mutation invalida cache relevante en `onSuccess`
- [ ] El servicio correspondiente existe en `src/services/`
- [ ] Los tipos de request/response existen en `src/types/api.types.ts`
