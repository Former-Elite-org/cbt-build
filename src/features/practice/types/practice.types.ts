export interface PracticeOption {
  id: string;
  option_text: string;
  option_label: string;
  is_correct: boolean;
  option_order: number;
}

export interface PracticeQuestion {
  item_id: string;
  question_id: string;
  exam_id: string;
  exam_title: string | null;
  subject_name: string | null;
  question_type: string;
  question_text: string;
  options: PracticeOption[];
  correct_answer: string | null;
  explanation: string | null;
  question_hint: string | null;
  topic_name: string | null;
  is_case_sensitive: boolean;
  marks: number;
  stage: number;
  review_count: number;
}

export interface PracticeStats {
  due_count: number;
  upcoming_count: number;
  mastered_count: number;
  total: number;
  review_count: number;
  correct_count: number;
  accuracy: number | null;
}

export interface PracticeSessionResponse {
  questions: PracticeQuestion[];
  stats: PracticeStats;
}
