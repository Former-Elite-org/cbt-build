import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Lightbulb,
  BookOpen,
  ArrowRight,
  MessageSquareText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackService, StudentDiagnostic } from '../services/feedbackService';

const STAR = '⭐';

export default function DiagnosticFeedbackPage() {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const admissionNo =
    searchParams.get('admission_no') ||
    searchParams.get('student_id') ||
    (user as any)?.admission_no ||
    (user as any)?.id;

  const [diagnostics, setDiagnostics] = useState<StudentDiagnostic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiagnostics = () => {
    if (!examId) return;
    setLoading(true);
    feedbackService
      .getStudentDiagnostics(examId, admissionNo)
      .then((res) => {
        if (res.success) setDiagnostics(res.data?.diagnostics || []);
        else toast.error(res.message || 'Failed to load diagnostics');
      })
      .catch(() => toast.error('Failed to load diagnostics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiagnostics();
  }, [examId, admissionNo]);

  const answered = diagnostics.length;
  const correct = diagnostics.filter((d) => d.is_correct).length;
  const incorrect = answered - correct;
  const pct = answered ? Math.round((correct / answered) * 100) : 0;

  const handleRate = (d: StudentDiagnostic, rating: number) => {
    feedbackService
      .rateFeedback({
        exam_id: examId || '',
        question_id: d.question_id,
        admission_no: admissionNo || '',
        helpful_rating: rating,
      })
      .then((res) => {
        if (res.success) toast.success('Feedback rated - thank you!');
        else toast.error(res.message || 'Failed to submit rating');
      })
      .catch(() => toast.error('Failed to submit rating'));
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-gray-800 pb-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-500 dark:text-gray-400 mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-black text-[#00356B] dark:text-white tracking-tight">
            Diagnostic Feedback
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Per-question guidance to help you understand your answers better
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Answered</p>
              <p className="text-2xl font-bold text-[#00356B] dark:text-white mt-1">{answered}</p>
            </div>
            <MessageSquareText className="h-8 w-8 text-sky-500" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Correct</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{correct}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">To Review</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{incorrect}</p>
              <Progress value={pct} className="h-1.5 mt-2 bg-gray-200 dark:bg-gray-700" />
            </div>
            <XCircle className="h-8 w-8 text-amber-500" />
          </CardBody>
        </Card>
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : diagnostics.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
          <CardBody className="text-center py-12 p-6">
            <MessageSquareText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No diagnostics available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Feedback is generated once you have responded to exam questions.
            </p>
          </CardBody>
        </Card>
      ) : (
        diagnostics.map((d) => {
          const correct = d.is_correct;
          const fb = d.feedback;
          return (
            <Card
              key={d.question_id}
              className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden ${
                correct ? 'border-emerald-100 dark:border-emerald-900/40' : 'border-amber-100 dark:border-amber-900/40'
              }`}
            >
              <CardHeader className="p-4 border-b dark:border-gray-700/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {d.question_text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {correct ? (
                        <Badge variant="success">Correct</Badge>
                      ) : (
                        <Badge variant="warning">Needs Review</Badge>
                      )}
                      <Badge variant="outline">{d.question_type || 'N/A'}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#00356B] dark:text-white">
                      {d.obtained_marks}/{d.marks}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-4 space-y-4">
                {/* Message */}
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {correct ? fb?.message : 'Review the explanation below to understand the correct answer.'}
                  </p>
                </div>

                {/* Remedial content */}
                {!correct && fb?.remedial && (
                  <div className="flex gap-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3">
                    <BookOpen className="h-5 w-5 text-[#00356B] dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase text-[#00356B] dark:text-blue-400">Explanation</p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{fb?.remedial}</p>
                    </div>
                  </div>
                )}

                {/* Next steps */}
                {!correct && fb?.next_steps && (
                  <div className="flex gap-3">
                    <ArrowRight className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{fb.next_steps}</p>
                  </div>
                )}

                {/* Rate feedback */}
                <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700/50">
                  <span className="text-xs text-gray-400">Was this helpful?</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-base hover:bg-amber-50 dark:hover:bg-amber-950/50"
                        onClick={() => handleRate(d, n)}
                      >
                        {STAR}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })
      )}
    </div>
  );
}