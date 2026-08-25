import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ExamSubmission } from '../types/exam-taking.types';
import { ApiResponse } from '@/types/api.types';

export const examSubmissionService = {
  submitExam: async (submission: ExamSubmission & { admission_no?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      ENDPOINTS.RESULTS.SUBMIT,
      {
        exam_id: submission.exam_id,
        answers: submission.answers,
        submitted_at: submission.submitted_at,
        time_taken: submission.time_taken,
        admission_no: submission.admission_no,
      }
    );
    return response.data;
  },

  saveProgress: async (
    examId: string,
    answers: Record<string, any>
  ): Promise<void> => {
    // Save to localStorage for auto-save
    const key = `exam_progress_${examId}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        answers,
        saved_at: new Date().toISOString(),
      })
    );
  },

  loadProgress: (examId: string): Record<string, any> | null => {
    const key = `exam_progress_${examId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.answers || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  clearProgress: (examId: string): void => {
    const key = `exam_progress_${examId}`;
    localStorage.removeItem(key);
  },
};

