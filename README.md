# BizOps 360 — Admin Console (planning stage)

**Status: not built yet.** This repo currently holds the original product spec
([`BizOps360_Specification.docx`](BizOps360_Specification.docx) — the same
document `bizops360-api` and the Flutter mobile apps were built from), the
plan doc ([`BizOps360_Admin_Panel_Plan.docx`](BizOps360_Admin_Panel_Plan.docx)),
and this README. No application code has been written — the build itself
happens separately (Mac/Docker), per instruction.

## What this will be

A Next.js web application that gives every `bizops360-api` module a real
interface — something no module has today (Filament was the original spec's
plan for this but was never built; the Flutter app only covers a mobile,
field-operations slice). It serves both **tenant staff** (Organization/HR/
Operations/CRM/Finance — a desktop counterpart to the Flutter app for
screens that work better on a bigger screen) and, once the platform-operator
phase lands, the **BizOps 360 team running the platform itself** (tenants,
billing, cross-vertical verification, audit). One app, one login, adapting
by role and permission — never forked — same principle the spec and the
mobile apps already establish.

It talks to [`bizops360-api`](https://github.com/mahbub06ru4/bizops360-api)
over the same versioned REST API (`/api/v1`) the Flutter apps use — never
touching Postgres directly. A user authenticates the same way mobile does
(`POST /api/v1/auth/login` → Sanctum token → `GET /api/v1/auth/me` for
roles/permissions/tenant/`is_platform_admin`); the backend stays the sole
authorization authority.

Recommended stack: Next.js (App Router) + TypeScript, shadcn/ui + Radix,
Tailwind CSS, React Hook Form + Zod, TanStack Query + TanStack Table,
Recharts. Full rationale per layer is in the plan doc §2.

## Build order: mirror how the backend itself was built

`bizops360-api` and the Flutter mobile app were both built phase by phase
from `BizOps360_Specification.docx` — Organization, then HR, then
Operations, then CRM, then Finance, then one industry module. **This panel
follows that exact order**, so each phase targets an API surface that
already exists and is already proven (the mobile app already consumes it in
production use):

- Phases 1–5 give the panel full coverage of the shared business platform —
  the same modules every tenant uses regardless of industry.
- Phase 6 adds one industry module (**Real Estate**) end-to-end, proving the
  integration pattern for vertical-specific screens before a second vertical
  (Travel) is attempted.
- Phase 7 adds the cross-tenant, platform-operator-only screens (tenant
  management, billing, audit) — deliberately after the tenant-facing modules
  exist, since a platform admin's job is largely looking into a tenant's own
  data, which needs to already be visible by then.

## Phased plan

| Phase | Scope |
|---|---|
| **0 — Foundation** | Next.js scaffold, auth, layout shell (permission-driven nav), typed API client, CI. No business screens yet. |
| **1 — Organization** | Company profile, Branches, Departments, Designations. Employees (list/detail/terminate). Teams + members. Users + role assignment. Roles (RBAC). |
| **2 — HR** | Attendance (check-in/out, summary, settings, office-location geofence). Leave (types, requests, approve/reject/cancel, balances). Holidays. Employee documents. |
| **3 — Operations** | Projects, Tasks (create/assign/status). Task comments/activities/attachments. Overview/workload/department-performance dashboard. |
| **4 — CRM** | Leads (pipeline + convert), Customers, Contacts, Follow-ups, CRM activities, CRM reports. |
| **5 — Finance** | Income, Expenses (with approval workflow), Invoices (create/payment/refund), Finance reports (P&L, outstanding, customer dues). |
| **6 — Industry module (Real Estate first)** | Project catalogue (projects/buildings/units/amenities/pricing/payment plans), the full Phase 1 sales pipeline (requirements, matching, site visits, offers, bookings, installments), and the platform-admin project-verification queue. |
| **7 — Platform-operator layer** | Tenant list/detail (**new backend endpoint needed**), billing/subscription overview (existing endpoints), platform-scoped audit log (**new backend endpoint needed**). |
| **8 — Production hardening** | Deployment, monitoring, error tracking, security hardening. |

## Backend prerequisites

Phases 1–6 need **no new backend work** — every endpoint they consume
already exists and is already exercised by the Flutter app, or (for Real
Estate) was built and verified in this session. Phase 7 needs two new
`bizops360-api` endpoints:

1. Platform-admin tenant list/detail — `GET /api/v1/platform/tenants[/{id}]`.
2. A platform-scoped or tenant-filterable audit/activity endpoint — today's
   `GET /api/v1/activity` is tenant-only.

## Known open items

1. **Filament vs. Next.js**: `bizops360-mobile-realstate/docs/BizOps360_SmartRealEstate_SaaS_Roadmap.md`
   and its `CLAUDE.md` still describe Filament as the reused admin panel and
   list Filament resources as a Real Estate deliverable. Since this repo
   commits to Next.js instead, those docs need correcting so a future
   session doesn't scaffold Filament by mistake.
2. Whether every module phase gets full CRUD parity with the API or a
   curated subset (e.g. read-heavy reporting before every edit flow) is a
   per-phase judgment call to make when that phase starts, not decided up
   front.
