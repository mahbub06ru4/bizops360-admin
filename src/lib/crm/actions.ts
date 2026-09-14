'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/session';
import type { Contact, Customer, FollowUp, Lead } from './types';

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

function partyPayload(formData: FormData) {
  return {
    owner_employee_id: optionalInt(formData, 'owner_employee_id'),
    name: String(formData.get('name') ?? ''),
    type: String(formData.get('type') || 'individual'),
    company: optionalString(formData, 'company'),
    email: optionalString(formData, 'email'),
    phone: optionalString(formData, 'phone'),
    address: optionalString(formData, 'address'),
  };
}

// --- Leads ---------------------------------------------------------

function leadPayload(formData: FormData) {
  const value = formData.get('estimated_value');

  return {
    owner_employee_id: optionalInt(formData, 'owner_employee_id'),
    name: String(formData.get('name') ?? ''),
    company: optionalString(formData, 'company'),
    email: optionalString(formData, 'email'),
    phone: optionalString(formData, 'phone'),
    source: optionalString(formData, 'source'),
    estimated_value: value ? Number(value) : null,
    notes: optionalString(formData, 'notes'),
  };
}

export async function createLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Lead }>('/leads', { method: 'POST', token, body: leadPayload(formData) });
    revalidatePath('/crm/leads');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateLead(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Lead }>(`/leads/${id}`, { method: 'PUT', token, body: leadPayload(formData) });
    revalidatePath('/crm/leads');
    revalidatePath(`/crm/leads/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function moveLeadStage(id: number, stage: string, lostReason: string | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/leads/${id}/stage`, {
      method: 'PUT',
      token,
      body: { stage, lost_reason: lostReason },
    });
    revalidatePath('/crm/leads');
    revalidatePath(`/crm/leads/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function convertLead(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/leads/${id}/convert`, { method: 'POST', token, body: {} });
    revalidatePath('/crm/leads');
    revalidatePath(`/crm/leads/${id}`);
    revalidatePath('/crm/customers');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteLead(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/leads/${id}`, { method: 'DELETE', token });
    revalidatePath('/crm/leads');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Customers ---------------------------------------------------------

export async function createCustomer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Customer }>('/customers', { method: 'POST', token, body: partyPayload(formData) });
    revalidatePath('/crm/customers');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateCustomer(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Customer }>(`/customers/${id}`, { method: 'PUT', token, body: partyPayload(formData) });
    revalidatePath('/crm/customers');
    revalidatePath(`/crm/customers/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCustomer(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/customers/${id}`, { method: 'DELETE', token });
    revalidatePath('/crm/customers');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Contacts ---------------------------------------------------------

function contactPayload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    title: optionalString(formData, 'title'),
    email: optionalString(formData, 'email'),
    phone: optionalString(formData, 'phone'),
    is_primary: formData.get('is_primary') === 'on',
    notes: optionalString(formData, 'notes'),
  };
}

export async function addContact(
  parent: 'leads' | 'customers',
  parentId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Contact }>(`/${parent}/${parentId}/contacts`, {
      method: 'POST',
      token,
      body: contactPayload(formData),
    });
    revalidatePath(`/crm/${parent}/${parentId}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteContact(parent: 'leads' | 'customers', parentId: number, contactId: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/contacts/${contactId}`, { method: 'DELETE', token });
    revalidatePath(`/crm/${parent}/${parentId}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Follow-ups ---------------------------------------------------------

function followUpPayload(formData: FormData) {
  return {
    assigned_employee_id: optionalInt(formData, 'assigned_employee_id'),
    type: String(formData.get('type') || 'call'),
    due_at: String(formData.get('due_at') ?? ''),
    notes: optionalString(formData, 'notes'),
  };
}

export async function scheduleFollowUp(
  parent: 'leads' | 'customers',
  parentId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: FollowUp }>(`/${parent}/${parentId}/follow-ups`, {
      method: 'POST',
      token,
      body: followUpPayload(formData),
    });
    revalidatePath(`/crm/${parent}/${parentId}`);
    revalidatePath('/crm/follow-ups');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function completeFollowUp(id: number, outcome: string | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/follow-ups/${id}/complete`, { method: 'POST', token, body: { outcome } });
    revalidatePath('/crm/follow-ups');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function cancelFollowUp(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/follow-ups/${id}/cancel`, { method: 'POST', token });
    revalidatePath('/crm/follow-ups');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFollowUp(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/follow-ups/${id}`, { method: 'DELETE', token });
    revalidatePath('/crm/follow-ups');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Notes (CRM activities) ---------------------------------------------------------

export async function addCrmNote(
  parent: 'leads' | 'customers',
  parentId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/${parent}/${parentId}/notes`, {
      method: 'POST',
      token,
      body: { body: String(formData.get('body') ?? '') },
    });
    revalidatePath(`/crm/${parent}/${parentId}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}
