# 03 Frontend > Capa de Servicios

> Prerrequisitos: [Estado global auth](03_estado_global_auth.md)

## Instancia Axios (`src/services/api.ts`)

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_ENABLE_MSW === 'true'
    ? '/api'                                         // MSW: rutas relativas
    : (import.meta.env.VITE_API_BASE_URL || '/api')  // Backend real
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

**Dos modos de operación:**
1. **MSW activo** (`VITE_ENABLE_MSW=true`): `baseURL = '/api'` — MSW intercepta dentro del navegador
2. **Backend real** (`VITE_ENABLE_MSW=false`): `baseURL = VITE_API_BASE_URL` — requests al servidor

## Servicios

Cada servicio exporta funciones que llaman a la API y retornan datos tipados:

### auth.service.ts

```typescript
export const login = (data: LoginRequest): Promise<AuthResponse> =>
  api.post('/auth/login', data).then(r => r.data)
```

### accounts.service.ts

```typescript
export const getProfile = (customerId: number): Promise<CustomerProfile> =>
  api.get(`/customers/${customerId}/profile`).then(r => r.data)
```

### cards.service.ts

```typescript
export const getCards = (customerId: number): Promise<Card[]> =>
  api.get(`/customers/${customerId}/cards`).then(r => r.data)

export const toggleCardStatus = (cardId: number, newStatus: string): Promise<Card> =>
  api.patch(`/cards/${cardId}/toggle`, { new_status: newStatus }).then(r => r.data)
```

### transactions.service.ts

```typescript
export const getTransactions = (accountId: number): Promise<Transaction[]> =>
  api.get(`/accounts/${accountId}/transactions`).then(r => r.data)

export const getTransactionDetail = (uuid: string): Promise<TransactionDetail> =>
  api.get(`/transactions/${uuid}`).then(r => r.data)
```

### transfer.service.ts

```typescript
export const createTransfer = (data: TransferRequest): Promise<TransferResponse> =>
  api.post('/transfers', data).then(r => r.data)
```

## Patrón consistente

Todos los servicios siguen el mismo patrón:
1. Reciben parámetros tipados
2. Llaman a `api.get/post/patch` con la ruta correspondiente
3. Extraen `response.data` con `.then(r => r.data)`
4. Retornan el tipo de respuesta esperado

No hay manejo de errores en la capa de servicios — los errores se propagan a React Query, que los maneja con `isError` y `error` en los componentes.

## Documentos relacionados

- [Hooks React Query](05_hooks_react_query.md) — cómo los hooks consumen estos servicios
- [Variables de entorno](../02_inicio_rapido/05_variables_entorno.md) — VITE_API_BASE_URL
- [Catálogo de endpoints](../06_contrato_api/01_catalogo_endpoints.md) — referencia de la API
