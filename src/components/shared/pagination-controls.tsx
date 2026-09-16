import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/lib/api/types';

function pageHref(basePath: string, searchParams: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && key !== 'page') {
      params.set(key, value);
    }
  }

  params.set('page', String(page));

  return `${basePath}?${params.toString()}`;
}

/**
 * Renders "X-Y of Z" plus Prev/Next links built from Laravel's paginate() meta,
 * preserving every other query param (per_page, filters) already on the page.
 */
export function PaginationControls<T>({
  meta,
  basePath,
  searchParams,
}: {
  meta: Paginated<T>['meta'];
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (meta.last_page <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={meta.current_page <= 1} asChild={meta.current_page > 1}>
          {meta.current_page > 1 ? (
            <Link href={pageHref(basePath, searchParams, meta.current_page - 1)}>Previous</Link>
          ) : (
            <span>Previous</span>
          )}
        </Button>
        <span className="flex items-center px-2 text-sm text-muted-foreground">
          Page {meta.current_page} of {meta.last_page}
        </span>
        <Button variant="outline" size="sm" disabled={meta.current_page >= meta.last_page} asChild={meta.current_page < meta.last_page}>
          {meta.current_page < meta.last_page ? (
            <Link href={pageHref(basePath, searchParams, meta.current_page + 1)}>Next</Link>
          ) : (
            <span>Next</span>
          )}
        </Button>
      </div>
    </div>
  );
}
