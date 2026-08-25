import { _get, _post } from '@/Helper';
import { ApiResponse } from '@/types/api.types';
import {
  ExamResult,
  ExamResultDetail,
  ResultQueryParams,
} from '../types/result.types';

// Transform backend result to frontend format
const transformResult = (result: any): ExamResult => {
  return {
    id: result.id,
    exam_id: result.exam_id,
    student_id: result.admission_no,
    total_marks: parseFloat(result.max_score || 0),
    obtained_marks: parseFloat(result.total_score || 0),
    percentage: parseFloat(result.percentage || 0),
    grade: result.grade || undefined,
    status: result.is_passed ? 'Pass' : 'Fail',
    submitted_at: result.submitted_at || result.created_at,
    time_taken: result.time_taken ? Math.round(result.time_taken / 60) : 0, // Convert seconds to minutes
    exam: result.exam ? {
      id: result.exam.id,
      exam_id: result.exam.id,
      title: result.exam.title || result.exam.assessment_type,
      assessment_type: result.exam.assessment_type,
      subject_name: result.exam.subject_name,
      class_name: result.exam.class_name,
      commence_date: result.exam.commence_date,
      start_time: result.exam.start_time,
      end_time: result.exam.end_time,
    } : undefined,
    student: result.student ? {
      student_id: result.student.admission_no,
      first_name: result.student.first_name || result.student.name?.split(' ')[0] || result.student.admission_no || '',
      last_name: result.student.last_name || result.student.surname || result.student.name?.split(' ').slice(1).join(' ') || '',
      admission_no: result.student.admission_no,
      email: result.student.email,
    } : undefined,
  };
};

export const resultService = {
  getAll: async (
    params?: ResultQueryParams
  ): Promise<ApiResponse<ExamResult[]>> => {
    return new Promise((resolve, reject) => {
      const queryParams: any = {
        query_type: 'select',
        ...params
      };

      // Map frontend params to backend params
      if (params?.exam_id) queryParams.exam_id = params.exam_id;
      if (params?.student_id) queryParams.admission_no = params.student_id;

      _get(
        `exam-results?${new URLSearchParams(queryParams).toString()}`,
        (res) => {
          const results = Array.isArray(res.data) ? res.data : [];
          const transformedResults = results.map(transformResult);
          resolve({
            success: res.success,
            data: transformedResults,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  getDetailed: async (
    examId: string,
    admissionNo: string
  ): Promise<ApiResponse<ExamResultDetail>> => {
    return new Promise((resolve, reject) => {
      _get(
        `exam-results/detailed?exam_id=${examId}&admission_no=${admissionNo}`,
        (res) => {
          if (res.success && res.data) {
            const result = res.data;
            const transformed: ExamResultDetail = {
              ...transformResult(result),
              question_results: result.question_results || [],
            };
            resolve({
              success: true,
              data: transformed,
              message: res.message,
            });
          } else {
            reject(new Error(res.message || 'Failed to fetch detailed result'));
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  getStudentResults: async (
    admissionNo?: string
  ): Promise<ApiResponse<ExamResult[]>> => {
    return new Promise((resolve, reject) => {
      const params: any = { query_type: 'select' };
      if (admissionNo) params.admission_no = admissionNo;

      _get(
        `exam-results?${new URLSearchParams(params).toString()}`,
        (res) => {
          const results = Array.isArray(res.data) ? res.data : [];
          const transformedResults = results.map(transformResult);
          resolve({
            success: res.success,
            data: transformedResults,
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

