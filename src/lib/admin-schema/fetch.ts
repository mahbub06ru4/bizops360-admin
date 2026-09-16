import { cache } from 'react';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken, hasPermission } from '@/lib/auth/session';
import { getPath, type AdminSchema, type ResourceSchema } from './types';
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

/** All rows of a resource as {id, label} options, for relation dropdowns. */
export async function listResourceOptions(
  resource: ResourceSchema,
  token: string | null,
): Promise<{ id: number; label: string }[]> {
  const { data } = await apiFetch<Paginated<Record<string, unknown>>>(`${resource.endpoint}?per_page=100`, { token });

  return data.map((row) => ({
    id: Number(row.id),
    label: String(getPath(row, resource.labelField) ?? `#${row.id}`),
  }));
}

/**
 * Builds nav sections from the live backend schema — rendered alongside the
 * hand-written NAV_SECTIONS in nav.ts as proof the panel can be genuinely
 * driven by backend metadata, not just by data within a fixed set of screens.
 * Never throws: a schema-endpoint hiccup should drop the dynamic section,
 * not take down every page's sidebar.
 */
export async function getDynamicNavSectionsSafe(user: AuthUser | null): Promise<NavSection[]> {
  try {
    const schema = await getAdminSchema();

    const managementSections = schema.modules
      .map((module) => ({
        // Suffixed so it never collides (as a React list key or visually)
        // with the hand-written section of the same name — this nav entry
        // points at the generic, backend-schema-driven screens instead.
        label: `${module.label} (Dynamic)`,
        icon: module.icon as NavIconName,
        items: module.resources
          .map((key) => schema.resources.find((resource) => resource.key === key))
          .filter((resource): resource is ResourceSchema => resource !== undefined)
          .filter((resource) => hasPermission(user, resource.permissions.view))
          .map((resource) => ({
            label: resource.pluralLabel,
            href: `/admin/${resource.key}`,
          })),
      }))
      .filter((section) => section.items.length > 0);

    // One consolidated Reports section, every resource the schema knows
    // about — this replaces the old hand-written list of 11 report pages.
    const visibleResources = schema.resources.filter((resource) => hasPermission(user, resource.permissions.view));
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
): Promise<Record<string, { id: number; label: string }[]>> {
  const relationResourceKeys = Array.from(
    new Set(resource.fields.filter((field) => field.type === 'relation' && field.relation).map((field) => field.relation!.resource)),
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
