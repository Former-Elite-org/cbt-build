// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:34567',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@@auth_token',
  SCHOOL_ID: 'school_id',
  USER_DATA: 'user_data',
} as const;

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EXAMS: '/exams',
  EXAMS_CREATE: '/exams/create',
  EXAMS_EDIT: '/exams/:id/edit',
  EXAMS_QUESTIONS: '/exams/:id/questions',
  TAKE_EXAM: '/takeexam/:id',
  RESULTS: '/exam/results',
  RESULTS_VIEW: '/examresults/:id',
  STUDENT_RESULT: '/studentresult/:id',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  BRANCH_ADMIN: 'BranchAdmin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
} as const;

// Exam Status
export const EXAM_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RELEASED: 'Released',
} as const;

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE: 'True/False',
  SHORT_ANSWER: 'Short Answer',
} as const;

// Breakpoints (for JS use)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

