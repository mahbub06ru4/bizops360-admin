import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { DesignationDialog } from '@/components/organization/designation-dialog';
import { PageHeader } from '@/components/organization/page-header';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteDesignation } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Department, Designation } from '@/lib/organization/types';

export default async function DesignationsPage() {
  const token = await getToken();
  const [{ data: designations }, { data: departments }] = await Promise.all([
    apiFetch<Paginated<Designation>>('/designations?per_page=100', { token }),
    apiFetch<Paginated<Department>>('/departments?per_page=100', { token }),
  ]);

  return (
    <div>
      <PageHeader
        title="Designations"
        description="Job titles within a department."
        action={<DesignationDialog departments={departments} />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designations.map((designation) => (
            <TableRow key={designation.id}>
              <TableCell className="font-medium">{designation.title}</TableCell>
              <TableCell className="text-muted-foreground">{designation.department?.name ?? '—'}</TableCell>
              <TableCell>{designation.rank ?? '—'}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <DesignationDialog designation={designation} departments={departments} />
                <DeleteRowButton
                  label={designation.title}
                  confirmMessage={`Delete designation "${designation.title}"?`}
                  action={deleteDesignation.bind(null, designation.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {designations.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No designations yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
