# Backend Nexora VIS2

## Objetivo

Montar el backend de Nexora dentro de Next.js para que el frontend deje de depender de arreglos fijos y consuma datos reales desde Supabase.

## Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Las dos variables publicas ya estan configuradas en este entorno. La `SUPABASE_SERVICE_ROLE_KEY` todavia no esta disponible localmente, por eso la lectura funciona completa y la siembra automatica queda preparada para activarse cuando esa llave exista.

## Estructura implementada

- `Docs/FRONTEND/src/lib/supabase.ts`
  Expone el cliente publico y el cliente admin opcional.
- `Docs/FRONTEND/src/lib/backend-data.ts`
  Centraliza las lecturas a Supabase, el mapeo para UI y la logica de seed demo.
- `Docs/FRONTEND/app/api/consultants/route.ts`
  GET de consultores con join a `profiles`.
- `Docs/FRONTEND/app/api/companies/route.ts`
  GET de empresas demo desde `profiles`.
- `Docs/FRONTEND/app/api/dashboard/route.ts`
  GET del snapshot para Home y metricas.
- `Docs/FRONTEND/app/api/challenges/route.ts`
  GET de la tabla `desafio`.
- `Docs/FRONTEND/app/api/demo/seed/route.ts`
  GET del estado del seed y POST para sembrar o confirmar los demos.

## Tablas verificadas

- `profiles`
  Disponible por REST publico y contiene 6 empresas demo y 5 consultores demo.
- `consultants`
  Disponible por REST publico y contiene la metadata profesional de los 5 consultores demo.
- `desafio`
  Existe, pero hoy esta vacia.
- `postulacion`
  Existe, pero hoy esta vacia.
- `empresa`
  Existe, pero hoy esta vacia.
- `consultor`
  Existe, pero hoy esta vacia.
- `calificacion`
  Existe, pero hoy esta vacia.

## Flujo actual

1. El frontend llama rutas `/api/*` de Next.
2. Las rutas consultan Supabase.
3. El backend adapta la respuesta a la forma que espera la UI.
4. Las vistas `Home`, `Explore`, `Network`, `Messages` y `Projects` leen esos endpoints.

## Estado de la guia

- Backend integrado en Next.js: completo.
- Variables publicas de Supabase: completas.
- Cliente admin opcional con `SUPABASE_SERVICE_ROLE_KEY`: preparado.
- Al menos un endpoint GET funcionando: completo.
- Al menos un endpoint POST funcionando: completo (`POST /api/demo/seed`).
- Frontend reflejando datos reales de Supabase: completo para empresas y consultores demo.
- Documentacion de arquitectura backend: completa.

## Nota operativa

La base ya trae las 6 empresas demo y los 5 consultores demo solicitados. Por eso el seed actual responde como `ready` y la app puede reflejar esos datos sin seguir usando colecciones hardcodeadas. Cuando se configure `SUPABASE_SERVICE_ROLE_KEY`, el mismo backend queda listo para resembrar esos datos de forma idempotente.
