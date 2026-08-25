import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';

const BASE = '/api/cbt/moderation/exams';

export type ExamStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface ModeratedExam {
  id: string;
  exam_code: string | null;
  title: string | null;
  description: string | null;
  board: string | null;
  subject_name: string;
  subject_code: string;
  assessment_type: string;
  exam_category: string | null;
  total_questions: number;
  total_marks: number;
  duration: number;
  status: ExamStatus;
  approval_date: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamModerationCounts {
  Draft: number;
  Pending: number;
  Approved: number;
  Rejected: number;
}

export const examModerationService = {
  /** List shared exams for moderation (admin). Returns { success, total, data: ModeratedExam[] }. */
  list: async (params: { status?: ExamStatus | 'ALL'; board?: string | 'ALL'; q?: string } = {}): Promise<
    ApiResponse<ModeratedExam[]> & { total?: number }
  > => {
    const res = await apiClient.get<ApiResponse<ModeratedExam[]> & { total?: number }>(BASE, { params });
    return res.data;
  },

  /** Status counts for the moderation dashboard. */
  counts: async (): Promise<ApiResponse<ExamModerationCounts>> => {
    const res = await apiClient.get<ApiResponse<ExamModerationCounts>>(`${BASE}/counts`);
    return res.data;
  },

  /** Approve an exam — makes it visible to students. */
  approve: async (examId: string): Promise<ApiResponse<{ status: string }>> => {
    const res = await apiClient.post<ApiResponse<{ status: string }>>(`${BASE}/${examId}/approve`);
    return res.data;
  },

  /** Reject an exam with a reason. */
  reject: async (examId: string, reason: string): Promise<ApiResponse<{ status: string }>> => {
    const res = await apiClient.post<ApiResponse<{ status: string }>>(`${BASE}/${examId}/reject`, { reason });
    return res.data;
  },
};
