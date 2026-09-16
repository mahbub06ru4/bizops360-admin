import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getAdminSchema } from '@/lib/admin-schema/fetch';
import { getPath } from '@/lib/admin-schema/types';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import type { Paginated } from '@/lib/api/types';
import type { ReportRow } from '@/lib/reports/export';

/**
 * One report page for any resource the backend schema describes — replaces
 * a hand-written page per report. Columns/endpoint/permission all come from
 * the same GET /api/v1/admin/schema the /admin/[resource] CRUD screens use;
 * this route just renders that data as an exportable table instead of an
 * editable one.
 */
export default async function DynamicReportPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const [token, user, schema] = await Promise.all([getToken(), getSession(), getAdminSchema()]);
  const resource = schema.resources.find((candidate) => candidate.key === key);

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

  const { data } = await apiFetch<Paginated<Record<string, unknown>>>(`${resource.endpoint}?per_page=100`, { token });

  const rows: ReportRow[] = data.map((row) =>
    Object.fromEntries(
      resource.columns.map((column) => {
        const value = getPath(row, column.key);

        return [column.key, typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value as string | number | null)];
      }),
    ),
  );

  return (
    <div>
      <PageHeader title={resource.pluralLabel} description="Screen generated from the backend schema." />
      <ReportTable title={resource.pluralLabel} filename={resource.key} columns={resource.columns} rows={rows} />
    </div>
  );
}
