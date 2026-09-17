export type FieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'relation'
  | 'relation-multi'
  | 'password'
  | 'file';

export interface FieldOption {
  value: string;
  label: string;
}

/** One choice for a 'relation'/'relation-multi' dropdown — `search` folds in identifying columns (phone, staff code, email, ...) beyond the display label. */
export interface RelationOption {
  id: number;
  label: string;
  search: string;
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
  /**
   * Dot-path evaluated against the row (or, when the owning action sets
   * `fetchDetail`, a freshly-fetched record) whose value seeds this field's
   * default when an action dialog opens.
   */
  prefillFrom?: string;
}

export interface ColumnSchema {
  key: string;
  label: string;
  /** Render the cell value as a clickable/downloadable link instead of plain text. */
  link?: boolean;
}

/**
 * A named, row-level operation beyond plain create/update/delete —
 * approve/reject, convert, terminate, and the like. No `fields` means the
 * button submits immediately (after `confirm`, if set); otherwise it opens a
 * small dialog built from `fields`.
 */
export interface ActionSchema {
  key: string;
  label: string;
  method: 'POST' | 'PUT' | 'DELETE';
  /** May contain a `{id}` placeholder, replaced with the row's id. */
  endpoint: string;
  permission: string | null;
  confirm?: string;
  style?: 'default' | 'destructive' | 'secondary';
  fields: FieldSchema[];
  /** GET the record fresh before opening the dialog, for `prefillFrom` data the list row doesn't carry. */
  fetchDetail?: boolean;
  /** 'row' (default): one button per row. 'resource': a single button near "New X", not tied to any row (a keyless upsert like LeaveBalance's). */
  scope?: 'row' | 'resource';
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
  /** Row-level operations beyond create/update/delete (approve, convert, ...). */
  actions?: ActionSchema[];
  /** Fetched and rendered as a row of stat cards above the table — read-only aggregate data no generic form/table captures. */
  summaryEndpoint?: string;
  /** May contain `{id}`. When set, the label cell links here instead of showing plain text — for a resource whose detail view is still a hand-built page. */
  detailPath?: string;
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
