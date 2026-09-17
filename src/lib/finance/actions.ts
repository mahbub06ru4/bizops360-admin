'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/session';
import type { Expense, Income, Invoice, InvoicePayment, InvoiceRefund } from './types';

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

// --- Incomes ---------------------------------------------------------

function incomePayload(formData: FormData) {
  return {
    customer_id: optionalInt(formData, 'customer_id'),
    category: String(formData.get('category') || 'customer_payment'),
    source: optionalString(formData, 'source'),
    amount: Number(formData.get('amount') ?? 0),
    received_on: String(formData.get('received_on') ?? ''),
    method: String(formData.get('method') || 'cash'),
    reference: optionalString(formData, 'reference'),
    note: optionalString(formData, 'note'),
  };
}

export async function createIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Income }>('/incomes', { method: 'POST', token, body: incomePayload(formData) });
    revalidatePath('/finance/incomes');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateIncome(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Income }>(`/incomes/${id}`, { method: 'PUT', token, body: incomePayload(formData) });
    revalidatePath('/finance/incomes');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteIncome(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/incomes/${id}`, { method: 'DELETE', token });
    revalidatePath('/finance/incomes');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Expenses ---------------------------------------------------------

function expensePayload(formData: FormData) {
  return {
    category: String(formData.get('category') || 'office'),
    employee_id: optionalInt(formData, 'employee_id'),
    supplier_name: optionalString(formData, 'supplier_name'),
    title: String(formData.get('title') ?? ''),
    amount: Number(formData.get('amount') ?? 0),
    spent_on: String(formData.get('spent_on') ?? ''),
    method: String(formData.get('method') || 'cash'),
    reference: optionalString(formData, 'reference'),
    note: optionalString(formData, 'note'),
  };
}

export async function createExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Expense }>('/expenses', { method: 'POST', token, body: expensePayload(formData) });
    revalidatePath('/finance/expenses');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateExpense(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Expense }>(`/expenses/${id}`, { method: 'PUT', token, body: expensePayload(formData) });
    revalidatePath('/finance/expenses');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteExpense(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/expenses/${id}`, { method: 'DELETE', token });
    revalidatePath('/finance/expenses');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function approveExpense(id: number, note: string | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/expenses/${id}/approve`, { method: 'POST', token, body: { note } });
    revalidatePath('/finance/expenses');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function rejectExpense(id: number, note: string | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/expenses/${id}/reject`, { method: 'POST', token, body: { note } });
    revalidatePath('/finance/expenses');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Invoices ---------------------------------------------------------

function invoicePayload(formData: FormData) {
  return {
    customer_id: Number(formData.get('customer_id') ?? 0),
    issue_date: String(formData.get('issue_date') ?? ''),
    due_date: optionalString(formData, 'due_date'),
    amount: Number(formData.get('amount') ?? 0),
    notes: optionalString(formData, 'notes'),
  };
}

export async function createInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Invoice }>('/invoices', { method: 'POST', token, body: invoicePayload(formData) });
    revalidatePath('/admin/invoices');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateInvoice(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Invoice }>(`/invoices/${id}`, { method: 'PUT', token, body: invoicePayload(formData) });
    revalidatePath('/admin/invoices');
    revalidatePath(`/finance/invoices/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteInvoice(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/invoices/${id}`, { method: 'DELETE', token });
    revalidatePath('/admin/invoices');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function sendInvoice(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/invoices/${id}/send`, { method: 'POST', token });
    revalidatePath('/admin/invoices');
    revalidatePath(`/finance/invoices/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function voidInvoice(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/invoices/${id}/void`, { method: 'POST', token });
    revalidatePath('/admin/invoices');
    revalidatePath(`/finance/invoices/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function recordInvoicePayment(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: InvoicePayment }>(`/invoices/${id}/payments`, {
      method: 'POST',
      token,
      body: {
        amount: Number(formData.get('amount') ?? 0),
        paid_on: String(formData.get('paid_on') ?? ''),
        method: String(formData.get('method') || 'cash'),
        reference: optionalString(formData, 'reference'),
        note: optionalString(formData, 'note'),
      },
    });
    revalidatePath('/admin/invoices');
    revalidatePath(`/finance/invoices/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function refundInvoice(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: InvoiceRefund }>(`/invoices/${id}/refunds`, {
      method: 'POST',
      token,
      body: {
        payment_id: optionalInt(formData, 'payment_id'),
        amount: Number(formData.get('amount') ?? 0),
        refunded_on: String(formData.get('refunded_on') ?? ''),
        method: String(formData.get('method') || 'cash'),
        reason: optionalString(formData, 'reason'),
      },
    });
    revalidatePath('/admin/invoices');
    revalidatePath(`/finance/invoices/${id}`);

    return ok;
  } catch (error) {
    return fail(error);
  }
}
