'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createExpense, updateExpense, type ActionState } from '@/lib/finance/actions';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, type Expense } from '@/lib/finance/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const NONE = '__none__';
const CATEGORY_LABELS: Record<string, string> = { office: 'Office', employee: 'Employee', supplier: 'Supplier', other: 'Other' };
const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  card: 'Card',
  mobile: 'Mobile',
  cheque: 'Cheque',
  other: 'Other',
};

export function ExpenseDialog({ expense, employees }: { expense?: Expense; employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const action = expense ? updateExpense.bind(null, expense.id) : createExpense;
  const [state, formAction, pending] = useActionState(action, initial);
  const [employeeId, setEmployeeId] = useState(expense?.employee_id ? String(expense.employee_id) : NONE);
  const [category, setCategory] = useState(expense?.category ?? 'office');
  const [method, setMethod] = useState(expense?.method ?? 'cash');
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.error === null) {
      setOpen(false);
    }

    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {expense ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${expense.title}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit expense' : 'New expense'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={expense?.title} required />
            {state.fieldErrors?.title && <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" min={0.01} step="0.01" defaultValue={expense?.amount} required />
              {state.fieldErrors?.amount && <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="spent_on">Spent on</Label>
              <Input id="spent_on" name="spent_on" type="date" defaultValue={expense?.spent_on} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <input type="hidden" name="category" value={category} />
              <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CATEGORY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Method</Label>
              <input type="hidden" name="method" value={method} />
              <Select value={method} onValueChange={(value) => setMethod(value as typeof method)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {METHOD_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Employee</Label>
            <input type="hidden" name="employee_id" value={employeeId === NONE ? '' : employeeId} />
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No employee</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="supplier_name">Supplier</Label>
            <Input id="supplier_name" name="supplier_name" defaultValue={expense?.supplier_name ?? ''} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" name="reference" defaultValue={expense?.reference ?? ''} />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
