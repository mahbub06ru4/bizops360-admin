'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createInvoice, updateInvoice, type ActionState } from '@/lib/finance/actions';
import type { Invoice } from '@/lib/finance/types';
import type { Customer } from '@/lib/crm/types';

const initial: ActionState = { error: null };

export function InvoiceDialog({ invoice, customers }: { invoice?: Invoice; customers: Customer[] }) {
  const [open, setOpen] = useState(false);
  const action = invoice ? updateInvoice.bind(null, invoice.id) : createInvoice;
  const [state, formAction, pending] = useActionState(action, initial);
  const [customerId, setCustomerId] = useState(invoice?.customer_id ? String(invoice.customer_id) : customers[0] ? String(customers[0].id) : '');
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
        {invoice ? (
          <Button variant="ghost" size="icon" aria-label={`Edit invoice ${invoice.number}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{invoice ? `Edit ${invoice.number}` : 'New invoice'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Customer</Label>
            <input type="hidden" name="customer_id" value={customerId} />
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.customer_id && <p className="text-sm text-destructive">{state.fieldErrors.customer_id[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" min={0.01} step="0.01" defaultValue={invoice?.amount} required />
            {state.fieldErrors?.amount && <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="issue_date">Issue date</Label>
              <Input id="issue_date" name="issue_date" type="date" defaultValue={invoice?.issue_date} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={invoice?.due_date ?? ''} />
              {state.fieldErrors?.due_date && <p className="text-sm text-destructive">{state.fieldErrors.due_date[0]}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={invoice?.notes ?? ''} />
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
