# 07 Reglas de Negocio > Dominio de Transacciones

> Prerrequisitos: [Dominio de transferencias](03_dominio_transferencias.md)

## Tipos de transacción

| Tipo | Origen | Descripción |
|------|--------|-------------|
| `TRANSFER` | Usuario (POST /api/transfers) | Transferencia entre cuentas |
| `PURCHASE` | Sistema / POS | Compra con tarjeta |
| `DEPOSIT` | Sistema | Depósito en cuenta |

En la demo, hay 5 TRANSFER y 1 PURCHASE.

## Estados

| Estado | Significado | Tiene `completed_at`? |
|--------|-----------|---------------------|
| `PENDING` | En progreso (cross-node esperando crédito) | No |
| `COMPLETED` | Exitosa, ambos saldos actualizados | Sí |
| `FAILED` | Error sin compensación | No |
| `ROLLED_BACK` | Error + compensación aplicada | No |

Ver [diagrama de estados](../diagramas/estados_transaccion.md).

## Campos calculados

Estos campos **no existen en la BD** — se calculan en el backend al serializar:

### `rol_cuenta`

```typescript
const isOrigin = Number(t.from_account_id) === accountId;
return isOrigin ? 'ORIGEN' : 'DESTINO'
```

- `ORIGEN`: La cuenta consultada es la que envía dinero (from_account)
- `DESTINO`: La cuenta consultada es la que recibe dinero (to_account)

**Limitación:** En `getDetail()`, `rol_cuenta` está hardcodeado como `'ORIGEN'` (línea 67).

### `counterpart_account`

```typescript
counterpart_account: isOrigin
  ? t.to_account.account_number    // Si soy origen, muestro el destino
  : t.from_account.account_number  // Si soy destino, muestro el origen
```

## UI por estado

| Estado | StatusBadge | SignedAmount (ORIGEN) | Timeline |
|--------|-----------|---------------------|----------|
| COMPLETED | Verde, check | `-$12,000.00` (rojo) | 4 nodos verdes, completa |
| PENDING | Amarillo, reloj | `-$8,000.00` (rojo) | 2 nodos, último pulsando |
| FAILED | Rojo, X | `-$3,200.00` (rojo) | 3 nodos, último rojo |
| ROLLED_BACK | Naranja, ↩ | `-$6,700.00` (rojo) | 4 nodos, últimos naranja |

## Timeline (TransactionTimeline)

El componente reproduce visualmente los `log_events` de una transacción:

- Cada evento es un **nodo** en la timeline
- Conectados por líneas con animación
- **Reproductor:** play/pause/replay con intervalo de 600ms
- El `node_id` de cada evento indica en qué nodo ocurrió

## Documentos relacionados

- [Estados de transacción](../diagramas/estados_transaccion.md) — diagrama
- [Sistema de componentes](../03_frontend/06_sistema_componentes.md) — TransactionRow, TransactionTimeline
- [Módulos de negocio](../04_backend/04_modulos_negocio.md) — TransactionsService
