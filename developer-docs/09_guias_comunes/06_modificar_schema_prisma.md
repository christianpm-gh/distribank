# 09 Guías > Modificar el Schema Prisma

## Paso a paso

### 1. Editar el schema

En `packages/backend/prisma/schema.prisma`:

```prisma
model mi_nueva_tabla {
  id         BigInt   @id @default(autoincrement())
  nombre     String   @db.VarChar(100)
  created_at DateTime @default(now())
}
```

### 2. Regenerar el cliente

```bash
cd packages/backend
npx prisma generate
```

Esto actualiza el Prisma Client en `node_modules/.prisma/client/` con los nuevos tipos.

### 3. Crear migración (si aplica)

```bash
npx prisma migrate dev --name agregar_tabla_mi_nueva
```

Esto crea un archivo SQL de migración en `prisma/migrations/`.

**Nota:** Las migraciones se aplican a la base de datos que esté en `DATABASE_URL`. Para aplicar a los 3 nodos, necesitas ejecutar la migración con cada URL.

### 4. Actualizar el seed (si aplica)

En `prisma/seed.ts`, agregar datos para la nueva tabla:

```typescript
await prisma.mi_nueva_tabla.upsert({
  where: { id: 1 },
  update: {},
  create: { id: 1, nombre: 'Ejemplo' },
})
```

### 5. Ejecutar el seed

```bash
npm run seed
```

### 6. Usar en services

```typescript
async getMiDato(customerId: number) {
  const prisma = this.nodeRouter.getPrismaForCustomer(customerId);
  const dato = await prisma.mi_nueva_tabla.findUnique({ where: { id: 1 } });

  return {
    id: Number(dato.id),       // BigInt → Number
    nombre: dato.nombre,
    created_at: dato.created_at.toISOString(),
  };
}
```

## Recordatorios

- El DDL base (`00_ddl_base.sql`) debe actualizarse si hay nuevas tablas
- El schema Prisma no soporta CHECK constraints — agregarlos en DDL
- `npx prisma generate` es necesario cada vez que cambias el schema
- Si cambias tipos, actualiza `api.types.ts` en el frontend

## Commit

```
feat(backend): agregar modelo <nombre> al schema Prisma
```
