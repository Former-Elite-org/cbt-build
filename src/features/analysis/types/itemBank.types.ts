export type QualityRating = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type ItemStatus = 'Active' | 'Inactive' | 'Draft';

export interface ItemUsage {
  id: string;
  item_id: string;
  exam_id: string;
  question_id?: string;
  used_date?: string;
  total_responses: number;
  difficulty_index?: number;
  discrimination_index?: number;
  performance_summary?: string;
  created_at?: string;
}

export interface ItemBankEntry {
  id: string;
  question_id: string;
  subject_code?: string;
  subject_name?: string;
  topic_name?: string;
  bloom_level?: string;
  difficulty_level?: string;
  question_type?: string;
  question_text?: string;
  avg_difficulty_index?: number;
  avg_discrimination_index?: number;
  quality_rating?: string;
  times_used?: number;
  total_responses?: number;
  avg_time_spent?: number;
  author_id?: string;
  peer_reviewed?: boolean;
  reviewed_by?: string;
  review_date?: string;
  status?: ItemStatus;
  tags?: string[];
  school_id?: string;
  branch_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemBankFilters {
  q?: string;
  subject?: string;
  bloom?: string;
  quality?: string;
  status?: string;
  topic?: string;
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