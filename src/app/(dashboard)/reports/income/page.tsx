import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Income } from '@/lib/finance/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'source', label: 'Source' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'received_on', label: 'Received on' },
  { key: 'customer', label: 'Customer' },
];

export default async function IncomeReportPage() {
  const token = await getToken();
  const { data: incomes } = await apiFetch<Paginated<Income>>('/incomes?per_page=100', { token });

  const rows = incomes.map((row) => ({
    source: row.source,
    category: row.category,
    amount: row.amount,
    received_on: row.received_on,
    customer: row.customer?.name ?? null,
  }));

  return (
    <div>
      <PageHeader title="Income report" description="Money received outside invoice payments." />
      <ReportTable title="Income Report" filename="income-report" columns={COLUMNS} rows={rows} />
    </div>
  );
}
