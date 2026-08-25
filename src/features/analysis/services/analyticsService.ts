import { _get, _post } from '@/Helper';
import { AnalyticsResult, ApiItemResponse, TrendResult } from '../types/analytics.types';

const BASE = 'api/cbt/analysis';

export const analyticsService = {
  getExamAnalytics: async (examId: string): Promise<ApiItemResponse<AnalyticsResult>> => {
    return new Promise((resolve, reject) => {
      _post(`${BASE}/analytics/${examId}`, {}, (res) => resolve(res), (err) => reject(err));
    });
  },

  getTrends: async (params: { branch_id?: string; subject?: string }): Promise<ApiItemResponse<TrendResult>> => {
    const qs = new URLSearchParams();
    if (params.branch_id) qs.set('branch_id', params.branch_id);
    if (params.subject) qs.set('subject', params.subject);
    const query = qs.toString();
    return new Promise((resolve, reject) => {
      _get(`${BASE}/analytics/trends${query ? `?${query}` : ''}`, (res) => resolve(res), (err) => reject(err));
    });
  },
};
