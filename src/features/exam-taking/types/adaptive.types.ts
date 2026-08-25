/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Adaptive Testing Types
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface AdaptiveSession {
  session_id: string;
  exam_id: string;
  initial_theta: number;
  initial_se: number;
  min_items: number;
  max_items: number;
  target_se: number;
  termination_rule: string;
  started_at: string;
}

export interface AdaptiveSessionResponse {
  success: boolean;
  message: string;
  data: AdaptiveSession;
}

export interface AdaptiveQuestion {
  id: string;
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  marks: number;
  topic?: string;
}

export interface ProgressInfo {
  current: number;
  min: number;
  max: number;
}

export interface NextItemData {
  item_admin_id: string;
  question: AdaptiveQuestion;
  current_ability: number;
  current_se: number;
  items_administered: number;
  progress: ProgressInfo;
}

export interface NextItemResponse {
  success: boolean;
  data?: NextItemData;
  session_complete?: boolean;
  termination_reason?: string;
  final_theta?: number;
  final_se?: number;
  score?: number;
  items_administered?: number;
}

export interface SubmitResponseRequest {
  session_id: string;
  item_admin_id: string;
  answer: string;
  time_spent?: number;
}

export interface AbilityEstimate {
  theta: number;
  se: number;
  confidence_95: {
    lower: number;
    upper: number;
  };
  reliability: number;
  method: string;
}

export interface SubmitResponseResponse {
  success: boolean;
  message: string;
  data: {
    is_correct: boolean;
    correct_answer: string;
    updated_ability: AbilityEstimate;
  };
}

export interface EndSessionData {
  session_id: string;
  items_administered: number;
  correct_responses: number;
  accuracy: string;
  final_ability: AbilityEstimate;
  score: number;
  duration_seconds: number;
  completed_at: string;
}

export interface EndSessionResponse {
  success: boolean;
  message: string;
  data: EndSessionData;
}

export interface SessionStatusData extends AdaptiveSession {
  current_ability: number;
  ability_se: number;
  items_administered: number;
  correct_responses: number;
  incorrect_responses: number;
  session_complete: boolean;
  exam_title: string;
  confidence_95: {
    lower: number;
    upper: number;
  };
  reliability: number;
  accuracy: string;
}

export interface SessionStatusResponse {
  success: boolean;
  data: SessionStatusData;
}

export interface AbilityEstimateHistory {
  id: string;
  admission_no: string;
  subject_code: string;
  theta: number;
  theta_se: number;
  confidence_95_lower: number;
  confidence_95_upper: number;
  estimation_method: string;
  items_used: number;
  assessment_date: string;
  created_at: string;
}

export interface AbilityHistoryResponse {
  success: boolean;
  data: AbilityEstimateHistory[];
  count: number;
}
