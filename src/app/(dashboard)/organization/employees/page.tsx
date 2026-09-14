import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeDialog } from '@/components/organization/employee-dialog';
import { PageHeader } from '@/components/organization/page-header';
import { TerminateEmployeeButton } from '@/components/organization/terminate-employee-button';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Paginated } from '@/lib/api/types';
import type { Branch, Department, Designation, Employee } from '@/lib/organization/types';

const STATUS_VARIANT: Record<Employee['employment_status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  probation: 'secondary',
  on_leave: 'outline',
  terminated: 'destructive',
};

export default async function EmployeesPage() {
  const token = await getToken();
  const [{ data: employees }, { data: branches }, { data: departments }, { data: designations }] = await Promise.all([
    apiFetch<Paginated<Employee>>('/employees?per_page=100', { token }),
    apiFetch<Paginated<Branch>>('/branches?per_page=100', { token }),
    apiFetch<Paginated<Department>>('/departments?per_page=100', { token }),
    apiFetch<Paginated<Designation>>('/designations?per_page=100', { token }),
  ]);

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${employees.length} on record.`}
        action={<EmployeeDialog branches={branches} departments={departments} designations={designations} />}
      />

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
                No employees yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
