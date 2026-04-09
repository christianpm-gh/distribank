# Contexto Distribuido — Implicaciones para los Endpoints

## Distribución de nodos

| Nodo | Infraestructura | Región | Criterio | SGBD |
|---|---|---|---|---|
| Nodo A | Supabase | South America (São Paulo) | `customer_id % 3 = 0` | PostgreSQL 17 |
| Nodo B | Supabase | US East (N. Virginia) | `customer_id % 3 = 1` | PostgreSQL 17 |
| Nodo C | Supabase | (existente) | `customer_id % 3 = 2` | PostgreSQL 17 |

Los 3 nodos son proyectos Supabase independientes en regiones distintas. Cada nodo ejecuta el mismo DDL (`00_ddl_base.sql`) y almacena solo los datos de sus clientes propietarios. Nodo C aloja adicionalmente el schema `distribank_vip_customers`.

**Cliente de demo (Natalia, id=27):** `27 % 3 = 0` → **Nodo A**.

---

## Tablas por nodo

Las 6 tablas se replican en estructura en cada nodo, pero solo con los datos del fragmento:

1. `customers`
2. `customer_accounts`
3. `accounts`
4. `cards`
5. `transactions`
6. `transaction_log`

---

## Impacto en los endpoints del frontend

### Endpoints de lectura (queries locales al nodo)

Estos endpoints consultan **solo el nodo propietario** del cliente autenticado:

| Endpoint | Nodo consultado |
|---|---|
| GET /customers/:id/profile | Nodo del cliente (determinado por `customer_id % 3`) |
| GET /customers/:id/cards | Mismo nodo |
| GET /accounts/:id/transactions | Mismo nodo |
| GET /transactions/:uuid | Nodo del cliente (puede requerir JOIN cross-nodo para log events) |

El backend NestJS actúa como **router**: al recibir una request, determina el nodo propietario y ejecuta la query ahí.

### Endpoints de escritura (potencialmente cross-nodo)

| Endpoint | Escenario intra-nodo | Escenario cross-nodo |
|---|---|---|
| PATCH /cards/:id/toggle | UPDATE local | Siempre local (tarjeta pertenece al cliente) |
| POST /transfers | Ambas cuentas en el mismo nodo → transacción local | Cuentas en nodos distintos → SAGA |

### Transferencia cross-nodo — flujo SAGA

```
Frontend                    Backend (coordinador)           Nodo A          Nodo B
   │                              │                          │                │
   ├─ POST /transfers ──────────▶ │                          │                │
   │                              ├── INITIATED ───────────▶ │                │
   │                              ├── DEBIT_APPLIED ───────▶ │                │
   │                              ├── CREDIT_APPLIED ──────────────────────▶ │
   │                              ├── COMPLETED ──────────▶  │                │
   │  ◀── { status: COMPLETED } ──┤                          │                │
```

Si falla en Nodo B:
```
   │                              ├── FAILED ──────────────────────────────▶ │
   │                              ├── COMPENSATED ─────────▶ │                │
   │  ◀── { status: ROLLED_BACK } ┤                          │                │
```

Si la respuesta cross-nodo tarda:
```
   │  ◀── { status: PENDING } ────┤  (respuesta inmediata)
   │                              │  ... procesamiento async ...
```

---

## Schema VIP — `distribank_vip_customers` en Nodo C

### Propósito
Réplica de datos de clientes VIP para failover y consultas agregadas.

### Criterio VIP
`SUM(week_transactions)` de todas las cuentas `ACTIVE` del cliente ≥ 3.

### Relevancia para el frontend
- El frontend usa `accounts.week_transactions` directamente (del nodo primario)
- NO consulta el schema VIP
- El badge VIP se calcula en el frontend: `week_transactions >= 3`
- El backend debe asegurar que `week_transactions` esté actualizado en el nodo primario

### Sincronización
- Frecuencia: cada 6-8 horas
- Clientes VIP replicados: sus 6 tablas se copian al schema `distribank_vip_customers`
- Si el nodo primario cae → failover lee del schema VIP en Nodo C

---

## FK inter-nodo — Estado actual

La FK `fk_transactions_to_account` (`to_account_id → accounts.id`) ha sido **eliminada en los 3 nodos Supabase**. Las transacciones cross-nodo no pueden respetar esta FK localmente porque la cuenta destino vive en otro nodo.

La integridad referencial es responsabilidad del coordinador SAGA del backend.

**Instrucción al aplicar DDL en Nodo A y B** (después de `00_ddl_base.sql`):
```sql
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transactions_to_account;
```

**Nodo C:** La FK fue eliminada vía MCP de Supabase en el proyecto `cllzymmcacyohsjuwibe`.

---

## Configuración Supabase — Variables de entorno

Formato de conexión directa (puerto 5432, recomendado para Prisma):
```
NODE_A_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF-A].supabase.co:5432/postgres?sslmode=require
NODE_B_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF-B].supabase.co:5432/postgres?sslmode=require
NODE_C_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.cllzymmcacyohsjuwibe.supabase.co:5432/postgres?sslmode=require
```

**Obtener la connection string:**
Supabase Dashboard → Settings → Database → Connection string → **URI** (sección "Direct connection").

**⚠ No usar el pooler (puerto 6543)** con Prisma en modo backend long-lived. El pooler (PgBouncer) está optimizado para serverless/edge functions.

**Limitación free tier:** Supabase permite 2 proyectos activos por organización. Para 3 nodos se puede usar Supabase Pro ($25/mes) o crear proyectos en organizaciones gratuitas separadas.

---

## Reset de secuencias post-seed (Nodo A)

Tras aplicar el seed con IDs fijos, ejecutar en Nodo A para evitar colisiones con inserts futuros:
```sql
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers) + 100);
SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts) + 100);
SELECT setval('cards_id_seq', (SELECT MAX(id) FROM cards) + 100);
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions) + 100);
SELECT setval('transaction_log_id_seq', (SELECT MAX(id) FROM transaction_log) + 100);
```

---

## Determinación de nodo en el backend

El backend necesita una función routing:

```typescript
function getNodeForCustomer(customerId: number): 'nodo-a' | 'nodo-b' | 'nodo-c' {
  const mod = customerId % 3;
  if (mod === 0) return 'nodo-a';
  if (mod === 1) return 'nodo-b';
  return 'nodo-c';
}
```

Para transfers, también necesita resolver el nodo de la cuenta destino:
1. Buscar `to_account_number` en los 3 nodos (o tener un catálogo global de account_number → nodo)
2. Si `nodo_origen === nodo_destino` → transacción local
3. Si difieren → orquestar SAGA cross-nodo

---

## Conexiones de BD

El backend NestJS usa **3 instancias de PrismaService** (una por nodo), ya implementadas en `src/database/database.module.ts`:

```typescript
// DatabaseModule crea una instancia por nodo con la URL del .env
new PrismaService(config.getOrThrow('NODE_A_DATABASE_URL'))  // → Nodo A (Supabase São Paulo)
new PrismaService(config.getOrThrow('NODE_B_DATABASE_URL'))  // → Nodo B (Supabase US East)
new PrismaService(config.getOrThrow('NODE_C_DATABASE_URL'))  // → Nodo C (Supabase, proyecto existente)
```

`NodeRouterService.getPrismaForCustomer(id)` selecciona automáticamente la instancia correcta según `customer_id % 3`.
