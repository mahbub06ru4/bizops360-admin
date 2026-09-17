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
      case 'relation-multi':
        payload[field.key] = formData.getAll(field.key).map((value) => Number(value));
        break;
      case 'multiselect':
        payload[field.key] = formData.getAll(field.key).map((value) => String(value));
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

/** Runs a schema-declared row action (approve, convert, terminate, ...). */
export async function invokeResourceAction(
  method: 'POST' | 'PUT' | 'DELETE',
  endpointTemplate: string,
  id: number | null,
  fields: FieldSchema[],
  listPath: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    const endpoint = id === null ? endpointTemplate : endpointTemplate.replace('{id}', String(id));
    const body = fields.length > 0 ? buildPayload(fields, formData) : undefined;
    await apiFetch(endpoint, { method, token, body });
    revalidatePath(listPath);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

/** Posts a freeform note to a detail page's activity feed ({ body }). */
export async function addActivityNote(
  noteEndpoint: string,
  listPath: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(noteEndpoint, { method: 'POST', token, body: { body: String(formData.get('body') ?? '') } });
    revalidatePath(listPath);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

/** Fetches a single record fresh — used by actions with `fetchDetail` to prefill fields the list row doesn't carry. */
export async function fetchResourceDetail(endpoint: string, id: number): Promise<Record<string, unknown> | null> {
  try {
    const token = await requireToken();
    const { data } = await apiFetch<{ data: Record<string, unknown> }>(`${endpoint}/${id}`, { token });

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
}
