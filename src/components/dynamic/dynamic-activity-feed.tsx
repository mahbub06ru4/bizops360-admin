import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicActivityNoteForm } from '@/components/dynamic/dynamic-activity-note-form';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { hasPermission } from '@/lib/auth/session';
import type { ActivityFeedSchema } from '@/lib/admin-schema/types';
import type { AuthUser, Paginated } from '@/lib/api/types';

interface ActivityEntry {
  id: number;
  causer_name?: string | null;
  description?: string | null;
  created_at?: string | null;
}

async function safeFetchActivity(endpoint: string, token: string | null): Promise<ActivityEntry[]> {
  try {
    const { data } = await apiFetch<Paginated<ActivityEntry>>(`${endpoint}?per_page=50`, { token });

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      return [];
    }

    throw error;
  }
}

/** A read-only activity timeline plus an optional freeform note form. */
export async function DynamicActivityFeed({
  activity,
  parentId,
  listPath,
  user,
  token,
}: {
  activity: ActivityFeedSchema;
  parentId: number;
  listPath: string;
  user: AuthUser | null;
  token: string | null;
}) {
  if (!hasPermission(user, activity.permission)) {
    return null;
  }

  const listEndpoint = activity.listEndpoint.replace('{id}', String(parentId));
  const entries = await safeFetchActivity(listEndpoint, token);
  const canNote = activity.noteEndpoint && activity.notePermission && hasPermission(user, activity.notePermission);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{activity.label}</CardTitle>
      </CardHeader>
      <CardContent>
        {canNote && (
          <DynamicActivityNoteForm noteEndpoint={activity.noteEndpoint!.replace('{id}', String(parentId))} listPath={listPath} />
        )}
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div key={entry.id} className="flex justify-between gap-2 border-t pt-2 text-sm first:border-t-0 first:pt-0">
              <span>
                <span className="font-medium">{entry.causer_name ?? 'System'}</span> {entry.description}
              </span>
              <span className="text-muted-foreground">{entry.created_at}</span>
            </div>
          ))}
          {entries.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
