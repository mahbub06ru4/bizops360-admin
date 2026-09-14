import type { Department, Employee } from '@/lib/organization/types';

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'cancelled'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  department_id: number | null;
  lead_employee_id: number | null;
  tasks_count: number | null;
  department: Department | null;
  lead: Employee | null;
}

export const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  id: number;
  project_id: number | null;
  parent_task_id: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_employee_id: number | null;
  assignee_team_id: number | null;
  due_at: string | null;
  completed_at: string | null;
  is_overdue: boolean;
  subtasks_count: number | null;
  project: Project | null;
  assignee_employee: Employee | null;
}

export interface TaskComment {
  id: number;
  task_id: number;
  author_id: number;
  author_name: string | null;
  body: string;
  created_at: string;
}

export interface TaskActivity {
  id: number;
  task_id: number;
  causer_id: number | null;
  causer_name: string | null;
  event: string;
  description: string;
  created_at: string;
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  uploaded_by: number;
  uploader_name: string | null;
  original_name: string;
  mime_type: string;
  size: number;
  download_url: string;
}

export interface OperationsOverview {
  tasks: {
    open: number;
    overdue: number;
    due_today: number;
    unassigned: number;
    completed_this_week: number;
    by_status: Record<TaskStatus, number>;
    by_priority: Record<TaskPriority, number>;
  };
  projects: {
    by_status: Record<ProjectStatus, number>;
  };
}

export interface EmployeeWorkload {
  employee_id: number;
  employee_name: string | null;
  open_tasks: number;
  overdue_tasks: number;
  due_today: number;
}

export interface DepartmentPerformance {
  department_id: number;
  department_name: string | null;
  projects: number;
  total_tasks: number;
  open_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
}
