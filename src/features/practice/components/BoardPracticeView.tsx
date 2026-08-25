import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  FileQuestion,
  Gift,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { practiceService } from '../services/practiceService';
import { BoardExam, PracticeBoard, SubjectAccessInfo } from '../types/board.types';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import PracticePaywall from '@/features/subscription/components/PracticePaywall';
import { naira } from '@/features/subscription/utils/format';

const BOARD_STYLES: Record<string, { accent: string; chip: string }> = {
  JAMB: { accent: 'from-indigo-500 to-blue-600', chip: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  WAEC: { accent: 'from-emerald-500 to-teal-600', chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  NECO: { accent: 'from-orange-500 to-amber-600', chip: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  GCE: { accent: 'from-rose-500 to-pink-600', chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  BECE: { accent: 'from-violet-500 to-purple-600', chip: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
};

const LEVEL_LABELS: Record<string, string> = {
  tertiary: 'Tertiary Entrance',
  senior: 'Senior Secondary',
  junior: 'Junior Secondary',
};

function BoardCard({ board, onOpen }: { board: PracticeBoard; onOpen: () => void }) {
  const style = BOARD_STYLES[board.board] || BOARD_STYLES.JAMB;
  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`bg-gradient-to-r ${style.accent} p-5 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">{board.board}</p>
            <p className="mt-0.5 text-xs text-white/85">{LEVEL_LABELS[board.level] || board.level}</p>
          </div>
          <Badge className="border-white/30 bg-white/15 text-white">
            {board.exam_count} {board.exam_count === 1 ? 'exam' : 'exams'}
          </Badge>
        </div>
      </div>
      <CardBody className="space-y-3 p-5">
        <p className="text-sm text-muted-foreground leading-snug">{board.name}</p>
        <div className="flex flex-wrap gap-1.5">
          {board.subjects.slice(0, 5).map((s) => (
            <span key={s.name} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${style.chip}`}>
              {s.name}
            </span>
          ))}
          {board.subjects.length > 5 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:bg-slate-800">
              +{board.subjects.length - 5} more
            </span>
          )}
        </div>
        <Button onClick={onOpen} className="w-full gap-2">
          Browse subjects
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardBody>
    </Card>
  );
}

export default function BoardPracticeView() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<PracticeBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState<PracticeBoard | null>(null);
  const [exams, setExams] = useState<BoardExam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const [access, setAccess] = useState<SubjectAccessInfo | null>(null);
  const [lockedSubject, setLockedSubject] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<'free' | 'single' | 'bundle' | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  const isAccessDenied = (err: any) => err?.response?.data?.code === 'PRACTICE_SUBSCRIPTION_REQUIRED';
  const isLocked = (subject: string) =>
    !!access && !access.full_access && !access.unlocked.includes(subject);

  const loadAccess = useCallback(() => {
    practiceService
      .getSubjectAccess()
      .then((res) => setAccess(res.data || null))
      .catch(() => setAccess(null));
  }, []);

  const loadBoards = useCallback(() => {
    setLoading(true);
    practiceService
      .getBoards()
      .then((res) => setBoards(res.data || []))
      .catch((err) => {
        if (isAccessDenied(err)) {
          setNeedsSubscription(true);
        } else {
          toast.error('Could not load board practice');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBoards();
    loadAccess();

    // Verify-on-return from Paystack: /practice?verify=1&reference=SUBJ-…
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    if (!reference) return;
    setCheckingOut('single');
    subscriptionService
      .verify(reference)
      .then((res) => {
        if (res.success) toast.success('Payment verified — subject unlocked!');
        else toast.error(res.message || 'Payment could not be verified');
      })
      .catch(() => toast.error('Payment could not be verified right now'))
      .finally(() => {
        setCheckingOut(null);
        window.history.replaceState({}, '', window.location.pathname);
        loadBoards();
        loadAccess();
      });
  }, [loadBoards, loadAccess]);

  const loadExams = useCallback(
    (board: string, subject?: string | null) => {
      setExamsLoading(true);
      setExams([]);
      practiceService
        .getBoardExams(board, subject || undefined)
        .then((res) => setExams(res.data || []))
        .catch((err) => {
          if (err?.response?.data?.code === 'SUBJECT_LOCKED') {
            setLockedSubject(err.response.data.data?.subject || subject || null);
            setAccess((a) => (a ? { ...a, ...err.response.data.data } : a));
          } else {
            toast.error('Could not load exams for this board');
          }
        })
        .finally(() => setExamsLoading(false));
    },
    []
  );

  const openBoard = (board: PracticeBoard) => {
    setSelectedBoard(board);
    setSubjectFilter(null);
    setLockedSubject(null);
    loadExams(board.board);
  };

  const pickSubject = (name: string) => {
    setLockedSubject(null);
    if (isLocked(name)) {
      setLockedSubject(name);
      setExams([]);
      setSubjectFilter(name);
      return;
    }
    setSubjectFilter(name);
    if (selectedBoard) loadExams(selectedBoard.board, name);
  };

  const grantFree = async () => {
    if (!lockedSubject) return;
    setCheckingOut('free');
    try {
      const res = await practiceService.grantFreeSubject(lockedSubject);
      toast.success(res.message || `${lockedSubject} unlocked with your free subject!`);
      setLockedSubject(null);
      loadAccess();
      if (selectedBoard) loadExams(selectedBoard.board, subjectFilter || undefined);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'DEVICE_FREE_USED') {
        toast.error('This device has already used its free subject. Sign in on another device or purchase access.');
        setAccess((a) => (a ? { ...a, device_free_used: true } : a));
      } else {
        toast.error(err?.response?.data?.message || 'Could not use your free subject');
      }
      loadAccess();
    } finally {
      setCheckingOut(null);
    }
  };

  const startCheckout = async (mode: 'single' | 'bundle') => {
    setCheckingOut(mode);
    try {
      const res = await practiceService.checkoutSubject({
        mode,
        subject: mode === 'single' ? lockedSubject || undefined : undefined,
        board: selectedBoard?.board,
        callback_url: `${window.location.origin}/practice?tab=boards&verify=1`,
      });
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }
      toast.error('Checkout could not be started');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Checkout could not be started');
    } finally {
      setCheckingOut(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-52 w-full" />
        ))}
      </div>
    );
  }

  if (needsSubscription) {
    return <PracticePaywall />;
  }

  if (!selectedBoard) {
    return (
      <div className="space-y-4">
        {access && !access.full_access && !access.free_used && !access.device_free_used && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <Gift className="h-4 w-4 text-primary" />
            <span>
              <strong>1 free subject</strong> is included with your account — pick any subject to unlock it.
            </span>
          </div>
        )}
        {access && !access.full_access && access.device_free_used && !access.free_used && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/40 dark:bg-amber-900/20">
            <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>This device</strong> has already used its free subject. Sign in on another device to claim a new one, or purchase access below.
            </span>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.board} board={board} onOpen={() => openBoard(board)} />
          ))}
        </div>
      </div>
    );
  }

  const style = BOARD_STYLES[selectedBoard.board] || BOARD_STYLES.JAMB;
  const lockedCount = selectedBoard.subjects.filter((s) => isLocked(s.name)).length;
  const unlockedCount = selectedBoard.subjects.length - lockedCount;
  const bundleSize = selectedBoard.subjects.length;
  // The bundle is only worth offering when it beats buying the REMAINING locked
  // subjects individually (6×₦500 = ₦3,000 vs ₦2,500).
  const subjectPrice = access?.pricing.subject_price ?? 500;
  const bundlePrice = access?.pricing.bundle_price ?? 2500;
  const bundleSavings = lockedCount * subjectPrice - bundlePrice;
  const showBundle = bundleSize >= 2 && bundleSavings > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setSelectedBoard(null)} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All boards
        </Button>
        <div className="flex items-center gap-2">
          <GraduationCap className={`h-5 w-5 ${style.chip.split(' ').pop()}`} />
          <h2 className="text-lg font-bold">{selectedBoard.board} Practice</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            setSubjectFilter(null);
            setLockedSubject(null);
            loadExams(selectedBoard.board);
          }}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !subjectFilter
              ? 'bg-primary text-primary-foreground'
              : 'bg-slate-100 text-muted-foreground hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        {selectedBoard.subjects.map((s) => {
          const locked = isLocked(s.name);
          const active = subjectFilter === s.name;
          return (
            <button
              key={s.name}
              onClick={() => pickSubject(s.name)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                locked
                  ? active
                    ? 'bg-amber-500 text-white'
                    : 'border border-amber-300/60 text-amber-600 hover:bg-amber-500/10 dark:border-amber-700/60 dark:text-amber-400'
                  : active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-slate-100 text-muted-foreground hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              {locked && <Lock className="h-3 w-3" />}
              {s.name} ({s.exams})
            </button>
          );
        })}
      </div>

      {/* Locked subject → unlock panel */}
      {lockedSubject ? (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
              <Lock className="h-6 w-6 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold">{lockedSubject} is locked</h3>
              <p className="text-sm text-muted-foreground">
                Unlock this subject to practise its past questions with answers and explanations.
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-200 p-6 sm:grid-cols-3 dark:border-slate-800">
            {access && !access.free_used && !access.device_free_used && (
              <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    <Gift className="h-4 w-4" /> Free subject
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Spend your 1 free subject on {lockedSubject} — no payment needed.
                  </p>
                </div>
                <Button
                  onClick={grantFree}
                  disabled={checkingOut !== null}
                  className="mt-3 gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {checkingOut === 'free' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Unlock free
                </Button>
              </div>
            )}

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Single subject</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {access ? naira(access.pricing.subject_price) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">One-time payment · lifetime access</p>
              </div>
              <Button
                onClick={() => startCheckout('single')}
                disabled={checkingOut !== null}
                className="mt-3 gap-2"
              >
                {checkingOut === 'single' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay to unlock
              </Button>
            </div>

            {showBundle && (
              <div className="flex flex-col justify-between rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/20">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    <Layers className="h-4 w-4" /> Full {selectedBoard.board} bundle
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{naira(bundlePrice)}</p>
                  <p className="text-xs text-muted-foreground">
                    All {bundleSize} subjects · save {naira(bundleSavings)} vs buying separately
                  </p>
                </div>
                <Button
                  onClick={() => startCheckout('bundle')}
                  disabled={checkingOut !== null}
                  variant="outline"
                  className="mt-3 gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300"
                >
                  {checkingOut === 'bundle' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Unlock all {bundleSize}
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : examsLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardBody className="py-14 text-center">
            <FileQuestion className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 font-bold">No exams here yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {subjectFilter && isLocked(subjectFilter)
                ? 'Unlock this subject above to start practising.'
                : 'Questions for this subject are still being prepared by our team.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="transition-shadow hover:shadow-md">
              <CardBody className="flex flex-wrap items-center gap-4 p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.chip}`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {exam.subject_name && (
                      <Badge className={`${style.chip} border-0 font-semibold text-xs`}>
                        {exam.subject_name}
                      </Badge>
                    )}
                    <p className="font-semibold leading-snug">{exam.title}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{exam.total_questions} questions</span>
                    <span>{exam.total_marks} marks</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exam.duration} min
                    </span>
                    {exam.submitted && (
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400">
                        <Trophy className="mr-1 h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </div>
                </div>
                <Button onClick={() => navigate(`/exams/${exam.exam_id}/take`)} className="gap-2">
                  {exam.submitted ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Retake
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
