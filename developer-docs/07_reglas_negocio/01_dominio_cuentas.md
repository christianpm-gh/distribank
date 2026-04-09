# 07 Reglas de Negocio > Dominio de Cuentas

> Prerrequisitos: [Diccionario de datos](../05_base_datos/02_diccionario_datos.md)

## Tipos de cuenta

| Tipo | Prefijo | Campos exclusivos | Formato |
|------|---------|-------------------|---------|
| **CHECKING** (Cheques) | `DISTCHK` | `overdraft_limit` | `DISTCHK\d{10}` |
| **CREDIT** (Crédito) | `DISTCRD` | `credit_limit`, `available_credit` | `DISTCRD\d{10}` |

Regex de validación: `/^DIST(CHK|CRD)\d{10}$/`

## Estados de cuenta

| Estado | Operaciones permitidas | Visible en Home |
|--------|----------------------|----------------|
| `ACTIVE` | Todas (transferencia, consulta, tarjetas) | Sí |
| `INACTIVE` | Solo lectura | Sí |
| `FROZEN` | Solo lectura | Sí |
| `CLOSED` | Solo historial | No (oculta del home) |

En la demo, ambas cuentas de Natalia están en estado `ACTIVE`.

## Balance según tipo

| Tipo | Significado de `balance` | Ejemplo |
|------|------------------------|---------|
| CHECKING | Saldo disponible (positivo = tiene dinero) | $56,000.00 |
| CREDIT | Monto adeudado | $12,000.00 en BD (positivo), -$12,000 en MSW (negativo) |

**Inconsistencia conocida:** El backend almacena y retorna el balance de CREDIT como positivo. Los mocks MSW del frontend lo retornan como negativo para representar deuda. El frontend debe manejar ambos casos.

## VIP Badge

**Regla:** Se muestra el badge VIP cuando `week_transactions >= 3` en cualquier cuenta ACTIVE.

| Cuenta | week_transactions | VIP? |
|--------|------------------|------|
| CHECKING (id=27) | 8 | Sí (8 >= 3) |
| CREDIT (id=43) | 4 | Sí (4 >= 3) |

**Implementación frontend:** `VIPBadge` recibe `weekTransactions` como prop y muestra el badge condicionalmente.

**Implementación backend:** `week_transactions` se lee directamente de la BD. No hay lógica de cálculo — se asume que otro proceso lo actualiza semanalmente.

## Límites de transferencia

| Tipo cuenta | Máximo transferible | Fórmula |
|-------------|--------------------|---------|
| CHECKING | $57,500.00 | `balance + overdraft_limit` (56000 + 1500) |
| CREDIT | $8,000.00 | `available_credit` |

## Documentos relacionados

- [Dominio de tarjetas](02_dominio_tarjetas.md)
- [Dominio de transferencias](03_dominio_transferencias.md)
- [Módulos de negocio](../04_backend/04_modulos_negocio.md) — CustomersService
