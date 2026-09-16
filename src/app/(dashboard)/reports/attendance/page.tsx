import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Attendance } from '@/lib/hr/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'employee', label: 'Employee' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'check_in_at', label: 'Check-in' },
  { key: 'check_out_at', label: 'Check-out' },
  { key: 'worked_minutes', label: 'Worked (min)' },
];

export default async function AttendanceReportPage() {
  const token = await getToken();
  const { data: attendance } = await apiFetch<Paginated<Attendance>>('/attendance?per_page=100', { token });

  const rows = attendance.map((row) => ({
    employee: row.employee?.full_name ?? null,
    date: row.date,
    status: row.status,
    check_in_at: row.check_in_at,
    check_out_at: row.check_out_at,
    worked_minutes: row.worked_minutes,
  }));

  return (
    <div>
      <PageHeader title="Attendance log" description="Daily check-in/check-out records." />
      <ReportTable title="Attendance Log" filename="attendance-log" columns={COLUMNS} rows={rows} />
    </div>
  );
}
