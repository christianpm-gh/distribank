# 04 Backend > Serialización de Respuestas

> Prerrequisitos: [Módulos de negocio](04_modulos_negocio.md)

## El problema

Prisma retorna tipos nativos de PostgreSQL que no son directamente serializables a JSON:
- **BigInt** — no soportado por `JSON.stringify()`
- **Decimal** (Prisma) — objeto, no un número JavaScript
- **DateTime** — objeto Date, se serializa pero como formato no estándar

## Conversiones aplicadas

Cada service convierte manualmente antes de retornar:

| Tipo Prisma | Tipo PostgreSQL | Conversión | Resultado JSON |
|-------------|-----------------|-----------|---------------|
| `BigInt` | BIGSERIAL/BIGINT | `Number(value)` | `27` |
| `Decimal` | DECIMAL(15,2) | `Number(value)` | `56000` |
| `DateTime` | TIMESTAMP | `.toISOString()` | `"2025-06-04T09:00:00.000Z"` |
| `DateTime` (fecha) | DATE | `.toISOString().slice(0, 7)` | `"2028-09"` |
| Nullable | — | `value ?? null` | `null` |

## Ejemplo: serializeAccount

En `customers.service.ts:47-61`:

```typescript
private serializeAccount(a: any) {
  return {
    id: Number(a.id),                       // BigInt → number
    account_number: a.account_number,        // String → string (sin cambio)
    account_type: a.account_type,            // String → string
    balance: Number(a.balance),              // Decimal → number
    credit_limit: a.credit_limit ? Number(a.credit_limit) : null,  // Decimal? → number | null
    available_credit: a.available_credit ? Number(a.available_credit) : null,
    overdraft_limit: a.overdraft_limit ? Number(a.overdraft_limit) : null,
    status: a.status,
    week_transactions: Number(a.week_transactions),  // BigInt → number
    created_at: a.created_at.toISOString(),          // DateTime → ISO string
    last_limit_increase_at: a.last_limit_increase_at?.toISOString() ?? null,
  };
}
```

## Ejemplo: serialización de tarjetas

En `cards.service.ts:24-34`:

```typescript
cards.map((c) => ({
  id: Number(c.id),
  card_number: c.card_number,               // Se retorna COMPLETO (16 dígitos)
  card_type: c.card_type,
  expiration_date: c.expiration_date.toISOString().slice(0, 7),  // "2028-09"
  status: c.status,
  daily_limit: c.daily_limit ? Number(c.daily_limit) : 0,
  account_id: Number(c.account_id),
  account_number: c.account.account_number,  // JOIN con account
  account_type: c.account.account_type,      // JOIN con account
}))
```

**Nota:** El `card_number` se retorna completo. El **frontend** es responsable de enmascarar (`****0010`). El `cvv` **nunca se incluye** en la respuesta.

## Ejemplo: log events

En `transactions.service.ts:94-99`:

```typescript
log_events: tx.transaction_log.map((log) => ({
  id: Number(log.id),
  event_type: log.event_type,
  occurred_at: log.created_at.toISOString(),          // Renombrado: created_at → occurred_at
  node_id: (log.details as any)?.node_id ?? 'nodo-a', // Extraído del JSONB
}))
```

- `created_at` del log se mapea a `occurred_at` en la respuesta (nombre más semántico para el frontend)
- `node_id` se extrae del campo JSONB `details`, con fallback a `'nodo-a'`

## Campos calculados (no existen en la BD)

| Campo | Calculado en | Lógica |
|-------|-------------|--------|
| `rol_cuenta` | `transactions.service.ts` | `from_account_id === accountId ? 'ORIGEN' : 'DESTINO'` |
| `counterpart_account` | `transactions.service.ts` | Número de la cuenta contraria |

## Precisión numérica

- PostgreSQL: `DECIMAL(15,2)` — hasta 999,999,999,999,999.99
- JavaScript: `Number()` — safe hasta `2^53` (9,007,199,254,740,992)
- Para este proyecto los montos son suficientemente pequeños — no hay riesgo de pérdida de precisión

## Documentos relacionados

- [Tipos compartidos](../06_contrato_api/03_tipos_compartidos.md) — mapeo completo BD ↔ Backend ↔ Frontend
- [Diccionario de datos](../05_base_datos/02_diccionario_datos.md) — tipos de la BD
