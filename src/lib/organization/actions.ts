'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/session';
import type { Paginated } from '@/lib/api/types';
import type { Branch, Department, Designation, Employee, OrgUser, Team } from './types';

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

function branchPayload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    code: String(formData.get('code') ?? ''),
    address: formData.get('address') ? String(formData.get('address')) : null,
    phone: formData.get('phone') ? String(formData.get('phone')) : null,
    email: formData.get('email') ? String(formData.get('email')) : null,
    is_head_office: formData.get('is_head_office') === 'on',
  };
}

export async function createBranch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Branch }>('/branches', { method: 'POST', token, body: branchPayload(formData) });
    revalidatePath('/organization/branches');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateBranch(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Branch }>(`/branches/${id}`, { method: 'PUT', token, body: branchPayload(formData) });
    revalidatePath('/organization/branches');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteBranch(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/branches/${id}`, { method: 'DELETE', token });
    revalidatePath('/organization/branches');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

function departmentPayload(formData: FormData) {
  const branchId = formData.get('branch_id');

  return {
    branch_id: branchId ? Number(branchId) : null,
    name: String(formData.get('name') ?? ''),
    code: String(formData.get('code') ?? ''),
    description: formData.get('description') ? String(formData.get('description')) : null,
  };
}

export async function createDepartment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Department }>('/departments', { method: 'POST', token, body: departmentPayload(formData) });
    revalidatePath('/organization/departments');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateDepartment(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Department }>(`/departments/${id}`, {
      method: 'PUT',
      token,
      body: departmentPayload(formData),
    });
    revalidatePath('/organization/departments');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteDepartment(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/departments/${id}`, { method: 'DELETE', token });
    revalidatePath('/organization/departments');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

function designationPayload(formData: FormData) {
  const departmentId = formData.get('department_id');
  const rank = formData.get('rank');

  return {
    department_id: departmentId ? Number(departmentId) : null,
    title: String(formData.get('title') ?? ''),
    rank: rank ? Number(rank) : null,
  };
}

export async function createDesignation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Designation }>('/designations', {
      method: 'POST',
      token,
      body: designationPayload(formData),
    });
    revalidatePath('/organization/designations');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateDesignation(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Designation }>(`/designations/${id}`, {
      method: 'PUT',
      token,
      body: designationPayload(formData),
    });
    revalidatePath('/organization/designations');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteDesignation(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/designations/${id}`, { method: 'DELETE', token });
    revalidatePath('/organization/designations');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

function optionalInt(formData: FormData, key: string): number | null {
  const value = formData.get(key);

  return value ? Number(value) : null;
}

function employeePayload(formData: FormData) {
  return {
    user_id: optionalInt(formData, 'user_id'),
    branch_id: optionalInt(formData, 'branch_id'),
    department_id: optionalInt(formData, 'department_id'),
    designation_id: optionalInt(formData, 'designation_id'),
    employee_code: String(formData.get('employee_code') ?? ''),
    first_name: String(formData.get('first_name') ?? ''),
    last_name: String(formData.get('last_name') ?? ''),
    email: formData.get('email') ? String(formData.get('email')) : null,
    phone: formData.get('phone') ? String(formData.get('phone')) : null,
    hire_date: String(formData.get('hire_date') ?? ''),
    employment_status: String(formData.get('employment_status') || 'active'),
  };
}

export async function createEmployee(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Employee }>('/employees', { method: 'POST', token, body: employeePayload(formData) });
    revalidatePath('/organization/employees');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function terminateEmployee(id: number, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    const terminationDate = String(formData.get('termination_date') ?? '');
    await apiFetch(`/employees/${id}/terminate`, {
      method: 'POST',
      token,
      body: terminationDate ? { termination_date: terminationDate } : {},
    });
    revalidatePath('/organization/employees');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

function teamPayload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    description: formData.get('description') ? String(formData.get('description')) : null,
    lead_employee_id: optionalInt(formData, 'lead_employee_id'),
  };
}

export async function createTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Team }>('/teams', { method: 'POST', token, body: teamPayload(formData) });
    revalidatePath('/organization/teams');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateTeamMembers(id: number, memberIds: number[]): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/teams/${id}/members`, { method: 'PUT', token, body: { members: memberIds } });
    revalidatePath('/organization/teams');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTeam(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/teams/${id}`, { method: 'DELETE', token });
    revalidatePath('/organization/teams');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    const roles = formData.getAll('roles').map(String);
    await apiFetch<{ data: OrgUser }>('/users', {
      method: 'POST',
      token,
      body: {
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        password_confirmation: String(formData.get('password_confirmation') ?? ''),
        roles,
      },
    });
    revalidatePath('/organization/users');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateUserRoles(id: number, roles: string[]): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/users/${id}/roles`, { method: 'PUT', token, body: { roles } });
    revalidatePath('/organization/users');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteUser(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/users/${id}`, { method: 'DELETE', token });
    revalidatePath('/organization/users');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function listAll<T>(path: string, token: string): Promise<T[]> {
  const response = await apiFetch<Paginated<T>>(`${path}?per_page=100`, { token });

  return response.data;
}
