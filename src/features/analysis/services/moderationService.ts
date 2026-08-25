import { _get, _post } from '@/Helper';
import {
  ApiItemResponse,
  ApiListResponse,
  ModerationQuestion,
  ModerationStatus,
} from '../types/moderation.types';

const BASE = 'api/cbt/moderation';

export const moderationService = {
  list: async (params: { status?: ModerationStatus; exam_id?: string; q?: string } = {}): Promise<
    ApiListResponse<ModerationQuestion>
  > => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.exam_id) qs.set('exam_id', params.exam_id);
    if (params.q) qs.set('q', params.q);
    const query = qs.toString();
    return new Promise((resolve, reject) => {
      _get(`${BASE}/questions${query ? `?${query}` : ''}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  submit: async (questionId: string): Promise<ApiItemResponse<{ status: string }>> => {
    return new Promise((resolve, reject) => {
      _post(`${BASE}/${questionId}/submit`, {}, (res) => resolve(res), (err) => reject(err));
    });
  },

  review: async (
    questionId: string,
    data: { action: 'start' | 'approve' | 'reject' | 'revise'; note?: string }
  ): Promise<ApiItemResponse<{ status: string }>> => {
    return new Promise((resolve, reject) => {
      _post(`${BASE}/${questionId}/review`, data, (res) => resolve(res), (err) => reject(err));
    });
  },
};