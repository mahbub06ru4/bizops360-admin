# BizOps 360 — Admin Console (planning stage)

**Status: not built yet.** This repo currently holds only the plan doc
([`BizOps360_Admin_Panel_Plan.docx`](BizOps360_Admin_Panel_Plan.docx)) and
this README. No application code has been written — the build itself
happens separately (Mac/Docker), per instruction.

## What this will be

The BizOps 360 platform-operator console — the tool the BizOps 360 team (not
tenant staff) uses to run the SaaS business: manage tenants, subscriptions/
billing, industry-module verification queues, platform analytics, and audit
oversight.

It talks to [`bizops360-api`](https://github.com/mahbub06ru4/bizops360-api)
(Laravel) over the same versioned REST API (`/api/v1`) the Flutter mobile
apps use — never touching Postgres directly. A platform-admin user
authenticates the same way mobile does (`POST /api/v1/auth/login` → Sanctum
token → `GET /api/v1/auth/me` for `is_platform_admin` + permissions); the
backend stays the sole authorization authority.

Recommended stack: Next.js (App Router) + TypeScript, shadcn/ui + Radix,
Tailwind CSS, React Hook Form + Zod, TanStack Query + TanStack Table,
Recharts. Full rationale per layer is in the plan doc §2.

## Build order: one real module first, then generalize

Rather than scaffolding a generic admin shell against imagined requirements,
the plan builds the panel wired to **one real, already-working industry
module end-to-end** before touching a second one:

- **Real Estate first** — its verification-queue API
  (`POST /api/v1/projects/{id}/verify` / `/reject`) already exists
  server-side with zero UI anywhere today, making it the highest-leverage,
  lowest-risk first slice.
- Only once that module is genuinely complete — auth, layout, data
  fetching, permission gating, the actual verify/reject workflow a human
  would use — does the plan factor out the reusable pieces and integrate a
  second module (Travel), proving the pattern generalizes before a third
  vertical is attempted.

## Scope decision

An earlier draft's sitemap (Organizations/Employees/CRM/Finance/HR/Travel/
RealEstate) describes a broader tenant-facing back-office web app —
effectively a desktop counterpart to the Flutter mobile apps. **That is a
separate, not-yet-made product decision.** This repo's phases are scoped
narrowly to the platform-operator console only; a tenant-facing area may be
added later as an explicit route group alongside the platform one, never by
default.

## Phased plan

| Phase | Scope |
|---|---|
| **0 — Vertical-slice foundation** | Next.js scaffold, platform-admin auth (Sanctum token + `/auth/me` + `is_platform_admin` guard), API client + data-fetching wiring, CI. Build exactly one working feature end-to-end against Real Estate's already-existing verification queue — no placeholder screens, no mock data. **Backend prerequisite:** add platform-admin tenant list/detail endpoints (`GET /api/v1/platform/tenants[/{id}]`) — don't exist yet. |
| **1 — Real Estate module, complete** | Project list/detail, the full verification queue (Pending/Verified/Rejected, document checklist review, verify/reject actions), tenant/billing overview. Proves the panel's module-integration pattern (nav entry, list/detail routes, typed API client module, permission gating) with one complete real vertical. |
| **2 — Generalize the pattern, add Travel** | Factor the Real Estate integration's shared pieces (layout shell, table/detail conventions, permission gating, API client conventions) into reusable primitives, then integrate Travel the same way. |
| **3 — Trust & operations depth** | Full audit log UI (needs a platform-scoped or tenant-filterable audit endpoint — today's `/activity` is tenant-only, a backend gap). Platform-wide analytics/reporting expansion. Subscription management actions (upgrade/downgrade/cancel/assign), not just read-only views. |
| **4 — Broader platform-ops** | Broker/channel-partner network management (Real Estate roadmap Phase 2). Marketplace moderation tooling (Real Estate roadmap Phase 3). Only here, as an explicit decision, consider a tenant-facing dashboard area. |

## Backend prerequisites (in `bizops360-api`, not this repo)

1. Platform-admin tenant list/detail endpoints — don't exist yet, needed for Phase 0.
2. A platform-scoped or tenant-filterable audit/activity endpoint — today's `/activity` is tenant-only — needed for Phase 3.
3. Real Estate's verification queue already exists — no backend work needed for Phase 0/1.

## Known open items

1. **Filament vs. Next.js**: `bizops360-mobile-realstate/docs/BizOps360_SmartRealEstate_SaaS_Roadmap.md`
   and its `CLAUDE.md` still describe Filament as the reused admin panel and
   list Filament resources as a Real Estate deliverable. Since this repo
   commits to Next.js instead, those docs need correcting so a future
   session doesn't scaffold Filament for the verification queue by mistake.
2. Persona scope (platform-operator only vs. also a tenant back-office)
   should stay an explicit decision, revisited no earlier than Phase 4.
