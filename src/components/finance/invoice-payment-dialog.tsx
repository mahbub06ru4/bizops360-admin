'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recordInvoicePayment, type ActionState } from '@/lib/finance/actions';
import { PAYMENT_METHODS } from '@/lib/finance/types';

const initial: ActionState = { error: null };
const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  card: 'Card',
  mobile: 'Mobile',
  cheque: 'Cheque',
  other: 'Other',
};

export function InvoicePaymentDialog({ invoiceId }: { invoiceId: number }) {
  const [open, setOpen] = useState(false);
  const action = recordInvoicePayment.bind(null, invoiceId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>('cash');
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
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
              {state.fieldErrors?.amount && <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="paid_on">Paid on</Label>
              <Input id="paid_on" name="paid_on" type="date" required />
            </div>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" name="reference" />
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
