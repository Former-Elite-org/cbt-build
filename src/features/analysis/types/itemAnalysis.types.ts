export interface DifficultyResult {
  index: number;
  level: 'Very Easy' | 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  total: number;
  correct: number;
}

export interface DiscriminationResult {
  index: number;
  quality: string;
  upperCorrect: number;
  lowerCorrect: number;
  upperTotal: number;
  lowerTotal: number;
}

export interface DistractorResult {
  option: string;
  text: string;
  selections?: number;
  selectionCount?: number;
  selectionRate: number;
  efficiency: number | null;
  isCorrect: boolean;
  recommendation?: string;
}

export interface ItemAnalysis {
  question_id: string;
  question_text: string;
  question_type: string;
  marks?: number;
  difficulty: DifficultyResult;
  discrimination: DiscriminationResult;
  distractors: DistractorResult[];
  quality_flag: 'Excellent' | 'Good' | 'Needs Review' | 'Reject';
  recommendations: string[];
}

export type QualityFlag = ItemAnalysis['quality_flag'];

export interface QualityDistribution {
  excellent: number;
  good: number;
  needs_review: number;
  reject: number;
}

export interface DifficultyDistribution {
  very_easy: number;
  easy: number;
  moderate: number;
  hard: number;
  very_hard: number;
}

export interface AnalysisSummary {
  total_analyzed: number;
  quality_distribution: QualityDistribution;
  avg_difficulty: number;
  avg_discrimination: number;
  difficulty_distribution: DifficultyDistribution;
  [key: string]: any;
}

export interface ItemAnalysisResponse {
  success: boolean;
  exam_id: string;
  total_questions: number;
  summary: AnalysisSummary;
  analysis: ItemAnalysis[];
  analyzed_at?: string;
  message?: string;
}