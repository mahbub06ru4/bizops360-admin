import { notFound } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { DynamicDeleteButton } from '@/components/dynamic/dynamic-delete-button';
import { DynamicFormDialog } from '@/components/dynamic/dynamic-form-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { SearchBox } from '@/components/shared/search-box';
import { apiFetch } from '@/lib/api/client';
import { getAdminSchema, listRelationOptionsFor } from '@/lib/admin-schema/fetch';
import { getPath } from '@/lib/admin-schema/types';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import type { Paginated } from '@/lib/api/types';

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
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

  const query = new URLSearchParams();
  if (page) query.set('page', page);
  if (q) query.set('q', q);
  query.set('per_page', perPage ?? '15');

  const [{ data: rows, meta }, relationOptions] = await Promise.all([
    apiFetch<Paginated<Record<string, unknown>>>(`${resource.endpoint}?${query.toString()}`, { token }),
    listRelationOptionsFor(resource, schema, token),
  ]);

  const listPath = `/admin/${resource.key}`;

  return (
    <div>
      <PageHeader
        title={resource.pluralLabel}
        description={`${meta.total} on record. Screen generated from the backend schema.`}
        action={
          canCreate ? (
            <DynamicFormDialog resource={resource} relationOptions={relationOptions} listPath={listPath} />
          ) : undefined
        }
      />

      {resource.searchable && (
        <div className="mb-4">
          <SearchBox basePath={listPath} placeholder={`Search ${resource.pluralLabel.toLowerCase()}…`} />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {resource.columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            {(canUpdate || canDelete) && <TableHead className="w-24 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={String(row.id)}>
              {resource.columns.map((column) => (
                <TableCell key={column.key}>{formatCell(getPath(row, column.key))}</TableCell>
              ))}
              {(canUpdate || canDelete) && (
                <TableCell className="flex justify-end gap-1">
                  {canUpdate && (
                    <DynamicFormDialog resource={resource} record={row} relationOptions={relationOptions} listPath={listPath} />
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
