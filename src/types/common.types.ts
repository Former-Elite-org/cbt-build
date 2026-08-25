// Common types used across the application

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type UserRole = 'Admin' | 'BranchAdmin' | 'Teacher' | 'Student';

export type ExamStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Released';

export type QuestionType = 'Multiple Choice' | 'True/False' | 'Short Answer';

export interface BaseEntity {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

