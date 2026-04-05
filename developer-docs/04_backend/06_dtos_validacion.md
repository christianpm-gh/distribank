# 04 Backend > DTOs y Validación

> Prerrequisitos: [Arquitectura NestJS](01_arquitectura_nestjs.md)

## ValidationPipe Global

Configurado en `src/main.ts:15-20`:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Remueve propiedades no declaradas en el DTO
  forbidNonWhitelisted: true,   // 400 si envían propiedades extra
  transform: true,              // Auto-cast: "27" → 27 si el DTO espera number
}));
```

Esto significa que **cualquier request con body** pasa por validación automática si el controller usa `@Body() dto: SomeDto`.

## DTOs

### LoginDto (`src/auth/dto/login.dto.ts`)

```typescript
class LoginDto {
  @IsEmail()                    email: string;
  @IsString() @MinLength(8)    password: string;
}
```

| Campo | Validación | Ejemplo válido | Error si inválido |
|-------|-----------|---------------|-------------------|
| `email` | Formato email | `natalia.ruiz@distribank.mx` | "email must be an email" |
| `password` | String, mín 8 chars | `Distribank2025!` | "password must be longer than or equal to 8 characters" |

### ToggleCardDto (`src/cards/dto/toggle-card.dto.ts`)

```typescript
class ToggleCardDto {
  @IsIn(['ACTIVE', 'BLOCKED'])  new_status: string;
}
```

| Campo | Validación | Valores válidos |
|-------|-----------|----------------|
| `new_status` | Debe ser uno de los valores | `"ACTIVE"`, `"BLOCKED"` |

### CreateTransferDto (`src/transfers/dto/create-transfer.dto.ts`)

```typescript
class CreateTransferDto {
  @IsUUID('4')                                    transaction_uuid: string;
  @IsNumber()                                     from_account_id: number;
  @IsString() @Matches(/^DIST(CHK|CRD)\d{10}$/)  to_account_number: string;
  @IsNumber() @Min(0.01)                          amount: number;
  @IsOptional() @IsString() @MaxLength(100)       description?: string;
}
```

| Campo | Validación | Ejemplo válido |
|-------|-----------|---------------|
| `transaction_uuid` | UUID v4 | `"550e8400-e29b-41d4-a716-446655440000"` |
| `from_account_id` | Número | `27` |
| `to_account_number` | Regex `DIST(CHK\|CRD)\d{10}` | `"DISTCHK0000000018"` |
| `amount` | Número >= 0.01 | `1000` |
| `description` | String opcional, max 100 chars | `"Pago de renta"` |

## Respuesta de error de validación

Si la validación falla, NestJS retorna automáticamente:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

## Documentos relacionados

- [Catálogo de endpoints](../06_contrato_api/01_catalogo_endpoints.md) — request/response completos
- [Manejo de errores](../06_contrato_api/04_manejo_errores.md) — todos los códigos de error
- [Tipos compartidos](../06_contrato_api/03_tipos_compartidos.md) — mapeo DTO ↔ TypeScript frontend
