# 04 Backend > Módulo Transfers (SAGA)

> Prerrequisitos: [Módulo Database](03_modulo_database.md), [Dominio transferencias](../07_reglas_negocio/03_dominio_transferencias.md)

Este es el módulo más complejo del backend. Implementa el patrón SAGA para transferencias entre cuentas que pueden residir en nodos diferentes.

Ver [diagrama de secuencia completo](../diagramas/flujo_transferencia.md).

## Endpoint

```
POST /api/transfers
Authorization: Bearer <token>
Body: {
  "transaction_uuid": "uuid-v4",        // Generado por el frontend
  "from_account_id": 27,
  "to_account_number": "DISTCHK0000000018",
  "amount": 1000,
  "description": "Pago renta"           // Opcional
}
```

## Flujo del método `create()` (`src/transfers/transfers.service.ts:9-76`)

### 1. Check de idempotencia (líneas 13-22)

```typescript
const existing = await prismaOrigin.transactions.findUnique({
  where: { transaction_uuid: dto.transaction_uuid },
});
if (existing) return { transaction_uuid, status, initiated_at }; // Retorna sin re-ejecutar
```

Si el UUID ya existe, retorna el resultado existente. Esto previene ejecuciones duplicadas si el frontend reintenta.

### 2. Validar cuenta origen (líneas 25-49)

- Busca cuenta por `from_account_id` en el nodo del cliente
- Valida saldo suficiente:
  - **CHECKING:** `amount <= balance + overdraft_limit`
  - **CREDIT:** `amount <= available_credit`
- Si falla: `BadRequestException('Saldo insuficiente...')`

### 3. Buscar cuenta destino (líneas 52-66)

- Usa `nodeRouter.findAccountNodeByNumber()` — busca en los 3 nodos
- Valida que `from_account_id ≠ to_account_id`
- Si no existe: `BadRequestException('Cuenta destino no encontrada')`

### 4. Determinar tipo de transferencia (líneas 68-76)

```typescript
const originNode = this.nodeRouter.getNodeForCustomer(customerId);
const isIntraNode = originNode === destResult.node;
```

## Transferencia Intra-Nodo (`executeIntraNode`, líneas 78-119)

Cuando ambas cuentas están en el **mismo nodo PostgreSQL**:

1. **Crear transacción** con status `COMPLETED` (inmediato)
2. **Crear 4 log events** con timestamps espaciados 1 segundo:
   - `INITIATED` (t+0)
   - `DEBIT_APPLIED` (t+1s)
   - `CREDIT_APPLIED` (t+2s)
   - `COMPLETED` (t+3s)
3. **Actualizar balances:**
   - Cuenta origen: `balance.decrement(amount)`
   - Cuenta destino: `balance.increment(amount)`

**Nota:** No usa transacción de BD (`$transaction`) — las 4 operaciones son independientes.

## Transferencia Cross-Nodo (`executeCrossNode`, líneas 121-206)

Cuando las cuentas están en **nodos diferentes** — patrón SAGA con compensación:

### Fase 1: Preparación (nodo origen)
```
1. Crear transacción con status PENDING
2. Log: INITIATED + DEBIT_APPLIED (ambos en nodo origen)
3. Decrementar balance de cuenta origen
```

### Fase 2: Crédito (nodo destino, dentro de try)
```
4. Incrementar balance de cuenta destino (en su nodo)
```

### Fase 3a: Si éxito
```
5. Log: CREDIT_APPLIED (nodo destino) + COMPLETED (nodo origen)
6. Update transacción: status → COMPLETED
```

### Fase 3b: Si error (catch → compensación)
```
5. Revertir débito: incrementar balance de cuenta origen
6. Log: FAILED (nodo destino) + COMPENSATED (nodo origen)
7. Update transacción: status → ROLLED_BACK
```

## Response

```json
{
  "transaction_uuid": "00000000-0000-4000-8000-000000000004",
  "status": "COMPLETED",     // o "ROLLED_BACK"
  "initiated_at": "2025-06-04T09:00:00.000Z"
}
```

## Consideraciones de diseño

1. **No usa transacciones distribuidas** — no hay 2PC (two-phase commit). El patrón SAGA maneja la consistencia eventual.
2. **La compensación es best-effort** — si la compensación falla, no hay retry automático. En un sistema real, necesitarías un mecanismo de reconciliación.
3. **Los log events se crean en el nodo origen** — incluso el `CREDIT_APPLIED` se registra con `node_id` del nodo destino pero se almacena en el nodo origen.
4. **Timestamps artificiales** — los log events se espacian 1s entre sí para simular latencia en la UI de timeline.

## Documentos relacionados

- [Diagrama de secuencia](../diagramas/flujo_transferencia.md)
- [Estados de transacción](../diagramas/estados_transaccion.md)
- [Dominio transferencias](../07_reglas_negocio/03_dominio_transferencias.md) — reglas de negocio
- [DTOs y validación](06_dtos_validacion.md) — CreateTransferDto
