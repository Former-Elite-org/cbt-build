export interface SplitHalfReliability {
  r: number;
  spearman_brown: number;
}

export interface ConfidenceInterval {
  margin: string;
  description: string;
}

export interface ReliabilityResult {
  kr20: number;
  cronbachs_alpha: number;
  split_half: SplitHalfReliability;
  sem: number;
  sd: number;
  variance: number;
  standard_deviation: number;
  interpretation: string;
  confidence_intervals: Record<string, ConfidenceInterval>;
  recommendations: string[];
  sample: {
    students: number;
    items: number;
  };
}

export interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}