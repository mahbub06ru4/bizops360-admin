'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addUnitPrice, type ActionState } from '@/lib/realestate/actions';
import { UNIT_PRICE_TYPES } from '@/lib/realestate/types';

const initial: ActionState = { error: null };
const LABELS: Record<string, string> = { base: 'Base', current: 'Current', per_sqft: 'Per sqft' };

export function UnitPriceDialog({ projectId, unitId }: { projectId: number; unitId: number }) {
  const [open, setOpen] = useState(false);
  const action = addUnitPrice.bind(null, projectId, unitId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [priceType, setPriceType] = useState<(typeof UNIT_PRICE_TYPES)[number]>('current');
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
        <Button variant="ghost" size="icon" aria-label="Add price">
          <Tag className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add price</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" min={0} step="0.01" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <input type="hidden" name="price_type" value={priceType} />
            <Select value={priceType} onValueChange={(value) => setPriceType(value as typeof priceType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_PRICE_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="effective_from">Effective from</Label>
            <Input id="effective_from" name="effective_from" type="date" />
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
