# 07 Reglas de Negocio > Seguridad y Aislamiento de Datos

> Prerrequisitos: [Autenticación JWT](../04_backend/02_autenticacion_jwt.md)

## Principio de aislamiento

Cada cliente solo puede acceder a **sus propios datos**. El `customer_id` del JWT es la **única fuente de verdad** para determinar identidad.

## JWT como fuente de identidad

1. El frontend envía `Authorization: Bearer <token>`
2. `JwtAuthGuard` valida el token
3. `JwtStrategy.validate()` extrae `{ customerId, role }` del payload
4. El controller accede a `req.user.customerId`
5. El service usa `nodeRouter.getPrismaForCustomer(customerId)` — **todas las queries** se filtran por nodo del cliente

## Validaciones por endpoint

| Endpoint | Validación de identidad |
|----------|------------------------|
| `GET /customers/:id/profile` | El service usa `customerId` del JWT (no el `:id` del URL) |
| `GET /customers/:id/cards` | Busca `customer_accounts` por `customerId` del JWT |
| `PATCH /cards/:id/toggle` | Busca card y verifica que pertenece al cliente |
| `GET /accounts/:id/transactions` | Usa prisma del nodo del cliente |
| `GET /transactions/:uuid` | Busca en nodo del cliente |
| `POST /transfers` | Valida `from_account_id` pertenece al cliente |

## Datos nunca expuestos

| Dato | Regla |
|------|-------|
| `password` | Nunca en ninguna respuesta (solo hash en BD) |
| `cvv` | Nunca incluido en respuesta de cards |
| `transaction_log.details` | Solo para rol `Support` (no implementado) |
| Datos de otros clientes | Imposible por routing de nodo |

## Masking en el frontend

| Dato | Formato original | Display |
|------|-----------------|---------|
| `card_number` | `4000000000000010` | `•••• •••• •••• 0010` |
| `account_number` | `DISTCHK0000000027` | `•••• 0027` |

## Seguridad del token

- **Almacenamiento:** `sessionStorage` (no `localStorage` — más seguro)
- **TTL:** 1 hora, no renovable
- **Logout:** Borra token del store y sessionStorage — no hay blacklist server-side
- **Protección de rutas:** `PrivateRoute` redirige a `/login` si no hay token

## Mensajes de error

Los mensajes de error del backend son en **español** (requisito del proyecto):
- "Credenciales inválidas" (no revela si es email o password)
- "Cliente no encontrado"
- "Tarjeta no encontrada"
- "Saldo insuficiente..."

## Documentos relacionados

- [Autenticación JWT](../04_backend/02_autenticacion_jwt.md) — implementación
- [Estado global auth](../03_frontend/03_estado_global_auth.md) — almacenamiento del token
- [Manejo de errores](../06_contrato_api/04_manejo_errores.md) — códigos y mensajes
