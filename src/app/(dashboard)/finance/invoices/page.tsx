import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { InvoiceActions } from '@/components/finance/invoice-actions';
import { InvoiceDialog } from '@/components/finance/invoice-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Customer } from '@/lib/crm/types';
import { deleteInvoice } from '@/lib/finance/actions';
import type { Invoice, InvoiceStatus } from '@/lib/finance/types';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';

const STATUS_VARIANT: Record<InvoiceStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  draft: 'outline',
  sent: 'default',
  partial: 'default',
  paid: 'secondary',
  refunded: 'secondary',
  void: 'destructive',
};

export default async function InvoicesPage() {
  const token = await getToken();
  const [{ data: invoices }, customers] = await Promise.all([
    apiFetch<Paginated<Invoice>>('/invoices?per_page=100', { token }),
    listAll<Customer>('/customers', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader title="Invoices" description="Billing for tenant customers." action={<InvoiceDialog customers={customers} />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="w-36 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                <Link href={`/finance/invoices/${invoice.id}`} className="hover:underline">
                  {invoice.number}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{invoice.customer_name}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[invoice.status]} className="capitalize">
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>
                {invoice.amount} <span className="text-muted-foreground">(due {invoice.amount_due})</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{invoice.due_date ?? '—'}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <InvoiceActions invoice={invoice} />
                <InvoiceDialog invoice={invoice} customers={customers} />
                <DeleteRowButton
                  label={invoice.number}
                  confirmMessage={`Delete invoice "${invoice.number}"?`}
                  action={deleteInvoice.bind(null, invoice.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No invoices yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
