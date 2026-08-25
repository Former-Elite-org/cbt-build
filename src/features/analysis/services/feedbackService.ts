import { _get, _post, _put, _delete } from '@/Helper';

export interface Feedback {
  question_id: string;
  type: 'correct' | 'incorrect' | 'partial' | 'misconception';
  message: string;
  remedial: string;
  related_topics: string[];
  next_steps: string;
}

export interface FeedbackTemplate {
  id: string;
  question_id: string;
  feedback_type: string;
  feedback_text: string | null;
  remedial_content: string | null;
  related_topics: string | null;
  difficulty_adjustment: string | null;
}

export interface StudentDiagnostic {
  question_id: string;
  question_text: string;
  question_type: string;
  is_correct: boolean;
  obtained_marks: number;
  marks: number;
  feedback: Feedback;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const feedbackService = {
  getQuestionTemplates: async (questionId: string): Promise<ApiResponse<FeedbackTemplate[]>> => {
    return new Promise((resolve, reject) => {
      _get(
        `api/cbt/feedback/templates?question_id=${questionId}`,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  saveTemplate: async (data: {
    question_id: string;
    feedback_type: string;
    feedback_text?: string;
    remedial_content?: string;
    related_topics?: string[];
    difficulty_adjustment?: string;
  }): Promise<ApiResponse<FeedbackTemplate>> => {
    return new Promise((resolve, reject) => {
      _post('api/cbt/feedback/templates', data, (res) => resolve(res), (err) => reject(err));
    });
  },

  deleteTemplate: async (id: string): Promise<ApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      _delete(`api/cbt/feedback/templates/${id}`, {}, (res) => resolve(res), (err) => reject(err));
    });
  },

  getStudentDiagnostics: async (
    examId: string,
    admissionNo?: string
  ): Promise<ApiResponse<{ exam_id: string; admission_no: string; diagnostics: StudentDiagnostic[] }>> => {
    return new Promise((resolve, reject) => {
      const query = admissionNo ? `&admission_no=${encodeURIComponent(admissionNo)}` : '';
      _get(
        `api/cbt/feedback/exam/${examId}/diagnostic${query}`,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  rateFeedback: async (data: {
    exam_id: string;
    question_id: string;
    admission_no: string;
    helpful_rating: number;
  }): Promise<ApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      _post('api/cbt/feedback/rate', data, (res) => resolve(res), (err) => reject(err));
    });
  },
};