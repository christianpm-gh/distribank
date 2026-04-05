# 02 Inicio Rápido > Requisitos Previos

> Este documento lista todo lo que necesitas instalar antes de levantar el proyecto.

## Software requerido

| Software | Versión mínima | Verificar con | Propósito |
|----------|---------------|--------------|-----------|
| **Node.js** | 18.x+ (recomendado 20+) | `node -v` | Runtime JavaScript |
| **npm** | 7.0+ (viene con Node) | `npm -v` | Package manager con soporte de workspaces |
| **PostgreSQL** | 16.x | `psql --version` | Base de datos (3 instancias o bases) |
| **Git** | 2.x | `git --version` | Control de versiones |

## Software recomendado

| Software | Propósito |
|----------|-----------|
| **VS Code** | Editor con mejor soporte para el stack |
| **pgAdmin 4** | Explorador visual de PostgreSQL |
| **Postman / Bruno** | Pruebas manuales de la API REST |

## Extensiones recomendadas para VS Code

| Extensión | ID | Propósito |
|-----------|-----|-----------|
| ESLint | `dbaeumer.vscode-eslint` | Linting en tiempo real |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Autocompletado de clases Tailwind |
| Prisma | `Prisma.prisma` | Syntax highlighting del schema |
| Thunder Client / REST Client | — | Pruebas de API dentro de VS Code |

## Sobre PostgreSQL

Necesitas **3 bases de datos** PostgreSQL. Opciones:

1. **Una sola instancia PostgreSQL** con 3 bases de datos diferentes (`distribank_nodo_a`, `distribank_nodo_b`, `distribank_nodo_c`)
2. **3 instancias separadas** en puertos diferentes (ej: 5432, 5433, 5434)
3. **Nodo C en Supabase** — el `.env.example` del backend muestra esta configuración (2 locales + 1 cloud)

Para desarrollo, la opción 1 es la más sencilla.

## Documentos relacionados

- [Setup frontend](02_setup_frontend.md) — siguiente paso
- [Setup backend](03_setup_backend.md) — requiere PostgreSQL
- [Variables de entorno](05_variables_entorno.md) — referencia completa
