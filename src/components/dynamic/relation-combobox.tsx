'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from 'cn';
import type { RelationOption } from '@/lib/admin-schema/types';

const NOT_SET = '__none__';

/**
 * A relation dropdown that filters by typing — matches against the option's
 * label plus identifying columns folded into `search` (phone, staff/employee
 * code, email, ...), not just the display label, so a large employee list is
 * findable by name, mobile number, or staff id.
 */
export function RelationCombobox({
  options,
  value,
  onChange,
  placeholder,
  clearable,
}: {
  options: RelationOption[];
  /** Selected id as a string, or '' / NOT_SET for none. */
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => String(option.id) === value);
  const filtered =
    query.trim().length === 0
      ? options
      : options.filter((option) => option.search.includes(query.trim().toLowerCase()));

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          setQuery('');
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <div className="border-b p-2">
          <Input
            autoFocus
            placeholder="Search by name, mobile, or staff id…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {clearable && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              <Check className={cn('h-4 w-4', value !== '' && value !== NOT_SET && 'opacity-0')} />
              Not set
            </button>
          )}
          {filtered.map((option) => (
            <button
              key={option.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onChange(String(option.id));
                setOpen(false);
              }}
            >
              <Check className={cn('h-4 w-4', String(option.id) !== value && 'opacity-0')} />
              {option.label}
            </button>
          ))}
          {filtered.length === 0 && <p className="px-2 py-3 text-center text-sm text-muted-foreground">No matches.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
