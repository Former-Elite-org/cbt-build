import { isAdminRole, isStudentRole, isTeacherRole } from '@/lib/utils/roles';

export type FlowTourStep = {
  title: string;
  body: string;
  /** `data-tour` value to spotlight. */
  target?: string;
  href?: string;
};

export const TOUR_EVENT = 'cbt:tour-replay';
export const TOUR_OPEN_SIDEBAR = 'cbt:tour-open-sidebar';
export const TOUR_VERSION = 'v1';

export type FlowTourRole = 'admin' | 'teacher' | 'student';

export const ADMIN_STEPS: FlowTourStep[] = [
  {
    title: 'Your CBT command centre',
    body: 'This dashboard is the admin view of exams in flight — pending reviews, live papers, and completion.',
    target: 'dashboard-overview',
    href: '/dashboard',
  },
  {
    title: 'Approve and release exams',
    body: 'Teachers submit papers here. Open Exams to approve, set the schedule, then release so students can sit them.',
    target: 'nav-exams',
    href: '/dashboard',
  },
  {
    title: 'The exam queue',
    body: 'Pending is waiting on you. Approved is scheduled. Release a paper when the class should sit it. Rejected stays on this board.',
    target: 'exam-tabs',
    href: '/exams',
  },
  {
    title: 'Results after release',
    body: 'Once a paper is released and students submit, Results is where you review scores and export.',
    target: 'nav-results',
    href: '/results',
  },
  {
    title: 'School roster',
    body: 'Sections, classes, subjects, students, and teachers live under School Management. Keep the roster current so exams land in the right class.',
    target: 'nav-school',
    href: '/dashboard',
  },
];

export const TEACHER_STEPS: FlowTourStep[] = [
  {
    title: 'Your teaching desk',
    body: 'Drafts, papers waiting on admin, and approved exams all show here first.',
    target: 'dashboard-overview',
    href: '/dashboard',
  },
  {
    title: 'Create, review, results',
    body: 'Use these shortcuts to write a new paper, open your exam list, or jump to scores.',
    target: 'teacher-quick-actions',
    href: '/dashboard',
  },
  {
    title: 'Your exams',
    body: 'Exams holds every paper you have written — draft, pending, approved, or sent back.',
    target: 'nav-exams',
    href: '/dashboard',
  },
  {
    title: 'Write a paper',
    body: 'Create New Exam starts a draft. Add questions, then send it to admin for approval before students can sit it.',
    target: 'teacher-create-exam',
    href: '/exams',
  },
  {
    title: 'See how the class did',
    body: 'Results lists released papers. Open one to view student scores.',
    target: 'nav-results',
    href: '/results',
  },
];

export const STUDENT_STEPS: FlowTourStep[] = [
  {
    title: 'Your exam desk',
    body: 'This is where you sit papers. Your name and admission number identify you for every attempt.',
    target: 'student-profile',
    href: '/dashboard',
  },
  {
    title: 'Pending, live, submitted',
    body: 'Pending is coming up. Ongoing is live — start it in the time window. Submitted is already done.',
    target: 'student-exam-tabs',
    href: '/dashboard',
  },
  {
    title: 'When a paper goes live',
    body: 'If an exam is in its time window, open Ongoing and start. You only get one sitting, so check the clock first.',
    target: 'student-exam-tabs',
    href: '/dashboard',
  },
  {
    title: 'My Results',
    body: 'After admin releases scores, My Results shows every paper you have sat.',
    target: 'student-results',
    href: '/dashboard',
  },
  {
    title: 'Your scores',
    body: 'Open a result for the question-by-question breakdown. Use Back to Exams when you are done.',
    target: 'student-results-list',
    href: '/my-results',
  },
];

export function tourRole(userType?: string | null): FlowTourRole | null {
  if (isAdminRole(userType)) return 'admin';
  if (isTeacherRole(userType)) return 'teacher';
  if (isStudentRole(userType)) return 'student';
  return null;
}

export function stepsFor(userType?: string | null): FlowTourStep[] | null {
  const role = tourRole(userType);
  if (role === 'admin') return ADMIN_STEPS;
  if (role === 'teacher') return TEACHER_STEPS;
  if (role === 'student') return STUDENT_STEPS;
  return null;
}

export function tourLabel(role: FlowTourRole): string {
  if (role === 'admin') return 'Admin tour';
  if (role === 'teacher') return 'Teacher tour';
  return 'Student tour';
}

export function tourUserId(user: { user_id?: string; id?: string; username?: string } | null | undefined): string {
  return String(user?.user_id || user?.id || user?.username || 'anon');
}

export function tourStorageKey(userId: string, role: FlowTourRole): string {
  return `cbt.tour.${TOUR_VERSION}:${userId}:${role}`;
}

export function requestTourReplay(userId: string, role: FlowTourRole): void {
  try {
    localStorage.removeItem(tourStorageKey(userId, role));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(TOUR_EVENT));
}

export function isNavTourTarget(target?: string): boolean {
  return Boolean(target && target.startsWith('nav-'));
}
