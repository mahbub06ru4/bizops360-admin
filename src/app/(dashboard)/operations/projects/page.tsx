import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { ProjectDialog } from '@/components/operations/project-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteProject } from '@/lib/operations/actions';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Project, ProjectStatus } from '@/lib/operations/types';
import type { Department, Employee } from '@/lib/organization/types';

const STATUS_VARIANT: Record<ProjectStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  planning: 'outline',
  active: 'default',
  on_hold: 'secondary',
  completed: 'secondary',
  cancelled: 'destructive',
};

export default async function ProjectsPage() {
  const token = await getToken();
  const [{ data: projects }, departments, employees] = await Promise.all([
    apiFetch<Paginated<Project>>('/projects?per_page=100', { token }),
    listAll<Department>('/departments', token ?? ''),
    listAll<Employee>('/employees', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Work organized by initiative."
        action={<ProjectDialog departments={departments} employees={employees} />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <Link href={`/operations/tasks?project_id=${project.id}`} className="hover:underline">
                  {project.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{project.code}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[project.status]} className="capitalize">
                  {project.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{project.department?.name ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{project.lead?.full_name ?? '—'}</TableCell>
              <TableCell>{project.tasks_count ?? 0}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <ProjectDialog project={project} departments={departments} employees={employees} />
                <DeleteRowButton
                  label={project.name}
                  confirmMessage={`Delete "${project.name}"? This cannot be undone.`}
                  action={deleteProject.bind(null, project.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No projects yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
