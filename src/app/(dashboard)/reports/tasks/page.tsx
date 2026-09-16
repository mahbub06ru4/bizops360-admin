import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Task } from '@/lib/operations/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'project', label: 'Project' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'due_at', label: 'Due' },
];

export default async function TaskReportPage() {
  const token = await getToken();
  const { data: tasks } = await apiFetch<Paginated<Task>>('/tasks?per_page=100', { token });

  const rows = tasks.map((row) => ({
    title: row.title,
    project: row.project?.name ?? null,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee_employee?.full_name ?? null,
    due_at: row.due_at,
  }));

  return (
    <div>
      <PageHeader title="Task list" description="Every task, status, and assignee." />
      <ReportTable title="Task List" filename="task-list" columns={COLUMNS} rows={rows} />
    </div>
  );
}
