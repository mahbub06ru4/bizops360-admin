import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { DynamicActionButton } from '@/components/dynamic/dynamic-action-button';
import { DynamicDeleteButton } from '@/components/dynamic/dynamic-delete-button';
import { DynamicFormDialog } from '@/components/dynamic/dynamic-form-dialog';
import { DynamicSingletonForm } from '@/components/dynamic/dynamic-singleton-form';
import { DynamicSummaryCards } from '@/components/dynamic/dynamic-summary-cards';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { SearchBox } from '@/components/shared/search-box';
import { apiFetch } from '@/lib/api/client';
import { getAdminSchema, listRelationOptionsFor } from '@/lib/admin-schema/fetch';
import { getPath, type ActionSchema } from '@/lib/admin-schema/types';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import type { AuthUser, Paginated } from '@/lib/api/types';

function formatCell(value: unknown, column?: { link?: boolean }): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (column?.link) {
    return 'Download';
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
  return (actions ?? []).filter((action) => action.permission === null || hasPermission(user, action.permission));
}

/** Renders a cell's value — as a link into the generic /admin/{key}/{id} detail page for the label column when `resource.detail` is set, a download link for a `link` column, or plain text otherwise. */
function renderCell(
  row: Record<string, unknown>,
  column: { key: string; label: string; link?: boolean },
  resource: { key: string; labelField: string; detail?: unknown },
): ReactNode {
  const value = getPath(row, column.key);

  if (column.link && typeof value === 'string' && value) {
    return (
      <a href={value} className="text-primary underline">
        Download
      </a>
    );
  }

  if (column.key === resource.labelField && resource.detail && row.id !== undefined && row.id !== null) {
    return (
      <Link href={`/admin/${resource.key}/${row.id}`} className="text-primary hover:underline">
        {formatCell(value)}
      </Link>
    );
  }

  return formatCell(value, column);
}

function rowKey(row: Record<string, unknown>, labelField: string): string {
  if (row.id !== undefined && row.id !== null) {
    return String(row.id);
  }

  return String(row[labelField] ?? JSON.stringify(row));
}

export default async function DynamicResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ page?: string; per_page?: string; q?: string }>;
}) {
  const { resource: resourceKey } = await params;
  const { page, per_page: perPage, q } = await searchParams;

  const [token, user, schema] = await Promise.all([getToken(), getSession(), getAdminSchema()]);
  const resource = schema.resources.find((candidate) => candidate.key === resourceKey);

  if (!resource) {
    notFound();
  }

  if (!hasPermission(user, resource.permissions.view)) {
    return (
      <div>
        <PageHeader title={resource.pluralLabel} />
        <p className="text-sm text-muted-foreground">You don&apos;t have permission to view this.</p>
      </div>
    );
  }

  const canCreate = resource.permissions.create !== null && hasPermission(user, resource.permissions.create);
  const canUpdate = resource.permissions.update !== null && hasPermission(user, resource.permissions.update);
  const canDelete = resource.permissions.delete !== null && hasPermission(user, resource.permissions.delete);
  const allActions = visibleActions(resource.actions, user);
  const rowActions = allActions.filter((action) => action.scope !== 'resource');
  const resourceActions = allActions.filter((action) => action.scope === 'resource');
  const listPath = `/admin/${resource.key}`;

  if (resource.mode === 'singleton') {
    const { data: record } = await apiFetch<{ data: Record<string, unknown> }>(resource.endpoint, { token });

    return (
      <div>
        <PageHeader title={resource.label} description="Screen generated from the backend schema." />
        {canUpdate ? (
          <DynamicSingletonForm resource={resource} record={record} />
        ) : (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            {resource.fields.map((field) => (
              <p key={field.key}>
                {field.label}: {formatCell(getPath(record, field.key))}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  const relationOptions = await listRelationOptionsFor(resource, schema, token);

  if (resource.paginated === false) {
    const { data: rows } = await apiFetch<{ data: Record<string, unknown>[] }>(resource.endpoint, { token });

    return (
      <div>
        <PageHeader
          title={resource.pluralLabel}
          description={`${rows.length} on record. Screen generated from the backend schema.`}
          action={
            canCreate || resourceActions.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {resourceActions.map((action) => (
                  <DynamicActionButton
                    key={action.key}
                    action={action}
                    resourceEndpoint={resource.endpoint}
                    row={{}}
                    relationOptions={relationOptions}
                    listPath={listPath}
                  />
                ))}
                {canCreate && <DynamicFormDialog resource={resource} relationOptions={relationOptions} listPath={listPath} createEndpoint={resource.endpoint} updateEndpoint={resource.endpoint} />}
              </div>
            ) : undefined
          }
        />

        {resource.summaryEndpoint && <DynamicSummaryCards endpoint={resource.summaryEndpoint} token={token} />}

        <Table>
          <TableHeader>
            <TableRow>
              {resource.columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {(canUpdate || canDelete || rowActions.length > 0) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row, resource.labelField)}>
                {resource.columns.map((column) => (
                  <TableCell key={column.key}>{renderCell(row, column, resource)}</TableCell>
                ))}
                {(canUpdate || canDelete || rowActions.length > 0) && (
                  <TableCell className="flex flex-wrap justify-end gap-1">
                    {rowActions.map((action) => (
                      <DynamicActionButton
                        key={action.key}
                        action={action}
                        resourceEndpoint={resource.endpoint}
                        row={row}
                        relationOptions={relationOptions}
                        listPath={listPath}
                      />
                    ))}
                    {canUpdate && (
                      <DynamicFormDialog resource={resource} record={row} relationOptions={relationOptions} listPath={listPath} createEndpoint={resource.endpoint} updateEndpoint={resource.endpoint} />
                    )}
                    {canDelete && row.id !== undefined && (
                      <DynamicDeleteButton
                        endpoint={resource.endpoint}
                        id={Number(row.id)}
                        label={String(getPath(row, resource.labelField) ?? '')}
                        listPath={listPath}
                      />
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={resource.columns.length + 1} className="text-center text-muted-foreground">
                  No {resource.pluralLabel.toLowerCase()} yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  const query = new URLSearchParams();
  if (page) query.set('page', page);
  if (q) query.set('q', q);
  query.set('per_page', perPage ?? '15');

  const { data: rows, meta } = await apiFetch<Paginated<Record<string, unknown>>>(
    `${resource.endpoint}?${query.toString()}`,
    { token },
  );

  return (
    <div>
      <PageHeader
        title={resource.pluralLabel}
        description={`${meta.total} on record. Screen generated from the backend schema.`}
        action={
          canCreate || resourceActions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {resourceActions.map((action) => (
                <DynamicActionButton
                  key={action.key}
                  action={action}
                  resourceEndpoint={resource.endpoint}
                  row={{}}
                  relationOptions={relationOptions}
                  listPath={listPath}
                />
              ))}
              {canCreate && <DynamicFormDialog resource={resource} relationOptions={relationOptions} listPath={listPath} createEndpoint={resource.endpoint} updateEndpoint={resource.endpoint} />}
            </div>
          ) : undefined
        }
      />

      {resource.searchable && (
        <div className="mb-4">
          <SearchBox basePath={listPath} placeholder={`Search ${resource.pluralLabel.toLowerCase()}…`} />
        </div>
      )}

      {resource.summaryEndpoint && <DynamicSummaryCards endpoint={resource.summaryEndpoint} token={token} />}

      <Table>
        <TableHeader>
          <TableRow>
            {resource.columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            {(canUpdate || canDelete || rowActions.length > 0) && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row, resource.labelField)}>
              {resource.columns.map((column) => (
                <TableCell key={column.key}>{renderCell(row, column, resource)}</TableCell>
              ))}
              {(canUpdate || canDelete || rowActions.length > 0) && (
                <TableCell className="flex flex-wrap justify-end gap-1">
                  {rowActions.map((action) => (
                    <DynamicActionButton
                      key={action.key}
                      action={action}
                      resourceEndpoint={resource.endpoint}
                      row={row}
                      relationOptions={relationOptions}
                      listPath={listPath}
                    />
                  ))}
                  {canUpdate && (
                    <DynamicFormDialog resource={resource} record={row} relationOptions={relationOptions} listPath={listPath} createEndpoint={resource.endpoint} updateEndpoint={resource.endpoint} />
                  )}
                  {canDelete && (
                    <DynamicDeleteButton
                      endpoint={resource.endpoint}
                      id={Number(row.id)}
                      label={String(getPath(row, resource.labelField) ?? `#${row.id}`)}
                      listPath={listPath}
                    />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={resource.columns.length + 1} className="text-center text-muted-foreground">
                {q ? `No ${resource.pluralLabel.toLowerCase()} match "${q}".` : `No ${resource.pluralLabel.toLowerCase()} yet.`}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PaginationControls meta={meta} basePath={listPath} searchParams={{ per_page: perPage, q }} />
    </div>
  );
}
