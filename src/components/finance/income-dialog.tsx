'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createIncome, updateIncome, type ActionState } from '@/lib/finance/actions';
import { INCOME_CATEGORIES, PAYMENT_METHODS, type Income } from '@/lib/finance/types';
import type { Customer } from '@/lib/crm/types';

const initial: ActionState = { error: null };
const NONE = '__none__';
const CATEGORY_LABELS: Record<string, string> = { customer_payment: 'Customer payment', other: 'Other' };
const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  card: 'Card',
  mobile: 'Mobile',
  cheque: 'Cheque',
  other: 'Other',
};

export function IncomeDialog({ income, customers }: { income?: Income; customers: Customer[] }) {
  const [open, setOpen] = useState(false);
  const action = income ? updateIncome.bind(null, income.id) : createIncome;
  const [state, formAction, pending] = useActionState(action, initial);
  const [customerId, setCustomerId] = useState(income?.customer_id ? String(income.customer_id) : NONE);
  const [category, setCategory] = useState(income?.category ?? 'customer_payment');
  const [method, setMethod] = useState(income?.method ?? 'cash');
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
        {income ? (
          <Button variant="ghost" size="icon" aria-label={`Edit income ${income.id}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New income
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{income ? 'Edit income' : 'New income'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" min={0.01} step="0.01" defaultValue={income?.amount} required />
              {state.fieldErrors?.amount && <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="received_on">Received on</Label>
              <Input id="received_on" name="received_on" type="date" defaultValue={income?.received_on} required />
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
                  {INCOME_CATEGORIES.map((value) => (
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
            <Label>Customer</Label>
            <input type="hidden" name="customer_id" value={customerId === NONE ? '' : customerId} />
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="source">Source</Label>
            <Input id="source" name="source" defaultValue={income?.source ?? ''} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" name="reference" defaultValue={income?.reference ?? ''} />
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
