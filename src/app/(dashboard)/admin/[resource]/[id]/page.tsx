import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/organization/page-header';
import { DynamicActionButton } from '@/components/dynamic/dynamic-action-button';
import { DynamicActivityFeed } from '@/components/dynamic/dynamic-activity-feed';
import { DynamicEmbeddedList } from '@/components/dynamic/dynamic-embedded-list';
import { DynamicFormDialog } from '@/components/dynamic/dynamic-form-dialog';
import { DynamicRelatedList } from '@/components/dynamic/dynamic-related-list';
import { apiFetch } from '@/lib/api/client';
import { getAdminSchema, listRelationOptionsFor } from '@/lib/admin-schema/fetch';
import { getPath, type ActionSchema } from '@/lib/admin-schema/types';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import type { AuthUser } from '@/lib/api/types';

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function visibleActions(actions: ActionSchema[] | undefined, user: AuthUser | null): ActionSchema[] {
  return (actions ?? []).filter(
    (action) => action.scope !== 'resource' && (action.permission === null || hasPermission(user, action.permission)),
  );
}

/**
 * A generic detail page for any resource whose schema declares `detail` —
 * built from read-only top fields, nested relatedLists (contacts,
 * follow-ups, comments, attachments — full CRUD), embeddedLists (payments/
 * refunds, read-only, already present in this same GET response), and an
 * optional activity timeline. Row-level top actions (convert, move stage,
 * send/void, ...) reuse the same DynamicActionButton the list page uses.
 */
export default async function DynamicResourceDetailPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: resourceKey, id } = await params;
  const recordId = Number(id);

  const [token, user, schema] = await Promise.all([getToken(), getSession(), getAdminSchema()]);
  const resource = schema.resources.find((candidate) => candidate.key === resourceKey);

  if (!resource || !resource.detail || !Number.isFinite(recordId)) {
    notFound();
  }

  if (!hasPermission(user, resource.permissions.view)) {
    return (
      <div>
        <PageHeader title={resource.label} />
        <p className="text-sm text-muted-foreground">You don&apos;t have permission to view this.</p>
      </div>
    );
  }

  const { data: record } = await apiFetch<{ data: Record<string, unknown> }>(`${resource.endpoint}/${recordId}`, { token });
  const relationOptions = await listRelationOptionsFor(resource, schema, token);
  const listPath = `/admin/${resource.key}/${recordId}`;
  const canUpdate = resource.permissions.update !== null && hasPermission(user, resource.permissions.update);
  const rowActions = visibleActions(resource.actions, user);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={String(getPath(record, resource.labelField) ?? resource.label)}
        description={`${resource.label} detail — screen generated from the backend schema.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {rowActions.map((action) => (
              <DynamicActionButton
                key={action.key}
                action={action}
                resourceEndpoint={resource.endpoint}
                row={record}
                relationOptions={relationOptions}
                listPath={listPath}
              />
            ))}
            {canUpdate && (
              <DynamicFormDialog
                resource={resource}
                record={record}
                relationOptions={relationOptions}
                listPath={listPath}
                createEndpoint={resource.endpoint}
                updateEndpoint={resource.endpoint}
              />
            )}
          </div>
        }
      />

      {resource.detail.fields && resource.detail.fields.length > 0 && (
        <div className="rounded-xl border bg-card p-6 text-sm shadow-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            {resource.detail.fields.map((field) => (
              <div key={field.key}>
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="font-medium">{formatCell(getPath(record, field.key))}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {(resource.detail.relatedLists ?? []).map((list) => (
          <DynamicRelatedList
            key={list.key}
            list={list}
            parentId={recordId}
            listPath={listPath}
            relationOptions={relationOptions}
            user={user}
            token={token}
          />
        ))}
        {(resource.detail.embeddedLists ?? []).map((list) => (
          <DynamicEmbeddedList key={list.key} list={list} record={record} />
        ))}
      </div>

      {resource.detail.activity && (
        <DynamicActivityFeed activity={resource.detail.activity} parentId={recordId} listPath={listPath} user={user} token={token} />
      )}
    </div>
  );
}
