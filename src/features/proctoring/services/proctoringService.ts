import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';
import {
  ForensicReport,
  ProctoredExam,
  ProctoringSessionRow,
} from '../types/proctoring.types';

const BASE = '/api/cbt/proctoring';

export interface ProctoringSettings {
  min_questions: number;
  min_seconds_per_question: number;
  max_flags: number;
  source: 'default' | 'school';
}

export const proctoringService = {
  /** Staff: exams that have proctoring data. */
  listExams: async (): Promise<ApiResponse<ProctoredExam[]>> => {
    const res = await apiClient.get<ApiResponse<ProctoredExam[]>>(`${BASE}/exams`);
    return res.data;
  },

  /** Staff: live per-student proctoring rows for one exam. */
  listSessions: async (examId: string): Promise<ApiResponse<ProctoringSessionRow[]>> => {
    const res = await apiClient.get<ApiResponse<ProctoringSessionRow[]>>(
      `${BASE}/exams/${examId}/sessions`
    );
    return res.data;
  },

  /** Staff: full forensic report (timeline + integrity) for one student. */
  getForensicReport: async (
    examId: string,
    admissionNo: string
  ): Promise<ApiResponse<ForensicReport>> => {
    // Admission numbers contain slashes — send via query to survive routing.
    const res = await apiClient.get<ApiResponse<ForensicReport>>(
      `${BASE}/exams/${examId}/students`,
      { params: { admission_no: admissionNo } }
    );
    return res.data;
  },

  /** Staff: effective speed thresholds for this school. */
  getSettings: async (): Promise<ApiResponse<ProctoringSettings>> => {
    const res = await apiClient.get<ApiResponse<ProctoringSettings>>(`${BASE}/settings`);
    return res.data;
  },

  /** Staff: update this school's proctoring thresholds (speed + termination). */
  updateSettings: async (settings: {
    min_questions: number;
    min_seconds_per_question: number;
    max_flags: number;
  }): Promise<ApiResponse<ProctoringSettings>> => {
    const res = await apiClient.put<ApiResponse<ProctoringSettings>>(`${BASE}/settings`, settings);
    return res.data;
  },

  /** Staff: remove this school's override → platform defaults resume. */
  resetSettings: async (): Promise<ApiResponse<ProctoringSettings>> => {
    const res = await apiClient.delete<ApiResponse<ProctoringSettings>>(`${BASE}/settings`);
    return res.data;
  },
};
