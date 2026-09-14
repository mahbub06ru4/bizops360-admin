'use client';

import { useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { approveExpense, rejectExpense } from '@/lib/finance/actions';
import type { Expense } from '@/lib/finance/types';

export function ExpenseDecisionActions({ expense }: { expense: Expense }) {
  const [pending, startTransition] = useTransition();

  if (expense.status !== 'pending') {
    return null;
  }

  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Approve"
        disabled={pending}
        onClick={() => {
          const note = window.prompt('Approval note (optional):') ?? '';

          startTransition(async () => {
            const result = await approveExpense(expense.id, note || null);

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
            const result = await rejectExpense(expense.id, note || null);

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
