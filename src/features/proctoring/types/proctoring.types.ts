export interface ProctoredExam {
  exam_id: string;
  title: string;
  subject_name: string;
  class_name: string;
  status: string;
  duration: number;
  student_count: number;
  active_now: number;
  avg_integrity: number;
}

export interface ProctoringSessionRow {
  session_id: string;
  admission_no: string;
  status: string;
  started_at: string;
  submitted_at: string | null;
  online: boolean;
  last_activity_at: string | null;
  device_info: Record<string, unknown> | null;
  ip_address: string | null;
  event_count: number;
  score: number;
  level: 'High' | 'Moderate' | 'Low' | 'Critical';
  flags: string[];
  counts: Record<string, number>;
}

export interface ProctoringTimelineEvent {
  event_type: string;
  severity: number;
  occurred_at: string;
  details: Record<string, unknown> | null;
}

export interface ProctoringSessionInfo {
  session_id: string;
  status: string;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  last_activity_at: string | null;
  device_info: Record<string, unknown> | null;
  ip_address: string | null;
  total_minutes: number | null;
}

export interface ForensicReport {
  exam_id: string;
  admission_no: string;
  student_name?: string | null;
  sessions: ProctoringSessionInfo[];
  timeline: ProctoringTimelineEvent[];
  integrity: {
    score: number;
    level: 'High' | 'Moderate' | 'Low' | 'Critical';
    flags: string[];
    event_counts: Record<string, number>;
  };
  event_count: number;
}
