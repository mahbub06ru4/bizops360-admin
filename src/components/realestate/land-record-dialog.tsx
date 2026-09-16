'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addLandRecord, type ActionState } from '@/lib/realestate/actions';

const initial: ActionState = { error: null };

export function LandRecordDialog({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const action = addLandRecord.bind(null, projectId);
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
          <Plus className="h-4 w-4" /> Add land record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add land record</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mouza">Mouza</Label>
            <Input id="mouza" name="mouza" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="jl_no">JL No.</Label>
              <Input id="jl_no" name="jl_no" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="khatian_no">Khatian No.</Label>
              <Input id="khatian_no" name="khatian_no" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dag_no">Dag No.</Label>
              <Input id="dag_no" name="dag_no" />
            </div>
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
