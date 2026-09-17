'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addActivityNote, type ActionState } from '@/lib/admin-schema/actions';

const initial: ActionState = { error: null };

export function DynamicActivityNoteForm({ noteEndpoint, listPath }: { noteEndpoint: string; listPath: string }) {
  const action = addActivityNote.bind(null, noteEndpoint, listPath);
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
    <form ref={formRef} action={formAction} className="mb-4 flex flex-col gap-2">
      <Textarea name="body" rows={2} placeholder="Add a note…" required />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" className="self-end" disabled={pending}>
        {pending ? 'Posting…' : 'Add note'}
      </Button>
    </form>
  );
}
