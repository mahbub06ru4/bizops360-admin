import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Project } from '@/lib/operations/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'status', label: 'Status' },
  { key: 'department', label: 'Department' },
  { key: 'lead', label: 'Lead' },
  { key: 'tasks_count', label: 'Tasks' },
];

export default async function ProjectReportPage() {
  const token = await getToken();
  const { data: projects } = await apiFetch<Paginated<Project>>('/projects?per_page=100', { token });

  const rows = projects.map((row) => ({
    name: row.name,
    code: row.code,
    status: row.status,
    department: row.department?.name ?? null,
    lead: row.lead?.full_name ?? null,
    tasks_count: row.tasks_count,
  }));

  return (
    <div>
      <PageHeader title="Projects" description="Every project and its status." />
      <ReportTable title="Projects" filename="projects" columns={COLUMNS} rows={rows} />
    </div>
  );
}
