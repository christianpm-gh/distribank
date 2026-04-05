# 03 Frontend > Validación de Formularios

> Prerrequisitos: [Páginas detalle](09_paginas_detalle.md)

## Librería

**Zod v4** — importado como `from 'zod/v4'` (nota: v4, no v3).

## LoginPage

```typescript
const loginSchema = z.object({
  email: z.email(),              // Formato email válido
  password: z.string().min(8),   // Mínimo 8 caracteres
})
```

**Patrón de uso:**
```typescript
const result = loginSchema.safeParse({ email, password })
if (!result.success) {
  // Extraer errors por campo
  const fieldErrors = result.error.issues.reduce((acc, issue) => {
    acc[issue.path[0]] = issue.message
    return acc
  }, {})
  setErrors(fieldErrors)
  return
}
// Si válido → llamar mutation
loginMutation.mutate(result.data)
```

## TransferPage

Validaciones aplicadas antes de navegar a la confirmación:

| Campo | Validación | Error |
|-------|-----------|-------|
| Cuenta origen | Selección requerida | "Selecciona una cuenta" |
| Cuenta destino | Formato `/^DIST(CHK|CRD)\d{10}$/` | "Formato de cuenta inválido" |
| Monto | Numérico, > 0 | "El monto debe ser mayor a 0" |
| Monto (CHECKING) | `<= balance + overdraft_limit` | "Saldo insuficiente" |
| Monto (CREDIT) | `<= available_credit` | "Crédito insuficiente" |

## Patrón general

1. **State local** para valores del form: `const [email, setEmail] = useState('')`
2. **State para errores** por campo: `const [errors, setErrors] = useState<Record<string, string>>({})`
3. **Validación on submit** (no on blur): `safeParse()` antes de llamar al mutation
4. **Display inline**: error debajo de cada campo
5. **Disabled state**: botón deshabilitado durante `mutation.isPending`

## Utilidades de formato (`src/lib/utils.ts`)

| Función | Input | Output | Uso |
|---------|-------|--------|-----|
| `formatCurrency(56000)` | number | `"$56,000.00"` | Montos en UI |
| `maskAccountNumber("DISTCHK0000000027")` | string | `"•••• 0027"` | Números de cuenta |
| `maskCardNumber("4000000000000010")` | string | `"•••• •••• •••• 0010"` | Números de tarjeta |
| `formatDate("2025-06-04T09:00:00Z")` | ISO string | `"4 jun 2025, 09:00:00"` | Fechas completas |
| `formatRelativeDate("2025-06-04T...")` | ISO string | `"Hoy" / "Ayer" / "Hace 3 días"` | Fechas relativas |
| `getFirstName("Natalia Ruiz Castillo")` | string | `"Natalia"` | Saludo en home |

## Documentos relacionados

- [DTOs y validación (backend)](../04_backend/06_dtos_validacion.md) — validación del lado del servidor
- [Hooks React Query](05_hooks_react_query.md) — mutations que reciben datos validados
