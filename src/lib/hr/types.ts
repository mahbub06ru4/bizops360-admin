import type { Employee } from '@/lib/organization/types';

export interface Holiday {
  id: number;
  name: string;
  date: string;
  is_recurring: boolean;
}

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  default_days_per_year: number | null;
  is_paid: boolean;
  requires_approval: boolean;
}

export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  decided_by: number | null;
  decided_at: string | null;
  decision_note: string | null;
  employee: Employee | null;
  leave_type: LeaveType | null;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  entitled_days: number;
  used_days: number;
  remaining_days: number;
  employee: Employee | null;
  leave_type: LeaveType | null;
}

export const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'half_day', 'on_leave', 'holiday'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: AttendanceStatus;
  worked_minutes: number | null;
  is_late: boolean;
  is_early_leave: boolean;
  note: string | null;
  employee: Employee | null;
}

export interface AttendanceSummary {
  month: string;
  employee_id: number;
  days_recorded: number;
  present: number;
  late: number;
  absent: number;
  half_day: number;
  on_leave: number;
  holiday: number;
  late_count: number;
  early_leave_count: number;
  worked_minutes: number;
}

export interface AttendanceSetting {
  work_starts_at: string;
  work_ends_at: string;
  grace_minutes: number;
}

export interface OfficeLocation {
  label: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  start_time: string;
  end_time: string;
}

export const EMPLOYEE_DOCUMENT_CATEGORIES = ['nid', 'passport', 'contract', 'offer_letter', 'certificate', 'other'] as const;
export type EmployeeDocumentCategory = (typeof EMPLOYEE_DOCUMENT_CATEGORIES)[number];

export interface EmployeeDocument {
  id: number;
  employee_id: number;
  category: EmployeeDocumentCategory;
  title: string;
  original_name: string;
  mime_type: string;
  size: number;
  expires_at: string | null;
  is_expired: boolean;
  download_url: string;
  employee: Employee | null;
}
