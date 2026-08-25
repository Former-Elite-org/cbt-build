import { BaseEntity } from '@/types/common.types';
import { Exam } from '@/features/exams/types/exam.types';
import { Question } from '@/features/exams/types/question.types';

export interface ExamResult extends BaseEntity {
  exam_id: string;
  student_id: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade?: string;
  status: 'Pass' | 'Fail' | 'Pending';
  submitted_at: string;
  time_taken: number; // minutes
  exam?: Exam;
  student?: {
    student_id: string;
    first_name: string;
    last_name: string;
    admission_no?: string;
    email?: string;
  };
}

export interface QuestionResult {
  question_id: string;
  question_text: string;
  question_type: string;
  marks: number;
  obtained_marks: number;
  answer: string;
  correct_answer: string;
  is_correct: boolean;
  selected_option?: string; // For multiple choice
  options?: Array<{
    id?: string;
    option: string;
    option_label?: string;
    is_correct: boolean;
  }>;
}

export interface ExamResultDetail extends ExamResult {
  question_results: QuestionResult[];
}

export interface ResultQueryParams {
  exam_id?: string;
  student_id?: string;
  branch_id?: string;
  class_id?: string;
  subject_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface ResultStatistics {
  total_students: number;
  total_passed: number;
  total_failed: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_rate: number;
}

