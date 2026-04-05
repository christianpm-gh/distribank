# 06 Contrato API > Manejo de Errores

> Prerrequisitos: [Catálogo de endpoints](01_catalogo_endpoints.md)

## Formato de error

NestJS retorna errores en este formato:

```json
{
  "statusCode": 400,
  "message": "Mensaje de error en español",
  "error": "Bad Request"
}
```

Para errores de validación (ValidationPipe), `message` es un **array**:
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than..."],
  "error": "Bad Request"
}
```

## Errores por endpoint

### POST /api/auth/login

| Status | Mensaje | Causa |
|--------|---------|-------|
| 401 | "Credenciales inválidas" | Email no existe O password incorrecto |
| 400 | ["email must be an email", ...] | Validación del DTO |

### GET /api/customers/:id/profile

| Status | Mensaje | Causa |
|--------|---------|-------|
| 401 | "Unauthorized" | Token inválido o expirado |
| 404 | "Cliente no encontrado" | customer_id no existe en su nodo |

### GET /api/customers/:id/cards

| Status | Mensaje | Causa |
|--------|---------|-------|
| 401 | "Unauthorized" | Token inválido o expirado |

### PATCH /api/cards/:id/toggle

| Status | Mensaje | Causa |
|--------|---------|-------|
| 401 | "Unauthorized" | Token inválido o expirado |
| 404 | "Tarjeta no encontrada" | cardId no existe |
| 409 | "No fue posible actualizar el estado de la tarjeta. Intenta de nuevo." | Transición inválida (ej: EXPIRED → ACTIVE) |

### GET /api/accounts/:id/transactions

| Status | Mensaje | Causa |
|--------|---------|-------|
| 401 | "Unauthorized" | Token inválido o expirado |

### GET /api/transactions/:uuid

| Status | Mensaje | Causa |
|--------|---------|-------|
| 401 | "Unauthorized" | Token inválido o expirado |
| 404 | "Transacción no encontrada" | UUID no existe |

### POST /api/transfers

| Status | Mensaje | Causa |
|--------|---------|-------|
| 401 | "Unauthorized" | Token inválido o expirado |
| 400 | "Cuenta origen no encontrada" | from_account_id no existe |
| 400 | "Saldo insuficiente. Tienes $X + $Y de sobregiro disponible." | CHECKING sin fondos |
| 400 | "Crédito insuficiente. Tienes $X disponibles en tu línea de crédito." | CREDIT sin disponible |
| 400 | "Cuenta destino no encontrada" | to_account_number no existe en ningún nodo |
| 400 | "La cuenta origen y destino no pueden ser la misma" | from === to |

## Manejo en el frontend

Los errores se propagan desde Axios → React Query → componentes:

```typescript
const { error, isError } = useProfile()

if (isError) {
  // error.response?.data?.message contiene el mensaje en español
}
```

Para mutations:
```typescript
const mutation = useLogin()
mutation.mutate(data, {
  onError: (error) => {
    setErrorMessage(error.response?.data?.message || 'Error desconocido')
  }
})
```

## Documentos relacionados

- [DTOs y validación](../04_backend/06_dtos_validacion.md) — ValidationPipe
- [Seguridad y aislamiento](../07_reglas_negocio/05_seguridad_aislamiento.md) — control de acceso
