'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/session';
import type { FieldSchema } from './types';

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

/** Coerces raw FormData into a JSON-ready payload using each field's declared type. */
function buildPayload(fields: FieldSchema[], formData: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = formData.get(field.key);

    switch (field.type) {
      case 'boolean':
        payload[field.key] = raw === 'on';
        break;
      case 'number':
        payload[field.key] = raw && String(raw).length > 0 ? Number(raw) : null;
        break;
      case 'relation':
        payload[field.key] = raw ? Number(raw) : null;
        break;
      default:
        payload[field.key] = raw && String(raw).length > 0 ? String(raw) : field.required ? '' : null;
    }
  }

  return payload;
}

/** A 'file' field means the request must stay multipart, not become JSON. */
function buildBody(fields: FieldSchema[], formData: FormData): Record<string, unknown> | FormData {
  return fields.some((field) => field.type === 'file') ? formData : buildPayload(fields, formData);
}

export async function createResourceRecord(
  endpoint: string,
  fields: FieldSchema[],
  listPath: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(endpoint, { method: 'POST', token, body: buildBody(fields, formData) });
    revalidatePath(listPath);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateResourceRecord(
  endpoint: string,
  id: number,
  fields: FieldSchema[],
  listPath: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`${endpoint}/${id}`, { method: 'PUT', token, body: buildBody(fields, formData) });
    revalidatePath(listPath);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

/** For `mode: 'singleton'` resources: PUT to the bare endpoint, no id. */
export async function updateSingletonRecord(
  endpoint: string,
  fields: FieldSchema[],
  listPath: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(endpoint, { method: 'PUT', token, body: buildBody(fields, formData) });
    revalidatePath(listPath);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteResourceRecord(endpoint: string, id: number, listPath: string): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`${endpoint}/${id}`, { method: 'DELETE', token });
    revalidatePath(listPath);

    return ok;
  } catch (error) {
    return fail(error);
  }
}
