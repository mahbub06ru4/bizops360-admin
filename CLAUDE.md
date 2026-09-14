# BizOps 360 — Admin Console

Next.js (App Router) + TypeScript web front end for `bizops360-api`. Full
plan: `BizOps360_Admin_Panel_Plan.docx`, phase order in `README.md`. Read
both at the start of every phase before planning.

## Stack

- Next.js 16 (App Router) + TypeScript, React 19
- shadcn/ui + Radix primitives, Tailwind CSS v4
- React Hook Form + Zod (forms/validation), TanStack Query + TanStack Table
  (client data), Recharts (charts)
- Auth: Sanctum token in an httpOnly cookie, set by a Server Action — never
  reaches client JS. Same login flow as the mobile app
  (`POST /api/v1/auth/login` → token → `GET /api/v1/auth/me`).

## Architecture

**Every request to bizops360-api goes through `apiFetch()`
(`src/lib/api/client.ts`), which is `server-only`.** Pages, layouts, and
Server Actions call it directly; client components never call the backend
themselves — they call a Server Action, or render data a server component
already fetched. This keeps the Sanctum token server-side only and matches
the backend's own boundary rule: the API is the sole authorization
authority, this app never re-implements permission logic beyond
show/hide-in-the-UI.

```
Client component (interaction only)
  → Server Action (src/lib/**/actions.ts, "use server")
  → apiFetch() (src/lib/api/client.ts, server-only)
  → bizops360-api /api/v1/...
```

Server Components read data directly via `apiFetch()` / `getSession()` —
no Server Action needed for a plain read.

## Rules

1. Never call bizops360-api from a client component or client-side hook —
   route it through a Server Action.
2. Never put the Sanctum token in anything but the httpOnly cookie
   (`TOKEN_COOKIE` in `src/lib/auth/session.ts`) — no localStorage, no
   passing it as a prop to a client component.
3. The nav (`src/lib/nav.ts`) is one config filtered by permission/role —
   never a second nav tree or a forked layout per role. Same "adapt, never
   fork" principle as the Flutter app.
4. New module screens mirror the API's own module boundaries
   (Organization, HR, Operations, CRM, Finance, Industry/RealEstate) —
   `src/app/(dashboard)/<module>/...` one route segment per module.
5. Every list screen uses the API's `paginate()` envelope (`Paginated<T>`
   in `src/lib/api/types.ts`) — don't invent a different pagination shape.
6. Types in `src/lib/api/types.ts` are added as each phase actually
   consumes that field — don't pre-guess the full backend contract.
7. Forms: React Hook Form + Zod, mirroring the Form Request the target
   endpoint validates with server-side (check `bizops360-api`'s
   `Http/Requests/*Request.php` for the real rules before writing the Zod
   schema).

## Commands

```
npm run dev
npm run lint
npm run typecheck   # tsc --noEmit
npm run build
```

## Definition of done

- `npm run lint`, `npm run typecheck`, `npm run build` all clean.
- New Server Actions handle the same error shapes bizops360-api returns
  (422 validation, 401, 403) — don't let an ApiError reach the user as a
  raw stack trace.
- Summary of changed files + verification output.

## Verification

npm run lint
npm run typecheck
npm run build
