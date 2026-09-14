'use client';

import { useTransition } from 'react';
import { Ban, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendInvoice, voidInvoice } from '@/lib/finance/actions';
import type { Invoice } from '@/lib/finance/types';

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-1">
      {invoice.status === 'draft' && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Send"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await sendInvoice(invoice.id);

              if (result.error) {
                toast.error(result.error);
              }
            });
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
      {invoice.status !== 'void' && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Void"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Void invoice ${invoice.number}?`)) {
              return;
            }

            startTransition(async () => {
              const result = await voidInvoice(invoice.id);

              if (result.error) {
                toast.error(result.error);
              }
            });
          }}
        >
          <Ban className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
