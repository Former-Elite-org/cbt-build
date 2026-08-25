import { _get, _post, _put, _delete } from '@/Helper';
import { Question, CreateQuestionDto } from '../types/question.types';
import { ApiResponse } from '@/types/api.types';

// Helper function to transform backend question format to frontend format
const transformQuestion = (question: any): Question => {
  // Map question types from backend format (snake_case) to frontend format (Title Case)
  const questionTypeMap: Record<string, string> = {
    'multiple_choice': 'Multiple Choice',
    'true_false': 'True/False',
    'short_answer': 'Short Answer',
    'essay': 'Essay',
    'fill_blank': 'Fill in the Blanks',
    'matching': 'Matching',
    'ordering': 'Ordering',
    'numeric': 'Numeric',
  };

  // Get question type - map from backend format if needed, otherwise use as-is
  let questionType = question.question_type;
  if (questionType && questionTypeMap[questionType]) {
    questionType = questionTypeMap[questionType];
  }

  const transformed: Question = {
    ...question,
    question_id: question.question_id || question.id,
    question_type: questionType as any,
  };

  // Transform options from backend format (option_text) to frontend format (option)
  if (question.options && Array.isArray(question.options)) {
    transformed.options = question.options.map((opt: any) => ({
      id: opt.id,
      option: opt.option || opt.option_text || opt.text || '',
      is_correct: opt.is_correct || false,
      marks: opt.marks || 0,
      option_order: opt.option_order !== undefined ? opt.option_order : undefined,
      option_label: opt.option_label || undefined,
    }));
  } else if (question.options === null || question.options === undefined) {
    // Ensure options is undefined if not present (not an empty array)
    transformed.options = undefined;
  }

  return transformed;
};

export const questionService = {
  getByExam: async (examId: string): Promise<ApiResponse<Question[]>> => {
    return new Promise((resolve, reject) => {
      _get(
        `exam-questions?query_type=select&exam_id=${examId}`,
        (res) => {
          const questions = Array.isArray(res.data) ? res.data : [];
          // Transform each question to match frontend format
          const transformedQuestions = questions.map(transformQuestion);
          
          resolve({
            success: res.success,
            data: transformedQuestions,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  create: async (data: CreateQuestionDto): Promise<ApiResponse<Question>> => {
    return new Promise((resolve, reject) => {
      // Format options correctly for backend
      const formattedData: any = { ...data };
      
      // Convert options format if present
      if (formattedData.options && Array.isArray(formattedData.options)) {
        formattedData.options = formattedData.options.map((opt: any) => ({
          option_text: opt.option || opt.option_text || opt.text || '',
          option: opt.option || opt.option_text || opt.text || '',
          is_correct: opt.is_correct || false,
          marks: opt.marks || 0,
        }));
      }
      
      _post(
        'exam-questions',
        {
          ...formattedData,
          query_type: 'insert',
        },
        (res) => {
          const questionData = res.data?.[0] || res.data || null;
          const transformed = questionData ? transformQuestion(questionData) : null;
          
          resolve({
            success: res.success,
            data: transformed,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  createBulk: async (questions: CreateQuestionDto[]): Promise<ApiResponse<Question[]>> => {
    return new Promise((resolve, reject) => {
      // Format options correctly for backend
      const formattedQuestions = questions.map(q => {
        const formatted: any = { ...q, query_type: 'insert' };
        
        // Convert options format if present
        if (formatted.options && Array.isArray(formatted.options)) {
          formatted.options = formatted.options.map((opt: any) => ({
            option_text: opt.option || opt.option_text || opt.text || '',
            option: opt.option || opt.option_text || opt.text || '',
            is_correct: opt.is_correct || false,
            marks: opt.marks || 0,
            option_order: opt.option_order !== undefined ? opt.option_order : undefined,
            option_label: opt.option_label || undefined,
          }));
        }
        
        return formatted;
      });
      
      _post(
        'exam-questions',
        formattedQuestions,
        (res) => {
          const questions = Array.isArray(res.data) ? res.data : [];
          // Transform each question to match frontend format
          const transformedQuestions = questions.map(transformQuestion);
          
          resolve({
            success: res.success,
            data: transformedQuestions,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  update: async (id: string, data: Partial<CreateQuestionDto>): Promise<ApiResponse<Question>> => {
    return new Promise((resolve, reject) => {
      // Format options correctly for backend
      const formattedData: any = { ...data };
      
      // Convert options format if present
      if (formattedData.options && Array.isArray(formattedData.options)) {
        formattedData.options = formattedData.options.map((opt: any) => ({
          option_text: opt.option || opt.option_text || opt.text || '',
          option: opt.option || opt.option_text || opt.text || '',
          is_correct: opt.is_correct || false,
          marks: opt.marks || 0,
          option_order: opt.option_order !== undefined ? opt.option_order : undefined,
          option_label: opt.option_label || undefined,
        }));
      }
      
      _put(
        `exam-questions?query_type=update&id=${id}`,
        formattedData,
        (res) => {
          const questionData = res.data?.[0] || res.data || null;
          const transformed = questionData ? transformQuestion(questionData) : null;
          
          resolve({
            success: res.success,
            data: transformed,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return new Promise((resolve, reject) => {
      _delete(
        `exam-questions?query_type=delete&id=${id}`,
        { id }, // Include id in body as well
        (res) => {
          resolve({
            success: res.success,
            data: undefined,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },
};

