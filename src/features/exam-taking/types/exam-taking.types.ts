import { Question } from '@/features/exams/types/question.types';
import { Exam } from '@/features/exams/types/exam.types';

export interface ExamAnswer {
  question_id: string;
  answer: string | string[]; // For multiple choice, can be array
  question_type: string;
  time_spent?: number; // seconds
}

export interface ExamSubmission {
  exam_id: string;
  answers: ExamAnswer[];
  submitted_at: string;
  time_taken: number; // minutes
}

export interface ExamSession {
  exam: Exam;
  questions: Question[];
  answers: Record<string, ExamAnswer>;
  currentQuestionIndex: number;
  startTime: Date;
  timeRemaining: number; // seconds
  isSubmitted: boolean;
}

