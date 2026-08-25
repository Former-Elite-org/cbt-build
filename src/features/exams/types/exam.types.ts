import { BaseEntity, ExamStatus } from '@/types/common.types';

export interface Exam extends BaseEntity {
  exam_id: string;
  title: string;
  assessment_type?: string; // Alternative title field
  description?: string;
  commence_date: string;
  start_time: string;
  end_time: string;
  duration: number; // in minutes
  status: ExamStatus;
  subject_id: string;
  class_id: string;
  section_id?: string;
  total_marks: number;
  branch_id: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface CreateExamDto {
  title: string;
  description?: string;
  commence_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  subject_id: string;
  class_id: string;
  section_id?: string;
  branch_id: string;
}

export interface UpdateExamDto extends Partial<CreateExamDto> {
  status?: ExamStatus;
  rejection_reason?: string;
}

export interface ExamQueryParams {
  status?: ExamStatus;
  subject_id?: string;
  class_id?: string;
  branch_id?: string;
  page?: number;
  limit?: number;
}

