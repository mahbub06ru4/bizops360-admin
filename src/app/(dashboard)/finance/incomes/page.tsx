import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { IncomeDialog } from '@/components/finance/income-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Customer } from '@/lib/crm/types';
import { deleteIncome } from '@/lib/finance/actions';
import type { Income } from '@/lib/finance/types';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';

export default async function IncomesPage() {
  const token = await getToken();
  const [{ data: incomes }, customers] = await Promise.all([
    apiFetch<Paginated<Income>>('/incomes?per_page=100', { token }),
    listAll<Customer>('/customers', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader title="Income" description="Money received outside of invoice payments." action={<IncomeDialog customers={customers} />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomes.map((income) => (
            <TableRow key={income.id}>
              <TableCell className="text-muted-foreground">{income.received_on}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {income.category.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{income.source ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{income.customer?.name ?? '—'}</TableCell>
              <TableCell className="font-medium">{income.amount}</TableCell>
              <TableCell className="capitalize text-muted-foreground">{income.method.replace('_', ' ')}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <IncomeDialog income={income} customers={customers} />
                <DeleteRowButton
                  label={`income ${income.id}`}
                  confirmMessage="Delete this income record?"
                  action={deleteIncome.bind(null, income.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {incomes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No income recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
