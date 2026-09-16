import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Customer } from '@/lib/crm/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'owner', label: 'Owner' },
];

export default async function CustomerReportPage() {
  const token = await getToken();
  const { data: customers } = await apiFetch<Paginated<Customer>>('/customers?per_page=100', { token });

  const rows = customers.map((row) => ({
    name: row.name,
    type: row.type,
    company: row.company,
    email: row.email,
    phone: row.phone,
    owner: row.owner?.full_name ?? null,
  }));

  return (
    <div>
      <PageHeader title="Customer list" description="Every customer on record." />
      <ReportTable title="Customer List" filename="customer-list" columns={COLUMNS} rows={rows} />
    </div>
  );
}
