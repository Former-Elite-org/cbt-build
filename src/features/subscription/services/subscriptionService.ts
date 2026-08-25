import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';
import {
  ApplyResult,
  PracticeSubscriptionStatus,
  SubscriptionTier,
  VerifyResultData,
} from '../types/subscription.types';

const BASE = '/api/cbt/subscription';

export interface InitiatePayload {
  tier?: SubscriptionTier;
  holder_type?: 'school' | 'student';
  admission_no?: string;
  student_count?: number;
  email?: string;
  callback_url?: string;
}

export interface ApplyPayload {
  tier: SubscriptionTier;
  student_count?: number;
  note?: string;
}

/** initiate returns its fields at the top level (backend spreads the result). */
export interface InitiateResponse {
  success: boolean;
  authorization_url: string;
  reference: string;
  plan_code: string | null;
  tier: SubscriptionTier | null;
  message?: string;
}

export const subscriptionService = {
  /** Current practice-mode access status (school-level or the student's own). */
  getStatus: async (): Promise<ApiResponse<PracticeSubscriptionStatus>> => {
    const res = await apiClient.get<ApiResponse<PracticeSubscriptionStatus>>(`${BASE}/status`);
    return res.data;
  },

  /** Start a Paystack checkout for practice-mode access. */
  initiate: async (payload: InitiatePayload): Promise<InitiateResponse> => {
    const res = await apiClient.post<InitiateResponse>(`${BASE}/initiate`, payload);
    return res.data;
  },

  /** School application flow: submit intent (tier + note) before checkout. */
  apply: async (payload: ApplyPayload): Promise<ApiResponse<ApplyResult>> => {
    const res = await apiClient.post<ApiResponse<ApplyResult>>(`${BASE}/apply`, payload);
    return res.data;
  },

  /** Confirm a completed Paystack transaction after redirect back. */
  verify: async (reference: string): Promise<ApiResponse<VerifyResultData>> => {
    const res = await apiClient.get<ApiResponse<VerifyResultData>>(`${BASE}/verify`, {
      params: { reference },
    });
    return res.data;
  },
};
