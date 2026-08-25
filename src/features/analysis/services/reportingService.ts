import { _get } from '@/Helper';

const BASE = 'api/cbt/reports';

export interface ExamAggregate {
  mean?: number;
  median?: number;
  std_dev?: number;
  highest?: number;
  lowest?: number;
  pass_rate?: number;
  sample_size?: number;
}

export interface DistributionBin {
  bucket: string;
  count: number;
}

export interface TopicMastery {
  topic: string;
  mastery_percentage?: number;
  correct?: number;
  total?: number;
}

export interface ExamReport {
  exam: { id: string; title?: string; subject_code?: string; status?: string; created_at?: string };
  aggregate: ExamAggregate;
  distribution: DistributionBin[];
  performance_levels?: Record<string, number>;
  grade_distribution: Record<string, number>;
  topic_mastery: TopicMastery[];
  reliability?: {
    kr20?: number;
    cronbachs_alpha?: number;
    interpretation?: string;
    sem?: number;
    sample?: { students?: number; items?: number };
  };
  item_count?: number;
  student_count?: number;
  generated_at?: string;
}

export interface QuestionDetail {
  question_id: string;
  question_text?: string;
  question_type?: string;
  marks?: number;
  topic_name?: string;
  answered?: boolean;
  correct?: boolean;
  obtained?: number;
}

export interface StudentTopic {
  topic: string;
  total?: number;
  correct?: number;
  mastery_percentage?: number;
  earned_marks?: number;
  max_marks?: number;
}

export interface StudentReportData {
  exam: { id: string; title?: string; subject_code?: string };
  student: {
    admission_no: string;
    total_questions?: number;
    answered_questions?: number;
    correct_answers?: number;
    wrong_answers?: number;
    total_score?: number;
    max_score?: number;
    percentage?: number;
    grade?: string;
    is_passed?: boolean;
    time_taken?: number;
    submitted_at?: string;
    position?: number;
    out_of?: number;
  };
  topic_breakdown: StudentTopic[];
  question_detail: QuestionDetail[];
  generated_at?: string;
}

export interface SubjectExamRow {
  exam_id: string;
  title?: string;
  subject_code?: string;
  created_at?: string;
  mean?: number;
  median?: number;
  pass_rate?: number;
  students?: number;
  std_dev?: number;
}

export interface SubjectReportData {
  subject?: string;
  class_name?: string;
  overall: { exams: number; students: number; avg_mean: number; avg_pass_rate: number };
  exams: SubjectExamRow[];
  generated_at?: string;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const reportingService = {
  getExamReport: async (examId: string): Promise<ApiItemResponse<ExamReport>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}/exam/${examId}`, (res) => resolve(res), (err) => reject(err));
    });
  },
  getStudentReport: async (examId: string, admissionNo: string): Promise<ApiItemResponse<StudentReportData>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}/student/${examId}/${encodeURIComponent(admissionNo)}`, (res) => resolve(res), (err) => reject(err));
    });
  },
  getSubjectReport: async (params: { branch_id?: string; subject?: string; class_name?: string }): Promise<ApiItemResponse<SubjectReportData>> => {
    const qs = new URLSearchParams();
    if (params.branch_id) qs.set('branch_id', params.branch_id);
    if (params.subject) qs.set('subject', params.subject);
    if (params.class_name) qs.set('class_name', params.class_name);
    const query = qs.toString();
    return new Promise((resolve, reject) => {
      _get(`${BASE}/subject${query ? `?${query}` : ''}`, (res) => resolve(res), (err) => reject(err));
    });
  },
};