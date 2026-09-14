# BizOps 360 — Admin Console (planning stage)

**Status: not built yet.** This repo currently holds only the architecture
proposal (`chatgpt_suggestion_you_can_modify_it_for _best.docx`) and this
README. No application code has been written — per instruction, this phase is
plan-only.

## What this will be

The BizOps 360 platform-operator console — the tool the BizOps 360 team (not
tenant staff) uses to run the SaaS business: manage tenants, subscriptions/
billing, the Real Estate project-verification queue, platform analytics, and
audit oversight.

It talks to [`bizops360-api`](https://github.com/mahbub06ru4/bizops360-api)
(Laravel) over the same versioned REST API (`/api/v1`) the Flutter mobile
apps use — never touching Postgres directly. A platform-admin user
authenticates the same way mobile does (`POST /api/v1/auth/login` → Sanctum
token → `GET /api/v1/auth/me` for `is_platform_admin` + permissions); the
backend stays the sole authorization authority.

Proposed stack (from the docx, open to revision): Next.js 16 + TypeScript +
App Router, shadcn/ui + Radix, Tailwind CSS v4, React Hook Form + Zod,
TanStack Query + TanStack Table, Zustand (UI state only), Recharts.

## Scope decision

The docx's own sitemap describes a broader tenant-facing back-office web app
(Organizations/Employees/CRM/Finance/HR/Travel/RealEstate — effectively a
desktop counterpart to the Flutter mobile apps). **That is a separate,
not-yet-made product decision.** This repo's first phases are scoped
narrowly to the platform-operator console only; a tenant-facing area may be
added later as an explicit `(dashboard)` route group alongside the
`(platform)` one, never by default.

## Phased plan

| Phase | Scope |
|---|---|
| **0 — Foundation** | Next.js scaffold, auth (Sanctum token + `/auth/me` + `is_platform_admin` route guard), API client + TanStack Query wiring, CI (lint/typecheck/build). **Backend prerequisite in `bizops360-api`:** add platform-admin tenant list/detail endpoints (`GET /api/v1/platform/tenants[/{id}]`) — these don't exist yet. |
| **1 — MVP operator console** | Tenant list/detail. **Real Estate project-verification queue UI** (`POST projects/{id}/verify` / `/reject` already exist server-side with zero UI — highest-leverage first feature). Billing/subscription overview from the existing `GET billing/plans` and `GET platform/analytics` endpoints. |
| **2 — Trust & operations depth** | Full audit log UI (needs a platform-scoped or tenant-filterable audit endpoint — today's `/activity` is tenant-only, a backend gap). Platform-wide analytics/reporting expansion. Subscription management actions (upgrade/downgrade/cancel/assign), not just read-only views. |
| **3 — Broader platform-ops** | Broker/channel-partner network management (ties to the Real Estate roadmap's Phase 2). Marketplace moderation tooling (Real Estate roadmap Phase 3). Only here, as an explicit decision, consider a tenant-facing dashboard area. |

## Known open items

1. **Filament vs. Next.js**: `bizops360-mobile-realstate/docs/BizOps360_SmartRealEstate_SaaS_Roadmap.md`
   and its `CLAUDE.md` still describe Filament as the reused admin panel and
   list Filament resources as a Real Estate deliverable. If this repo
   (Next.js) is the real direction, those docs need correcting so a future
   session doesn't scaffold Filament for the verification queue by mistake.
2. Two `bizops360-api` backend endpoints this console's early phases depend
   on don't exist yet: a platform-admin tenant list/detail endpoint, and a
   platform-scoped audit log.
