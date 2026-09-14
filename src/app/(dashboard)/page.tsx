import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSession } from '@/lib/auth/session';

export default async function DashboardPage() {
  const user = await getSession();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground">
          {user?.tenant ? `${user.tenant.name} · ${user.tenant.industry ?? 'no industry set'}` : 'Platform administrator'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your role</CardTitle>
            <CardDescription>{user?.roles.join(', ') || 'No role assigned'}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>{user?.permissions?.length ?? 0} granted</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>Business screens land phase by phase, starting with Organization.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This is the Phase 0 foundation — auth, layout, and the permission-driven nav are live. See the plan doc for the full build order.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
