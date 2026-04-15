# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nexora is a B2B marketplace connecting companies (Empresas) with consultants (Consultores). Built as a university project for Externado (IA Corporativa course) by a team of three (Julian, Juan, Sebastian, Iosiv).

## Commands

All commands run from `Docs/FRONTEND/`:

```bash
cd Docs/FRONTEND
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm start          # Start production server
npm run test       # Run tests in watch mode (Vitest)
npm run test:run   # Run tests once
```

## Architecture

### Next.js App Router

The app uses Next.js 16 with the App Router pattern. All routing is file-based under `app/`.

**Root layout** (`app/layout.tsx`) — Server Component with metadata, font preconnects, global CSS. Wraps children with `<Providers>`.

**Providers** (`app/providers.tsx`) — `"use client"` wrapper containing `AuthProvider` (Supabase auth) + `Toaster` (sonner notifications).

**Route groups:**
- `app/login/` — Public login page (no layout chrome)
- `app/(dashboard)/` — Protected routes with shared layout (Sidebar, Header, BottomNav, GridFloor, ParticleSystem). Auth guard in the layout redirects unauthenticated users to `/login`.

### Key Directories (under `Docs/FRONTEND/`)

- `app/` — Next.js App Router (layouts, pages, providers)
- `app/(dashboard)/` — Protected dashboard pages with shared layout
- `src/app/pages/` — Page components (HomePage, ExplorePage, etc.)
- `src/app/components/` — Shared components (ConsultantCard, GlassCard, Sidebar, Header, etc.)
- `src/app/components/ui/` — Radix UI primitives (shadcn/ui style, 46 components)
- `src/app/context/` — React Context (AuthContext)
- `src/lib/` — Utilities (Supabase client)
- `src/styles/` — Global CSS (theme vars, fonts, Tailwind)

### Routes

File-based routing via Next.js App Router. Protected routes use `(dashboard)` route group:

- `/login` — Auth (public)
- `/` — Home (role-based dashboard)
- `/explorar` — Browse consultants with filters
- `/red` — Network/favorites
- `/proyectos` — Project management
- `/mensajes` — Messaging
- `/analytics` — Analytics dashboard
- `/perfil` — User profile
- `/configuracion` — Settings

### Auth & Data

- **Supabase** for auth (email/password + Google OAuth) and PostgreSQL database
- Supabase client initialized in `src/lib/supabase.ts` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AuthContext` wraps the app via `providers.tsx`, providing `session`, `user`, `profile`, `signOut`, `loading`
- Auth guard lives in `app/(dashboard)/layout.tsx` — redirects to `/login` if not authenticated
- Two user roles: `EMPRESA` (company) and `CONSULTOR` (consultant) — stored in `profiles.user_type`
- Database tables: `profiles`, `consultants`, `favorites`, `messages` — all with RLS policies
- Most pages use hardcoded mock data — Supabase integration only wired for auth and profile fetch

### Styling

- Tailwind CSS 4 + Emotion (CSS-in-JS) coexist
- Glassmorphism aesthetic: `backdrop-filter: blur(12px)`, semi-transparent backgrounds
- CSS variables defined in `src/styles/theme.css`
- Custom fonts: Sora, Montserrat, Inter (declared via Google Fonts in `app/layout.tsx`)
- PWA-ready: `manifest.json` in `Docs/FRONTEND/public/`

### Testing

- **Vitest** with `@testing-library/react` and jsdom
- Config: `vitest.config.ts`
- Tests live alongside components in `__tests__/` directories
- Mock patterns for `next/link`, `next/navigation`, and `AuthContext` in test files

## Deployment

- **Vercel** via GitHub Actions (`.github/workflows/vercel-deploy.yml`)
- Push to `master` → production deploy
- Push to any other branch → preview deploy
- Working directory for CI: `Docs/FRONTEND`
- Required secrets: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`

## Team Branches

- `master` — production
- `profesor` — professor's working branch
- `Juan`, `Iosiv`, `Sebastian` — individual working branches

## Documentation

Design and business docs live in `Docs/` subdirectories:
- `ARQUITECTURA/` — Tech stack rationale
- `BASE_DATOS/` — Database schema and RLS policies
- `BRANDING/` — Design system, moodboard, color palette
- `NEGOCIO/` — Business model, user flows
