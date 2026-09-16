export type FieldType = 'string' | 'text' | 'number' | 'boolean' | 'date' | 'select' | 'relation';

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
}

export interface ColumnSchema {
  key: string;
  label: string;
}

export interface ResourcePermissions {
  view: string;
  create: string;
  update: string;
  delete: string;
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
