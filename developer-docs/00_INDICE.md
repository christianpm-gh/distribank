# DistriBank — Documentación de Onboarding para Desarrolladores

> Bienvenido al equipo. Este documento es tu punto de entrada para entender el sistema DistriBank
> y empezar a contribuir código productivo.

---

## Qué es DistriBank

DistriBank es un **simulador de banca minorista** construido como proyecto académico. Implementa:

- Una **SPA** (Single Page Application) con React 19, dark mode, diseño mobile-first
- Una **API REST** con NestJS que gestiona autenticación, cuentas, tarjetas, transacciones y transferencias
- Una **base de datos distribuida** en 3 nodos PostgreSQL, particionada por `customer_id % 3`
- Un **patrón SAGA** para transferencias cross-node con compensación automática

El sistema completo es relativamente pequeño (~2,500 líneas de código funcional) pero implementa patrones reales de arquitectura distribuida.

---

## Ruta de aprendizaje progresiva

### Hora 1 — Visión general y primera ejecución

| Paso | Documento | Objetivo |
|------|-----------|----------|
| 1 | [Arquitectura del sistema](01_vision_general/01_arquitectura_sistema.md) | Entender las 3 capas |
| 2 | [Stack tecnológico](01_vision_general/02_stack_tecnologico.md) | Conocer versiones exactas |
| 3 | [Estructura del monorepo](01_vision_general/03_estructura_monorepo.md) | Saber dónde está cada cosa |
| 4 | [Setup frontend (MSW)](02_inicio_rapido/02_setup_frontend.md) | Levantar la app sin backend |
| 5 | [Verificación demo](02_inicio_rapido/04_verificacion_demo.md) | Confirmar que todo funciona |

**Al terminar:** Tienes la app corriendo en `localhost:5173` con datos mock de Natalia.

### Horas 2-3 — Frontend deep dive

| Paso | Documento | Objetivo |
|------|-----------|----------|
| 6 | [Entrada de la aplicación](03_frontend/01_entrada_aplicacion.md) | Cadena de bootstrap |
| 7 | [Sistema de rutas](03_frontend/02_sistema_rutas.md) | 12 rutas y navegación |
| 8 | [Estado global (auth)](03_frontend/03_estado_global_auth.md) | Zustand + sessionStorage |
| 9 | [Capa de servicios](03_frontend/04_capa_servicios.md) | Axios + 5 servicios |
| 10 | [Hooks React Query](03_frontend/05_hooks_react_query.md) | Cache, invalidación, mutations |
| 11 | [Sistema de componentes](03_frontend/06_sistema_componentes.md) | 16 componentes en 4 capas |
| 12 | [Sistema de diseño](03_frontend/07_sistema_diseno.md) | Tokens CSS, tipografía, colores |

**Al terminar:** Puedes trazar cualquier flujo de datos desde el click del usuario hasta la respuesta.

### Día 2 — Backend y base de datos

| Paso | Documento | Objetivo |
|------|-----------|----------|
| 13 | [Setup backend](02_inicio_rapido/03_setup_backend.md) | 3 nodos PostgreSQL + NestJS |
| 14 | [Arquitectura NestJS](04_backend/01_arquitectura_nestjs.md) | Bootstrap, módulos, patrón |
| 15 | [Autenticación JWT](04_backend/02_autenticacion_jwt.md) | Login multi-nodo, guards |
| 16 | [Módulo Database](04_backend/03_modulo_database.md) | 3 Prisma + NodeRouter |
| 17 | [Módulos de negocio](04_backend/04_modulos_negocio.md) | Customers, Cards, Transactions |
| 18 | [Transfers (SAGA)](04_backend/05_modulo_transfers_saga.md) | Flujo completo con compensación |
| 19 | [Esquema ER](05_base_datos/01_esquema_er.md) | 6 tablas y relaciones |
| 20 | [Distribución en nodos](05_base_datos/03_distribucion_nodos.md) | Particionamiento por customer_id |

**Al terminar:** Puedes ejecutar el backend, entender el routing distribuido y la SAGA.

### Día 3 — Contrato API y reglas de negocio

| Paso | Documento | Objetivo |
|------|-----------|----------|
| 21 | [Catálogo de endpoints](06_contrato_api/01_catalogo_endpoints.md) | 7 endpoints con request/response |
| 22 | [Tipos compartidos](06_contrato_api/03_tipos_compartidos.md) | Mapeo Frontend ↔ Backend ↔ BD |
| 23 | [Manejo de errores](06_contrato_api/04_manejo_errores.md) | Códigos HTTP, mensajes |
| 24 | [Dominio: cuentas](07_reglas_negocio/01_dominio_cuentas.md) | CHECKING vs CREDIT, VIP |
| 25 | [Dominio: transferencias](07_reglas_negocio/03_dominio_transferencias.md) | Idempotencia, SAGA, validaciones |
| 26 | [Seguridad y aislamiento](07_reglas_negocio/05_seguridad_aislamiento.md) | JWT, aislamiento, masking |

**Al terminar:** Conoces todas las reglas de negocio y el contrato entre frontend y backend.

### Semana 1 — Referencia al hacer tu primera tarea

| Documento | Cuándo consultarlo |
|-----------|-------------------|
| [Agregar una página](09_guias_comunes/01_agregar_pagina.md) | Tu primera feature frontend |
| [Agregar un endpoint](09_guias_comunes/02_agregar_endpoint.md) | Tu primer endpoint backend |
| [Agregar un componente](09_guias_comunes/03_agregar_componente.md) | Tu primer componente UI |
| [Agregar mock MSW](09_guias_comunes/04_agregar_mock_msw.md) | Mock para desarrollo standalone |
| [Agregar hook React Query](09_guias_comunes/05_agregar_hook_react_query.md) | Hook de datos |
| [Modificar schema Prisma](09_guias_comunes/06_modificar_schema_prisma.md) | Cambio en base de datos |
| [Convenciones de commits](08_workflow_desarrollo/01_convenciones_commits.md) | Antes de tu primer commit |
| [Checklist de contribución](08_workflow_desarrollo/03_checklist_contribucion.md) | Antes de cada push |

---

## Tabla de contenidos completa

### 01 — Visión General

- [01 Arquitectura del sistema](01_vision_general/01_arquitectura_sistema.md) — Diagrama alto nivel, flujo de request, puertos
- [02 Stack tecnológico](01_vision_general/02_stack_tecnologico.md) — Versiones exactas de todas las dependencias
- [03 Estructura del monorepo](01_vision_general/03_estructura_monorepo.md) — Árbol de directorios anotado

### 02 — Inicio Rápido

- [01 Requisitos previos](02_inicio_rapido/01_requisitos_previos.md) — Node, npm, PostgreSQL, herramientas
- [02 Setup frontend](02_inicio_rapido/02_setup_frontend.md) — Ejecución standalone con MSW
- [03 Setup backend](02_inicio_rapido/03_setup_backend.md) — 3 nodos PostgreSQL, Prisma, seed
- [04 Verificación demo](02_inicio_rapido/04_verificacion_demo.md) — Checklist con datos de Natalia
- [05 Variables de entorno](02_inicio_rapido/05_variables_entorno.md) — Referencia completa de `.env`

### 03 — Frontend

- [01 Entrada de la aplicación](03_frontend/01_entrada_aplicacion.md) — `main.tsx` → `App.tsx` → Router → MSW bootstrap
- [02 Sistema de rutas](03_frontend/02_sistema_rutas.md) — 12 rutas, PrivateRoute, AppShell
- [03 Estado global (auth)](03_frontend/03_estado_global_auth.md) — Zustand + sessionStorage
- [04 Capa de servicios](03_frontend/04_capa_servicios.md) — Axios interceptor + 5 servicios
- [05 Hooks React Query](03_frontend/05_hooks_react_query.md) — Query keys, invalidación, hooks
- [06 Sistema de componentes](03_frontend/06_sistema_componentes.md) — 16 componentes en 4 capas
- [07 Sistema de diseño](03_frontend/07_sistema_diseno.md) — Tokens CSS, paleta, tipografía
- [08 Mocks MSW](03_frontend/08_mocks_msw.md) — Handlers, datos demo, delays
- [09 Páginas (detalle)](03_frontend/09_paginas_detalle.md) — 12 páginas con specs S-01..S-11
- [10 Validación de formularios](03_frontend/10_validacion_formularios.md) — Zod schemas

### 04 — Backend

- [01 Arquitectura NestJS](04_backend/01_arquitectura_nestjs.md) — Bootstrap, AppModule, patrón Controller/Service
- [02 Autenticación JWT](04_backend/02_autenticacion_jwt.md) — Passport, JwtStrategy, guards, payload
- [03 Módulo Database](04_backend/03_modulo_database.md) — DatabaseModule, 3 Prisma, NodeRouter
- [04 Módulos de negocio](04_backend/04_modulos_negocio.md) — Customers, Cards, Transactions
- [05 Módulo Transfers (SAGA)](04_backend/05_modulo_transfers_saga.md) — SAGA intra/cross-node con compensación
- [06 DTOs y validación](04_backend/06_dtos_validacion.md) — class-validator, ValidationPipe
- [07 Serialización de respuestas](04_backend/07_serializacion_respuestas.md) — BigInt→Number, Decimal, Date

### 05 — Base de Datos

- [01 Esquema ER](05_base_datos/01_esquema_er.md) — Diagrama ER de 6 tablas
- [02 Diccionario de datos](05_base_datos/02_diccionario_datos.md) — Cada tabla, columna, tipo, constraints
- [03 Distribución en nodos](05_base_datos/03_distribucion_nodos.md) — `customer_id % 3`, Nodo A/B/C
- [04 DDL y datos SQL](05_base_datos/04_ddl_y_datos.md) — Referencia a 6 archivos SQL
- [05 Seed y datos demo](05_base_datos/05_seed_datos_demo.md) — Script seed.ts, datos de Natalia

### 06 — Contrato API

- [01 Catálogo de endpoints](06_contrato_api/01_catalogo_endpoints.md) — 7 endpoints con request/response exactos
- [02 Flujos de secuencia](06_contrato_api/02_flujos_secuencia.md) — Diagramas de secuencia: login, transfer, toggle
- [03 Tipos compartidos](06_contrato_api/03_tipos_compartidos.md) — Mapeo `api.types.ts` ↔ DTOs ↔ Prisma
- [04 Manejo de errores](06_contrato_api/04_manejo_errores.md) — Códigos HTTP, mensajes en español

### 07 — Reglas de Negocio

- [01 Dominio: cuentas](07_reglas_negocio/01_dominio_cuentas.md) — CHECKING vs CREDIT, VIP, estados
- [02 Dominio: tarjetas](07_reglas_negocio/02_dominio_tarjetas.md) — Transiciones de estado, toggle
- [03 Dominio: transferencias](07_reglas_negocio/03_dominio_transferencias.md) — SAGA, idempotencia, compensación
- [04 Dominio: transacciones](07_reglas_negocio/04_dominio_transacciones.md) — Tipos, estados, timeline
- [05 Seguridad y aislamiento](07_reglas_negocio/05_seguridad_aislamiento.md) — JWT, aislamiento, masking

### 08 — Workflow de Desarrollo

- [01 Convenciones de commits](08_workflow_desarrollo/01_convenciones_commits.md) — Conventional Commits, scopes
- [02 Flujo Git y deploy](08_workflow_desarrollo/02_flujo_git_deploy.md) — Branch main, Vercel, doc sync
- [03 Checklist de contribución](08_workflow_desarrollo/03_checklist_contribucion.md) — Verificación pre-push

### 09 — Guías Comunes (paso a paso)

- [01 Agregar una página](09_guias_comunes/01_agregar_pagina.md)
- [02 Agregar un endpoint](09_guias_comunes/02_agregar_endpoint.md)
- [03 Agregar un componente](09_guias_comunes/03_agregar_componente.md)
- [04 Agregar un mock MSW](09_guias_comunes/04_agregar_mock_msw.md)
- [05 Agregar un hook React Query](09_guias_comunes/05_agregar_hook_react_query.md)
- [06 Modificar el schema Prisma](09_guias_comunes/06_modificar_schema_prisma.md)

### Diagramas Mermaid

- [Arquitectura general](diagramas/arquitectura_general.md) — `graph TB` con subgraphs Frontend/Backend/DB
- [Esquema ER completo](diagramas/er_completo.md) — `erDiagram` de 6 tablas con columnas
- [Flujo de login](diagramas/flujo_login.md) — `sequenceDiagram` completo
- [Flujo de transferencia](diagramas/flujo_transferencia.md) — `sequenceDiagram` intra + cross-node
- [Flujo toggle tarjeta](diagramas/flujo_toggle_tarjeta.md) — `sequenceDiagram` con modal
- [Navegación SPA](diagramas/navegacion_spa.md) — `flowchart` de 12 pantallas
- [Estados de transacción](diagramas/estados_transaccion.md) — `stateDiagram-v2`
- [Estados de tarjeta](diagramas/estados_tarjeta.md) — `stateDiagram-v2`

---

## Quick Reference

### Credenciales demo

| Campo | Valor |
|-------|-------|
| Email | `natalia.ruiz@email.com` |
| Contraseña | `password123` |
| Customer ID | `27` |
| Nodo asignado | **Nodo C** (`27 % 3 = 0` → nodo-c) |

### Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | `http://localhost:5173` |
| Backend (NestJS) | 3000 | `http://localhost:3000/api` |
| PostgreSQL Nodo A | 5432 | `distribank_nodo_a` |
| PostgreSQL Nodo B | 5432 | `distribank_nodo_b` |
| PostgreSQL Nodo C | 5432 | `distribank_nodo_c` |

### Cuentas de Natalia

| Tipo | Número | Balance | Nodo |
|------|--------|---------|------|
| CHECKING | 2701001 | $45,230.75 | C |
| CREDIT | 2702001 | $12,000.00 | C |

### Comandos más usados

```bash
# Frontend standalone (con MSW)
cd packages/frontend
npm run dev

# Backend
cd packages/backend
npx prisma generate
npm run seed
npm run start:dev

# Monorepo (desde raíz)
npm install          # Instala todo
npm run dev -w packages/frontend
npm run start:dev -w packages/backend
```

---

## Limitaciones conocidas

Estas son inconsistencias descubiertas durante la revisión de código. Están documentadas en detalle en las secciones correspondientes:

1. **`isOrigin = true` hardcodeado** — `transactions.service.ts:67` siempre devuelve `rol_cuenta: 'ORIGEN'` en el detalle. Ver [Módulos de negocio](04_backend/04_modulos_negocio.md).

2. **`description: null`** — Las transacciones nunca devuelven la descripción de la BD. Ver [Módulos de negocio](04_backend/04_modulos_negocio.md).

3. **Balance crédito: positivo vs negativo** — El backend devuelve `12000` (positivo), los mocks MSW devuelven `-12000`. Ver [Mocks MSW](03_frontend/08_mocks_msw.md).

4. **Versiones en CLAUDE.md desactualizadas** — Dice React 18 / Router v6, pero el código usa React 19.2.4 / Router 7.13.1. Ver [Stack tecnológico](01_vision_general/02_stack_tecnologico.md).

---

## Estructura del directorio de documentación

```
developer-docs/
├── 00_INDICE.md                    ← Estás aquí
├── 01_vision_general/              (3 archivos)
├── 02_inicio_rapido/               (5 archivos)
├── 03_frontend/                    (10 archivos)
├── 04_backend/                     (7 archivos)
├── 05_base_datos/                  (5 archivos)
├── 06_contrato_api/                (4 archivos)
├── 07_reglas_negocio/              (5 archivos)
├── 08_workflow_desarrollo/         (3 archivos)
├── 09_guias_comunes/               (6 archivos)
└── diagramas/                      (8 archivos)
```

**Total: 49 archivos** — Esta documentación fue generada revisando directamente el código fuente para garantizar precisión.
