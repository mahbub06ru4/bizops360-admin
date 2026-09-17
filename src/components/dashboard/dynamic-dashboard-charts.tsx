import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSeriesAreaChart } from '@/components/dashboard/multi-series-area-chart';
import { StatusDonutChart } from '@/components/dashboard/status-donut-chart';
import { PipelineBarChart } from '@/components/dashboard/pipeline-bar-chart';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { hasPermission } from '@/lib/auth/session';
import { getPath, type AdminSchema, type ChartSchema } from '@/lib/admin-schema/types';
import type { AuthUser } from '@/lib/api/types';

function titleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function safeFetch(endpoint: string, token: string | null): Promise<unknown> {
  try {
    const { data } = await apiFetch<{ data: unknown }>(endpoint, { token });

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
}

/** A {label: count} object (Tasks by status, Sales pipeline by stage, ...) into {label, value}[], titleCased and zero-filtered. */
function toSlices(value: unknown): { label: string; value: number }[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value as Record<string, unknown>)
    .map(([key, count]) => ({ label: titleCase(key), value: Number(count) }))
    .filter((slice) => slice.value > 0);
}

/**
 * Renders the main dashboard's charts entirely from `schema.charts` — no
 * chart-specific code here beyond the three renderers (area/donut/bar)
 * dispatched by `chart.type`. Charts sharing an endpoint are fetched once.
 */
export async function DynamicDashboardCharts({
  schema,
  user,
  token,
}: {
  schema: AdminSchema;
  user: AuthUser | null;
  token: string | null;
}) {
  const visible = schema.charts.filter((chart) => hasPermission(user, chart.permission));

  if (visible.length === 0) {
    return null;
  }

  const endpoints = Array.from(new Set(visible.map((chart) => chart.endpoint)));
  const responses = await Promise.all(endpoints.map((endpoint) => safeFetch(endpoint, token)));
  const responseByEndpoint = new Map(endpoints.map((endpoint, index) => [endpoint, responses[index]]));

  const charts = visible
    .map((chart) => {
      const response = responseByEndpoint.get(chart.endpoint);

      if (!response || typeof response !== 'object') {
        return null;
      }

      const value = getPath(response as Record<string, unknown>, chart.dataPath);

      return { chart, value };
    })
    .filter((entry): entry is { chart: ChartSchema; value: unknown } => entry !== null);

  if (charts.length === 0) {
    return null;
  }

  return (
    <>
      {charts.map(({ chart, value }) => {
        if (chart.type === 'area') {
          const rows = Array.isArray(value) ? (value as Record<string, string | number>[]) : [];

          if (rows.length === 0) {
            return null;
          }

          return (
            <Card key={chart.key}>
              <CardHeader>
                <CardTitle>{chart.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiSeriesAreaChart data={rows} xKey={chart.xKey ?? 'label'} series={chart.series ?? []} />
              </CardContent>
            </Card>
          );
        }

        const slices = toSlices(value);

        if (slices.length === 0) {
          return null;
        }

        return (
          <Card key={chart.key}>
            <CardHeader>
              <CardTitle>{chart.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {chart.type === 'donut' ? <StatusDonutChart data={slices} /> : <PipelineBarChart data={slices} />}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
