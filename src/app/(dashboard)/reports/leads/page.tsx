import { PageHeader } from '@/components/organization/page-header';
import { ReportTable } from '@/components/reports/report-table';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Lead } from '@/lib/crm/types';
import type { Paginated } from '@/lib/api/types';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'stage', label: 'Stage' },
  { key: 'value', label: 'Estimated value' },
  { key: 'owner', label: 'Owner' },
];

export default async function LeadReportPage() {
  const token = await getToken();
  const { data: leads } = await apiFetch<Paginated<Lead>>('/leads?per_page=100', { token });

  const rows = leads.map((row) => ({
    name: row.name,
    company: row.company,
    stage: row.stage,
    value: row.estimated_value,
    owner: row.owner?.full_name ?? null,
  }));

  return (
    <div>
      <PageHeader title="Sales pipeline" description="Every lead and its pipeline stage." />
      <ReportTable title="Sales Pipeline" filename="sales-pipeline" columns={COLUMNS} rows={rows} />
    </div>
  );
}
