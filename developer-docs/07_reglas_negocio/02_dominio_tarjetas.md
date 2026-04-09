# 07 Reglas de Negocio > Dominio de Tarjetas

> Prerrequisitos: [Dominio de cuentas](01_dominio_cuentas.md)

## Tipos de tarjeta

| Tipo | Asociada a | Color en PhysicalCard |
|------|-----------|----------------------|
| DEBIT | Cuenta CHECKING | Gradiente azul |
| CREDIT | Cuenta CREDIT | Gradiente dorado |

## Estados y transiciones

Ver [diagrama de estados](../diagramas/estados_tarjeta.md).

| Estado | Transiciones posibles | Quién la inicia | UI |
|--------|--------------------|----------------|-----|
| `ACTIVE` | → BLOCKED, → EXPIRED, → CANCELLED | Usuario (BLOCKED), Sistema (EXPIRED/CANCELLED) | Switch ON, habilitado |
| `BLOCKED` | → ACTIVE, → EXPIRED, → CANCELLED | Usuario (ACTIVE), Sistema (EXPIRED/CANCELLED) | Switch OFF, habilitado |
| `EXPIRED` | Ninguna (estado terminal) | Sistema | Switch deshabilitado, grayscale |
| `CANCELLED` | Ninguna (estado terminal) | Sistema | Switch deshabilitado, grayscale |

**Solo ACTIVE ↔ BLOCKED** es una transición válida por el usuario.

## Validación del toggle

En `cards.service.ts:49-52`:
```typescript
const expectedCurrent = newStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
if (card.status !== expectedCurrent) {
  throw new ConflictException('No fue posible actualizar...');
}
```

| Request `new_status` | Estado actual esperado | Si no coincide |
|----------------------|----------------------|---------------|
| `BLOCKED` | ACTIVE | 409 Conflict |
| `ACTIVE` | BLOCKED | 409 Conflict |

## Masking de datos

| Campo | BD | API response | Frontend display |
|-------|-----|-------------|-----------------|
| `card_number` | `4000000000000010` (completo) | `4000000000000010` (completo) | `•••• •••• •••• 0010` (masked) |
| `cvv` | `123` | **NUNCA incluido** | — |
| `expiration_date` | `2028-09-01` (Date) | `2028-09` (string) | `09/28` |

El **frontend** es responsable del masking usando `maskCardNumber()` de `src/lib/utils.ts`.

## Tarjetas en la demo

| # | Número | Tipo | Estado | Límite | Cuenta |
|---|--------|------|--------|--------|--------|
| 1 | ****0010 | DEBIT | ACTIVE | $15,000/día | DISTCHK0000000027 |
| 2 | ****0011 | DEBIT | ACTIVE | $5,000/día | DISTCHK0000000027 |
| 3 | ****0017 | CREDIT | ACTIVE | $20,000/día | DISTCRD0000000013 |
| 4 | ****0018 | CREDIT | **BLOCKED** | $10,000/día | DISTCRD0000000013 |

## Documentos relacionados

- [Estados de tarjeta](../diagramas/estados_tarjeta.md) — diagrama Mermaid
- [Flujo toggle tarjeta](../diagramas/flujo_toggle_tarjeta.md) — secuencia completa
- [Módulos de negocio](../04_backend/04_modulos_negocio.md) — CardsService
