export type AlignmentStrength = 'Direct' | 'Partial' | 'Supportive';

export interface CurriculumStandard {
  id: string;
  standard_code: string;
  standard_body?: string;
  subject_code?: string;
  grade_level?: string;
  strand?: string;
  standard_text?: string;
  description?: string;
  proficiency_levels?: string[];
  school_id?: string;
  branch_id?: string;
  created_at?: string;
  alignment_strength?: AlignmentStrength;
}

export interface StandardFilters {
  q?: string;
  subject?: string;
  body?: string;
  grade?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data?: T[];
  total?: number;
  message?: string;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}