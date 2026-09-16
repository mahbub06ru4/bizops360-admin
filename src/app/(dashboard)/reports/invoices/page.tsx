import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Invoice } from '@/lib/finance/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'number', label: 'Number' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'amount_paid', label: 'Paid' },
  { key: 'amount_due', label: 'Due' },
  { key: 'issue_date', label: 'Issued' },
  { key: 'due_date', label: 'Due date' },
];

export default async function InvoiceReportPage() {
  const token = await getToken();
  const { data: invoices } = await apiFetch<Paginated<Invoice>>('/invoices?per_page=100', { token });

  const rows = invoices.map((row) => ({
    number: row.number,
    customer: row.customer_name,
    status: row.status,
    amount: row.amount,
    amount_paid: row.amount_paid,
    amount_due: row.amount_due,
    issue_date: row.issue_date,
    due_date: row.due_date,
  }));

  return (
    <div>
      <PageHeader title="Invoices" description="Billing status for every invoice." />
      <ReportTable title="Invoices" filename="invoices" columns={COLUMNS} rows={rows} />
    </div>
  );
}
