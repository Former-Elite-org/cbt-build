import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse } from '@/types/api.types';
import { Question } from '../types/question.types';

export interface UploadDocumentResponse {
  success: boolean;
  document_id: string;
  extracted_text: string;
  pages?: number;
  word_count?: number;
}

export interface GenerateQuestionsParams {
  document_id: string;
  question_count?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  question_types?: string[];
  subject?: string;
  grade_level?: string;
  custom_prompt?: string;
}

export interface GeneratedQuestion {
  question_text: string;
  question_type: 'Multiple Choice' | 'True/False' | 'Short Answer';
  options?: {
    text: string;
    is_correct: boolean;
  }[];
  correct_answer?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  source_context?: string;
  page_number?: number;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  questions: GeneratedQuestion[];
  processing_time?: number;
}

export const aiService = {
  uploadDocument: async (
    file: File,
    metadata: { school_id: string; branch_id: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadDocumentResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('school_id', metadata.school_id);
    formData.append('branch_id', metadata.branch_id);

    const response = await apiClient.post<ApiResponse<UploadDocumentResponse>>(
      ENDPOINTS.AI.UPLOAD_DOCUMENT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data;
  },

  generateQuestions: async (
    params: GenerateQuestionsParams
  ): Promise<ApiResponse<GenerateQuestionsResponse>> => {
    const response = await apiClient.post<ApiResponse<GenerateQuestionsResponse>>(
      ENDPOINTS.AI.GENERATE_QUESTIONS,
      {
        document_id: params.document_id,
        question_count: params.question_count || 10,
        difficulty: params.difficulty || 'mixed',
        question_types: params.question_types || ['Multiple Choice'],
        subject: params.subject,
        grade_level: params.grade_level,
        custom_prompt: params.custom_prompt,
      }
    );

    return response.data;
  },

  regenerateQuestion: async (
    documentId: string,
    questionIndex: number,
    questionContext?: string
  ): Promise<ApiResponse<{ question: GeneratedQuestion }>> => {
    const response = await apiClient.post<ApiResponse<{ question: GeneratedQuestion }>>(
      ENDPOINTS.AI.REGENERATE_QUESTION,
      {
        document_id: documentId,
        question_index: questionIndex,
        question_context: questionContext,
      }
    );

    return response.data;
  },
};

