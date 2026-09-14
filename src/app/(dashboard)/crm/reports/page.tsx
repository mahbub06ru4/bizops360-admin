import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { CrmOverview, SalesPerformanceRow } from '@/lib/crm/types';

export default async function CrmReportsPage() {
  const token = await getToken();
  const [{ data: overview }, { data: performance }] = await Promise.all([
    apiFetch<{ data: CrmOverview }>('/crm/overview', { token }),
    apiFetch<{ data: SalesPerformanceRow[] }>('/crm/sales-performance', { token }),
  ]);

  return (
    <div>
      <PageHeader title="CRM reports" description="Pipeline health and sales performance." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Open leads</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.leads.open}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Conversion rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {overview.leads.conversion_rate !== null ? `${overview.leads.conversion_rate}%` : '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Open pipeline value</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.leads.open_pipeline_value}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Customers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.customers}</CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by stage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(overview.leads.by_stage).map(([stage, count]) => (
              <Badge key={stage} variant="outline" className="capitalize">
                {stage.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <span>Due today: {overview.follow_ups.due_today}</span>
            <span>Overdue: {overview.follow_ups.overdue}</span>
            <span>Activities this week: {overview.activities_this_week}</span>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Sales performance by owner</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Open leads</TableHead>
              <TableHead>Converted</TableHead>
              <TableHead>Lost</TableHead>
              <TableHead>Win rate</TableHead>
              <TableHead>Converted value</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>Open follow-ups</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performance.map((row) => (
              <TableRow key={row.employee_id}>
                <TableCell className="font-medium">{row.employee_name ?? '—'}</TableCell>
                <TableCell>{row.open_leads}</TableCell>
                <TableCell>{row.converted_leads}</TableCell>
                <TableCell>{row.lost_leads}</TableCell>
                <TableCell>{row.win_rate !== null ? `${row.win_rate}%` : '—'}</TableCell>
                <TableCell>{row.converted_value}</TableCell>
                <TableCell>{row.customers}</TableCell>
                <TableCell>{row.open_follow_ups}</TableCell>
              </TableRow>
            ))}
            {performance.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No sales performance data yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
