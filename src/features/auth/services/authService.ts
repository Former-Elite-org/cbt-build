import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  LoginCredentials,
  LoginResponse,
  UserProfile,
  SchoolDetails,
  RegisterPayload,
  RegisterResponse,
  OnboardingPayload,
} from '../types/auth.types';
import { ApiResponse } from '@/types/api.types';
import { withBearer } from '@/lib/utils/roles';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN(credentials.type),
      {
        username: credentials.username,
        password: credentials.password,
        ...(credentials.short_name ? { short_name: credentials.short_name } : {}),
        ...(credentials.school_id ? { school_id: credentials.school_id } : {}),
      }
    );
    return response.data;
  },

  selectSchool: async (selection_token: string, school_id: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/select-school', {
      selection_token,
      school_id,
    });
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', payload);
    return response.data;
  },

  completeOnboarding: async (payload: OnboardingPayload): Promise<{ success: boolean; message?: string; school?: any }> => {
    const response = await apiClient.put('/auth/onboarding', payload);
    return response.data;
  },

  checkShortName: async (short_name: string): Promise<{ success: boolean; available: boolean }> => {
    const response = await apiClient.get(`/schools/check-shortname?short_name=${encodeURIComponent(short_name)}`);
    return response.data;
  },

  verifyToken: async (token: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(ENDPOINTS.AUTH.VERIFY_TOKEN, {
      headers: {
        authorization: withBearer(token),
      },
    });
    return response.data;
  },

  getSchoolDetails: async (shortName: string): Promise<ApiResponse<SchoolDetails[]>> => {
    const response = await apiClient.get<ApiResponse<SchoolDetails[]>>(
      `schools/get-details?query_type=select-by-short-name&short_name=${shortName}`
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('@@auth_token');
    localStorage.removeItem('school_id');
  },
};

