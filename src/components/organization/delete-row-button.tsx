'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ActionState } from '@/lib/organization/actions';

export function DeleteRowButton({
  label,
  confirmMessage,
  action,
}: {
  label: string;
  confirmMessage: string;
  action: () => Promise<ActionState>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Delete ${label}`}
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) {
          return;
        }

        startTransition(async () => {
          const result = await action();

          if (result.error) {
            toast.error(result.error);
          }
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
