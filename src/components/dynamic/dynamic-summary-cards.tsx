import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

function titleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function safeFetch(endpoint: string, token: string | null): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await apiFetch<{ data: Record<string, unknown> }>(endpoint, { token });

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
}

/** Renders a schema resource's `summaryEndpoint` as a row of read-only stat cards — aggregate data no generic table/form captures. */
export async function DynamicSummaryCards({ endpoint, token }: { endpoint: string; token: string | null }) {
  const summary = await safeFetch(endpoint, token);

  if (!summary) {
    return null;
  }

  const entries = Object.entries(summary).filter(([, value]) => typeof value === 'string' || typeof value === 'number');

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {entries.map(([key, value]) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{titleCase(key)}</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">{String(value)}</CardContent>
        </Card>
      ))}
    </div>
  );
}
