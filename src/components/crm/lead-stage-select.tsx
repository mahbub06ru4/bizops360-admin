'use client';

import { useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { moveLeadStage } from '@/lib/crm/actions';
import { LEAD_STAGES, type LeadStage } from '@/lib/crm/types';

const LABELS: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  follow_up: 'Follow up',
  negotiation: 'Negotiation',
  converted: 'Converted',
  lost: 'Lost',
};

export function LeadStageSelect({ leadId, stage }: { leadId: number; stage: LeadStage }) {
  const [pending, startTransition] = useTransition();

  if (stage === 'converted') {
    return <span className="text-sm text-muted-foreground">{LABELS.converted}</span>;
  }

  return (
    <Select
      value={stage}
      disabled={pending}
      onValueChange={(value) => {
        const lostReason = value === 'lost' ? window.prompt('Reason the lead was lost (optional):') : null;

        startTransition(async () => {
          const result = await moveLeadStage(leadId, value, lostReason || null);

          if (result.error) {
            toast.error(result.error);
          }
        });
      }}
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STAGES.filter((value) => value !== 'converted').map((value) => (
          <SelectItem key={value} value={value}>
            {LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
