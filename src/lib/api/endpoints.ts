// API Endpoint constants

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: (type: 'users' | 'students') => `/${type}/login`,
    VERIFY_TOKEN: '/verify-token',
    LOGOUT: '/logout',
  },

  // Exams
  EXAMS: {
    LIST: '/examinations',
    GET: (id: string) => `/examinations/${id}`,
    CREATE: '/examinations',
    UPDATE: (id: string) => `/examinations/${id}`,
    DELETE: (id: string) => `/examinations/${id}`,
    UPDATE_STATUS: (id: string) => `/examinations?query_type=status&id=${id}`,
  },

  // Questions
  QUESTIONS: {
    LIST: '/exam-questions',
    CREATE: '/exam-questions',
    UPDATE: (id: string) => `/exam-questions/${id}`,
    DELETE: (id: string) => `/exam-questions/${id}`,
    BY_EXAM: (examId: string) => `/exam-questions?exam_id=${examId}`,
  },

  // Results
  RESULTS: {
    LIST: '/exam-results',
    GET: (id: string) => `/exam-results/${id}`,
    STUDENT_RESULTS: '/student-exam-results',
    SUBMIT: '/exam-submissions',
  },

  // AI Generator
  AI: {
    UPLOAD_DOCUMENT: '/ai/upload-document',
    GENERATE_QUESTIONS: '/ai/generate-questions',
    REGENERATE_QUESTION: '/ai/regenerate-question',
  },

  // Dashboard
  DASHBOARD: {
    ADMIN: '/dashboard_query?query_type=Select CBT Dashboard',
    STATS: '/dashboard/stats',
  },
} as const;

