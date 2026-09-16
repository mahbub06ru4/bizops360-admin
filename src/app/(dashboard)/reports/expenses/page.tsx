import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Expense } from '@/lib/finance/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'spent_on', label: 'Spent on' },
  { key: 'status', label: 'Status' },
  { key: 'employee', label: 'Employee' },
];

export default async function ExpenseReportPage() {
  const token = await getToken();
  const { data: expenses } = await apiFetch<Paginated<Expense>>('/expenses?per_page=100', { token });

  const rows = expenses.map((row) => ({
    title: row.title,
    category: row.category,
    amount: row.amount,
    spent_on: row.spent_on,
    status: row.status,
    employee: row.employee?.full_name ?? null,
  }));

  return (
    <div>
      <PageHeader title="Expense report" description="Spend, with approval status." />
      <ReportTable title="Expense Report" filename="expense-report" columns={COLUMNS} rows={rows} />
    </div>
  );
}
