import { _get, _post } from '@/Helper';
import { ItemAnalysisResponse } from '../types/itemAnalysis.types';

const BASE = 'api/cbt/analysis';

export const itemAnalysisService = {
  /**
   * Analyze all items in an exam (POST) - triggers fresh analysis
   */
  analyzeExam: async (examId: string): Promise<ItemAnalysisResponse> => {
    return new Promise((resolve, reject) => {
      _post(
        `${BASE}/items/${examId}`,
        {},
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  /**
   * Get full item analysis for an exam
   */
  getExamAnalysis: async (examId: string): Promise<ItemAnalysisResponse> => {
    return new Promise((resolve, reject) => {
      _get(
        `${BASE}/items/${examId}`,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  /**
   * Get summary statistics only (faster)
   */
  getSummary: async (examId: string): Promise<ItemAnalysisResponse> => {
    return new Promise((resolve, reject) => {
      _get(
        `${BASE}/summary/${examId}`,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  /**
   * Get questions grouped by quality flag
   */
  getQualityGroups: async (examId: string): Promise<ItemAnalysisResponse> => {
    return new Promise((resolve, reject) => {
      _get(
        `${BASE}/quality/${examId}`,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },
};
