import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';

const BASE = '/api/cbt/results';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ClassApproval {
  id: string;
  exam_id: string;
  class_code: string;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approval_date: string | null;
  rejection_reason: string | null;
  school_id: string;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStatusResponse {
  require_approval: boolean;
  statuses: ClassApproval[];
}

export interface PrintLog {
  id: number;
  school_id: string;
  branch_id: string | null;
  report_type: string;
  assessment_type: string | null;
  section: string | null;
  class_code: string | null;
  class_name: string | null;
  academic_year: string | null;
  term: string | null;
  student_count: number;
  printed_by: number;
  printed_by_name: string | null;
  print_date: string;
  print_type: string;
  copies_count: number;
  ip_address: string | null;
  user_agent: string | null;
}

export interface PrintLogPayload {
  report_type?: string;
  assessment_type?: string | null;
  section?: string | null;
  class_code?: string | null;
  class_name?: string | null;
  academic_year?: string | null;
  term?: string | null;
  student_count?: number;
  print_type?: 'Preview' | 'Download' | 'Print' | 'Bulk';
  copies_count?: number;
}

export interface PrintLogQuery {
  school_id?: string;
  section?: string;
  report_type?: string;
  class_code?: string;
  limit?: number;
}

export const resultApprovalService = {
  /** Get the school's release policy + per-class approval state for an exam. */
  getStatus: async (examId: string, classCode?: string): Promise<ApiResponse<ApprovalStatusResponse>> => {
    const res = await apiClient.post<ApiResponse<ApprovalStatusResponse>>(`${BASE}/approvals/status`, {
      exam_id: examId,
      class_code: classCode,
    });
    return res.data;
  },

  /** Approve an exam's results for the given classes. */
  approve: async (examId: string, classCodes: string[]): Promise<ApiResponse<{ exam_id: string; class_codes: string[] }>> => {
    const res = await apiClient.post<ApiResponse<{ exam_id: string; class_codes: string[] }>>(`${BASE}/approvals/approve`, {
      exam_id: examId,
      class_codes: classCodes,
    });
    return res.data;
  },

  /** Reject an exam's results for the given classes, with a reason. */
  reject: async (examId: string, classCodes: string[], reason: string): Promise<ApiResponse<{ exam_id: string; class_codes: string[] }>> => {
    const res = await apiClient.post<ApiResponse<{ exam_id: string; class_codes: string[] }>>(`${BASE}/approvals/reject`, {
      exam_id: examId,
      class_codes: classCodes,
      reason,
    });
    return res.data;
  },

  /** Release an exam's results (gated by the school's approval policy). */
  release: async (examId: string, classCodes: string[]): Promise<ApiResponse<{ exam_id: string; class_codes: string[] }>> => {
    const res = await apiClient.post<ApiResponse<{ exam_id: string; class_codes: string[] }>>(`${BASE}/approvals/release`, {
      exam_id: examId,
      class_codes: classCodes,
    });
    return res.data;
  },

  /** Log a report print/download/preview for audit. */
  logPrint: async (payload: PrintLogPayload): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(`${BASE}/print-log`, payload);
    return res.data;
  },

  /** Fetch recent report print logs. */
  getPrintLogs: async (params: PrintLogQuery = {}): Promise<ApiResponse<PrintLog[]>> => {
    const res = await apiClient.get<ApiResponse<PrintLog[]>>(`${BASE}/print-logs`, { params });
    return res.data;
  },
};
