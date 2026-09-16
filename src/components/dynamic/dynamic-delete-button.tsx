'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteResourceRecord } from '@/lib/admin-schema/actions';

export function DynamicDeleteButton({
  endpoint,
  id,
  label,
  listPath,
}: {
  endpoint: string;
  id: number;
  label: string;
  listPath: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Delete ${label}`}
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) {
          return;
        }

        startTransition(async () => {
          const result = await deleteResourceRecord(endpoint, id, listPath);

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
