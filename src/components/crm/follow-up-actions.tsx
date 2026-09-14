'use client';

import { useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cancelFollowUp, completeFollowUp } from '@/lib/crm/actions';
import type { FollowUp } from '@/lib/crm/types';

export function FollowUpActions({ followUp }: { followUp: FollowUp }) {
  const [pending, startTransition] = useTransition();

  if (followUp.status !== 'pending') {
    return null;
  }

  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Complete"
        disabled={pending}
        onClick={() => {
          const outcome = window.prompt('Outcome (optional):') ?? '';

          startTransition(async () => {
            const result = await completeFollowUp(followUp.id, outcome || null);

            if (result.error) {
              toast.error(result.error);
            }
          });
        }}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cancel"
        disabled={pending}
        onClick={() => {
          if (!window.confirm('Cancel this follow-up?')) {
            return;
          }

          startTransition(async () => {
            const result = await cancelFollowUp(followUp.id);

            if (result.error) {
              toast.error(result.error);
            }
          });
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
