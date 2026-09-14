import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { ExpenseDecisionActions } from '@/components/finance/expense-decision-actions';
import { ExpenseDialog } from '@/components/finance/expense-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteExpense } from '@/lib/finance/actions';
import type { Expense, ExpenseStatus } from '@/lib/finance/types';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Employee } from '@/lib/organization/types';

const STATUS_VARIANT: Record<ExpenseStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
};

export default async function ExpensesPage() {
  const token = await getToken();
  const [{ data: expenses }, employees] = await Promise.all([
    apiFetch<Paginated<Expense>>('/expenses?per_page=100', { token }),
    listAll<Employee>('/employees', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader title="Expenses" description="Spend, with an approval workflow." action={<ExpenseDialog employees={employees} />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {expense.category}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{expense.spent_on}</TableCell>
              <TableCell className="font-medium">{expense.amount}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[expense.status]} className="capitalize">
                  {expense.status}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <ExpenseDecisionActions expense={expense} />
                <ExpenseDialog expense={expense} employees={employees} />
                <DeleteRowButton
                  label={expense.title}
                  confirmMessage={`Delete "${expense.title}"?`}
                  action={deleteExpense.bind(null, expense.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {expenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No expenses recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
