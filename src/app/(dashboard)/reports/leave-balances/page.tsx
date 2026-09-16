import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { LeaveBalance } from '@/lib/hr/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'employee', label: 'Employee' },
  { key: 'type', label: 'Leave type' },
  { key: 'year', label: 'Year' },
  { key: 'entitled', label: 'Entitled' },
  { key: 'used', label: 'Used' },
  { key: 'remaining', label: 'Remaining' },
];

export default async function LeaveBalanceReportPage() {
  const token = await getToken();
  const { data: balances } = await apiFetch<Paginated<LeaveBalance>>('/leave-balances?per_page=100', { token });

  const rows = balances.map((row) => ({
    employee: row.employee?.full_name ?? null,
    type: row.leave_type?.name ?? null,
    year: row.year,
    entitled: row.entitled_days,
    used: row.used_days,
    remaining: row.remaining_days,
  }));

  return (
    <div>
      <PageHeader title="Leave balances" description="Entitlement and usage per employee." />
      <ReportTable title="Leave Balances" filename="leave-balances" columns={COLUMNS} rows={rows} />
    </div>
  );
}
