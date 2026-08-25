import { useState, useEffect, useCallback } from 'react';
import { useExam } from '@/features/exams/hooks/useExams';
import { useQuestions } from '@/features/exams/hooks/useQuestions';
import { examSubmissionService } from '../services/examSubmissionService';
import { ExamSession, ExamAnswer } from '../types/exam-taking.types';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import toast from 'react-hot-toast';

export const useExamTaking = (examId: string | null) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: examData } = useExam(examId);
  const { data: questionsData } = useQuestions(examId);
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime] = useState(new Date());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const exam = examData?.data;
  const questions = questionsData?.data || [];

  // Load saved progress on mount
  useEffect(() => {
    if (examId && questions.length > 0) {
      const saved = examSubmissionService.loadProgress(examId);
      if (saved) {
        setAnswers(saved);
        toast.success('Previous progress loaded');
      }
    }
  }, [examId, questions.length]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!examId || Object.keys(answers).length === 0) return;

    const interval = setInterval(() => {
      examSubmissionService.saveProgress(examId, answers);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [examId, answers]);

  const handleAnswerChange = useCallback(
    (questionId: string, answer: string | string[], questionType: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          question_id: questionId,
          answer,
          question_type: questionType,
        },
      }));
    },
    []
  );

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitExam = async (isAutoSubmit = false) => {
    if (!exam || !examId) return;

    // Get admission_no from user (students have admission_no, teachers have user_id)
    const admission_no = (user as any)?.admission_no || (user as any)?.admissionNo || (user as any)?.user_id;
    if (!admission_no) {
      toast.error('Student admission number is required. Please log in again.');
      return;
    }

    // Only show confirmation for manual submissions
    if (!isAutoSubmit && !confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      return;
    }

    try {
      const timeTaken = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60);

      await examSubmissionService.submitExam({
        exam_id: examId,
        answers: Object.values(answers),
        submitted_at: new Date().toISOString(),
        time_taken: timeTaken,
        admission_no: admission_no,
      });

      // Clear saved progress
      examSubmissionService.clearProgress(examId);

      setIsSubmitted(true);
      toast.success(isAutoSubmit ? 'Time is up! Exam submitted successfully!' : 'Exam submitted successfully!');
      
      // Navigate back to exam list - results will be available when exam is released
      setTimeout(() => {
        navigate('/exams');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit exam');
    }
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const getAnswerForQuestion = (questionId: string) => {
    return answers[questionId];
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;
    return (Object.keys(answers).length / questions.length) * 100;
  };

  return {
    exam,
    questions,
    currentQuestion: getCurrentQuestion(),
    currentQuestionIndex,
    answers,
    startTime,
    isSubmitted,
    handleAnswerChange,
    goToQuestion,
    goToNext,
    goToPrevious,
    submitExam,
    getAnswerForQuestion,
    getAnsweredCount,
    getProgressPercentage,
  };
};

