'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addAmenity, type ActionState } from '@/lib/realestate/actions';

const initial: ActionState = { error: null };

export function AmenityForm({ projectId }: { projectId: number }) {
  const action = addAmenity.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.error === null) {
      formRef.current?.reset();
    }

    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <Input name="name" placeholder="Amenity name (e.g. Swimming pool)" required />
      <Input name="icon" placeholder="Icon (optional)" className="w-32" />
      <Button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add'}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
