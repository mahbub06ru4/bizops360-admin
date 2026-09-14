'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addTaskComment, type ActionState } from '@/lib/operations/actions';

const initial: ActionState = { error: null };

export function TaskCommentForm({ taskId }: { taskId: number }) {
  const action = addTaskComment.bind(null, taskId);
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
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <Textarea name="body" placeholder="Add a comment…" rows={2} required />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Posting…' : 'Comment'}
        </Button>
      </div>
    </form>
  );
}
