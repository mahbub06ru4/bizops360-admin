'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addUnit, type ActionState } from '@/lib/realestate/actions';
import { UNIT_FACINGS } from '@/lib/realestate/types';

const initial: ActionState = { error: null };
const NONE = '__none__';

export function UnitDialog({ projectId, buildingId }: { projectId: number; buildingId: number }) {
  const [open, setOpen] = useState(false);
  const action = addUnit.bind(null, projectId, buildingId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [facing, setFacing] = useState(NONE);
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
        <Button variant="ghost" size="sm">
          <Plus className="h-3.5 w-3.5" /> Add unit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add unit</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="unit_number">Unit number</Label>
              <Input id="unit_number" name="unit_number" required />
              {state.fieldErrors?.unit_number && (
                <p className="text-sm text-destructive">{state.fieldErrors.unit_number[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="floor">Floor</Label>
              <Input id="floor" name="floor" type="number" min={0} max={300} required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="size_sqft">Size (sqft)</Label>
            <Input id="size_sqft" name="size_sqft" type="number" min={0} step="0.01" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min={0} max={50} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min={0} max={50} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="parking_spaces">Parking</Label>
              <Input id="parking_spaces" name="parking_spaces" type="number" min={0} max={50} defaultValue={0} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Facing</Label>
            <input type="hidden" name="facing" value={facing === NONE ? '' : facing} />
            <Select value={facing} onValueChange={setFacing}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not set</SelectItem>
                {UNIT_FACINGS.map((value) => (
                  <SelectItem key={value} value={value} className="capitalize">
                    {value}
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
