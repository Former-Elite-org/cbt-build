export interface BoardSubjectChip {
  name: string;
  exams: number;
}

export interface PracticeBoard {
  board: string;
  name: string;
  level: 'tertiary' | 'senior' | 'junior';
  exam_count: number;
  subjects: BoardSubjectChip[];
}

export interface BoardExam {
  id: string;
  exam_id: string;
  title: string;
  subject_name: string;
  board: string;
  duration: number;
  total_questions: number;
  total_marks: number;
  status: string;
  submitted: boolean;
  description: string | null;
}

export interface SubjectPricing {
  subject_price: number;
  bundle_price: number;
  free_subjects: number;
  currency: string;
}

export interface SubjectAccessInfo {
  full_access: boolean;
  unlocked: string[];
  free_used: boolean;
  free_subject: string | null;
  device_free_used?: boolean;
  pricing: SubjectPricing;
}

export interface SubjectCheckoutResult {
  success: boolean;
  authorization_url: string;
  reference: string;
  mode: 'single' | 'bundle';
  subjects: string[];
  amount: number;
}
