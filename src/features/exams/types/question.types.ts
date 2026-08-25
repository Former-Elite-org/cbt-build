import { BaseEntity, QuestionType } from '@/types/common.types';

export interface QuestionOption {
  id?: string;
  option: string;
  is_correct: boolean;
  marks?: number;
}

export interface Question extends BaseEntity {
  question_id?: string;
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: QuestionOption[];
  correct_answer?: string; // For Essay or Fill in the Blanks
  marks: number;
  attachment_url?: string;
  question_hint?: string;
  case_sensitive?: boolean; // For Fill in the Blanks
  partial_credit?: boolean;
  branch_id?: string;
}

export interface CreateQuestionDto {
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: QuestionOption[];
  correct_answer?: string;
  marks: number;
  attachment_url?: string;
  question_hint?: string;
  case_sensitive?: boolean;
  partial_credit?: boolean;
  branch_id?: string;
}

