# 02 Inicio Rápido > Setup Frontend

> Prerrequisitos: [Requisitos previos](01_requisitos_previos.md)
>
> El frontend funciona **standalone** con MSW — no necesitas el backend para desarrollo frontend.

## Paso a paso

### 1. Clonar e instalar

```bash
git clone <url-del-repo>
cd distribank-fe
npm install          # Instala dependencias de AMBOS packages (workspaces)
```

### 2. Verificar archivo `.env`

```bash
cat packages/frontend/.env
```

Debe contener:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MSW=true
```

Si no existe, crearlo con estos valores. `VITE_ENABLE_MSW=true` activa los mocks de MSW.

### 3. Arrancar el dev server

```bash
cd packages/frontend
npm run dev
```

Verás:
```
  VITE v8.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
```

### 4. Abrir en el navegador

Navega a `http://localhost:5173`. Deberías ver la página de login.

### 5. Iniciar sesión con el usuario demo

| Campo | Valor |
|-------|-------|
| Email | `natalia.ruiz@distribank.mx` |
| Password | `Distribank2025!` |

### 6. Verificar que todo funciona

Después del login deberías ver el **HomePage** con:
- Nombre: Natalia Ruiz Castillo
- Cuenta de cheques: $56,000.00 (saldo), 8 transacciones semanales
- Cuenta de crédito: $12,000.00 (adeudo), $8,000.00 disponible
- Badge VIP en ambas cuentas (week_transactions >= 3)

## Cómo funciona MSW

Cuando `VITE_ENABLE_MSW=true`:

1. `main.tsx` llama `enableMocking()` **antes** del render de React
2. Se importa dinámicamente `mocks/browser.ts` que registra todos los handlers
3. MSW intercepta requests HTTP **dentro del navegador** — nunca salen al network
4. Los handlers en `mocks/handlers/` devuelven datos mockeados con delays realistas

```
main.tsx:6-12 → enableMocking() → import("./mocks/browser") → worker.start()
```

Los datos demo están en `src/mocks/data/natalia.ts`.

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `vite` | Dev server con HMR en :5173 |
| `build` | `tsc -b && vite build` | Type-check + build de producción |
| `preview` | `vite preview` | Servir build de producción localmente |
| `lint` | `eslint .` | Linting con ESLint |

## Documentos relacionados

- [Verificación demo](04_verificacion_demo.md) — checklist detallado
- [Mocks MSW](../03_frontend/08_mocks_msw.md) — arquitectura de mocks
- [Entrada de la aplicación](../03_frontend/01_entrada_aplicacion.md) — flujo de bootstrap
