# 04 Backend > Autenticación JWT

> Prerrequisitos: [Arquitectura NestJS](01_arquitectura_nestjs.md)

## Flujo completo

Ver [diagrama de secuencia del login](../diagramas/flujo_login.md).

## Componentes

### AuthModule (`src/auth/auth.module.ts`)

Configura JWT y Passport:

```typescript
JwtModule.registerAsync({
  useFactory: (config: ConfigService) => ({
    secret: config.getOrThrow<string>('JWT_SECRET'),
    signOptions: { expiresIn: '1h' },
  }),
})
```

- **TTL del token:** 1 hora (hardcodeado como `'1h'`)
- **Algoritmo:** HS256 (default de `@nestjs/jwt`)
- **No hay refresh token** — al expirar, el usuario debe re-autenticarse

### AuthService (`src/auth/auth.service.ts`)

**Método `login(email, password)`:**

1. Busca el email **secuencialmente** en los 3 nodos via `nodeRouter.getAllNodes()`
2. Si no encuentra: `throw UnauthorizedException('Credenciales inválidas')`
3. Compara password con bcrypt: `bcrypt.compare(password, customer.password)`
4. Si no coincide: misma excepción (no revela si el email existe)
5. Genera JWT: `jwtService.sign({ sub: Number(customer.id), role: 'customer' })`
6. Retorna: `{ access_token, customer_id, role: 'customer', expires_in: 3600 }`

### JwtStrategy (`src/auth/strategies/jwt.strategy.ts`)

Extrae el token del header `Authorization: Bearer <token>`:

```typescript
validate(payload: { sub: number; role: string }) {
  return { customerId: payload.sub, role: payload.role };
}
```

El objeto retornado queda disponible en `req.user` en todos los controllers protegidos.

### JwtAuthGuard (`src/auth/guards/jwt-auth.guard.ts`)

```typescript
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Se usa con `@UseGuards(JwtAuthGuard)` en cada controller protegido. Si el token es inválido o expirado, retorna automáticamente `401 Unauthorized`.

## JWT Payload

```json
{
  "sub": 27,          // customer_id
  "role": "customer",
  "iat": 1719500000,  // issued at (Unix timestamp)
  "exp": 1719503600   // expires at (iat + 3600s)
}
```

## Acceso al usuario en controllers

```typescript
@UseGuards(JwtAuthGuard)
@Get(':id/profile')
getProfile(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
  const customerId = req.user.customerId;  // Del JWT
  // Validar que id === customerId para aislamiento
}
```

## Seguridad

- **Mismo mensaje de error** para email inexistente y password incorrecto → no permite enumerar emails
- **bcrypt con 10 salt rounds** — suficiente para un proyecto académico
- **Solo rol `customer`** — no hay admin/support implementado
- **JWT stateless** — no hay blacklist de tokens; logout solo borra el token del frontend

## Documentos relacionados

- [Estado global auth (frontend)](../03_frontend/03_estado_global_auth.md) — cómo el frontend almacena el token
- [Seguridad y aislamiento](../07_reglas_negocio/05_seguridad_aislamiento.md) — reglas de aislamiento de datos
