export interface ExamSummary {
  mean: number;
  median: number;
  std_dev: number;
  highest: number;
  lowest: number;
  pass_rate: number;
  sample_size: number;
}

export interface DistributionBin {
  bucket: string;
  count: number;
}

export interface PerformanceLevels {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface TopStudent {
  admission_no: string;
  percentage: number;
  grade?: string;
}

export interface TopicMastery {
  topic: string;
  item_count: number;
  mastery_percentage: number;
  attempted_by: number;
  correct: number;
  total: number;
}

export interface TrendExam {
  id: string;
  title?: string;
  subject_code?: string;
  created_at?: string;
  mean_score?: number;
}

export interface AnalyticsResult {
  exam_id: string;
  exam_title?: string;
  summary: ExamSummary;
  distribution: DistributionBin[];
  performance_levels: PerformanceLevels;
  top_students: TopStudent[];
  topic_mastery: TopicMastery[];
  analyzed_at?: string;
}

export interface TrendResult {
  exams: TrendExam[];
  scores: number[];
  trend: string;
  growth_rate: number;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
