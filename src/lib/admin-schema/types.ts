export type FieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'time'
  | 'select'
  | 'relation'
  | 'password'
  | 'file';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  relation?: { resource: string };
  /** Hidden on the edit form — e.g. a password only ever set on create. */
  onlyOnCreate?: boolean;
}

export interface ColumnSchema {
  key: string;
  label: string;
}

/**
 * `create`/`update`/`delete` are null when no matching backend route
 * exists for that action (e.g. a resource that's list+create only) — the
 * frontend hides the action entirely rather than gating it on a permission
 * that could never be satisfied.
 */
export interface ResourcePermissions {
  view: string;
  create: string | null;
  update: string | null;
  delete: string | null;
}

export interface ResourceSchema {
  key: string;
  label: string;
  pluralLabel: string;
  endpoint: string;
  labelField: string;
  permissions: ResourcePermissions;
  columns: ColumnSchema[];
  fields: FieldSchema[];
  searchable?: boolean;
  /** 'singleton' (default 'list'): one GET/PUT record, no id, no list. */
  mode?: 'list' | 'singleton';
  /**
   * Whether the index endpoint returns Laravel's paginate() envelope
   * (default true). false means a plain `{ data: T[] }` array with no
   * `meta` — the frontend must not expect pagination for it.
   */
  paginated?: boolean;
}

export interface ModuleSchema {
  key: string;
  label: string;
  icon: string;
  resources: string[];
}

/** A bespoke analytics page the schema can't render generically — just a permission-gated link. */
export interface DashboardLink {
  key: string;
  label: string;
  href: string;
  module: string;
  permission: string;
}

export interface AdminSchema {
  modules: ModuleSchema[];
  resources: ResourceSchema[];
  dashboards: DashboardLink[];
}

/** Reads a possibly-nested value ("department.name") out of a record. */
export function getPath(record: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key];
    }

    return null;
  }, record);
}
