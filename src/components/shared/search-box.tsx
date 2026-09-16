'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * Debounced free-text search that pushes `q` into the URL (and resets `page`
 * to 1), so the server component re-fetches with the new filter. Keeps every
 * other existing query param.
 *
 * Keyed by the current `q` in the parent so browser back/forward (which
 * changes the URL without remounting) still shows the right value —
 * cheaper than syncing local state to the URL in an effect.
 */
export function SearchBox({ basePath, placeholder = 'Search…' }: { basePath: string; placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const [, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        key={searchParams.get('q') ?? ''}
        defaultValue={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams);

            if (next) {
              params.set('q', next);
            } else {
              params.delete('q');
            }

            params.delete('page');

            startTransition(() => {
              router.push(`${basePath}?${params.toString()}`);
            });
          }, 350);
        }}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}
