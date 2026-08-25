import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Target,
  ArrowRight,
  RotateCcw,
  Trophy,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { practiceService } from '../services/practiceService';
import { PracticeQuestion, PracticeStats } from '../types/practice.types';
import BoardPracticeView from '../components/BoardPracticeView';

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  short_answer: 'Short Answer',
  fill_blank: 'Fill in the Blanks',
  numeric: 'Numeric',
  essay: 'Essay',
  matching: 'Matching',
  ordering: 'Ordering',
};

/** Grade a practice answer for instant feedback (learning context only). */
const gradeAnswer = (q: PracticeQuestion, selected: string | null): boolean => {
  if (!selected) return false;

  if (q.question_type === 'multiple_choice') {
    const opt = q.options.find((o) => o.option_label === selected);
    return !!opt?.is_correct;
  }
  if (q.question_type === 'true_false') {
    return selected.trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();
  }
  if (q.question_type === 'numeric') {
    const correct = parseFloat(q.correct_answer || '');
    const given = parseFloat(selected);
    if (Number.isNaN(correct) || Number.isNaN(given)) return false;
    return Math.abs(given - correct) <= Math.max(0.01, Math.abs(correct) * 0.005);
  }
  const a = selected.trim();
  const b = (q.correct_answer || '').trim();
  return q.is_case_sensitive ? a === b : a.toLowerCase() === b.toLowerCase();
};

function QuestionCard({
  question,
  index,
  total,
  onNext,
  onFinish,
}: {
  question: PracticeQuestion;
  index: number;
  total: number;
  onNext: (correct: boolean) => void;
  onFinish: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isChoice = question.question_type === 'multiple_choice' || question.question_type === 'true_false';
  const correct = revealed ? gradeAnswer(question, selected) : false;
  const isLast = index === total - 1;

  const reset = () => {
    setSelected(null);
    setRevealed(false);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary">{TYPE_LABELS[question.question_type] || question.question_type}</Badge>
            {question.subject_name && (
              <Badge variant="outline">{question.subject_name}</Badge>
            )}
            {question.topic_name && (
              <Badge variant="outline">{question.topic_name}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5" title={`Review stage ${question.stage} of 5`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`h-1.5 w-3 rounded-full transition-colors ${
                  s <= question.stage ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
        <CardTitle className="text-lg font-semibold leading-relaxed pt-3">
          {question.question_text}
        </CardTitle>
        <CardDescription>
          Question {index + 1} of {total}
        </CardDescription>
      </CardHeader>

      <CardBody className="space-y-4 p-5">
        {isChoice ? (
          <div className="space-y-2">
            {question.options.map((opt) => {
              let stateClass =
                'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5';
              if (revealed) {
                if (opt.is_correct) {
                  stateClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                } else if (opt.option_label === selected) {
                  stateClass = 'border-red-400 bg-red-50 dark:bg-red-900/20';
                } else {
                  stateClass = 'border-slate-200 dark:border-slate-700 opacity-60';
                }
              } else if (opt.option_label === selected) {
                stateClass = 'border-primary bg-primary/10';
              }
              return (
                <button
                  key={opt.id}
                  disabled={revealed}
                  onClick={() => setSelected(opt.option_label)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200 disabled:cursor-default ${stateClass}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {opt.option_label}
                  </span>
                  <span className="flex-1">{opt.option_text}</span>
                  {revealed && opt.is_correct && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                  {revealed && opt.option_label === selected && !opt.is_correct && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder={
                question.question_type === 'numeric' ? 'Type your numeric answer…' : 'Type your answer…'
              }
              value={selected || ''}
              disabled={revealed}
              onChange={(e) => setSelected(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && selected && !revealed) setRevealed(true);
              }}
              className="h-11"
            />
            {revealed && (
              <p className="text-sm">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Correct answer: </span>
                {question.correct_answer}
              </p>
            )}
          </div>
        )}

        {/* Feedback */}
        {revealed && (
          <div
            className={`rounded-xl border p-4 animate-in slide-in-from-bottom-2 duration-300 ${
              correct
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20'
                : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {correct ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-300">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 dark:text-red-300">
                    Not quite{isChoice ? ` — the answer is ${question.options.find((o) => o.is_correct)?.option_label}` : ''}
                  </span>
                </>
              )}
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {correct ? 'Next review scheduled further out' : 'This question will come back in 10 minutes'}
              </span>
            </div>
            {question.explanation && (
              <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-slate-700 dark:text-slate-300">{question.explanation}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          {!revealed ? (
            <Button onClick={() => setRevealed(true)} disabled={!selected} className="gap-2">
              Check Answer
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : isLast ? (
            <Button onClick={() => onFinish(correct)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Trophy className="h-4 w-4" />
              Finish Session
            </Button>
          ) : (
            <Button
              onClick={() => {
                reset();
                onNext(correct);
              }}
              className="gap-2"
            >
              Next Question
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function StatsBar({ stats }: { stats: PracticeStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="flex items-center gap-3 py-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{stats.due_count}</p>
            <p className="text-[11px] text-muted-foreground">Due now</p>
          </div>
        </CardBody>
      </Card>
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="flex items-center gap-3 py-3">
          <div className="rounded-lg bg-amber-500/10 p-2.5">
            <BookOpen className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{stats.upcoming_count}</p>
            <p className="text-[11px] text-muted-foreground">Scheduled</p>
          </div>
        </CardBody>
      </Card>
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="flex items-center gap-3 py-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{stats.mastered_count}</p>
            <p className="text-[11px] text-muted-foreground">Mastered</p>
          </div>
        </CardBody>
      </Card>
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="flex items-center gap-3 py-3">
          <div className="rounded-lg bg-indigo-500/10 p-2.5">
            <Brain className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">
              {stats.accuracy != null ? `${stats.accuracy}%` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">Accuracy</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function PracticePage() {
  const navigate = useNavigate();
  // ?tab=boards is used as the Paystack return target so the board view mounts
  // and can verify the payment (see BoardPracticeView verify-on-return).
  const [mode, setMode] = useState<'review' | 'boards'>(() =>
    new URLSearchParams(window.location.search).get('tab') === 'boards' ? 'boards' : 'review'
  );
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSession = useCallback(() => {
    setLoading(true);
    setSessionDone(false);
    setIndex(0);
    setResults([]);
    practiceService
      .getDue(10)
      .then((res) => {
        setQuestions(res.data.questions || []);
        setStats(res.data.stats);
      })
      .catch(() => toast.error('Could not load practice questions'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const recordAndAdvance = useCallback(
    (correct: boolean) => {
      const q = questions[index];
      if (!q) return;
      // Append synchronously so the session summary always counts every answer.
      setResults((prev) => [...prev, correct]);
      setSubmitting(true);
      practiceService
        .review(q.question_id, correct)
        .then((res) => {
          if (res.data.mastered) {
            toast.success('🎉 Mastered! This question is now scheduled out.');
          }
        })
        .catch(() => toast.error('Could not save this review'))
        .finally(() => setSubmitting(false));
    },
    [questions, index]
  );

  const handleNext = (correct: boolean) => {
    recordAndAdvance(correct);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const handleFinish = (correct: boolean) => {
    recordAndAdvance(correct);
    setSessionDone(true);
  };

  const sessionStats = useMemo(() => {
    const answered = results.length;
    const correctCount = results.filter(Boolean).length;
    return {
      answered,
      correctCount,
      accuracy: answered > 0 ? Math.round((correctCount / answered) * 100) : 0,
    };
  }, [results]);

  if (mode === 'boards') {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
          </div>
          <Button variant="outline" onClick={() => setMode('review')} className="gap-2">
            <Brain className="h-4 w-4" />
            Spaced Review
          </Button>
        </div>
        <BoardPracticeView />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Practice Mode</h1>
          </div>
          <Button variant="outline" onClick={() => setMode('boards')} className="gap-2">
            <Layers className="h-4 w-4" />
            Board Practice
          </Button>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card className="overflow-hidden text-center">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Session Complete!</h2>
            <p className="mt-1 text-emerald-50/90">
              {sessionStats.accuracy >= 70
                ? 'Great job — your review schedule is progressing.'
                : 'Keep practicing — missed questions will return shortly.'}
            </p>
          </div>
          <CardBody className="space-y-6 p-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-3xl font-bold tabular-nums">{sessionStats.answered}</p>
                <p className="mt-1 text-xs text-muted-foreground">Reviewed</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <p className="text-3xl font-bold tabular-nums text-emerald-600">{sessionStats.correctCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
                <p className="text-3xl font-bold tabular-nums text-indigo-600">{sessionStats.accuracy}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={loadSession} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Practice More
              </Button>
              <Button variant="outline" onClick={() => navigate('/exams')} className="gap-2">
                <Layers className="h-4 w-4" />
                Back to Exams
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Practice Mode</h1>
          </div>
          <Button variant="outline" onClick={() => setMode('boards')} className="gap-2">
            <Layers className="h-4 w-4" />
            Board Practice
          </Button>
        </div>
        {stats && <StatsBar stats={stats} />}
        <Card>
          <CardBody className="py-16 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h3 className="mt-4 text-lg font-bold">All caught up!</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              You have no questions due right now. Miss a question in an exam and it will appear
              here automatically for spaced review.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate('/exams')}>
                <Layers className="mr-2 h-4 w-4" />
                Back to Exams
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const current = questions[index];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Practice Mode</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Target className="h-3 w-3" />
            {stats?.due_count ?? 0} due
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setMode('boards')} className="gap-2">
            <Layers className="h-4 w-4" />
            Board Practice
          </Button>
        </div>
      </div>

      {stats && <StatsBar stats={stats} />}

      {/* Session progress */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(Math.min(index + 1, questions.length) / questions.length) * 100}%` }}
        />
      </div>

      <QuestionCard
        key={current.question_id}
        question={current}
        index={index}
        total={questions.length}
        onNext={handleNext}
        onFinish={handleFinish}
      />

      {submitting && <p className="text-center text-xs text-muted-foreground">Saving review…</p>}
    </div>
  );
}
