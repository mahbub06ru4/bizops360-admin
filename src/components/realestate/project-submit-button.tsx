'use client';

import { useTransition } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { submitProject } from '@/lib/realestate/actions';

export function ProjectSubmitButton({ projectId }: { projectId: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('Submit this project for platform verification?')) {
          return;
        }

        startTransition(async () => {
          const result = await submitProject(projectId);

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success('Submitted for verification.');
          }
        });
      }}
    >
      <Send className="h-4 w-4" /> {pending ? 'Submitting…' : 'Submit for verification'}
    </Button>
  );
}
