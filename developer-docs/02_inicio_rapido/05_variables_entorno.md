# 02 Inicio Rápido > Variables de Entorno

> Referencia completa de todas las variables de entorno del proyecto.

## Frontend (`packages/frontend/.env`)

| Variable | Valor por defecto | Descripción |
|----------|------------------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | URL base del backend. Solo se usa cuando MSW está deshabilitado. |
| `VITE_ENABLE_MSW` | `true` | `true` = MSW intercepta requests (dev). `false` = requests van al backend real. |

**Nota:** Las variables Vite deben tener prefijo `VITE_` para ser accesibles en el código frontend via `import.meta.env.VITE_*`.

No existe `.env.example` en el frontend — los valores están documentados en `CLAUDE.md`.

### Cómo se usan

En `src/services/api.ts`:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_ENABLE_MSW === 'true'
    ? '/api'                                        // MSW intercepta rutas relativas
    : (import.meta.env.VITE_API_BASE_URL || '/api') // Backend real
})
```

En `src/main.tsx`:
```typescript
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return
  const { worker } = await import('./mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}
```

## Backend (`packages/backend/.env`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `NODE_A_DATABASE_URL` | `postgresql://user:pass@localhost:5432/distribank_nodo_a` | Conexión PostgreSQL Nodo A (customer_id % 3 = 0) |
| `NODE_B_DATABASE_URL` | `postgresql://user:pass@localhost:5433/distribank_nodo_b` | Conexión PostgreSQL Nodo B (customer_id % 3 = 1) |
| `NODE_C_DATABASE_URL` | `postgresql://user:pass@host:5432/distribank_nodo_c` | Conexión PostgreSQL Nodo C (customer_id % 3 = 2) |
| `JWT_SECRET` | `distribank-dev-secret-change-in-production` | Clave secreta para firmar tokens JWT |
| `JWT_EXPIRES_IN` | `3600` | Tiempo de vida del JWT en segundos (1 hora) |

Existe `.env.example` en `packages/backend/.env.example` con valores de referencia.

### Cómo se usan

En `src/database/database.module.ts`:
```typescript
// Cada nodo usa su propia URL
const prismaNodeA = new PrismaService(configService.getOrThrow('NODE_A_DATABASE_URL'))
```

En `src/auth/auth.module.ts`:
```typescript
JwtModule.registerAsync({
  useFactory: (config: ConfigService) => ({
    secret: config.getOrThrow('JWT_SECRET'),
    signOptions: { expiresIn: config.getOrThrow('JWT_EXPIRES_IN') + 's' },
  }),
})
```

## Archivos sensibles (NO commitear)

Los siguientes archivos están en `.gitignore`:
- `.env`
- `.env.local`
- `.env.*.local`

**Nunca** commitear archivos que contengan contraseñas de base de datos o secretos JWT.

## Documentos relacionados

- [Setup frontend](02_setup_frontend.md)
- [Setup backend](03_setup_backend.md)
- [Módulo Database](../04_backend/03_modulo_database.md)
