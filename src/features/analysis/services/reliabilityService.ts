import { _post } from '@/Helper';
import { ApiItemResponse, ReliabilityResult } from '../types/reliability.types';

const BASE = 'api/cbt/analysis';

export const reliabilityService = {
  analyze: async (examId: string): Promise<ApiItemResponse<ReliabilityResult>> => {
    return new Promise((resolve, reject) => {
      _post(`${BASE}/reliability/${examId}`, {}, (res) => resolve(res), (err) => reject(err));
    });
  },
};