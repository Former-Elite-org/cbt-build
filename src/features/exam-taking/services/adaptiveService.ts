/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Adaptive Testing Service
 * ═══════════════════════════════════════════════════════════════════════════
 * Frontend service for Computer Adaptive Testing (CAT)
 */

import api from '@/lib/api';
import type {
  AdaptiveSession,
  AdaptiveSessionResponse,
  NextItemResponse,
  SubmitResponseRequest,
  SubmitResponseResponse,
  EndSessionResponse,
  SessionStatusResponse,
  AbilityHistoryResponse
} from '../types/adaptive.types';

const BASE_URL = '/cbt/adaptive';

/**
 * Start a new adaptive test session.
 * Identity is resolved from the JWT server-side; only exam_id is required.
 */
export const startAdaptiveSession = async (data: {
  exam_id: string;
  admission_no?: string;
  school_id?: string;
  class_code?: string;
}): Promise<AdaptiveSessionResponse> => {
  const response = await api.post<AdaptiveSessionResponse>(`${BASE_URL}/start-session`, data);
  return response.data;
};

/**
 * Get next optimal item for the student
 */
export const getNextItem = async (sessionId: string): Promise<NextItemResponse> => {
  const response = await api.get<NextItemResponse>(`${BASE_URL}/next-item/${sessionId}`);
  return response.data;
};

/**
 * Submit response and get updated ability estimate
 */
export const submitResponse = async (data: SubmitResponseRequest): Promise<SubmitResponseResponse> => {
  const response = await api.post<SubmitResponseResponse>(`${BASE_URL}/submit-response`, data);
  return response.data;
};

/**
 * End adaptive test session
 */
export const endSession = async (sessionId: string): Promise<EndSessionResponse> => {
  const response = await api.post<EndSessionResponse>(`${BASE_URL}/end-session`, {
    session_id: sessionId
  });
  return response.data;
};

/**
 * Get current session status
 */
export const getSessionStatus = async (sessionId: string): Promise<SessionStatusResponse> => {
  const response = await api.get<SessionStatusResponse>(`${BASE_URL}/session/${sessionId}`);
  return response.data;
};

/**
 * Get student's ability history
 */
export const getAbilityHistory = async (
  admissionNo: string,
  subjectCode?: string
): Promise<AbilityHistoryResponse> => {
  const url = subjectCode 
    ? `${BASE_URL}/ability-history/${admissionNo}?subject_code=${subjectCode}`
    : `${BASE_URL}/ability-history/${admissionNo}`;
  
  const response = await api.get<AbilityHistoryResponse>(url);
  return response.data;
};

export const adaptiveService = {
  startAdaptiveSession,
  getNextItem,
  submitResponse,
  endSession,
  getSessionStatus,
  getAbilityHistory
};
