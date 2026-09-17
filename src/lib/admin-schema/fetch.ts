import { cache } from 'react';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken, hasPermission } from '@/lib/auth/session';
import { getPath, type AdminSchema, type RelationOption, type ResourceSchema } from './types';
import type { AuthUser, Paginated } from '@/lib/api/types';
import type { NavIconName, NavSection } from '@/lib/nav';

/**
 * Fetches the admin panel schema once per request (React `cache()`), since
 * multiple components on a page (nav, list, form) all need it.
 */
export const getAdminSchema = cache(async (): Promise<AdminSchema> => {
  const token = await getToken();

  return apiFetch<{ data: AdminSchema }>('/admin/schema', { token }).then((r) => r.data);
});

export async function getResourceSchema(key: string): Promise<ResourceSchema | null> {
  const schema = await getAdminSchema();

  return schema.resources.find((resource) => resource.key === key) ?? null;
}

/** Column keys, beyond the label, worth matching against when a user searches a relation dropdown (e.g. "search by name or mobile/staff id"). */
const SEARCHABLE_EXTRA_KEYS = ['employee_code', 'phone', 'mobile', 'email', 'code'];

/** All rows of a resource as {id, label, search} options, for relation dropdowns. `search` folds in identifying columns (phone, staff code, email, ...) so a combobox can filter by more than just the display label. */
export async function listResourceOptions(
  resource: ResourceSchema,
  token: string | null,
): Promise<RelationOption[]> {
  const { data } = await apiFetch<Paginated<Record<string, unknown>>>(`${resource.endpoint}?per_page=100`, { token });

  return data.map((row) => {
    const label = String(getPath(row, resource.labelField) ?? `#${row.id}`);
    const extras = SEARCHABLE_EXTRA_KEYS.map((key) => getPath(row, key))
      .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
      .map(String);

    return {
      id: Number(row.id),
      label,
      search: [label, ...extras].join(' ').toLowerCase(),
    };
  });
}

/**
 * Builds nav sections from the live backend schema — these are the whole
 * module nav now (NAV_SECTIONS in nav.ts only has the plain Overview/
 * Dashboard link left). Never throws: a schema-endpoint hiccup should drop
 * these sections, not take down every page's sidebar.
 */
export async function getDynamicNavSectionsSafe(user: AuthUser | null): Promise<NavSection[]> {
  try {
    const schema = await getAdminSchema();

    const managementSections = schema.modules
      .map((module) => ({
        label: module.label,
        icon: module.icon as NavIconName,
        items: [
          ...module.resources
            .map((key) => schema.resources.find((resource) => resource.key === key))
            .filter((resource): resource is ResourceSchema => resource !== undefined)
            .filter((resource) => hasPermission(user, resource.permissions.view))
            .map((resource) => ({
              label: resource.pluralLabel,
              href: `/admin/${resource.key}`,
            })),
          // Bespoke analytics pages the schema can't render generically —
          // still worth surfacing here so this section is a complete map
          // of the module, not just its CRUD resources.
          ...schema.dashboards
            .filter((dashboard) => dashboard.module === module.key)
            .filter((dashboard) => hasPermission(user, dashboard.permission))
            .map((dashboard) => ({ label: dashboard.label, href: dashboard.href })),
        ],
      }))
      .filter((section) => section.items.length > 0);

    // One consolidated Reports section, every list resource the schema
    // knows about — this replaces the old hand-written list of 11 report
    // pages. Singletons (one record, no list) aren't reportable.
    const visibleResources = schema.resources.filter(
      (resource) => resource.mode !== 'singleton' && hasPermission(user, resource.permissions.view),
    );
    const reportsSection: NavSection[] =
      visibleResources.length > 0
        ? [
            {
              label: 'Reports',
              icon: 'FileBarChart2',
              items: [
                { label: 'All reports', href: '/reports' },
                ...visibleResources.map((resource) => ({
                  label: resource.pluralLabel,
                  href: `/reports/${resource.key}`,
                })),
              ],
            },
          ]
        : [];

    return [...managementSections, ...reportsSection];
  } catch (error) {
    if (error instanceof ApiError) {
      return [];
    }

    throw error;
  }
}

/**
 * Fetches every relation resource's options a form needs, keyed by resource
 * key, so a create/edit dialog can populate its dropdowns without each
 * field making its own request.
 */
export async function listRelationOptionsFor(
  resource: ResourceSchema,
  schema: AdminSchema,
  token: string | null,
): Promise<Record<string, RelationOption[]>> {
  const actionFields = (resource.actions ?? []).flatMap((action) => action.fields);
  const relatedListFields = (resource.detail?.relatedLists ?? []).flatMap((list) => [
    ...list.fields,
    ...(list.actions ?? []).flatMap((action) => action.fields),
  ]);
  const relationResourceKeys = Array.from(
    new Set(
      [...resource.fields, ...actionFields, ...relatedListFields]
        .filter((field) => (field.type === 'relation' || field.type === 'relation-multi') && field.relation)
        .map((field) => field.relation!.resource),
    ),
  );

  const entries = await Promise.all(
    relationResourceKeys.map(async (key) => {
      const relationResource = schema.resources.find((candidate) => candidate.key === key);

      if (!relationResource) {
        return [key, []] as const;
      }

      return [key, await listResourceOptions(relationResource, token)] as const;
    }),
  );

  return Object.fromEntries(entries);
}
