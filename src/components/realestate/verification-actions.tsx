'use client';

import { useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { rejectProject, verifyProject } from '@/lib/realestate/actions';

export function VerificationActions({ projectId }: { projectId: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => {
          const notes = window.prompt('Verification notes (optional):') ?? '';

          startTransition(async () => {
            const result = await verifyProject(projectId, notes || null);

            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success('Project verified.');
            }
          });
        }}
      >
        <Check className="h-4 w-4" /> Verify
      </Button>
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => {
          const notes = window.prompt('Reason for rejection (required):');

          if (!notes) {
            return;
          }

          startTransition(async () => {
            const result = await rejectProject(projectId, notes);

            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success('Project rejected.');
            }
          });
        }}
      >
        <X className="h-4 w-4" /> Reject
      </Button>
    </div>
  );
}
