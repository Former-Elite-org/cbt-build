import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';
import { getDeviceId } from '@/lib/utils/device';
import {
  PracticeSessionResponse,
  PracticeStats,
} from '../types/practice.types';
import {
  BoardExam,
  PracticeBoard,
  SubjectAccessInfo,
  SubjectCheckoutResult,
} from '../types/board.types';

const BASE = '/api/cbt/practice';

export interface ReviewResult {
  next_due_at: string;
  mastered: boolean;
  item: { stage: number; review_count: number; correct_count: number };
}

export const practiceService = {
  /** Student: questions due for review (with answers + explanations). */
  getDue: async (limit = 10): Promise<ApiResponse<PracticeSessionResponse>> => {
    const res = await apiClient.get<ApiResponse<PracticeSessionResponse>>(
      `${BASE}/due`,
      { params: { limit } }
    );
    return res.data;
  },

  /** Student: record a review outcome + reschedule. */
  review: async (
    questionId: string,
    correct: boolean
  ): Promise<ApiResponse<ReviewResult>> => {
    const res = await apiClient.post<ApiResponse<ReviewResult>>(`${BASE}/review`, {
      question_id: questionId,
      correct,
    });
    return res.data;
  },

  /** Student: practice progress stats. */
  getStats: async (): Promise<ApiResponse<PracticeStats>> => {
    const res = await apiClient.get<ApiResponse<PracticeStats>>(`${BASE}/stats`);
    return res.data;
  },

  /** Student: board practice overview (all boards + subjects with exams). */
  getBoards: async (): Promise<ApiResponse<PracticeBoard[]>> => {
    const res = await apiClient.get<ApiResponse<PracticeBoard[]>>(`${BASE}/boards`);
    return res.data;
  },

  /** Student: exams available for one board (optional subject filter). */
  getBoardExams: async (
    board: string,
    subject?: string
  ): Promise<ApiResponse<BoardExam[]>> => {
    const res = await apiClient.get<ApiResponse<BoardExam[]>>(
      `${BASE}/boards/${encodeURIComponent(board)}/exams`,
      { params: subject ? { subject } : {} }
    );
    return res.data;
  },

  /** Student: which subjects are unlocked + pricing (freemium state). */
  getSubjectAccess: async (): Promise<ApiResponse<SubjectAccessInfo>> => {
    const res = await apiClient.get<ApiResponse<SubjectAccessInfo>>('/api/cbt/subjects/access', {
      params: { device_id: getDeviceId() },
    });
    return res.data;
  },

  /** Student: spend the one free subject on a subject (one per device + student). */
  grantFreeSubject: async (
    subjectName: string
  ): Promise<ApiResponse<{ subject: string; source: string }>> => {
    const res = await apiClient.post<ApiResponse<{ subject: string; source: string }>>(
      '/api/cbt/subjects/free',
      { subject_name: subjectName, device_id: getDeviceId() }
    );
    return res.data;
  },

  /** Student: start a Paystack checkout for a subject (single) or whole board (bundle). */
  checkoutSubject: async (payload: {
    mode: 'single' | 'bundle';
    subject?: string;
    board?: string;
    callback_url?: string;
  }): Promise<SubjectCheckoutResult> => {
    const res = await apiClient.post<SubjectCheckoutResult>('/api/cbt/subjects/checkout', payload);
    return res.data;
  },
};
