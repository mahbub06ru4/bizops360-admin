import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeDialog } from '@/components/organization/employee-dialog';
import { PageHeader } from '@/components/organization/page-header';
import { TerminateEmployeeButton } from '@/components/organization/terminate-employee-button';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { SearchBox } from '@/components/shared/search-box';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Branch, Department, Designation, Employee } from '@/lib/organization/types';

const STATUS_VARIANT: Record<Employee['employment_status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  probation: 'secondary',
  on_leave: 'outline',
  terminated: 'destructive',
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string; q?: string }>;
}) {
  const { page, per_page: perPage, q } = await searchParams;
  const token = await getToken();

  const query = new URLSearchParams();
  if (page) query.set('page', page);
  if (q) query.set('q', q);
  query.set('per_page', perPage ?? '15');

  const [{ data: employees, meta }, branches, departments, designations] = await Promise.all([
    apiFetch<Paginated<Employee>>(`/employees?${query.toString()}`, { token }),
    listAll<Branch>('/branches', token ?? ''),
    listAll<Department>('/departments', token ?? ''),
    listAll<Designation>('/designations', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${meta.total} on record.`}
        action={<EmployeeDialog branches={branches} departments={departments} designations={designations} />}
      />

      <div className="mb-4">
        <SearchBox basePath="/organization/employees" placeholder="Search by name, code, or email…" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.full_name}</TableCell>
              <TableCell>{employee.employee_code}</TableCell>
              <TableCell className="text-muted-foreground">{employee.designation?.title ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[employee.employment_status]}>
                  {employee.employment_status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                {employee.employment_status !== 'terminated' && (
                  <TerminateEmployeeButton id={employee.id} name={employee.full_name} />
                )}
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {q ? `No employees match "${q}".` : 'No employees yet.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PaginationControls meta={meta} basePath="/organization/employees" searchParams={{ per_page: perPage, q }} />
    </div>
  );
}
