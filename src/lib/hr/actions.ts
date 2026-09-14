'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/session';
import type {
  Attendance,
  AttendanceSetting,
  EmployeeDocument,
  Holiday,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  OfficeLocation,
} from './types';

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

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return value ? String(value) : null;
}

// --- Holidays ---------------------------------------------------------

function holidayPayload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    date: String(formData.get('date') ?? ''),
    is_recurring: formData.get('is_recurring') === 'on',
  };
}

export async function createHoliday(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Holiday }>('/holidays', { method: 'POST', token, body: holidayPayload(formData) });
    revalidatePath('/hr/holidays');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateHoliday(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Holiday }>(`/holidays/${id}`, { method: 'PUT', token, body: holidayPayload(formData) });
    revalidatePath('/hr/holidays');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteHoliday(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/holidays/${id}`, { method: 'DELETE', token });
    revalidatePath('/hr/holidays');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Leave types --------------------------------------------------------

function leaveTypePayload(formData: FormData) {
  const days = formData.get('default_days_per_year');

  return {
    name: String(formData.get('name') ?? ''),
    code: String(formData.get('code') ?? ''),
    default_days_per_year: days ? Number(days) : null,
    is_paid: formData.get('is_paid') === 'on',
    requires_approval: formData.get('requires_approval') === 'on',
  };
}

export async function createLeaveType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: LeaveType }>('/leave-types', { method: 'POST', token, body: leaveTypePayload(formData) });
    revalidatePath('/hr/leave-types');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateLeaveType(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: LeaveType }>(`/leave-types/${id}`, {
      method: 'PUT',
      token,
      body: leaveTypePayload(formData),
    });
    revalidatePath('/hr/leave-types');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteLeaveType(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/leave-types/${id}`, { method: 'DELETE', token });
    revalidatePath('/hr/leave-types');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Leave requests -------------------------------------------------------

export async function createLeaveRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    const employeeId = formData.get('employee_id');
    await apiFetch<{ data: LeaveRequest }>('/leave-requests', {
      method: 'POST',
      token,
      body: {
        employee_id: employeeId ? Number(employeeId) : null,
        leave_type_id: Number(formData.get('leave_type_id') ?? 0),
        start_date: String(formData.get('start_date') ?? ''),
        end_date: String(formData.get('end_date') ?? ''),
        reason: optionalString(formData, 'reason'),
      },
    });
    revalidatePath('/hr/leave-requests');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function approveLeaveRequest(id: number, note: string | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/leave-requests/${id}/approve`, { method: 'POST', token, body: { note } });
    revalidatePath('/hr/leave-requests');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function rejectLeaveRequest(id: number, note: string | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/leave-requests/${id}/reject`, { method: 'POST', token, body: { note } });
    revalidatePath('/hr/leave-requests');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function cancelLeaveRequest(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/leave-requests/${id}/cancel`, { method: 'POST', token });
    revalidatePath('/hr/leave-requests');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Leave balances -------------------------------------------------------

export async function upsertLeaveBalance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: LeaveBalance }>('/leave-balances', {
      method: 'PUT',
      token,
      body: {
        employee_id: Number(formData.get('employee_id') ?? 0),
        leave_type_id: Number(formData.get('leave_type_id') ?? 0),
        year: Number(formData.get('year') ?? new Date().getFullYear()),
        entitled_days: Number(formData.get('entitled_days') ?? 0),
      },
    });
    revalidatePath('/hr/leave-balances');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Attendance -------------------------------------------------------

export async function recordAttendance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    const checkIn = optionalString(formData, 'check_in_at');
    const checkOut = optionalString(formData, 'check_out_at');
    await apiFetch<{ data: Attendance }>('/attendance', {
      method: 'POST',
      token,
      body: {
        employee_id: Number(formData.get('employee_id') ?? 0),
        date: String(formData.get('date') ?? ''),
        status: String(formData.get('status') ?? 'present'),
        check_in_at: checkIn,
        check_out_at: checkOut,
        note: optionalString(formData, 'note'),
      },
    });
    revalidatePath('/hr/attendance');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Attendance settings -------------------------------------------------------

export async function updateAttendanceSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: AttendanceSetting }>('/attendance-settings', {
      method: 'PUT',
      token,
      body: {
        work_starts_at: String(formData.get('work_starts_at') ?? ''),
        work_ends_at: String(formData.get('work_ends_at') ?? ''),
        grace_minutes: Number(formData.get('grace_minutes') ?? 0),
      },
    });
    revalidatePath('/hr/attendance-settings');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateOfficeLocation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: OfficeLocation }>('/office-location', {
      method: 'PUT',
      token,
      body: {
        label: String(formData.get('label') ?? ''),
        latitude: Number(formData.get('latitude') ?? 0),
        longitude: Number(formData.get('longitude') ?? 0),
        radius_meters: Number(formData.get('radius_meters') ?? 0),
        start_time: String(formData.get('start_time') ?? ''),
        end_time: String(formData.get('end_time') ?? ''),
      },
    });
    revalidatePath('/hr/office-location');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Employee documents -------------------------------------------------------

export async function uploadEmployeeDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: EmployeeDocument }>('/employee-documents', { method: 'POST', token, body: formData });
    revalidatePath('/hr/employee-documents');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteEmployeeDocument(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/employee-documents/${id}`, { method: 'DELETE', token });
    revalidatePath('/hr/employee-documents');

    return ok;
  } catch (error) {
    return fail(error);
  }
}
