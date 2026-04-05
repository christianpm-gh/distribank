# 09 Guías > Agregar un Endpoint al Backend

## Archivos a crear/modificar

### 1. Decidir módulo

Si el endpoint encaja en un módulo existente (auth, customers, cards, transactions, transfers), agregar ahí. Si no, crear uno nuevo.

### 2. Crear módulo nuevo (si aplica)

```bash
cd packages/backend
nest generate module mi-modulo
nest generate controller mi-modulo
nest generate service mi-modulo
```

Agregar al `src/app.module.ts`:
```typescript
imports: [..., MiModuloModule],
```

### 3. Crear DTO

En `src/mi-modulo/dto/mi-accion.dto.ts`:

```typescript
import { IsString, IsNumber, Min } from 'class-validator';

export class MiAccionDto {
  @IsString()
  campo: string;

  @IsNumber()
  @Min(1)
  otro_campo: number;
}
```

### 4. Agregar método al controller

```typescript
@UseGuards(JwtAuthGuard)
@Post()
create(@Body() dto: MiAccionDto, @Req() req: any) {
  return this.service.create(req.user.customerId, dto);
}
```

### 5. Implementar lógica en service

```typescript
async create(customerId: number, dto: MiAccionDto) {
  const prisma = this.nodeRouter.getPrismaForCustomer(customerId);
  // Lógica...
  // Serializar BigInt/Decimal antes de retornar
}
```

### 6. Serializar la respuesta

- `BigInt` → `Number(value)`
- `Decimal` → `Number(value)`
- `DateTime` → `.toISOString()`
- `cvv` → **nunca incluir**

### 7. Probar

```bash
curl -X POST http://localhost:3000/api/mi-recurso \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"campo": "valor", "otro_campo": 1}'
```

### 8. Actualizar docs del frontend

- `docs/backend-specs/01_catalogo_endpoints.md`
- `docs/backend-specs/02_tipos_y_dtos.md` (si hay tipos nuevos)

### 9. Commit

```
feat(backend): agregar endpoint de <descripción>
```
