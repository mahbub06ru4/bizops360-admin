import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { ProjectDialog } from '@/components/realestate/project-dialog';
import { ProjectSubmitButton } from '@/components/realestate/project-submit-button';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteProject } from '@/lib/realestate/actions';
import type { Project, ProjectStatus } from '@/lib/realestate/types';
import type { Paginated } from '@/lib/api/types';

const STATUS_VARIANT: Record<ProjectStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  draft: 'outline',
  pending_verification: 'secondary',
  verified: 'default',
  rejected: 'destructive',
};

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  land_share: 'Land share',
  commercial: 'Commercial',
  plot: 'Plot',
};

export default async function RealEstateProjectsPage() {
  const token = await getToken();
  const { data: projects } = await apiFetch<Paginated<Project>>('/real-estate/projects?per_page=100', { token });

  return (
    <div>
      <PageHeader title="Projects" description="The real estate project catalogue." action={<ProjectDialog />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Land area</TableHead>
            <TableHead className="w-52 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <Link href={`/real-estate/projects/${project.id}`} className="hover:underline">
                  {project.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{TYPE_LABELS[project.project_type]}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[project.status]} className="capitalize">
                  {project.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{project.total_land_area ?? '—'}</TableCell>
              <TableCell className="flex justify-end gap-1">
                {project.status === 'draft' && <ProjectSubmitButton projectId={project.id} />}
                <ProjectDialog project={project} />
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
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No projects yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
