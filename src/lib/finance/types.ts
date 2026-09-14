import type { Customer } from '@/lib/crm/types';
import type { Employee } from '@/lib/organization/types';

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'mobile', 'cheque', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const INCOME_CATEGORIES = ['customer_payment', 'other'] as const;
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export const EXPENSE_CATEGORIES = ['office', 'employee', 'supplier', 'other'] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export const INVOICE_STATUSES = ['draft', 'sent', 'partial', 'paid', 'refunded', 'void'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface Income {
  id: number;
  customer_id: number | null;
  category: IncomeCategory;
  source: string | null;
  amount: string;
  received_on: string;
  method: PaymentMethod;
  reference: string | null;
  note: string | null;
  customer: Customer | null;
}

export interface Expense {
  id: number;
  category: ExpenseCategory;
  employee_id: number | null;
  supplier_name: string | null;
  title: string;
  amount: string;
  spent_on: string;
  method: PaymentMethod;
  reference: string | null;
  note: string | null;
  status: ExpenseStatus;
  approved_by: number | null;
  approved_at: string | null;
  decision_note: string | null;
  employee: Employee | null;
}

export interface InvoicePayment {
  id: number;
  invoice_id: number;
  amount: string;
  paid_on: string;
  method: PaymentMethod;
  reference: string | null;
  note: string | null;
}

export interface InvoiceRefund {
  id: number;
  invoice_id: number;
  payment_id: number | null;
  amount: string;
  refunded_on: string;
  method: PaymentMethod;
  reason: string | null;
}

export interface Invoice {
  id: number;
  number: string;
  customer_id: number;
  customer_name: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  amount: string;
  amount_paid: string;
  amount_refunded: string;
  amount_due: string;
  notes: string | null;
  customer: Customer | null;
  payments: InvoicePayment[];
  refunds: InvoiceRefund[];
}

export interface FinancePeriodFigures {
  income: string;
  expense: string;
  profit: string;
  margin: number | null;
}

export interface FinanceOverview {
  all_time: FinancePeriodFigures;
  this_month: FinancePeriodFigures;
  receivables: {
    outstanding_invoices: number;
    outstanding_amount: string;
  };
  counts: {
    incomes: number;
    expenses: number;
    invoices: number;
  };
}

export interface ProfitAndLoss {
  from: string;
  to: string;
  summary: FinancePeriodFigures;
  income_by_category: Record<string, string>;
  expense_by_category: Record<string, string>;
}

export interface OutstandingInvoiceRow {
  id: number;
  number: string;
  customer_id: number | null;
  customer_name: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  amount: string;
  amount_due: string;
  days_overdue: number;
  ageing_bucket: 'current' | '1_30' | '31_60' | '61_90' | 'over_90';
}

export interface OutstandingInvoices {
  total_outstanding: string;
  invoice_count: number;
  ageing: Record<string, string>;
  invoices: OutstandingInvoiceRow[];
}

export interface CustomerDueRow {
  customer_id: number | null;
  customer_name: string;
  invoice_count: number;
  amount_due: string;
}

export interface CustomerDues {
  total_due: string;
  customer_count: number;
  customers: CustomerDueRow[];
}

export interface MonthlyFinanceRow extends FinancePeriodFigures {
  month: number;
  label: string;
}

export interface MonthlyFinanceReport {
  year: number;
  summary: FinancePeriodFigures;
  months: MonthlyFinanceRow[];
}
