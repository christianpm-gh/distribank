# 05 Base de Datos > DDL y Datos SQL

> Prerrequisitos: [Distribución de nodos](03_distribucion_nodos.md)

## Archivos SQL disponibles

Todos los archivos están en `packages/frontend/docs/ddl_data_distribank/`:

| Archivo | Propósito | Aplicar en |
|---------|-----------|-----------|
| `00_ddl_base.sql` | Crea las 6 tablas con constraints, índices y tipos | **Los 3 nodos** |
| `01_nodo_a_data.sql` | Inserta datos de clientes con id % 3 = 0 | Solo Nodo A |
| `02_nodo_b_data.sql` | Inserta datos de clientes con id % 3 = 1 | Solo Nodo B |
| `03_nodo_c_data.sql` | Inserta datos de clientes con id % 3 = 2 | Solo Nodo C |
| `04_ddl_vip_schema.sql` | Crea schema VIP (réplica con lag 6-8h) | Solo Nodo C |
| `05_nodo_c_vip_data.sql` | Datos de la réplica VIP | Solo Nodo C |

## Orden de ejecución

```bash
# 1. DDL base en los 3 nodos
psql -d distribank_nodo_a -f 00_ddl_base.sql
psql -d distribank_nodo_b -f 00_ddl_base.sql
psql -d distribank_nodo_c -f 00_ddl_base.sql

# 2. Datos por nodo
psql -d distribank_nodo_a -f 01_nodo_a_data.sql
psql -d distribank_nodo_b -f 02_nodo_b_data.sql
psql -d distribank_nodo_c -f 03_nodo_c_data.sql

# 3. (Opcional) Schema VIP en Nodo C
psql -d distribank_nodo_c -f 04_ddl_vip_schema.sql
psql -d distribank_nodo_c -f 05_nodo_c_vip_data.sql
```

## DDL base vs Prisma schema

El proyecto tiene **dos fuentes de schema**:

1. **`00_ddl_base.sql`** — DDL completo con CHECK constraints, índices, triggers
2. **`prisma/schema.prisma`** — Modelos Prisma para el ORM

Las CHECK constraints (ej: "CHECKING no puede tener credit_limit") solo existen en el DDL SQL. Prisma no soporta CHECK constraints nativamente.

Para desarrollo, puedes usar cualquiera de las dos fuentes. El `prisma generate` funciona con el schema de Prisma directamente (no necesita el DDL aplicado previamente si usas `prisma migrate`).

## Schema VIP (Nodo C)

El Nodo C tiene un schema adicional `distribank_vip_customers` que es una réplica parcial con 6-8 horas de lag. Se usa para consultas analíticas de clientes VIP sin impactar el nodo principal.

Este schema no es usado por el backend actual — es parte de la especificación académica.

## Documentos relacionados

- [Seed de datos demo](05_seed_datos_demo.md) — datos de Natalia vía Prisma
- [Setup backend](../02_inicio_rapido/03_setup_backend.md) — instrucciones de setup
- [Especificación de nodos](../../packages/frontend/docs/spec_distribank_doc/06_descripcion_nodos.md) — doc académica
