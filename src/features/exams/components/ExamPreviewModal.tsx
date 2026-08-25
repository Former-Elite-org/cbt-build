import { useState } from 'react';
import { Question } from '../types/question.types';
import { ExamAnswer } from '@/features/exam-taking/types/exam-taking.types';
import { QuestionDisplay } from '@/features/exam-taking/components/QuestionDisplay';
import { QuestionNavigation } from '@/features/exam-taking/components/QuestionNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAlpha } from '@/lib/utils/format';
import { shuffleArray } from '@/lib/utils/shuffle';
import { ArrowLeft, PlayCircle, RotateCcw, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface ExamPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: any;
  questions: Question[];
}

interface QuestionResult {
  question: Question;
  status: 'correct' | 'wrong' | 'unanswered' | 'not_auto_graded';
  earned: number;
  studentAnswer?: string | string[];
}

type Stage = 'instructions' | 'exam' | 'results';

const questionId = (q: Question) => q.question_id || q.id!;

const isAnswered = (answer?: ExamAnswer): boolean => {
  if (!answer) return false;
  if (typeof answer.answer === 'string') return answer.answer.trim().length > 0;
  return Array.isArray(answer.answer) && answer.answer.length > 0;
};

export function ExamPreviewModal({ open, onOpenChange, exam, questions }: ExamPreviewModalProps) {
  const [stage, setStage] = useState<Stage>('instructions');
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [seed, setSeed] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Shuffle options per run when the exam has option randomization enabled.
  // Labels (A, B, C …) stay attached to their option so grading by label stays correct.
  const previewQuestions = exam?.randomize_options
    ? questions.map((q) => ({
        ...q,
        options: q.options && Array.isArray(q.options)
          ? shuffleArray(q.options, `${seed}:${questionId(q)}`)
          : q.options,
      }))
    : questions;

  const reset = () => {
    setStage('instructions');
    setAnswers({});
    setCurrentIndex(0);
    setResults([]);
    setSeed(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  };

  const startPreview = () => {
    setSeed(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setStage('exam');
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const handleAnswerChange = (questionIdValue: string, answer: string | string[]) => {
    const q = previewQuestions.find((qq) => questionId(qq) === questionIdValue);
    setAnswers((prev) => ({
      ...prev,
      [questionIdValue]: {
        question_id: questionIdValue,
        answer,
        question_type: q?.question_type || 'Multiple Choice',
      },
    }));
  };

  // Resolve the option a student chose by its fixed label (A/B/C …),
  // falling back to position-based lookup for options without a label.
  const findOptionByLabel = (q: Question, letter: string) => {
    const target = String(letter).trim().toUpperCase();
    const byLabel = q.options?.find((o) => {
      const label = String((o as any).option_label || '').trim().toUpperCase();
      return label === target;
    });
    if (byLabel) return byLabel;
    const index = target.charCodeAt(0) - 65;
    return q.options?.[index];
  };

  const grade = (): QuestionResult[] => {
    return previewQuestions.map((q) => {
      const answer = answers[questionId(q)];
      const raw = answer?.answer;

      if (!isAnswered(answer)) {
        return { question: q, status: 'unanswered', earned: 0 };
      }

      const type = q.question_type;

      if (type === 'Multiple Choice') {
        const option = findOptionByLabel(q, String(raw));
        if (option?.is_correct) {
          return { question: q, status: 'correct', earned: parseFloat(String(q.marks)) || 0, studentAnswer: raw };
        }
        return { question: q, status: 'wrong', earned: 0, studentAnswer: raw };
      }

      if (type === 'True/False') {
        const correctOption = q.options?.find((o) => o.is_correct);
        const correctText = String(correctOption?.option_text || correctOption?.option || '').trim().toLowerCase();
        if (String(raw).trim().toLowerCase() === correctText) {
          return { question: q, status: 'correct', earned: parseFloat(String(q.marks)) || 0, studentAnswer: raw };
        }
        return { question: q, status: 'wrong', earned: 0, studentAnswer: raw };
      }

      const correctAnswer = q.correct_answer || '';
      if (!correctAnswer.trim()) {
        return { question: q, status: 'not_auto_graded', earned: 0, studentAnswer: raw };
      }

      const a = String(raw).trim();
      const b = String(correctAnswer).trim();
      const isCorrect = q.case_sensitive ? a === b : a.toLowerCase() === b.toLowerCase();
      if (isCorrect) {
        return { question: q, status: 'correct', earned: parseFloat(String(q.marks)) || 0, studentAnswer: raw };
      }
      return { question: q, status: 'wrong', earned: 0, studentAnswer: raw };
    });
  };

  const handleSubmit = () => {
    setResults(grade());
    setStage('results');
  };

  const answeredCount = Object.values(answers).filter(isAnswered).length;
  const totalMarks = questions.reduce((sum, q) => sum + (parseFloat(String(q.marks)) || 0), 0);
  const score = results.reduce((sum, r) => sum + r.earned, 0);
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const hasInstructions = Boolean(exam?.instructions && exam?.instructions.trim());

  const statusBadge = (status: string) => {
    switch (status) {
      case 'correct':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Correct</Badge>;
      case 'wrong':
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold"><XCircle className="w-3.5 h-3.5 mr-1" />Wrong</Badge>;
      case 'unanswered':
        return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 font-semibold"><MinusCircle className="w-3.5 h-3.5 mr-1" />Unanswered</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold">Not auto-graded</Badge>;
    }
  };

  const correctAnswerText = (q: Question): string => {
    const correctOption = q.options?.find((o) => o.is_correct);
    if (correctOption) {
      const text = String(correctOption.option_text || correctOption.option || '');
      const label = String((correctOption as any).option_label || '').trim();
      if (label) return `${label}. ${text}`.trim();
      const index = q.options?.indexOf(correctOption);
      return `${getAlpha(index ?? -1)}. ${text}`.trim();
    }
    return String(q.correct_answer || '—');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        {stage === 'instructions' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                Preview Exam — Student Experience
              </DialogTitle>
              <DialogDescription>
                This is a dry run. Answers are <strong>not saved</strong> and nothing is recorded. Submit to see your score instantly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Title</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{exam?.assessment_type || exam?.title}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Questions</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{questions.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Marks</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{totalMarks}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{exam?.duration} min</p>
                </div>
              </div>

              {hasInstructions && (
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">Instructions</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{exam.instructions}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={startPreview} className="gap-2">
                <PlayCircle className="w-4 h-4" />
                Start Preview
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === 'exam' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Previewing: {exam?.assessment_type || exam?.title}</DialogTitle>
              <DialogDescription>
                {answeredCount} / {questions.length} answered — nothing will be saved.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-4">
              <div className="lg:col-span-3 space-y-4">
                {previewQuestions[currentIndex] && (
                  <QuestionDisplay
                    question={previewQuestions[currentIndex]}
                    questionNumber={currentIndex + 1}
                    totalQuestions={previewQuestions.length}
                    answer={answers[questionId(previewQuestions[currentIndex])]}
                    onAnswerChange={(answer) =>
                      handleAnswerChange(questionId(previewQuestions[currentIndex]), answer)
                    }
                  />
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentIndex((i) => Math.min(previewQuestions.length - 1, i + 1))}
                    disabled={currentIndex === previewQuestions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <QuestionNavigation
                  questions={previewQuestions}
                  answers={answers}
                  currentIndex={currentIndex}
                  onQuestionClick={setCurrentIndex}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 gap-2">
                Submit &amp; See Score
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === 'results' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {percentage >= 50 ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
                Preview Score
              </DialogTitle>
              <DialogDescription>
                Dry-run result — nothing was recorded for this exam.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{score}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mt-1">Score</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{totalMarks}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mt-1">Max Marks</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-center">
                  <p className="text-3xl font-black text-slate-600 dark:text-slate-300">{percentage}%</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-1">Percentage</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{results.filter((r) => r.status === 'correct').length}/{questions.length}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mt-1">Correct</p>
                </div>
              </div>

              <div className="space-y-3">
                {results.map((r, i) => (
                  <Card key={questionId(r.question)} className="border-slate-200/70 dark:border-slate-800">
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-400">Q{i + 1}.</span>
                            {statusBadge(r.status)}
                            <span className="text-xs font-semibold text-slate-400">({r.earned}/{r.question.marks} pts)</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">{r.question.question_text}</p>
                          {r.studentAnswer !== undefined && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Your answer: <span className="font-semibold">{Array.isArray(r.studentAnswer) ? r.studentAnswer.join(', ') : r.studentAnswer}</span>
                            </p>
                          )}
                          {r.status !== 'correct' && r.status !== 'not_auto_graded' && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                              Correct answer: <span className="font-semibold">{correctAnswerText(r.question)}</span>
                            </p>
                          )}
                          {r.status === 'not_auto_graded' && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                              This question type requires manual grading.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Preview
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
