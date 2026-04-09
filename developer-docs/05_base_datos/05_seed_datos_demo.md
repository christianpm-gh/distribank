# 05 Base de Datos > Seed de Datos Demo

> Prerrequisitos: [Diccionario de datos](02_diccionario_datos.md)

Fuente: `packages/backend/prisma/seed.ts`

## Ejecutar el seed

```bash
cd packages/backend
npm run seed
```

El seed usa `upsert` — es seguro ejecutarlo múltiples veces sin duplicar datos.

## Datos insertados

### Cliente

| Campo | Valor |
|-------|-------|
| id | 27 |
| name | Natalia Ruiz Castillo |
| curp | RUCN900515MDFZTS01 |
| email | natalia.ruiz@distribank.mx |
| password | `bcrypt.hash('Distribank2025!', 10)` |

**Nodo destino:** A (27 % 3 = 0)

### Cuentas

| id | account_number | type | balance | credit_limit | available_credit | overdraft | week_tx | status |
|----|---------------|------|---------|-------------|-----------------|-----------|---------|--------|
| 27 | DISTCHK0000000027 | CHECKING | 56,000 | — | — | 1,500 | 8 | ACTIVE |
| 43 | DISTCRD0000000013 | CREDIT | 12,000 | 20,000 | 8,000 | — | 4 | ACTIVE |

**Nota:** El balance de la cuenta crédito se almacena como **positivo** (12,000 = adeuda $12K). Los mocks MSW lo devuelven como **negativo** (-12,000) para que el frontend lo muestre como deuda.

### Cuentas destino (para transferencias)

| id | account_number | type | balance | overdraft |
|----|---------------|------|---------|-----------|
| 18 | DISTCHK0000000018 | CHECKING | 30,000 | 1,000 |
| 30 | DISTCHK0000000030 | CHECKING | 15,000 | 500 |
| 35 | DISTCHK0000000035 | CHECKING | 20,000 | 1,000 |
| 40 | DISTCHK0000000040 | CHECKING | 10,000 | 500 |
| 22 | DISTCHK0000000022 | CHECKING | 25,000 | 1,000 |

### Tarjetas

| id | card_number | type | cvv | expiration | status | daily_limit | account_id |
|----|------------|------|-----|-----------|--------|-------------|------------|
| 1 | 4000000000000010 | DEBIT | 123 | 2028-09 | ACTIVE | 15,000 | 27 |
| 2 | 4000000000000011 | DEBIT | 456 | 2027-03 | ACTIVE | 5,000 | 27 |
| 3 | 4000000000000017 | CREDIT | 789 | 2028-09 | ACTIVE | 20,000 | 43 |
| 4 | 4000000000000018 | CREDIT | 012 | 2027-09 | BLOCKED | 10,000 | 43 |

### Transacciones

| id | uuid (últimos 4) | from → to | amount | type | status | initiated_at |
|----|-------------------|-----------|--------|------|--------|-------------|
| 4 | ...0004 | 27 → 18 | $12,000 | TRANSFER | COMPLETED | 2025-06-04 09:00 |
| 9 | ...0009 | 27 → 30 | $5,500 | TRANSFER | COMPLETED | 2025-06-05 14:30 |
| 11 | ...0011 | 43 → 27 | $4,500 | PURCHASE | COMPLETED | 2025-06-06 11:15 |
| 15 | ...0015 | 27 → 35 | $8,000 | TRANSFER | PENDING | 2025-06-07 10:00 |
| 20 | ...0020 | 27 → 40 | $3,200 | TRANSFER | FAILED | 2025-06-08 08:45 |
| 25 | ...0025 | 27 → 22 | $6,700 | TRANSFER | ROLLED_BACK | 2025-06-09 16:20 |

### Transaction Log Events

| tx_id | event_type | node_id | timestamp |
|-------|-----------|---------|-----------|
| 4 | INITIATED | nodo-a | 09:00:00 |
| 4 | DEBIT_APPLIED | nodo-a | 09:00:01 |
| 4 | CREDIT_APPLIED | nodo-b | 09:00:03 |
| 4 | COMPLETED | nodo-a | 09:00:04 |
| 15 | INITIATED | nodo-a | 10:00:00 |
| 15 | DEBIT_APPLIED | nodo-a | 10:00:01 |
| 20 | INITIATED | nodo-a | 08:45:00 |
| 20 | DEBIT_APPLIED | nodo-a | 08:45:01 |
| 20 | FAILED | nodo-b | 08:45:03 |
| 25 | INITIATED | nodo-a | 16:20:00 |
| 25 | DEBIT_APPLIED | nodo-a | 16:20:01 |
| 25 | FAILED | nodo-b | 16:20:03 |
| 25 | COMPENSATED | nodo-a | 16:20:05 |

## Cobertura del demo

Los datos de Natalia cubren todos los escenarios del frontend:

| Escenario | Dato que lo cubre |
|-----------|------------------|
| VIP badge | week_transactions: 8 (CHECKING) y 4 (CREDIT), ambos >= 3 |
| Card BLOCKED | Tarjeta id=4 (****0018) en estado BLOCKED |
| Transaction COMPLETED | T4, T9, T11 |
| Transaction PENDING | T15 (simula cross-node en progreso) |
| Transaction FAILED | T20 |
| Transaction ROLLED_BACK | T25 (con COMPENSATED en log) |
| Timeline completa | T4 tiene 4 log events |
| Timeline parcial | T15 tiene 2 log events (INITIATED + DEBIT_APPLIED) |
| PURCHASE con tarjeta | T11 usa card_id=3 |
| Rol ORIGEN | T4, T9, T15, T20, T25 (from_account=27) |
| Rol DESTINO | T11 vista desde cuenta 27 (to_account=27) |

## Documentos relacionados

- [Verificación demo](../02_inicio_rapido/04_verificacion_demo.md) — checklist para verificar
- [Mocks MSW](../03_frontend/08_mocks_msw.md) — datos equivalentes en el frontend
