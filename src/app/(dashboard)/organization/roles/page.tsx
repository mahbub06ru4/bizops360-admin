import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/organization/page-header';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { Role } from '@/lib/organization/types';

export default async function RolesPage() {
  const token = await getToken();
  const { data: roles } = await apiFetch<{ data: Role[] }>('/roles', { token });

  return (
    <div>
      <PageHeader title="Roles" description="Fixed per-tenant roles and what each one can do." />

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <CardTitle className="capitalize">{role.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-muted-foreground">{role.permissions.length} permissions</p>
              <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="font-normal">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
