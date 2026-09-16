'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { setProjectPricing, type ActionState } from '@/lib/realestate/actions';
import type { ProjectPricing } from '@/lib/realestate/types';

const initial: ActionState = { error: null };

export function ProjectPricingForm({ projectId, pricing }: { projectId: number; pricing?: ProjectPricing }) {
  const action = setProjectPricing.bind(null, projectId);
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);

    if (result.error === null) {
      toast.success('Pricing saved.');
    }

    return result;
  }, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="land_cost">Land cost</Label>
          <Input id="land_cost" name="land_cost" type="number" min={0} step="0.01" defaultValue={pricing?.land_cost ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="construction_cost">Construction cost</Label>
          <Input
            id="construction_cost"
            name="construction_cost"
            type="number"
            min={0}
            step="0.01"
            defaultValue={pricing?.construction_cost ?? ''}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="consultancy_cost">Consultancy cost</Label>
          <Input
            id="consultancy_cost"
            name="consultancy_cost"
            type="number"
            min={0}
            step="0.01"
            defaultValue={pricing?.consultancy_cost ?? ''}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" maxLength={3} defaultValue={pricing?.currency ?? 'BDT'} />
        </div>
      </div>

      {pricing && (
        <p className="text-sm text-muted-foreground">
          Estimated total: {pricing.estimated_total} {pricing.currency}
        </p>
      )}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Saving…' : 'Save pricing'}
        </Button>
      </div>
    </form>
  );
}
