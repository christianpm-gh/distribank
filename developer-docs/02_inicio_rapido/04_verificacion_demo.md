# 02 Inicio Rápido > Verificación de la Demo

> Prerrequisitos: [Setup frontend](02_setup_frontend.md) o [Setup backend](03_setup_backend.md)

## Credenciales demo

| Campo | Valor |
|-------|-------|
| Email | `natalia.ruiz@distribank.mx` |
| Password | `Distribank2025!` |
| Customer ID | 27 |
| Nodo | A (27 % 3 = 0) |

## Checklist de verificación

### Login (S-01)
- [ ] Abrir `http://localhost:5173`
- [ ] Redirige automáticamente a `/login`
- [ ] Ingresar credenciales demo → login exitoso
- [ ] Redirige a `/` (HomePage)

### HomePage (S-02)
- [ ] Muestra nombre: **Natalia Ruiz Castillo**
- [ ] Cuenta de cheques:
  - Número: `DISTCHK0000000027`
  - Saldo: `$56,000.00`
  - Transacciones semanales: 8
  - Badge **VIP** visible (8 >= 3)
- [ ] Cuenta de crédito:
  - Número: `DISTCRD0000000013`
  - Adeudo: `$12,000.00`
  - Disponible: `$8,000.00`
  - Límite: `$20,000.00`
  - Badge **VIP** visible (4 >= 3)

### Cuenta Débito (S-03)
- [ ] Click en cuenta de cheques → navega a `/accounts/debit`
- [ ] Saldo y sobregiro visibles ($56,000 + $1,500 sobregiro)

### Cuenta Crédito (S-04)
- [ ] Click en cuenta de crédito → navega a `/accounts/credit`
- [ ] Barra de uso de crédito visible (60% utilizado: 12K de 20K)

### Transacciones (S-05 / S-06)
- [ ] Navegar al historial de transacciones de la cuenta débito
- [ ] Se ven 6 transacciones con estados variados:
  - T4: COMPLETED ($12,000 → DISTCHK0000000018)
  - T9: COMPLETED ($5,500 → DISTCHK0000000030)
  - T11: COMPLETED ($4,500 ← DISTCRD0000000013) — rol DESTINO
  - T15: PENDING ($8,000 → DISTCHK0000000035)
  - T20: FAILED ($3,200 → DISTCHK0000000040)
  - T25: ROLLED_BACK ($6,700 → DISTCHK0000000022)
- [ ] Click en T4 → TransactionDetailPage con timeline de 4 eventos
- [ ] Click en T25 → Timeline muestra INITIATED → DEBIT_APPLIED → FAILED → COMPENSATED

### Tarjetas (S-07 / S-08)
- [ ] Sidebar → Tarjetas → `/cards`
- [ ] 4 tarjetas visibles:
  - ****0010 — DEBIT, ACTIVE, $15,000 límite diario
  - ****0011 — DEBIT, ACTIVE, $5,000 límite diario
  - ****0017 — CREDIT, ACTIVE, $20,000 límite diario
  - ****0018 — CREDIT, **BLOCKED**, $10,000 límite diario
- [ ] Click en ****0018 → CardDetailPage
- [ ] Switch en posición OFF (BLOCKED)
- [ ] Activar switch → modal de confirmación → confirmar → cambia a ACTIVE
- [ ] Refrescar datos → tarjeta ahora ACTIVE

### Transferencia (S-09 / S-10 / S-11)
- [ ] Sidebar → Transferir → `/transfer`
- [ ] Seleccionar cuenta origen (débito o crédito)
- [ ] Ingresar cuenta destino: `DISTCHK0000000018`
- [ ] Ingresar monto: `1000`
- [ ] Click Continuar → `/transfer/confirm` muestra resumen
- [ ] Click Confirmar → `/transfer/result` muestra resultado
- [ ] Resultado COMPLETED (con MSW, siempre exitoso)

## Datos detallados de Natalia

### Cuentas

| Campo | Débito (id=27) | Crédito (id=43) |
|-------|---------------|-----------------|
| Número | DISTCHK0000000027 | DISTCRD0000000013 |
| Tipo | CHECKING | CREDIT |
| Saldo | $56,000.00 | $12,000.00 (adeudo) |
| Límite crédito | — | $20,000.00 |
| Disponible | — | $8,000.00 |
| Sobregiro | $1,500.00 | — |
| Tx semanales | 8 | 4 |
| Estado | ACTIVE | ACTIVE |

### Tarjetas

| ID | Número | Tipo | Estado | Límite diario | Cuenta |
|----|--------|------|--------|---------------|--------|
| 1 | 4000000000000010 | DEBIT | ACTIVE | $15,000 | 27 |
| 2 | 4000000000000011 | DEBIT | ACTIVE | $5,000 | 27 |
| 3 | 4000000000000017 | CREDIT | ACTIVE | $20,000 | 43 |
| 4 | 4000000000000018 | CREDIT | BLOCKED | $10,000 | 43 |

## Documentos relacionados

- [Seed de datos demo](../05_base_datos/05_seed_datos_demo.md) — detalle del script seed.ts
- [Mocks MSW](../03_frontend/08_mocks_msw.md) — datos en natalia.ts
