# 02 Inicio Rápido > Setup Backend

> Prerrequisitos: [Requisitos previos](01_requisitos_previos.md) — necesitas PostgreSQL instalado.

## Paso a paso

### 1. Crear las bases de datos

Conecta a PostgreSQL y crea 3 bases de datos:

```sql
CREATE DATABASE distribank_nodo_a;
CREATE DATABASE distribank_nodo_b;
CREATE DATABASE distribank_nodo_c;
```

### 2. Aplicar el DDL base

El DDL que crea las 6 tablas está en `packages/frontend/docs/ddl_data_distribank/00_ddl_base.sql`.

Aplícalo en las **3 bases de datos**:

```bash
psql -d distribank_nodo_a -f packages/frontend/docs/ddl_data_distribank/00_ddl_base.sql
psql -d distribank_nodo_b -f packages/frontend/docs/ddl_data_distribank/00_ddl_base.sql
psql -d distribank_nodo_c -f packages/frontend/docs/ddl_data_distribank/00_ddl_base.sql
```

### 3. (Opcional) Cargar datos SQL completos

Si quieres datos más allá del seed de Natalia:

```bash
psql -d distribank_nodo_a -f packages/frontend/docs/ddl_data_distribank/01_nodo_a_data.sql
psql -d distribank_nodo_b -f packages/frontend/docs/ddl_data_distribank/02_nodo_b_data.sql
psql -d distribank_nodo_c -f packages/frontend/docs/ddl_data_distribank/03_nodo_c_data.sql
```

### 4. Configurar variables de entorno

```bash
cd packages/backend
cp .env.example .env
```

Edita `.env` con tus datos de conexión:

```env
NODE_A_DATABASE_URL=postgresql://usuario:password@localhost:5432/distribank_nodo_a
NODE_B_DATABASE_URL=postgresql://usuario:password@localhost:5432/distribank_nodo_b
NODE_C_DATABASE_URL=postgresql://usuario:password@localhost:5432/distribank_nodo_c
JWT_SECRET=distribank-dev-secret-change-in-production
JWT_EXPIRES_IN=3600
```

> Si usas puertos diferentes para cada nodo, ajusta el puerto en cada URL.

### 5. Generar el cliente Prisma

```bash
npx prisma generate
```

Esto genera el Prisma Client en `node_modules/.prisma/client/` a partir de `prisma/schema.prisma`.

### 6. Ejecutar el seed

```bash
npm run seed
```

Esto inserta los datos de Natalia Ruiz Castillo (customer_id=27) en el **Nodo A** (27 % 3 = 0):
- Customer con email `natalia.ruiz@distribank.mx` y password hasheado con bcrypt
- Cuenta de cheques (id=27) y cuenta de crédito (id=43)
- 4 tarjetas, 5 cuentas destino, 6 transacciones con log events

### 7. Arrancar el backend

```bash
npm run start:dev
```

Verás:
```
DistriBank Backend running on http://localhost:3000/api
```

### 8. Verificar con curl

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"natalia.ruiz@distribank.mx","password":"Distribank2025!"}'
```

Respuesta esperada:
```json
{
  "access_token": "eyJhbG...",
  "customer_id": 27,
  "role": "customer",
  "expires_in": 3600
}
```

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `start:dev` | `nest start --watch` | Dev con hot-reload |
| `start:debug` | `nest start --debug --watch` | Dev con debugger |
| `start:prod` | `node dist/main` | Producción |
| `build` | `nest build` | Compilar a dist/ |
| `seed` | `ts-node prisma/seed.ts` | Ejecutar seed de datos |
| `prisma:migrate` | `prisma migrate dev` | Ejecutar migraciones |

## Conectar frontend al backend real

Para usar el backend real en vez de MSW, edita `packages/frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MSW=false
```

Reinicia el dev server del frontend.

## Documentos relacionados

- [Verificación demo](04_verificacion_demo.md) — checklist de verificación
- [Variables de entorno](05_variables_entorno.md) — referencia completa
- [Módulo Database](../04_backend/03_modulo_database.md) — cómo funciona el routing a los 3 nodos
