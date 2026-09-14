import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { TaskAssigneeDialog } from '@/components/operations/task-assignee-dialog';
import { TaskAttachmentDialog } from '@/components/operations/task-attachment-dialog';
import { TaskCommentForm } from '@/components/operations/task-comment-form';
import { TaskDialog } from '@/components/operations/task-dialog';
import { TaskStatusSelect } from '@/components/operations/task-status-select';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteTaskAttachment, deleteTaskComment } from '@/lib/operations/actions';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Project, Task, TaskActivity, TaskAttachment, TaskComment } from '@/lib/operations/types';
import type { Employee, Team } from '@/lib/organization/types';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taskId = Number(id);
  const token = await getToken();

  const [{ data: task }, { data: comments }, { data: activities }, { data: attachments }, projects, employees, teams] =
    await Promise.all([
      apiFetch<{ data: Task }>(`/tasks/${taskId}`, { token }),
      apiFetch<Paginated<TaskComment>>(`/tasks/${taskId}/comments`, { token }),
      apiFetch<Paginated<TaskActivity>>(`/tasks/${taskId}/activities`, { token }),
      apiFetch<Paginated<TaskAttachment>>(`/tasks/${taskId}/attachments`, { token }),
      listAll<Project>('/projects', token ?? ''),
      listAll<Employee>('/employees', token ?? ''),
      listAll<Team>('/teams', token ?? ''),
    ]);

  return (
    <div>
      <PageHeader
        title={task.title}
        description={task.project ? `In ${task.project.name}` : 'No project'}
        action={
          <div className="flex gap-1">
            <TaskAssigneeDialog task={task} employees={employees} teams={teams} />
            <TaskDialog task={task} projects={projects} />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TaskStatusSelect taskId={task.id} status={task.status} />
        <Badge variant="outline" className="capitalize">
          {task.priority}
        </Badge>
        {task.is_overdue && <Badge variant="destructive">Overdue</Badge>}
        <span className="text-sm text-muted-foreground">
          Assigned to {task.assignee_employee?.full_name ?? 'nobody'}
        </span>
      </div>

      {task.description && <p className="mb-6 whitespace-pre-wrap text-sm text-muted-foreground">{task.description}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TaskCommentForm taskId={task.id} />
            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start justify-between gap-2 border-t pt-3">
                  <div>
                    <p className="text-sm font-medium">{comment.author_name ?? 'Unknown'}</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{comment.body}</p>
                  </div>
                  <DeleteRowButton
                    label="comment"
                    confirmMessage="Delete this comment?"
                    action={deleteTaskComment.bind(null, task.id, comment.id)}
                  />
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TaskAttachmentDialog taskId={task.id} />
            <div className="flex flex-col gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between gap-2 border-t pt-2">
                  <Button variant="link" size="sm" asChild className="h-auto px-0">
                    <a href={attachment.download_url}>{attachment.original_name}</a>
                  </Button>
                  <DeleteRowButton
                    label={attachment.original_name}
                    confirmMessage={`Delete "${attachment.original_name}"?`}
                    action={deleteTaskAttachment.bind(null, task.id, attachment.id)}
                  />
                </div>
              ))}
              {attachments.length === 0 && <p className="text-sm text-muted-foreground">No attachments yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex justify-between gap-2 border-t pt-2 text-sm">
                <span>
                  <span className="font-medium">{activity.causer_name ?? 'System'}</span> {activity.description}
                </span>
                <span className="text-muted-foreground">{activity.created_at}</span>
              </div>
            ))}
            {activities.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/operations/tasks" className="text-sm text-muted-foreground hover:underline">
          ← Back to tasks
        </Link>
      </div>
    </div>
  );
}
