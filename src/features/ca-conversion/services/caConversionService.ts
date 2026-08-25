import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';

export interface CASetupOption {
  id: string | number;
  ca_type: string;
  week_number: number;
  max_score: number | string;
  section?: string | null;
  status?: string;
  opening_date?: string | null;
  closing_date?: string | null;
}

export interface CAScorePreviewRow {
  admissionNo: string;
  classCode: string;
  subjectCode: string;
  caSetupId: string | number;
  caType: string;
  weekNumber: number;
  score: number;
  maxScore: number;
  academicYear: string | null;
  term: string | null;
  raw_score: number;
  total_marks: number;
  percentage: number;
}

export interface CAConversionRecord {
  id: string;
  source_type: 'cbt' | 'assignment';
  source_id: string;
  source_label?: string | null;
  ca_setup_id: string | number;
  ca_type: string;
  week_number?: number | null;
  class_code: string;
  subject_code: string;
  school_id: string;
  branch_id: string;
  academic_year?: string | null;
  term?: string | null;
  scores_count: number;
  converted_by?: string | null;
  converted_at: string;
}

export const caConversionService = {
  /** List active CA setups for the current branch (CA1..CAx + EXAM). */
  getSetups: async (params?: {
    academic_year?: string;
    term?: string;
    section?: string;
  }): Promise<ApiResponse<CASetupOption[]>> => {
    const res = await apiClient.get<ApiResponse<CASetupOption[]>>('/api/cbt/ca/setups', { params });
    return res.data;
  },

  /** Preview conversion of a completed exam's results into weekly scores. */
  previewConversion: async (
    exam_id: string,
    ca_setup_id: string | number
  ): Promise<any> => {
    const res = await apiClient.post<any>('/api/cbt/ca/convert', {
      exam_id,
      ca_setup_id,
      dry_run: true,
    });
    return res.data;
  },

  /** Persist conversion of a completed exam's results into weekly scores. */
  convert: async (
    exam_id: string,
    ca_setup_id: string | number
  ): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>('/api/cbt/ca/convert', {
      exam_id,
      ca_setup_id,
      dry_run: false,
    });
    return res.data;
  },

  /** Conversion history for the current branch (newest first). */
  getHistory: async (limit = 50): Promise<ApiResponse<CAConversionRecord[]>> => {
    const res = await apiClient.get<ApiResponse<CAConversionRecord[]>>('/api/cbt/ca/history', {
      params: { limit },
    });
    return res.data;
  },
};
