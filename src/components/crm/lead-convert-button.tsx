'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { convertLead } from '@/lib/crm/actions';

export function LeadConvertButton({ leadId }: { leadId: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('Convert this lead to a customer?')) {
          return;
        }

        startTransition(async () => {
          const result = await convertLead(leadId);

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success('Lead converted.');
            router.push('/admin/customers');
          }
        });
      }}
    >
      <ArrowRightCircle className="h-4 w-4" /> {pending ? 'Converting…' : 'Convert'}
    </Button>
  );
}
