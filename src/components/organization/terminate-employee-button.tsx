'use client';

import { useTransition } from 'react';
import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { terminateEmployee } from '@/lib/organization/actions';

export function TerminateEmployeeButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Terminate ${name}`}
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Terminate ${name}? This can't be undone from here.`)) {
          return;
        }

        startTransition(async () => {
          const result = await terminateEmployee(id, new FormData());

          if (result.error) {
            toast.error(result.error);
          }
        });
      }}
    >
      <UserX className="h-4 w-4" />
    </Button>
  );
}
