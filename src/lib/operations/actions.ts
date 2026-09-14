'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/session';
import type { Project, Task, TaskAttachment, TaskComment } from './types';

export interface ActionState {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
}

const ok: ActionState = { error: null };

function fail(error: unknown): ActionState {
  if (error instanceof ApiError) {
    return { error: error.message, fieldErrors: error.validationErrors };
  }

  return { error: 'Something went wrong. Try again.' };
}

async function requireToken(): Promise<string> {
  const token = await getToken();

  if (token === null) {
    throw new ApiError(401, { message: 'Not authenticated.' });
  }

  return token;
}

function optionalInt(formData: FormData, key: string): number | null {
  const value = formData.get(key);

  return value ? Number(value) : null;
}

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return value ? String(value) : null;
}

// --- Projects ---------------------------------------------------------

function projectPayload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    code: String(formData.get('code') ?? ''),
    description: optionalString(formData, 'description'),
    status: String(formData.get('status') || 'planning'),
    department_id: optionalInt(formData, 'department_id'),
    lead_employee_id: optionalInt(formData, 'lead_employee_id'),
    start_date: optionalString(formData, 'start_date'),
    due_date: optionalString(formData, 'due_date'),
  };
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Project }>('/projects', { method: 'POST', token, body: projectPayload(formData) });
    revalidatePath('/operations/projects');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateProject(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Project }>(`/projects/${id}`, { method: 'PUT', token, body: projectPayload(formData) });
    revalidatePath('/operations/projects');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProject(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/projects/${id}`, { method: 'DELETE', token });
    revalidatePath('/operations/projects');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Tasks ---------------------------------------------------------

function taskPayload(formData: FormData) {
  return {
    project_id: optionalInt(formData, 'project_id'),
    parent_task_id: optionalInt(formData, 'parent_task_id'),
    title: String(formData.get('title') ?? ''),
    description: optionalString(formData, 'description'),
    priority: String(formData.get('priority') || 'normal'),
    due_at: optionalString(formData, 'due_at'),
  };
}

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Task }>('/tasks', { method: 'POST', token, body: taskPayload(formData) });
    revalidatePath('/operations/tasks');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateTask(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Task }>(`/tasks/${id}`, { method: 'PUT', token, body: taskPayload(formData) });
    revalidatePath('/operations/tasks');
    revalidatePath(`/operations/tasks/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function assignTask(id: number, employeeId: number | null, teamId: number | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/tasks/${id}/assignee`, {
      method: 'PUT',
      token,
      body: { assignee_employee_id: employeeId, assignee_team_id: teamId },
    });
    revalidatePath('/operations/tasks');
    revalidatePath(`/operations/tasks/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function changeTaskStatus(id: number, status: string): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/tasks/${id}/status`, { method: 'PUT', token, body: { status } });
    revalidatePath('/operations/tasks');
    revalidatePath(`/operations/tasks/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTask(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/tasks/${id}`, { method: 'DELETE', token });
    revalidatePath('/operations/tasks');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Task comments ---------------------------------------------------------

export async function addTaskComment(taskId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: TaskComment }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      token,
      body: { body: String(formData.get('body') ?? '') },
    });
    revalidatePath(`/operations/tasks/${taskId}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTaskComment(taskId: number, commentId: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/task-comments/${commentId}`, { method: 'DELETE', token });
    revalidatePath(`/operations/tasks/${taskId}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Task attachments ---------------------------------------------------------

export async function uploadTaskAttachment(taskId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: TaskAttachment }>(`/tasks/${taskId}/attachments`, { method: 'POST', token, body: formData });
    revalidatePath(`/operations/tasks/${taskId}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTaskAttachment(taskId: number, attachmentId: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/task-attachments/${attachmentId}`, { method: 'DELETE', token });
    revalidatePath(`/operations/tasks/${taskId}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}
