import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { DepartmentDialog } from '@/components/organization/department-dialog';
import { PageHeader } from '@/components/organization/page-header';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteDepartment } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Branch, Department } from '@/lib/organization/types';

export default async function DepartmentsPage() {
  const token = await getToken();
  const [{ data: departments }, { data: branches }] = await Promise.all([
    apiFetch<Paginated<Department>>('/departments?per_page=100', { token }),
    apiFetch<Paginated<Branch>>('/branches?per_page=100', { token }),
  ]);

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Grouped under a branch, or company-wide."
        action={<DepartmentDialog branches={branches} />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium">{department.name}</TableCell>
              <TableCell>{department.code}</TableCell>
              <TableCell className="text-muted-foreground">{department.branch?.name ?? '—'}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <DepartmentDialog department={department} branches={branches} />
                <DeleteRowButton
                  label={department.name}
                  confirmMessage={`Delete department "${department.name}"?`}
                  action={deleteDepartment.bind(null, department.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {departments.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No departments yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
