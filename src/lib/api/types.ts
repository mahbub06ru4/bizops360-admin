/**
 * Shapes returned by bizops360-api. Kept intentionally minimal in Phase 0 —
 * add fields here as each module phase starts consuming them, rather than
 * guessing the full backend contract up front. Source of truth is always
 * the live OpenAPI doc: {@link https://bizops360-api.onrender.com/docs/api}.
 */

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  industry: string | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  tenant: Tenant | null;
  roles: string[];
  /** Only present when the resource is the authenticated user themself. */
  permissions?: string[];
  is_platform_admin?: boolean;
}

export interface LoginResponse {
  data: AuthUser;
  token: string;
}

/** The envelope every bizops360-api list endpoint returns (Laravel's paginate()). */
export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}
