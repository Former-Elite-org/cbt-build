import { _get, _post, _delete } from '@/Helper';
import {
  ApiItemResponse,
  ApiListResponse,
  CurriculumStandard,
  StandardFilters,
} from '../types/standards.types';

const BASE = 'api/cbt/standards';

function toQuery(filters: StandardFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const standardsService = {
  list: async (filters?: StandardFilters): Promise<ApiListResponse<CurriculumStandard>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}${toQuery(filters)}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  import: async (data: {
    standard_body?: string;
    subject?: string;
    standards: Array<{
      standard_code: string;
      standard_text?: string;
      strand?: string;
      grade_level?: string;
      subject_code?: string;
      standard_body?: string;
      proficiency_levels?: string[];
    }>;
  }): Promise<ApiItemResponse<{ imported_count: number }>> => {
    return new Promise((resolve, reject) => {
      _post(`${BASE}/import`, data, (res) => resolve(res), (err) => reject(err));
    });
  },

  mapQuestion: async (
    questionId: string,
    data: { standard_codes: string[]; alignment_strength?: string }
  ): Promise<ApiItemResponse<string[]>> => {
    return new Promise((resolve, reject) => {
      _post(`${BASE}/questions/${questionId}/map-standards`, data, (res) => resolve(res), (err) => reject(err));
    });
  },

  getQuestionMappings: async (questionId: string): Promise<ApiListResponse<CurriculumStandard>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}/question/${questionId}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  removeMapping: async (mappingId: string): Promise<ApiItemResponse<null>> => {
    return new Promise((resolve, reject) => {
      _delete(`${BASE}/mapping/${mappingId}`, {}, (res) => resolve(res), (err) => reject(err));
    });
  },
};