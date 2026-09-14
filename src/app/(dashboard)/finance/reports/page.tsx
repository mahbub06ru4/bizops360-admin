import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { CustomerDues, FinanceOverview, MonthlyFinanceReport, OutstandingInvoices, ProfitAndLoss } from '@/lib/finance/types';

export default async function FinanceReportsPage() {
  const token = await getToken();
  const year = new Date().getFullYear();
  const [{ data: overview }, { data: profitAndLoss }, { data: outstanding }, { data: dues }, { data: monthly }] =
    await Promise.all([
      apiFetch<{ data: FinanceOverview }>('/finance/overview', { token }),
      apiFetch<{ data: ProfitAndLoss }>('/finance/profit-loss', { token }),
      apiFetch<{ data: OutstandingInvoices }>('/finance/outstanding-invoices', { token }),
      apiFetch<{ data: CustomerDues }>('/finance/customer-dues', { token }),
      apiFetch<{ data: MonthlyFinanceReport }>(`/finance/monthly?year=${year}`, { token }),
    ]);

  return (
    <div>
      <PageHeader title="Finance reports" description="Profit & loss, receivables, and monthly trends." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">This month&apos;s profit</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.this_month.profit}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">This month&apos;s margin</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {overview.this_month.margin !== null ? `${overview.this_month.margin}%` : '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Outstanding invoices</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.receivables.outstanding_invoices}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Outstanding amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.receivables.outstanding_amount}</CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Profit &amp; loss ({profitAndLoss.from} – {profitAndLoss.to})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <span>Income: {profitAndLoss.summary.income}</span>
            <span>Expense: {profitAndLoss.summary.expense}</span>
            <span>Profit: {profitAndLoss.summary.profit}</span>
            <span>Margin: {profitAndLoss.summary.margin !== null ? `${profitAndLoss.summary.margin}%` : '—'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoice ageing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(outstanding.ageing).map(([bucket, amount]) => (
              <Badge key={bucket} variant="outline">
                {bucket.replace('_', '–')}: {amount}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-medium">Outstanding invoices ({outstanding.total_outstanding})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Days overdue</TableHead>
              <TableHead>Bucket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outstanding.invoices.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.number}</TableCell>
                <TableCell className="text-muted-foreground">{row.customer_name}</TableCell>
                <TableCell>{row.amount_due}</TableCell>
                <TableCell className={row.days_overdue > 0 ? 'text-destructive' : undefined}>{row.days_overdue}</TableCell>
                <TableCell className="capitalize">{row.ageing_bucket.replace('_', '–')}</TableCell>
              </TableRow>
            ))}
            {outstanding.invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No outstanding invoices.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-medium">Customer dues ({dues.total_due})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead>Amount due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dues.customers.map((row) => (
              <TableRow key={row.customer_id ?? row.customer_name}>
                <TableCell className="font-medium">{row.customer_name}</TableCell>
                <TableCell>{row.invoice_count}</TableCell>
                <TableCell>{row.amount_due}</TableCell>
              </TableRow>
            ))}
            {dues.customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No customers owe money.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Monthly ({monthly.year})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Income</TableHead>
              <TableHead>Expense</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthly.months.map((row) => (
              <TableRow key={row.month}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>{row.income}</TableCell>
                <TableCell>{row.expense}</TableCell>
                <TableCell>{row.profit}</TableCell>
                <TableCell>{row.margin !== null ? `${row.margin}%` : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
