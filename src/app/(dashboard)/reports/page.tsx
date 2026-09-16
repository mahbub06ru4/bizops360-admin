import Link from 'next/link';
import { FileBarChart2, UserSquare2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/organization/page-header';
import { getAdminSchema } from '@/lib/admin-schema/fetch';
import { getSession, hasPermission } from '@/lib/auth/session';

export default async function ReportsHubPage() {
  const [user, schema] = await Promise.all([getSession(), getAdminSchema()]);
  const visible = schema.resources.filter((resource) => hasPermission(user, resource.permissions.view));

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Every resource the backend schema describes, downloadable as PDF or Excel."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((resource) => (
          <Link key={resource.key} href={`/reports/${resource.key}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <FileBarChart2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{resource.pluralLabel}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {resource.columns.length} columns · generated from the backend schema.
              </CardContent>
            </Card>
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
            <UserSquare2 className="h-4 w-4" />
            No reports available for your role.
          </div>
        )}
      </div>
    </div>
  );
}
