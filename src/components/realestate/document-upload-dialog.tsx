'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadProjectDocument, type ActionState } from '@/lib/realestate/actions';
import { PROJECT_DOCUMENT_TYPES } from '@/lib/realestate/types';

const initial: ActionState = { error: null };
const LABELS: Record<string, string> = {
  rajuk_approval: 'RAJUK approval',
  land_deed: 'Land deed',
  mutation: 'Mutation',
  other: 'Other',
};

export function DocumentUploadDialog({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const action = uploadProjectDocument.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [documentType, setDocumentType] = useState<(typeof PROJECT_DOCUMENT_TYPES)[number]>('other');
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.error === null) {
      setOpen(false);
    }

    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Upload document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <input type="hidden" name="document_type" value={documentType} />
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as typeof documentType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_DOCUMENT_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="is_private" name="is_private" defaultChecked />
            <Label htmlFor="is_private">Private (owner/admin only)</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
            {state.fieldErrors?.file && <p className="text-sm text-destructive">{state.fieldErrors.file[0]}</p>}
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
