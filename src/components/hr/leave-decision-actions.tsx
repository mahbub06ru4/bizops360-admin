'use client';

import { useTransition } from 'react';
import { Check, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { approveLeaveRequest, cancelLeaveRequest, rejectLeaveRequest } from '@/lib/hr/actions';
import type { LeaveRequest } from '@/lib/hr/types';

export function LeaveDecisionActions({ leaveRequest, canDecide }: { leaveRequest: LeaveRequest; canDecide: boolean }) {
  const [pending, startTransition] = useTransition();

  if (leaveRequest.status !== 'pending') {
    return null;
  }

  return (
    <div className="flex justify-end gap-1">
      {canDecide && (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Approve"
            disabled={pending}
            onClick={() => {
              const note = window.prompt('Approval note (optional):') ?? '';

              startTransition(async () => {
                const result = await approveLeaveRequest(leaveRequest.id, note || null);

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
            aria-label="Reject"
            disabled={pending}
            onClick={() => {
              const note = window.prompt('Rejection note (optional):') ?? '';

              startTransition(async () => {
                const result = await rejectLeaveRequest(leaveRequest.id, note || null);

                if (result.error) {
                  toast.error(result.error);
                }
              });
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cancel"
        disabled={pending}
        onClick={() => {
          if (!window.confirm('Cancel this leave request?')) {
            return;
          }

          startTransition(async () => {
            const result = await cancelLeaveRequest(leaveRequest.id);

            if (result.error) {
              toast.error(result.error);
            }
          });
        }}
      >
        <Ban className="h-4 w-4" />
      </Button>
    </div>
  );
}
