export const PROJECT_STATUSES = ['draft', 'pending_verification', 'verified', 'rejected'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = ['apartment', 'land_share', 'commercial', 'plot'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_DOCUMENT_TYPES = ['rajuk_approval', 'land_deed', 'mutation', 'other'] as const;
export type ProjectDocumentType = (typeof PROJECT_DOCUMENT_TYPES)[number];

export const PAYMENT_PLAN_FREQUENCIES = ['monthly', 'quarterly'] as const;
export type PaymentPlanFrequency = (typeof PAYMENT_PLAN_FREQUENCIES)[number];

export const UNIT_FACINGS = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'] as const;
export type UnitFacing = (typeof UNIT_FACINGS)[number];

export const UNIT_STATUSES = ['available', 'reserved', 'sold'] as const;
export type UnitStatus = (typeof UNIT_STATUSES)[number];

export const UNIT_MEDIA_TYPES = ['image', 'floor_plan', 'video'] as const;
export type UnitMediaType = (typeof UNIT_MEDIA_TYPES)[number];

export const UNIT_PRICE_TYPES = ['base', 'current', 'per_sqft'] as const;
export type UnitPriceType = (typeof UNIT_PRICE_TYPES)[number];

export const VERIFICATION_DECISIONS = ['pending', 'verified', 'rejected'] as const;
export type VerificationDecision = (typeof VERIFICATION_DECISIONS)[number];

export interface ProjectLocation {
  id: number;
  division: string | null;
  district: string | null;
  area: string | null;
  sector: string | null;
  road: string | null;
  landmark: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface ProjectPricing {
  id: number;
  land_cost: string;
  construction_cost: string;
  consultancy_cost: string;
  estimated_total: string;
  currency: string;
}

export interface ProjectPaymentPlan {
  id: number;
  name: string;
  down_payment_percent: string;
  installment_count: number;
  installment_frequency: PaymentPlanFrequency;
}

export interface LandShare {
  id: number;
  total_shares: number;
  share_value: string;
}

export interface LandRecord {
  id: number;
  project_id: number;
  mouza: string | null;
  jl_no: string | null;
  khatian_no: string | null;
  dag_no: string | null;
}

export interface ProjectDocument {
  id: number;
  project_id: number;
  document_type: ProjectDocumentType;
  is_private: boolean;
  uploaded_by: number | null;
  created_at: string;
}

export interface UnitMedia {
  id: number;
  file_path: string;
  media_type: UnitMediaType;
  sort_order: number;
}

export interface UnitPrice {
  id: number;
  price: string;
  price_type: UnitPriceType;
  effective_from: string | null;
}

export interface Unit {
  id: number;
  building_id: number;
  unit_number: string;
  floor: number;
  size_sqft: string;
  bedrooms: number | null;
  bathrooms: number | null;
  facing: UnitFacing | null;
  parking_spaces: number;
  status: UnitStatus;
  media?: UnitMedia[];
  prices?: UnitPrice[];
}

export interface Building {
  id: number;
  project_id: number;
  name: string;
  total_floors: number;
  units?: Unit[];
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

export interface VerificationReview {
  id: number;
  project_id: number;
  reviewed_by: number | null;
  decision: VerificationDecision;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  project_type: ProjectType;
  description: string | null;
  status: ProjectStatus;
  total_land_area: string | null;
  currency: string;
  locations?: ProjectLocation[];
  amenities?: Amenity[];
  pricing?: ProjectPricing;
  payment_plans?: ProjectPaymentPlan[];
  buildings?: Building[];
  land_shares?: LandShare[];
  verification_reviews?: VerificationReview[];
  created_by: number | null;
  created_at: string;
  updated_at: string;
}
