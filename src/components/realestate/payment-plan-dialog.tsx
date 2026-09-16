'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addPaymentPlan, type ActionState } from '@/lib/realestate/actions';
import { PAYMENT_PLAN_FREQUENCIES } from '@/lib/realestate/types';

const initial: ActionState = { error: null };
const LABELS: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly' };

export function PaymentPlanDialog({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const action = addPaymentPlan.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [frequency, setFrequency] = useState<(typeof PAYMENT_PLAN_FREQUENCIES)[number]>('monthly');
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
          <Plus className="h-4 w-4" /> Add payment plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add payment plan</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
            {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="down_payment_percent">Down payment %</Label>
              <Input id="down_payment_percent" name="down_payment_percent" type="number" min={0} max={100} step="0.01" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="installment_count">Installments</Label>
              <Input id="installment_count" name="installment_count" type="number" min={1} max={360} required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Frequency</Label>
            <input type="hidden" name="installment_frequency" value={frequency} />
            <Select value={frequency} onValueChange={(value) => setFrequency(value as typeof frequency)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_PLAN_FREQUENCIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
