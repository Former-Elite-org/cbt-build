import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';

export interface ExamSessionInfo {
  session_id: string;
  exam_id: string;
  started_at: string;
  expires_at: string;
  duration_seconds: number;
  remaining_seconds?: number;
  status?: string;
  expired?: boolean;
}

export const examSessionService = {
  /**
   * Start (or resume) a server-authoritative exam session.
   * The returned expires_at is the deadline the server will enforce.
   */
  start: async (examId: string, deviceInfo?: Record<string, unknown>): Promise<ApiResponse<ExamSessionInfo>> => {
    const response = await apiClient.post<ApiResponse<ExamSessionInfo>>(
      '/exam-sessions/start',
      {
        exam_id: examId,
        device_info: deviceInfo || {
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        },
      }
    );
    return response.data;
  },

  /**
   * Fetch the authoritative remaining time for an active session.
   */
  get: async (sessionId: string): Promise<ApiResponse<ExamSessionInfo>> => {
    const response = await apiClient.get<ApiResponse<ExamSessionInfo>>(`/exam-sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Persist the student's latest answers to the server (network-resilience).
   * Called on every answer change so a drop at the final submit step never
   * loses progress.
   */
  saveSnapshot: async (
    sessionId: string,
    answers: any[],
    force = false
  ): Promise<ApiResponse<{ snapshot_at: string }>> => {
    const response = await apiClient.post<ApiResponse<{ snapshot_at: string }>>(
      `/exam-sessions/${sessionId}/snapshot`,
      { answers, force }
    );
    return response.data;
  },

  /**
   * Restore the last persisted answers snapshot (after reload / network drop).
   */
  getSnapshot: async (sessionId: string): Promise<ApiResponse<{ answers: any[]; snapshot_at?: string }>> => {
    const response = await apiClient.get<ApiResponse<{ answers: any[]; snapshot_at?: string }>>(
      `/exam-sessions/${sessionId}/snapshot`
    );
    return response.data;
  },
};
