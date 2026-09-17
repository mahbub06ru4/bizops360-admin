import { Building2, Layers, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicDashboardCharts } from '@/components/dashboard/dynamic-dashboard-charts';
import { getAdminSchema } from '@/lib/admin-schema/fetch';
import { getSession, getToken } from '@/lib/auth/session';

export default async function DashboardPage() {
  const [user, token, schema] = await Promise.all([getSession(), getToken(), getAdminSchema()]);
  const firstName = user?.name.split(' ')[0] ?? '';

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

      <div className="grid gap-4 lg:grid-cols-2">
        <DynamicDashboardCharts schema={schema} user={user} token={token} />
      </div>

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
