import { _get, _post, _put, _delete } from '@/Helper';
import { Exam, CreateExamDto, UpdateExamDto, ExamQueryParams } from '../types/exam.types';
import { ApiResponse } from '@/types/api.types';

export const examService = {
  getAll: async (params?: ExamQueryParams): Promise<ApiResponse<Exam[]>> => {
    return new Promise((resolve, reject) => {
      const queryParams = new URLSearchParams();
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.subject_id) queryParams.append('subject_id', params.subject_id);
      if (params?.class_id) queryParams.append('class_id', params.class_id);
      if (params?.branch_id) queryParams.append('branch_id', params.branch_id);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      // Use select-all if no branch_id (for admins), otherwise use select
      const queryType = params?.branch_id ? 'select' : 'select-all';
      queryParams.append('query_type', queryType);
      
      _get(
        `examinations?${queryParams.toString()}`,
        (res) => {
          resolve({
            success: res.success,
            data: Array.isArray(res.data) ? res.data : [],
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  getById: async (id: string): Promise<ApiResponse<Exam>> => {
    return new Promise((resolve, reject) => {
      _get(
        `examinations?query_type=by_id&id=${id}`,
        (res) => {
          const examData = Array.isArray(res.data) ? res.data[0] : res.data;
          // Map response to include exam_id for frontend compatibility
          const mappedExam = examData ? {
            ...examData,
            exam_id: examData.id || examData.exam_id,
            start_time: examData.start_time || examData.startTime,
            end_time: examData.end_time || examData.endTime,
            commence_date: examData.commence_date || examData.commenceDate,
            subject_id: examData.subject_code || examData.subject_id,
            class_id: examData.class_code || examData.class_id,
            section_id: examData.section || examData.section_id,
            duration: examData.duration || 60, // Ensure duration is included
            instructions: examData.instructions || '', // Ensure instructions are included
            title: examData.title || examData.assessment_type // Ensure title is included
          } : examData;
          
          resolve({
            success: res.success,
            data: mappedExam,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  create: async (data: CreateExamDto): Promise<ApiResponse<Exam>> => {
    return new Promise((resolve, reject) => {
      _post(
        'examinations',
        {
          ...data,
          query_type: 'insert',
        },
        (res) => {
          resolve({
            success: res.success,
            data: Array.isArray(res.data) ? res.data[0] : res.data,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  update: async (id: string, data: UpdateExamDto): Promise<ApiResponse<Exam>> => {
    return new Promise((resolve, reject) => {
      _put(
        `examinations?query_type=update&id=${id}`,
        data,
        (res) => {
          resolve({
            success: res.success,
            data: Array.isArray(res.data) ? res.data[0] : res.data,
            message: res.message,
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  updateStatus: async (id: string, status: string, rejection_reason?: string): Promise<ApiResponse<Exam>> => {
    return new Promise((resolve, reject) => {
      _put(
        `examinations?query_type=status&id=${id}`,
        {
          status,
          rejection_reason,
        },
        (res) => {
          resolve({
            success: res.success,
            data: Array.isArray(res.data) ? res.data[0] : res.data,
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
        `examinations?query_type=delete&id=${id}`,
        {},
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

