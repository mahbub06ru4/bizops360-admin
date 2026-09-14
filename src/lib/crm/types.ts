import type { Employee } from '@/lib/organization/types';

export const LEAD_STAGES = ['new', 'contacted', 'interested', 'follow_up', 'negotiation', 'converted', 'lost'] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const CRM_PARTY_TYPES = ['individual', 'business'] as const;
export type CrmPartyType = (typeof CRM_PARTY_TYPES)[number];

export interface Lead {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  stage: LeadStage;
  estimated_value: string | null;
  notes: string | null;
  owner_employee_id: number | null;
  converted_customer_id: number | null;
  converted_at: string | null;
  lost_reason: string | null;
  owner: Employee | null;
}

export interface Customer {
  id: number;
  name: string;
  type: CrmPartyType;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  owner_employee_id: number | null;
  owner: Employee | null;
}

export interface Contact {
  id: number;
  contactable_type: string;
  contactable_id: number;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  notes: string | null;
}

export const FOLLOW_UP_TYPES = ['call', 'email', 'meeting', 'task'] as const;
export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];

export const FOLLOW_UP_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export interface FollowUp {
  id: number;
  followupable_type: string;
  followupable_id: number;
  assigned_employee_id: number | null;
  type: FollowUpType;
  due_at: string;
  status: FollowUpStatus;
  notes: string | null;
  outcome: string | null;
  completed_at: string | null;
  is_overdue: boolean;
  assigned_employee: Employee | null;
}

export interface CrmActivity {
  id: number;
  subject_type: string;
  subject_id: number;
  causer_id: number | null;
  causer_name: string | null;
  event: string;
  description: string;
  created_at: string;
}

export interface CustomerHistory {
  customer: Customer;
  source_lead: Lead | null;
  contacts: Contact[];
  follow_ups: FollowUp[];
  activities: CrmActivity[];
}

export interface LeadPipelineStage {
  count: number;
  value: string;
}

export interface CrmOverview {
  leads: {
    open: number;
    converted: number;
    lost: number;
    conversion_rate: number | null;
    open_pipeline_value: string;
    by_stage: Record<LeadStage, number>;
  };
  customers: number;
  follow_ups: {
    due_today: number;
    overdue: number;
  };
  activities_this_week: number;
}

export interface SalesPerformanceRow {
  employee_id: number;
  employee_name: string | null;
  open_leads: number;
  converted_leads: number;
  lost_leads: number;
  win_rate: number | null;
  converted_value: string;
  customers: number;
  open_follow_ups: number;
}
