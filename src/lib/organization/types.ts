export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_head_office: boolean;
}

export interface Department {
  id: number;
  branch_id: number | null;
  branch: Branch | null;
  name: string;
  code: string;
  description: string | null;
}

export interface Designation {
  id: number;
  department_id: number | null;
  department: Department | null;
  title: string;
  rank: number | null;
}

export const EMPLOYMENT_STATUSES = ['active', 'probation', 'on_leave', 'terminated'] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  hire_date: string;
  employment_status: EmploymentStatus;
  user_id: number | null;
  branch_id: number | null;
  department_id: number | null;
  designation_id: number | null;
  branch: Branch | null;
  department: Department | null;
  designation: Designation | null;
}

export interface Team {
  id: number;
  name: string;
  description: string | null;
  lead_employee_id: number | null;
  members_count: number | null;
  members: Employee[];
}

export interface OrgUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface Role {
  name: string;
  permissions: string[];
}
