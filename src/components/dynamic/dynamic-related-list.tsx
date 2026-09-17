import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicActionButton } from '@/components/dynamic/dynamic-action-button';
import { DynamicDeleteButton } from '@/components/dynamic/dynamic-delete-button';
import { DynamicFormDialog } from '@/components/dynamic/dynamic-form-dialog';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { hasPermission } from '@/lib/auth/session';
import { getPath, type RelatedListSchema, type RelationOption } from '@/lib/admin-schema/types';
import type { AuthUser, Paginated } from '@/lib/api/types';

function formatCell(value: unknown, link?: boolean): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (link) {
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

/** Strips a trailing `/{id}` template, leaving the base endpoint DynamicDeleteButton/updateResourceRecord append `/${id}` to themselves. */
function baseEndpoint(rowEndpoint: string): string {
  return rowEndpoint.replace(/\/\{id\}$/, '');
}

async function safeFetchRows(endpoint: string, token: string | null): Promise<Record<string, unknown>[]> {
  try {
    const { data } = await apiFetch<Paginated<Record<string, unknown>>>(`${endpoint}?per_page=100`, { token });

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      return [];
    }

    throw error;
  }
}

/** Renders one nested sub-resource tab on a detail page — a Card with a table, an optional "New" dialog, and per-row edit/delete/action buttons. */
export async function DynamicRelatedList({
  list,
  parentId,
  listPath,
  relationOptions,
  user,
  token,
}: {
  list: RelatedListSchema;
  parentId: number;
  listPath: string;
  relationOptions: Record<string, RelationOption[]>;
  user: AuthUser | null;
  token: string | null;
}) {
  if (!hasPermission(user, list.permissions.view)) {
    return null;
  }

  const listEndpoint = list.listEndpoint.replace('{id}', String(parentId));
  const rows = await safeFetchRows(listEndpoint, token);

  const canCreate = list.permissions.create !== null && hasPermission(user, list.permissions.create);
  const rowActions = (list.actions ?? []).filter(
    (action) => action.permission === null || hasPermission(user, action.permission),
  );
  const rowBase = list.rowEndpoint ? baseEndpoint(list.rowEndpoint) : null;

  function canManageRow(row: Record<string, unknown>): boolean {
    if (list.ownerField === undefined) {
      return true;
    }

    if (list.bypassPermission && hasPermission(user, list.bypassPermission)) {
      return true;
    }

    return getPath(row, list.ownerField) === user?.id;
  }

  const canUpdateAny = list.permissions.update !== null && hasPermission(user, list.permissions.update) && rowBase !== null;
  const canDeleteAny = list.permissions.delete !== null && hasPermission(user, list.permissions.delete) && rowBase !== null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>{list.label}</CardTitle>
        {canCreate && (
          <DynamicFormDialog
            resource={{ label: list.label, fields: list.fields }}
            relationOptions={relationOptions}
            listPath={listPath}
            createEndpoint={listEndpoint}
            updateEndpoint={rowBase ?? listEndpoint}
          />
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {list.columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {(canUpdateAny || canDeleteAny || rowActions.length > 0) && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const manageable = canManageRow(row);
              const showUpdate = canUpdateAny && manageable;
              const showDelete = canDeleteAny && manageable;

              return (
                <TableRow key={String(row.id ?? getPath(row, list.labelField) ?? JSON.stringify(row))}>
                  {list.columns.map((column) => {
                    const value = getPath(row, column.key);

                    return (
                      <TableCell key={column.key}>
                        {column.link && typeof value === 'string' && value ? (
                          <a href={value} className="text-primary underline">
                            Download
                          </a>
                        ) : (
                          formatCell(value, column.link)
                        )}
                      </TableCell>
                    );
                  })}
                  {(canUpdateAny || canDeleteAny || rowActions.length > 0) && (
                    <TableCell className="flex flex-wrap justify-end gap-1">
                      {rowActions.map((action) => (
                        <DynamicActionButton
                          key={action.key}
                          action={action}
                          resourceEndpoint={rowBase ?? listEndpoint}
                          row={row}
                          relationOptions={relationOptions}
                          listPath={listPath}
                        />
                      ))}
                      {showUpdate && list.fields.length > 0 && (
                        <DynamicFormDialog
                          resource={{ label: list.label, fields: list.fields }}
                          record={row}
                          relationOptions={relationOptions}
                          listPath={listPath}
                          createEndpoint={listEndpoint}
                          updateEndpoint={rowBase!}
                        />
                      )}
                      {showDelete && row.id !== undefined && (
                        <DynamicDeleteButton
                          endpoint={rowBase!}
                          id={Number(row.id)}
                          label={String(getPath(row, list.labelField) ?? `#${row.id}`)}
                          listPath={listPath}
                        />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={list.columns.length + 1} className="text-center text-muted-foreground">
                  Nothing yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
