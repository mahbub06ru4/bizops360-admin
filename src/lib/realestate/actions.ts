'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/session';
import type {
  Amenity,
  Building,
  LandRecord,
  LandShare,
  Project,
  ProjectDocument,
  ProjectLocation,
  ProjectPaymentPlan,
  ProjectPricing,
  Unit,
  UnitMedia,
  UnitPrice,
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

function revalidateProject(id: number) {
  revalidatePath('/real-estate/projects');
  revalidatePath(`/real-estate/projects/${id}`);
}

// --- Projects ---------------------------------------------------------

function projectPayload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    project_type: String(formData.get('project_type') || 'apartment'),
    description: optionalString(formData, 'description'),
    total_land_area: optionalString(formData, 'total_land_area'),
    currency: String(formData.get('currency') || 'BDT'),
  };
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Project }>('/real-estate/projects', { method: 'POST', token, body: projectPayload(formData) });
    revalidatePath('/real-estate/projects');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function updateProject(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Project }>(`/real-estate/projects/${id}`, {
      method: 'PUT',
      token,
      body: projectPayload(formData),
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProject(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/real-estate/projects/${id}`, { method: 'DELETE', token });
    revalidatePath('/real-estate/projects');

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function submitProject(id: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/real-estate/projects/${id}/submit`, { method: 'POST', token });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Location / pricing / payment plans / land shares / land records ------

export async function setProjectLocation(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: ProjectLocation }>(`/real-estate/projects/${id}/location`, {
      method: 'POST',
      token,
      body: {
        division: optionalString(formData, 'division'),
        district: optionalString(formData, 'district'),
        area: optionalString(formData, 'area'),
        sector: optionalString(formData, 'sector'),
        road: optionalString(formData, 'road'),
        landmark: optionalString(formData, 'landmark'),
        latitude: optionalString(formData, 'latitude'),
        longitude: optionalString(formData, 'longitude'),
      },
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function setProjectPricing(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: ProjectPricing }>(`/real-estate/projects/${id}/pricing`, {
      method: 'POST',
      token,
      body: {
        land_cost: optionalString(formData, 'land_cost'),
        construction_cost: optionalString(formData, 'construction_cost'),
        consultancy_cost: optionalString(formData, 'consultancy_cost'),
        currency: String(formData.get('currency') || 'BDT'),
      },
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function addPaymentPlan(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: ProjectPaymentPlan }>(`/real-estate/projects/${id}/payment-plans`, {
      method: 'POST',
      token,
      body: {
        name: String(formData.get('name') ?? ''),
        down_payment_percent: Number(formData.get('down_payment_percent') ?? 0),
        installment_count: Number(formData.get('installment_count') ?? 1),
        installment_frequency: String(formData.get('installment_frequency') || 'monthly'),
      },
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function addLandShare(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: LandShare }>(`/real-estate/projects/${id}/land-shares`, {
      method: 'POST',
      token,
      body: {
        total_shares: Number(formData.get('total_shares') ?? 0),
        share_value: Number(formData.get('share_value') ?? 0),
      },
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function addLandRecord(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: LandRecord }>(`/real-estate/projects/${id}/land-records`, {
      method: 'POST',
      token,
      body: {
        mouza: optionalString(formData, 'mouza'),
        jl_no: optionalString(formData, 'jl_no'),
        khatian_no: optionalString(formData, 'khatian_no'),
        dag_no: optionalString(formData, 'dag_no'),
      },
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Documents ---------------------------------------------------------

export async function uploadProjectDocument(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: ProjectDocument }>(`/real-estate/projects/${id}/documents`, {
      method: 'POST',
      token,
      body: formData,
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Amenities ---------------------------------------------------------

export async function addAmenity(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Amenity }>(`/real-estate/projects/${id}/amenities`, {
      method: 'POST',
      token,
      body: { name: String(formData.get('name') ?? ''), icon: optionalString(formData, 'icon') },
    });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteAmenity(projectId: number, amenityId: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/real-estate/amenities/${amenityId}`, { method: 'DELETE', token });
    revalidateProject(projectId);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Buildings ---------------------------------------------------------

export async function addBuilding(projectId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: Building }>(`/real-estate/projects/${projectId}/buildings`, {
      method: 'POST',
      token,
      body: {
        name: String(formData.get('name') ?? ''),
        total_floors: Number(formData.get('total_floors') ?? 1),
      },
    });
    revalidateProject(projectId);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteBuilding(projectId: number, buildingId: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/real-estate/buildings/${buildingId}`, { method: 'DELETE', token });
    revalidateProject(projectId);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Units ---------------------------------------------------------

export async function addUnit(projectId: number, buildingId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    const facing = formData.get('facing');
    await apiFetch<{ data: Unit }>(`/real-estate/buildings/${buildingId}/units`, {
      method: 'POST',
      token,
      body: {
        unit_number: String(formData.get('unit_number') ?? ''),
        floor: Number(formData.get('floor') ?? 0),
        size_sqft: Number(formData.get('size_sqft') ?? 0),
        bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null,
        bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : null,
        facing: facing ? String(facing) : null,
        parking_spaces: Number(formData.get('parking_spaces') ?? 0),
      },
    });
    revalidateProject(projectId);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function deleteUnit(projectId: number, unitId: number): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/real-estate/units/${unitId}`, { method: 'DELETE', token });
    revalidateProject(projectId);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function addUnitPrice(projectId: number, unitId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: UnitPrice }>(`/real-estate/units/${unitId}/prices`, {
      method: 'POST',
      token,
      body: {
        price: Number(formData.get('price') ?? 0),
        price_type: String(formData.get('price_type') || 'current'),
        effective_from: optionalString(formData, 'effective_from'),
      },
    });
    revalidateProject(projectId);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function addUnitMedia(projectId: number, unitId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch<{ data: UnitMedia }>(`/real-estate/units/${unitId}/media`, {
      method: 'POST',
      token,
      body: formData,
    });
    revalidateProject(projectId);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

// --- Platform-admin verification ---------------------------------------

export async function verifyProject(id: number, notes: string | null): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/real-estate/projects/${id}/verify`, { method: 'POST', token, body: { notes } });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}

export async function rejectProject(id: number, notes: string): Promise<ActionState> {
  try {
    const token = await requireToken();
    await apiFetch(`/real-estate/projects/${id}/reject`, { method: 'POST', token, body: { notes } });
    revalidateProject(id);

    return ok;
  } catch (error) {
    return fail(error);
  }
}
