export const BLOOM_LEVELS = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
] as const;

export type BloomLevel = (typeof BLOOM_LEVELS)[number];

export interface BlueprintSpec {
  id?: string;
  topic_name: string;
  bloom_level: BloomLevel;
  target_questions: number;
  target_marks: number;
  percentage_weight?: number;
  actual_questions?: number;
  actual_marks?: number;
}

export interface TestBlueprint {
  id: string;
  exam_id: string | null;
  subject_code?: string;
  title?: string;
  total_marks: number;
  total_questions: number;
  status: 'Draft' | 'Active' | 'Completed';
  created_by?: string;
  school_id?: string;
  branch_id?: string;
  created_at?: string;
  updated_at?: string;
  specifications?: BlueprintSpec[];
}

export interface BloomDistributionEntry {
  target_marks: number;
  target_questions: number;
  achieved_marks: number;
  achieved_questions: number;
  percentage: number;
}

export interface BlueprintCoverage {
  topics: { covered: number; total: number; percentage: number };
  tagged_questions: { tagged: number; total: number; percentage: number };
  marks_distribution: { target: number; achieved: number };
  questions_distribution: { target: number; achieved: number };
}

export interface BlueprintStatusResponse {
  success: boolean;
  data?: {
    blueprint: TestBlueprint;
    coverage: BlueprintCoverage;
    bloom_distribution: Record<string, BloomDistributionEntry>;
    specifications: (BlueprintSpec & { completion_percentage: number })[];
  };
  message?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data?: T[];
  message?: string;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}