# BizOps 360 — Admin Console

**Status: built.** A Next.js web application giving every `bizops360-api`
module (Organization, HR, Operations, CRM, Finance) a real interface. One
login, one nav, adapting by role/permission — never forked per tenant or
per role.

The defining property of this app: almost none of it is hand-coded per
screen. The backend exposes a single schema endpoint describing every
resource, workflow, and dashboard chart; the frontend is a generic renderer
driven entirely by that schema. Adding a field, a workflow action, or a
whole new resource is a backend registry change — the admin panel picks it
up with no frontend code.

## How it talks to the backend

Every request goes through `apiFetch()` (`src/lib/api/client.ts`), which is
`server-only`. Pages and Server Actions call it directly; client components
never call `bizops360-api` themselves — they call a Server Action, or
render data a Server Component already fetched. This keeps the Sanctum
token server-side only (an httpOnly cookie, never sent to client JS) and
matches the backend's own rule: the API is the sole authorization
authority, this app never re-implements permission logic beyond
show/hide-in-the-UI.

```
Client component (interaction only)
  → Server Action (src/lib/admin-schema/actions.ts, "use server")
  → apiFetch() (src/lib/api/client.ts, server-only)
  → bizops360-api /api/v1/...
```

Auth: `POST /api/v1/auth/login` → Sanctum token → `GET /api/v1/auth/me` for
roles/permissions/tenant/`is_platform_admin` — the same flow the Flutter
mobile apps use.

## The schema-driven engine

`GET /api/v1/admin/schema` (built by `AdminSchemaRegistry` in
`bizops360-api`) returns:

- **`modules`** — the sidebar sections (Organization, HR, Operations, CRM,
  Finance) and which resource keys belong to each.
- **`resources`** — one entry per CRUD resource: its endpoint, permission
  strings, table `columns`, form `fields` (with type, validation,
  relations), and:
  - **`actions`** — named operations beyond plain create/update/delete
    (approve/reject, convert, terminate, send/void/record-payment/refund,
    status/assignee changes, role/team-member management, ...). Each
    declares its own HTTP method, endpoint, permission, optional confirm
    text, and optional small form. `scope: 'resource'` marks a
    not-tied-to-any-row action (a keyless upsert like LeaveBalance's).
  - **`detail`** — for resources with a real detail view: read-only
    `fields`, `relatedLists` (nested sub-resources with their own CRUD —
    contacts/follow-ups under a lead, comments/attachments under a task),
    `embeddedLists` (read-only data already present in the resource's own
    `GET {id}` response — Invoice's payments/refunds), and an `activity`
    timeline with an optional note form.
  - `mode: 'singleton'` (one GET/PUT record, no list — Attendance
    settings), `paginated: false` (a plain array response, no `meta`),
    `summaryEndpoint` (stat cards above the table — Attendance's monthly
    summary), a `link` column (a download link, not plain text).
- **`dashboards`** — bespoke analytics pages the schema can't render
  generically (Operations Overview, CRM/Finance Reports) — listed only so
  the nav can link to them.
- **`charts`** — the main dashboard's charts: which endpoint to fetch, a
  `dataPath` into that response, and a chart `type` (`area`/`donut`/`bar`).

### Frontend rendering

- **`/admin/[resource]`** — the generic list page: table, search,
  pagination, create/edit dialogs, delete, and every schema `action` as a
  button — built from the schema alone, no resource-specific code.
- **`/admin/[resource]/[id]`** — the generic detail page, built from
  `resource.detail`: read-only fields, `DynamicRelatedList` (one Card per
  nested resource, its own create dialog and per-row edit/delete/action
  buttons), `DynamicEmbeddedList` (read-only), `DynamicActivityFeed`.
- **`/reports/[key]`** — every resource as an exportable (PDF/Excel) table,
  from the same schema.
- **`(dashboard)/page.tsx`** — the main dashboard: three profile stat
  cards (hand-written — they read the session, not the API) plus every
  chart in `schema.charts`, rendered by `DynamicDashboardCharts`.
- **`src/components/dynamic/`** — the engine itself: `DynamicFormDialog`,
  `DynamicActionButton`, `DynamicDeleteButton`, `DynamicRelatedList`,
  `DynamicEmbeddedList`, `DynamicActivityFeed`, `DynamicSingletonForm`,
  `DynamicSummaryCards`, `RelationCombobox` (a searchable relation
  picker — filters by name, phone, or staff/employee code, not just the
  display label).
- **`src/lib/admin-schema/`** — `types.ts` (the schema's TypeScript shape),
  `fetch.ts` (fetches the schema once per request via React `cache()`,
  builds nav sections and relation-dropdown options from it),
  `actions.ts` (the generic Server Actions every dynamic component calls:
  `createResourceRecord`, `updateResourceRecord`, `deleteResourceRecord`,
  `invokeResourceAction`, `addActivityNote`, `fetchResourceDetail`).

### What's still hand-built, and why

Three dashboards — Operations Overview, CRM Reports, Finance Reports — are
genuine custom visualizations (drill-down layouts, mixed metrics), not
tabular CRUD or a chart-per-endpoint the `charts` schema shape can express.
They're listed in `schema.dashboards` purely so the nav can link to them
under the right module. Everything else — every list, every form, every
workflow action, every detail view, every dashboard chart — is
schema-driven.

## Stack

- Next.js 16 (App Router) + TypeScript, React 19
- shadcn/ui + Radix primitives (`radix-ui` package), Tailwind CSS v4
- Recharts (dashboard charts)
- Auth: Sanctum token in an httpOnly cookie, set by a Server Action

## Commands

```bash
npm run dev
npm run lint
npm run typecheck   # tsc --noEmit
npm run build
```

## Deployment

`render.yaml` deploys this alongside `bizops360-api` on Render (a plain
Node web service — `next build` / `next start`, no Docker needed since
this isn't the Laravel app). No CORS setup is needed on the API side:
every request goes through `apiFetch()` server-side, so the browser never
calls `bizops360-api` directly. Set `API_BASE_URL` to the live API's URL.

## What was done to make it dynamic

The panel started as hand-coded screens (one page per resource, one dialog
component per form). It was converted to the schema-driven engine
described above in stages:

1. **Schema endpoint + generic CRUD** — `AdminSchemaRegistry` +
   `GET /api/v1/admin/schema`; `/admin/[resource]` replacing hand-built
   list pages one resource at a time, across all 23 resources in
   Organization/HR/Operations/CRM/Finance.
2. **Engine capabilities added as real gaps were found**, each closing a
   specific hand-built screen the schema couldn't yet express: `mode:
   'singleton'` (Attendance settings, Office location), `paginated: false`
   (Roles), a `file` field type + `link` column (Employee documents),
   `summaryEndpoint` (Attendance's monthly stats).
3. **The `actions` engine** — approve/reject, convert, terminate,
   send/void/record-payment/refund, status/assignee changes,
   role/team-member management (`relation-multi`/`multiselect` field
   types, `fetchDetail` prefill, `scope: 'resource'` for keyless upserts)
   — replacing every remaining hand-built workflow button.
4. **Searchable relation pickers** (`RelationCombobox`) — filtering by
   name, phone, or staff/employee code, not just the display label.
5. **The `detail`/`relatedLists`/`embeddedLists`/`activity` engine** — the
   last gap: Lead/Customer/Task/Invoice detail pages (contacts,
   follow-ups, comments, attachments, activity timelines, payment/refund
   history), via a generic `/admin/[resource]/[id]` route.
6. **The main dashboard's charts** described in `schema.charts` instead of
   hand-coded per chart, rendered by `DynamicDashboardCharts` dispatching
   on chart `type`.
7. **Dead-code removal at each stage** — every hand-built page, dialog,
   and Server Action file superseded by a generic equivalent was deleted,
   not left behind: ~30 components and five whole `lib/*/actions.ts`
   files across the CRM/Finance/Operations/HR/Organization modules.

Net effect: zero hand-built CRUD screens remain anywhere in the app. The
only hand-built pages left are the three dashboards a schema genuinely
can't describe (see above).

## Rules

1. Never call `bizops360-api` from a client component — route it through
   a Server Action.
2. Never put the Sanctum token in anything but the httpOnly cookie.
3. Prefer extending the schema (`AdminSchemaRegistry` in `bizops360-api`)
   over hand-coding a new screen — that's what keeps this panel dynamic.
   A hand-built page is justified only when the schema genuinely can't
   express it (a bespoke visualization, not a table or a form).
