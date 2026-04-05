# 03 Frontend > Hooks React Query

> Prerrequisitos: [Capa de servicios](04_capa_servicios.md)

## Configuración global

En `App.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } }
})
```

- **staleTime:** 5 minutos — no refetch automático dentro de este período
- **retry:** 1 reintento en caso de error de red

## Tabla de hooks

### Queries (lectura)

| Hook | Archivo | Query Key | Servicio | Enabled |
|------|---------|-----------|----------|---------|
| `useProfile()` | `useAccounts.ts` | `['profile', customerId]` | `getProfile(customerId)` | `!!customerId` |
| `useCards()` | `useCards.ts` | `['cards', customerId]` | `getCards(customerId)` | `!!customerId` |
| `useTransactions(accountId)` | `useTransactions.ts` | `['transactions', accountId]` | `getTransactions(accountId)` | `!!accountId` |
| `useTransactionDetail(uuid)` | `useTransactions.ts` | `['transaction', uuid]` | `getTransactionDetail(uuid)` | `!!uuid` |

### Mutations (escritura)

| Hook | Archivo | Servicio | onSuccess |
|------|---------|----------|-----------|
| `useLogin()` | `useAuth.ts` | `login(data)` | `store.login()` + `navigate('/')` |
| `useToggleCard()` | `useCards.ts` | `toggleCardStatus(cardId, status)` | `invalidateQueries(['cards', customerId])` |
| `useTransfer()` | `useTransfer.ts` | `createTransfer(data)` | — (sin callback) |

## Detalle de cada hook

### useProfile

```typescript
export function useProfile() {
  const customerId = useAuthStore((s) => s.customerId)
  return useQuery({
    queryKey: ['profile', customerId],
    queryFn: () => getProfile(customerId!),
    enabled: !!customerId,
  })
}
```

Usado en: HomePage, AccountDebitPage, AccountCreditPage, TransferPage

### useCards

```typescript
export function useCards() {
  const customerId = useAuthStore((s) => s.customerId)
  return useQuery({
    queryKey: ['cards', customerId],
    queryFn: () => getCards(customerId!),
    enabled: !!customerId,
  })
}
```

Usado en: CardsPage, CardDetailPage

### useToggleCard

```typescript
export function useToggleCard() {
  const queryClient = useQueryClient()
  const customerId = useAuthStore((s) => s.customerId)
  return useMutation({
    mutationFn: ({ cardId, newStatus }) => toggleCardStatus(cardId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', customerId] })
    },
  })
}
```

**Invalidación de cache:** Al togglear una tarjeta exitosamente, se invalida el cache de `['cards', customerId]`, forzando un refetch de todas las tarjetas.

### useLogin

```typescript
export function useLogin() {
  const storeLogin = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      storeLogin(response.access_token, response.customer_id, response.role)
      navigate('/')
    },
  })
}
```

**Side effects:** Al login exitoso: guarda token en Zustand/sessionStorage Y navega a home.

### useTransfer

```typescript
export function useTransfer() {
  return useMutation({
    mutationFn: (data: TransferRequest) => createTransfer(data),
  })
}
```

No invalida cache ni navega — el componente TransferConfirmPage maneja la navegación a `/transfer/result`.

## Uso en componentes

```typescript
function HomePage() {
  const { data: profile, isLoading, isError } = useProfile()

  if (isLoading) return <Spinner />
  if (isError) return <ErrorMessage />

  return <div>{profile.customer.name}</div>
}
```

## Documentos relacionados

- [Capa de servicios](04_capa_servicios.md) — funciones que los hooks invocan
- [Entrada de la aplicación](01_entrada_aplicacion.md) — QueryClient global
- [Guía: agregar hook](../09_guias_comunes/05_agregar_hook_react_query.md)
