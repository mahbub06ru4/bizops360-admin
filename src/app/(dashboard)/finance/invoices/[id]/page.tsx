import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/organization/page-header';
import { InvoiceActions } from '@/components/finance/invoice-actions';
import { InvoicePaymentDialog } from '@/components/finance/invoice-payment-dialog';
import { InvoiceRefundDialog } from '@/components/finance/invoice-refund-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Invoice, InvoiceStatus } from '@/lib/finance/types';

const STATUS_VARIANT: Record<InvoiceStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  draft: 'outline',
  sent: 'default',
  partial: 'default',
  paid: 'secondary',
  refunded: 'secondary',
  void: 'destructive',
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoiceId = Number(id);
  const token = await getToken();

  const { data: invoice } = await apiFetch<{ data: Invoice }>(`/invoices/${invoiceId}`, { token });

  return (
    <div>
      <PageHeader
        title={invoice.number}
        description={invoice.customer_name}
        action={<InvoiceActions invoice={invoice} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant={STATUS_VARIANT[invoice.status]} className="capitalize">
          {invoice.status}
        </Badge>
        <span className="text-sm text-muted-foreground">Issued {invoice.issue_date}</span>
        {invoice.due_date && <span className="text-sm text-muted-foreground">Due {invoice.due_date}</span>}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Amount</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{invoice.amount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{invoice.amount_paid}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Refunded</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{invoice.amount_refunded}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Due</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{invoice.amount_due}</CardContent>
        </Card>
      </div>

      {invoice.notes && <p className="mb-6 whitespace-pre-wrap text-sm text-muted-foreground">{invoice.notes}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InvoicePaymentDialog invoiceId={invoice.id} />
            <div className="flex flex-col gap-2">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between gap-2 border-t pt-2 text-sm">
                  <span>
                    {payment.paid_on} — <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                  </span>
                  <span className="font-medium">{payment.amount}</span>
                </div>
              ))}
              {invoice.payments.length === 0 && <p className="text-sm text-muted-foreground">No payments yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refunds</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InvoiceRefundDialog invoiceId={invoice.id} payments={invoice.payments} />
            <div className="flex flex-col gap-2">
              {invoice.refunds.map((refund) => (
                <div key={refund.id} className="flex justify-between gap-2 border-t pt-2 text-sm">
                  <span>
                    {refund.refunded_on} — <span className="capitalize">{refund.method.replace('_', ' ')}</span>
                  </span>
                  <span className="font-medium">{refund.amount}</span>
                </div>
              ))}
              {invoice.refunds.length === 0 && <p className="text-sm text-muted-foreground">No refunds yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/finance/invoices" className="text-sm text-muted-foreground hover:underline">
          ← Back to invoices
        </Link>
      </div>
    </div>
  );
}
