export type ModerationStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Under Review'
  | 'Needs Revision'
  | 'Approved'
  | 'Rejected';

export interface ModerationInfo {
  status: ModerationStatus;
  review_note?: string | null;
  reviewer_name?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
}

export interface ModerationQuestion {
  id: string;
  exam_id: string;
  question_type?: string;
  question_text?: string;
  marks?: number;
  topic_name?: string;
  moderation: ModerationInfo;
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