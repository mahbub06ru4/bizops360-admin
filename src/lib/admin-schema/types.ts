export type FieldType = 'string' | 'text' | 'number' | 'boolean' | 'date' | 'select' | 'relation' | 'password';

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
}

export interface ModuleSchema {
  key: string;
  label: string;
  icon: string;
  resources: string[];
}

export interface AdminSchema {
  modules: ModuleSchema[];
  resources: ResourceSchema[];
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
