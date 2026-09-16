'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addLandShare, type ActionState } from '@/lib/realestate/actions';

const initial: ActionState = { error: null };

export function LandShareDialog({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const action = addLandShare.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initial);
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
          <Plus className="h-4 w-4" /> Add land share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add land share</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="total_shares">Total shares</Label>
            <Input id="total_shares" name="total_shares" type="number" min={1} max={1000000} required />
            {state.fieldErrors?.total_shares && (
              <p className="text-sm text-destructive">{state.fieldErrors.total_shares[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="share_value">Share value</Label>
            <Input id="share_value" name="share_value" type="number" min={0} step="0.01" required />
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
