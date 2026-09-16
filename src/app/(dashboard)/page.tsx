import { Building2, Layers, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinanceTrendChart, type FinanceTrendPoint } from '@/components/dashboard/finance-trend-chart';
import { PipelineBarChart, type PipelineBar } from '@/components/dashboard/pipeline-bar-chart';
import { StatusDonutChart, type DonutSlice } from '@/components/dashboard/status-donut-chart';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import type { CrmOverview } from '@/lib/crm/types';
import type { OperationsOverview } from '@/lib/operations/types';
import type { MonthlyFinanceReport } from '@/lib/finance/types';

function titleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function safeFetch<T>(path: string, token: string | null): Promise<T | null> {
  try {
    return await apiFetch<T>(path, { token });
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
}

export default async function DashboardPage() {
  const [user, token] = await Promise.all([getSession(), getToken()]);
  const firstName = user?.name.split(' ')[0] ?? '';

  const canViewFinance = hasPermission(user, 'finance.view_reports');
  const canViewOperations = hasPermission(user, 'operations.view_dashboard');
  const canViewCrm = hasPermission(user, 'crm.view_dashboard');

  const [monthly, operations, crm] = await Promise.all([
    canViewFinance
      ? safeFetch<{ data: MonthlyFinanceReport }>(`/finance/monthly?year=${new Date().getFullYear()}`, token)
      : null,
    canViewOperations ? safeFetch<{ data: OperationsOverview }>('/operations/overview', token) : null,
    canViewCrm ? safeFetch<{ data: CrmOverview }>('/crm/overview', token) : null,
  ]);

  const financeTrend: FinanceTrendPoint[] =
    monthly?.data.months.map((month) => ({
      label: month.label,
      income: Number(month.income),
      expense: Number(month.expense),
    })) ?? [];

  const taskStatus: DonutSlice[] = operations
    ? Object.entries(operations.data.tasks.by_status)
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label: titleCase(label), value }))
    : [];

  const projectStatus: DonutSlice[] = operations
    ? Object.entries(operations.data.projects.by_status)
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label: titleCase(label), value }))
    : [];

  const leadPipeline: PipelineBar[] = crm
    ? Object.entries(crm.data.leads.by_stage).map(([label, value]) => ({ label: titleCase(label), value }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground shadow-sm sm:px-8">
        <p className="text-sm font-medium text-primary-foreground/80">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{firstName}</h1>
        <p className="mt-2 text-sm text-primary-foreground/85">
          {user?.tenant
            ? `${user.tenant.name} · ${user.tenant.industry ?? 'no industry set'}`
            : 'Platform administrator'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your role</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1 text-lg font-semibold capitalize">{user?.roles.join(', ') || 'No role assigned'}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Permissions</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1 text-lg font-semibold">{user?.permissions?.length ?? 0} granted</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tenant</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1 text-lg font-semibold">{user?.tenant?.name ?? 'Platform'}</CardContent>
        </Card>
      </div>

      {monthly && (
        <Card>
          <CardHeader>
            <CardTitle>Income vs. expense ({monthly.data.year})</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceTrendChart data={financeTrend} />
          </CardContent>
        </Card>
      )}

      {operations && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDonutChart data={taskStatus} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Projects by status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDonutChart data={projectStatus} />
            </CardContent>
          </Card>
        </div>
      )}

      {crm && (
        <Card>
          <CardHeader>
            <CardTitle>Sales pipeline by stage</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineBarChart data={leadPipeline} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Getting around</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the sidebar to jump between Organization, HR, Operations, CRM, and Finance — each section shows only the
          screens your role has permission for.
        </CardContent>
      </Card>
    </div>
  );
}
