import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { TaskAssigneeDialog } from '@/components/operations/task-assignee-dialog';
import { TaskDialog } from '@/components/operations/task-dialog';
import { TaskStatusSelect } from '@/components/operations/task-status-select';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteTask } from '@/lib/operations/actions';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Project, Task, TaskPriority } from '@/lib/operations/types';
import type { Employee, Team } from '@/lib/organization/types';

const PRIORITY_VARIANT: Record<TaskPriority, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  low: 'secondary',
  normal: 'outline',
  high: 'default',
  urgent: 'destructive',
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ project_id?: string; status?: string; priority?: string }>;
}) {
  const { project_id: projectId, status, priority } = await searchParams;
  const token = await getToken();

  const query = new URLSearchParams({ per_page: '100' });
  if (projectId) query.set('project_id', projectId);
  if (status) query.set('status', status);
  if (priority) query.set('priority', priority);

  const [{ data: tasks }, projects, employees, teams] = await Promise.all([
    apiFetch<Paginated<Task>>(`/tasks?${query.toString()}`, { token }),
    listAll<Project>('/projects', token ?? ''),
    listAll<Employee>('/employees', token ?? ''),
    listAll<Team>('/teams', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={projectId ? `Tasks for ${projects.find((p) => p.id === Number(projectId))?.name ?? 'project'}.` : 'All tasks.'}
        action={<TaskDialog projects={projects} />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="w-36 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                <Link href={`/operations/tasks/${task.id}`} className="hover:underline">
                  {task.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{task.project?.name ?? '—'}</TableCell>
              <TableCell>
                <TaskStatusSelect taskId={task.id} status={task.status} />
              </TableCell>
              <TableCell>
                <Badge variant={PRIORITY_VARIANT[task.priority]} className="capitalize">
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{task.assignee_employee?.full_name ?? '—'}</TableCell>
              <TableCell className={task.is_overdue ? 'text-destructive' : 'text-muted-foreground'}>
                {task.due_at ?? '—'}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <TaskAssigneeDialog task={task} employees={employees} teams={teams} />
                <TaskDialog task={task} projects={projects} />
                <DeleteRowButton
                  label={task.title}
                  confirmMessage={`Delete "${task.title}"?`}
                  action={deleteTask.bind(null, task.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No tasks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
