# DistriBank - Accesos Demo

Password universal: `Distribank2025!`

## Accesos por nodo

| Nodo | Tipo | ID | Nombre | Email |
|------|------|----|--------|-------|
| A | VIP | 27 | Natalia Ruiz Castillo | natalia.ruiz@distribank.mx |
| A | no-VIP | 9 | Camila Ortiz Vega | camila.ortiz@distribank.mx |
| B | VIP | 1 | Ana Garcia Reyes | ana.garcia@distribank.mx |
| B | no-VIP | 4 | Roberto Ramirez Castro | roberto.ramirez@distribank.mx |
| C | VIP | 2 | Carlos Mendoza Lopez | carlos.mendoza@distribank.mx |
| C | no-VIP | 14 | Jorge Campos Vela | jorge.campos@distribank.mx |

## Routing de nodos

```
customer_id % 3 = 0  ->  Nodo A  (Supabase)
customer_id % 3 = 1  ->  Nodo B  (local)
customer_id % 3 = 2  ->  Nodo C  (Supabase + schema VIP)
```

## VIP

Un cliente es VIP cuando la suma de `week_transactions` de sus cuentas ACTIVE es >= 3.
Los clientes VIP se replican en el schema `distribank_vip_customers` del Nodo C.
