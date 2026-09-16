import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Paginated } from '@/lib/api/types';
import type { Employee } from '@/lib/organization/types';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'hire_date', label: 'Hire date' },
  { key: 'status', label: 'Status' },
];

export default async function EmployeeReportPage() {
  const token = await getToken();
  const { data: employees } = await apiFetch<Paginated<Employee>>('/employees?per_page=100', { token });

  const rows = employees.map((employee) => ({
    name: employee.full_name,
    code: employee.employee_code,
    email: employee.email,
    phone: employee.phone,
    department: employee.department?.name ?? null,
    designation: employee.designation?.title ?? null,
    hire_date: employee.hire_date,
    status: employee.employment_status,
  }));

  return (
    <div>
      <PageHeader title="Employee directory" description="Every employee on record, with org placement." />
      <ReportTable title="Employee Directory" filename="employee-directory" columns={COLUMNS} rows={rows} />
    </div>
  );
}
