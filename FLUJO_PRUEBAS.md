# DistriBank - Flujo de pruebas de transferencias

Login: `natalia.ruiz@distribank.mx` / `Distribank2025!` (customer_id=27, Nodo A, VIP)

---

## Escenario 1: Intra-nodo VIP → VIP

**Natalia → Sofía** (ambas Nodo A, ambas VIP)

| Campo | Valor |
|-------|-------|
| Origen | acc:27 · DISTCHK0000000027 · Natalia Ruiz Castillo · $56,000.00 |
| Destino | acc:3 · DISTCHK0000000003 · Sofía Torres Medina · $87,500.75 |
| Monto | $500.00 |
| Tipo | Intra-nodo (nodo-a) |

**Salida esperada en `watch:transactions`:**

```
[HH:MM:SS] | INITIATED       | tx:N | 27 -> 3  | $500.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | DEBIT_APPLIED   | tx:N | 27 -> 3  | $500.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | CREDIT_APPLIED  | tx:N | 27 -> 3  | $500.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | COMPLETED       | tx:N | 27 -> 3  | $500.00 | nodo-a
[HH:MM:SS] | ⭐ VIP_SYNC      | tx:N | Natalia Ruiz Castillo (acc:27) → vip schema | nodo-c
[HH:MM:SS] | ⭐ VIP_SYNC      | tx:N | Sofía Torres Medina (acc:3) → vip schema    | nodo-c
                              ── 3s ──
[HH:MM:SS] | ✓ VIP_VERIFIED   | tx:N | acc:27 balance=$55,500.00 confirmado | nodo-c
[HH:MM:SS] | ✓ VIP_VERIFIED   | tx:N | acc:3 balance=$88,000.75 confirmado  | nodo-c
```

**Balances después:**

| Cuenta | Schema público | Schema VIP (nodo-c) |
|--------|---------------|---------------------|
| acc:27 (Natalia) | $55,500.00 | $55,500.00 |
| acc:3 (Sofía) | $88,000.75 | $88,000.75 |

---

## Escenario 2: Inter-nodo VIP → VIP

**Natalia (Nodo A) → Ana (Nodo B)** — ambas VIP

| Campo | Valor |
|-------|-------|
| Origen | acc:27 · DISTCHK0000000027 · Natalia Ruiz Castillo · $56,000.00 |
| Destino | acc:1 · DISTCHK0000000001 · Ana García Reyes · $15,420.50 |
| Monto | $300.00 |
| Tipo | Cross-nodo (nodo-a → nodo-b) |

**Salida esperada en `watch:transactions`:**

```
[HH:MM:SS] | INITIATED       | tx:N | 27 -> 1  | $300.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | DEBIT_APPLIED   | tx:N | 27 -> 1  | $300.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | CREDIT_APPLIED  | tx:N | 27 -> 1  | $300.00 | nodo-b
                              ── 3s ──
[HH:MM:SS] | COMPLETED       | tx:N | 27 -> 1  | $300.00 | nodo-a
[HH:MM:SS] | ⭐ VIP_SYNC      | tx:N | Natalia Ruiz Castillo (acc:27) → vip schema | nodo-c
[HH:MM:SS] | ⭐ VIP_SYNC      | tx:N | Ana García Reyes (acc:1) → vip schema       | nodo-c
                              ── 3s ──
[HH:MM:SS] | ✓ VIP_VERIFIED   | tx:N | acc:27 balance=$55,700.00 confirmado | nodo-c
[HH:MM:SS] | ✓ VIP_VERIFIED   | tx:N | acc:1 balance=$15,720.50 confirmado  | nodo-c
```

**Notas cross-nodo:**
- Los 4 eventos de saga se escriben en `transaction_log` del **nodo origen** (nodo-a)
- El `node_id` en CREDIT_APPLIED refleja `nodo-b` (donde se acreditó)
- El balance de Ana se actualiza en nodo-b (público) y en nodo-c (VIP schema)

**Balances después:**

| Cuenta | Schema público | Schema VIP (nodo-c) |
|--------|---------------|---------------------|
| acc:27 (Natalia) en nodo-a | $55,700.00 | $55,700.00 |
| acc:1 (Ana) en nodo-b | $15,720.50 | $15,720.50 |

---

## Escenario 3: Intra-nodo VIP → no-VIP

**Natalia → Camila** (ambas Nodo A, solo Natalia es VIP)

| Campo | Valor |
|-------|-------|
| Origen | acc:27 · DISTCHK0000000027 · Natalia Ruiz Castillo · $56,000.00 |
| Destino | acc:9 · DISTCHK0000000009 · Camila Ortiz Vega · $1,250.00 |
| Monto | $200.00 |
| Tipo | Intra-nodo (nodo-a) |

**Salida esperada en `watch:transactions`:**

```
[HH:MM:SS] | INITIATED       | tx:N | 27 -> 9  | $200.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | DEBIT_APPLIED   | tx:N | 27 -> 9  | $200.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | CREDIT_APPLIED  | tx:N | 27 -> 9  | $200.00 | nodo-a
                              ── 3s ──
[HH:MM:SS] | COMPLETED       | tx:N | 27 -> 9  | $200.00 | nodo-a
[HH:MM:SS] | ⭐ VIP_SYNC      | tx:N | Natalia Ruiz Castillo (acc:27) → vip schema | nodo-c
                              ── 3s ──
[HH:MM:SS] | ✓ VIP_VERIFIED   | tx:N | acc:27 balance=$55,800.00 confirmado | nodo-c
```

**Diferencia clave:** No hay mensajes VIP para Camila porque no es VIP. Solo se sincroniza el débito de Natalia en el schema VIP.

**Balances después:**

| Cuenta | Schema público | Schema VIP (nodo-c) |
|--------|---------------|---------------------|
| acc:27 (Natalia) | $55,800.00 | $55,800.00 |
| acc:9 (Camila) | $1,450.00 | — (no existe en VIP) |

---

## Resumen de comportamiento VIP

| Escenario | Origen VIP | Destino VIP | VIP_SYNC origen | VIP_SYNC destino | TX replicada |
|-----------|-----------|-------------|-----------------|------------------|--------------|
| 1. Intra VIP→VIP | Si | Si | Si (débito) | Si (crédito) | Si (FK en from) |
| 2. Inter VIP→VIP | Si | Si | Si (débito) | Si (crédito) | Si (FK en from) |
| 3. VIP→no-VIP | Si | No | Si (débito) | No | Si (FK en from) |
| *4. no-VIP→VIP | No | Si | No | Si (crédito) | No (FK falla) |

> *Escenario 4 no incluido en las pruebas pero documentado: si el origen no es VIP, no se replica la transacción en el schema VIP (restricción FK en `from_account_id`), pero sí se actualiza el balance del destino VIP.

---

## Comandos

```bash
# Terminal 1: watcher
cd packages/backend && npm run watch:transactions

# Terminal 2: backend
cd packages/backend && npm run start:dev

# Terminal 3: frontend
cd packages/frontend && npm run dev
```

Login en `http://localhost:5173` con `natalia.ruiz@distribank.mx` / `Distribank2025!` y ejecutar las transferencias desde la UI ingresando el número de cuenta destino (ej. `DISTCHK0000000003`).
