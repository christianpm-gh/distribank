# Datos de Demo — Seed para Natalia Ruiz Castillo

Cliente de referencia para la demo del frontend. `customer_id = 27`, asignada a **Nodo A** (`27 % 3 = 0`).

Fuente: `src/mocks/data/natalia.ts`

---

## Customer

```sql
INSERT INTO customers (id, name, curp, email, password)
VALUES (27, 'Natalia Ruiz Castillo', 'RUCN900515MDFZTS01',
        'natalia.ruiz@distribank.mx',
        '$2b$10$...');  -- bcrypt hash de 'Distribank2025!'
```

**Credenciales demo:** `natalia.ruiz@distribank.mx` / `Distribank2025!`

---

## Accounts

| id | account_number | type | balance | credit_limit | available_credit | overdraft_limit | status | week_tx | created_at |
|---|---|---|---|---|---|---|---|---|---|
| 27 | DISTCHK0000000027 | CHECKING | 56,000.00 | — | — | 1,500.00 | ACTIVE | 8 | 2024-01-08 |
| 43 | DISTCRD0000000013 | CREDIT | -12,000.00 | 20,000.00 | 8,000.00 | — | ACTIVE | 4 | 2024-03-15 |

**Nota:** La cuenta de crédito tiene `last_limit_increase_at = '2025-02-10'`.

---

## Customer Accounts (tabla puente)

```sql
INSERT INTO customer_accounts (customer_id, checking_account_id, credit_account_id)
VALUES (27, 27, 43);
```

---

## Cards

| id | card_number | card_type | expiration | status | daily_limit | account_id |
|---|---|---|---|---|---|---|
| 1 | 4000000000000010 | DEBIT | 2028-09 | ACTIVE | 15,000 | 27 |
| 2 | 4000000000000011 | DEBIT | 2027-03 | ACTIVE | 5,000 | 27 |
| 3 | 4000000000000017 | CREDIT | 2028-09 | ACTIVE | 20,000 | 43 |
| 4 | 4000000000000018 | CREDIT | 2027-09 | **BLOCKED** | 10,000 | 43 |

La tarjeta `****0018` en estado BLOCKED es el caso de uso principal para la demo de bloqueo/desbloqueo (S-08).

---

## Transactions — Cuenta Débito (account_id=27)

| id | UUID (últimos 4) | from | to | amount | type | status | initiated_at | completed_at |
|---|---|---|---|---|---|---|---|---|
| 4 | ...0004 | 27 | 18 | 12,000 | TRANSFER | COMPLETED | 2025-06-04 09:00 | 09:00:04 |
| 9 | ...0009 | 27 | 30 | 5,500 | TRANSFER | COMPLETED | 2025-06-05 14:30 | 14:30:03 |
| 11 | ...0011 | 43 | 27 | 4,500 | PURCHASE | COMPLETED | 2025-06-06 11:15 | 11:15:02 |
| 15 | ...0015 | 27 | 35 | 8,000 | TRANSFER | PENDING | 2025-06-07 10:00 | — |
| 20 | ...0020 | 27 | 40 | 3,200 | TRANSFER | FAILED | 2025-06-08 08:45 | — |
| 25 | ...0025 | 27 | 22 | 6,700 | TRANSFER | ROLLED_BACK | 2025-06-09 16:20 | — |

**Nota:** T11 aparece también en la cuenta crédito (desde perspective opuesta).

---

## Transactions — Cuenta Crédito (account_id=43)

| id | UUID | from | to | amount | type | status | description | card_id |
|---|---|---|---|---|---|---|---|---|
| 11 | ...0011 | 43 | 27 | 4,500 | PURCHASE | COMPLETED | Coppel Satélite | 3 |

---

## Transaction Log Events

### T4 (COMPLETED) — secuencia completa
| id | event_type | occurred_at | node_id |
|---|---|---|---|
| 10 | INITIATED | 2025-06-04 09:00:00 | nodo-a |
| 11 | DEBIT_APPLIED | 2025-06-04 09:00:01 | nodo-a |
| 12 | CREDIT_APPLIED | 2025-06-04 09:00:03 | nodo-b |
| 13 | COMPLETED | 2025-06-04 09:00:04 | nodo-a |

### T15 (PENDING) — stalled
| id | event_type | occurred_at | node_id |
|---|---|---|---|
| 1 | INITIATED | 2025-06-07 10:00:00 | nodo-a |
| 2 | DEBIT_APPLIED | 2025-06-07 10:00:01 | nodo-a |

### T20 (FAILED)
| id | event_type | occurred_at | node_id |
|---|---|---|---|
| 3 | INITIATED | 2025-06-08 08:45:00 | nodo-a |
| 4 | DEBIT_APPLIED | 2025-06-08 08:45:01 | nodo-a |
| 5 | FAILED | 2025-06-08 08:45:03 | nodo-b |

### T25 (ROLLED_BACK) — con compensación
| id | event_type | occurred_at | node_id |
|---|---|---|---|
| 6 | INITIATED | 2025-06-09 16:20:00 | nodo-a |
| 7 | DEBIT_APPLIED | 2025-06-09 16:20:01 | nodo-a |
| 8 | FAILED | 2025-06-09 16:20:03 | nodo-b |
| 9 | COMPENSATED | 2025-06-09 16:20:05 | nodo-a |

---

## UUIDs completos

Para referencia de seed:

| Alias | UUID completo |
|---|---|
| T4 | `00000000-0000-4000-8000-000000000004` |
| T9 | `00000000-0000-4000-8000-000000000009` |
| T11 | `00000000-0000-4000-8000-000000000011` |
| T15 | `00000000-0000-4000-8000-000000000015` |
| T20 | `00000000-0000-4000-8000-000000000020` |
| T25 | `00000000-0000-4000-8000-000000000025` |
