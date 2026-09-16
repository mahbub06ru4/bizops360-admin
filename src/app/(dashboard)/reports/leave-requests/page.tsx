import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { LeaveRequest } from '@/lib/hr/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'employee', label: 'Employee' },
  { key: 'type', label: 'Leave type' },
  { key: 'start_date', label: 'Start' },
  { key: 'end_date', label: 'End' },
  { key: 'days', label: 'Days' },
  { key: 'status', label: 'Status' },
];

export default async function LeaveRequestReportPage() {
  const token = await getToken();
  const { data: leaveRequests } = await apiFetch<Paginated<LeaveRequest>>('/leave-requests?per_page=100', { token });

  const rows = leaveRequests.map((row) => ({
    employee: row.employee?.full_name ?? null,
    type: row.leave_type?.name ?? null,
    start_date: row.start_date,
    end_date: row.end_date,
    days: row.days,
    status: row.status,
  }));

  return (
    <div>
      <PageHeader title="Leave requests" description="Every leave request and its decision." />
      <ReportTable title="Leave Requests" filename="leave-requests" columns={COLUMNS} rows={rows} />
    </div>
  );
}
