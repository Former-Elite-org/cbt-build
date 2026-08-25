import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Eye,
  MonitorPlay,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Activity,
  Radio,
  FileSearch,
  Clock,
  RefreshCw,
  Users,
  FileDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { proctoringService, ProctoringSettings } from '../services/proctoringService';
import { downloadForensicPdf } from '../lib/forensicPdf';
import {
  ForensicReport,
  ProctoredExam,
  ProctoringSessionRow,
} from '../types/proctoring.types';

const LEVEL_STYLES: Record<string, { badge: string; bar: string; text: string }> = {
  High: { badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  Moderate: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', bar: 'bg-amber-500', text: 'text-amber-600' },
  Low: { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300', bar: 'bg-orange-500', text: 'text-orange-600' },
  Critical: { badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', bar: 'bg-red-500', text: 'text-red-600' },
};

const LEVEL_ICON: Record<string, typeof ShieldCheck> = {
  High: ShieldCheck,
  Moderate: ShieldCheck,
  Low: ShieldQuestion,
  Critical: ShieldAlert,
};

const EVENT_LABELS: Record<string, string> = {
  tab_switch: 'Tab switch',
  tab_return: 'Tab return',
  window_blur: 'Window blur',
  window_focus: 'Window focus',
  copy_attempt: 'Copy attempt',
  paste_attempt: 'Paste attempt',
  cut_attempt: 'Cut attempt',
  right_click: 'Right-click',
  fullscreen_exit: 'Fullscreen exit',
  devtools: 'Developer tools',
  answer_change: 'Answer change',
  suspicious_speed: 'Suspicious speed',
  device_switch: 'Device switch',
  exam_start: 'Exam start',
  exam_submit: 'Exam submit',
  session_terminated: 'Session terminated',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  submitted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  expired: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  abandoned: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  terminated: 'bg-red-100 text-red-800 ring-1 ring-red-300 dark:bg-red-900/50 dark:text-red-300 dark:ring-red-800',
};

const timeAgo = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
};

const fmtTime = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function IntegrityScore({ score, level, size = 'sm' }: { score: number; level: string; size?: 'sm' | 'lg' }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.Moderate;
  const Icon = LEVEL_ICON[level] || ShieldQuestion;
  return (
    <div className={`flex items-center gap-3 ${size === 'lg' ? 'flex-col' : ''}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${style.text}`} />
        <span className={`font-bold tabular-nums ${size === 'lg' ? 'text-3xl' : ''} ${style.text}`}>{score}</span>
        <Badge className={style.badge}>{level}</Badge>
      </div>
      {size === 'sm' && (
        <div className="h-2 w-24 overflow-hidden rounded-full bg-primary-100 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function ProctoringPage() {
  const { examId: examIdParam } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exams, setExams] = useState<ProctoredExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(examIdParam || '');
  const [sessions, setSessions] = useState<ProctoringSessionRow[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [settings, setSettings] = useState<ProctoringSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [minQuestions, setMinQuestions] = useState(5);
  const [minSeconds, setMinSeconds] = useState(8);
  const [maxFlags, setMaxFlags] = useState(5);
  const [savingSettings, setSavingSettings] = useState(false);

  // Exam list with proctoring data
  const fetchExams = useCallback(() => {
    proctoringService
      .listExams()
      .then((res) => {
        const list = res.data || [];
        setExams(list);
        if (!selectedExamId && list.length > 0) {
          setSelectedExamId(list[0].exam_id);
        }
      })
      .catch(() => toast.error('Could not load proctored exams'))
      .finally(() => setLoadingExams(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Load this school's speed thresholds (defaults merged server-side)
  useEffect(() => {
    proctoringService
      .getSettings()
      .then((res) => {
        const data = res.data;
        if (data) {
          setSettings(data);
          setMinQuestions(data.min_questions);
          setMinSeconds(data.min_seconds_per_question);
          setMaxFlags(data.max_flags);
        }
      })
      .catch(() => toast.error('Could not load proctoring settings'))
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleSaveSettings = () => {
    setSavingSettings(true);
    proctoringService
      .updateSettings({
        min_questions: minQuestions,
        min_seconds_per_question: minSeconds,
        max_flags: maxFlags,
      })
      .then((res) => {
        if (res.data) {
          setSettings(res.data);
          setMinQuestions(res.data.min_questions);
          setMinSeconds(res.data.min_seconds_per_question);
          setMaxFlags(res.data.max_flags);
        }
        toast.success('Proctoring thresholds updated');
      })
      .catch(() => toast.error('Could not save proctoring settings'))
      .finally(() => setSavingSettings(false));
  };

  const handleResetSettings = () => {
    setSavingSettings(true);
    proctoringService
      .resetSettings()
      .then((res) => {
        if (res.data) {
          setSettings(res.data);
          setMinQuestions(res.data.min_questions);
          setMinSeconds(res.data.min_seconds_per_question);
          setMaxFlags(res.data.max_flags);
        }
        toast.success('Proctoring settings restored to defaults');
      })
      .catch(() => toast.error('Could not reset proctoring settings'))
      .finally(() => setSavingSettings(false));
  };

  // Poll live sessions for the selected exam
  useEffect(() => {
    if (!selectedExamId) return;
    let cancelled = false;

    const load = () => {
      setLoadingSessions(true);
      proctoringService
        .listSessions(selectedExamId)
        .then((res) => {
          if (cancelled) return;
          setSessions(res.data || []);
          setLastUpdated(new Date());
        })
        .catch(() => {
          if (!cancelled) toast.error('Could not load proctoring sessions');
        })
        .finally(() => {
          if (!cancelled) setLoadingSessions(false);
        });
    };

    load();
    const interval = window.setInterval(load, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [selectedExamId]);

  const openReport = (admissionNo: string) => {
    setReportOpen(true);
    setReportLoading(true);
    proctoringService
      .getForensicReport(selectedExamId, admissionNo)
      .then((res) => setReport(res.data))
      .catch(() => {
        toast.error('Could not load forensic report');
        setReportOpen(false);
      })
      .finally(() => setReportLoading(false));
  };

  const handleExportPdf = () => {
    if (!report) return;
    const exam = exams.find((e) => e.exam_id === report.exam_id);
    downloadForensicPdf(report, {
      title: exam?.title,
      subject_name: exam?.subject_name,
      class_name: exam?.class_name,
      status: exam?.status,
      brand: 'Elite CBT',
    });
    toast.success('Forensic report exported as PDF');
  };

  const activeCount = sessions.filter((s) => s.online).length;
  const flaggedCount = sessions.filter((s) => s.flags.length > 0).length;
  const avgScore =
    sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length) : 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MonitorPlay className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Live Proctoring</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time integrity monitoring for CBT exam attempts
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {sessions.some((s) => s.online) && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  sessions.some((s) => s.online) ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            </span>
            {activeCount} online
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
              updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
        </div>
      </div>

      {/* Exam picker + stat cards */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selectedExamId}
          onValueChange={(v) => {
            setSelectedExamId(v);
            navigate(`/proctoring/${v}`, { replace: true });
          }}
        >
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder={loadingExams ? 'Loading exams…' : 'Select an exam'} />
          </SelectTrigger>
          <SelectContent>
            {exams.map((e) => (
              <SelectItem key={e.exam_id} value={e.exam_id}>
                {e.title} · {e.subject_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Speed-threshold settings (school-configurable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Integrity Thresholds
            <Badge
              variant="outline"
              className="ml-auto text-[10px] font-semibold"
            >
              {settings?.source === 'school' ? 'School custom' : 'Platform default'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Submissions with fewer questions than the minimum, or an average pace
            below the seconds-per-question floor, are auto-flagged. When a
            student accumulates more integrity events than the max-flag count,
            the session is terminated automatically and can no longer be
            submitted.
          </CardDescription>
        </CardHeader>
        <CardBody className="flex flex-wrap items-end gap-4">
          {settingsLoading ? (
            <Skeleton className="h-16 w-full max-w-sm" />
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="min-questions" className="text-xs font-semibold">
                  Min questions before flagging
                </Label>
                <Input
                  id="min-questions"
                  type="number"
                  min={1}
                  max={200}
                  value={minQuestions}
                  onChange={(e) => setMinQuestions(Number(e.target.value))}
                  className="w-40"
                />
                <p className="text-[11px] text-muted-foreground">
                  Tiny quizzes below this count are never flagged.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="min-seconds" className="text-xs font-semibold">
                  Max pace floor (seconds / question)
                </Label>
                <Input
                  id="min-seconds"
                  type="number"
                  min={1}
                  max={600}
                  value={minSeconds}
                  onChange={(e) => setMinSeconds(Number(e.target.value))}
                  className="w-40"
                />
                <p className="text-[11px] text-muted-foreground">
                  Average pace below this triggers the flag.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-flags" className="text-xs font-semibold">
                  Max flags before termination
                </Label>
                <Input
                  id="max-flags"
                  type="number"
                  min={1}
                  max={100}
                  value={maxFlags}
                  onChange={(e) => setMaxFlags(Number(e.target.value))}
                  className="w-40"
                />
                <p className="text-[11px] text-muted-foreground">
                  Integrity events beyond this end the attempt.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Saving…' : 'Save thresholds'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={savingSettings || settings?.source !== 'school'}
                  onClick={handleResetSettings}
                >
                  {savingSettings ? 'Restoring…' : 'Restore defaults'}
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {loadingExams ? (
        <Skeleton className="h-40 w-full" />
      ) : exams.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <Eye className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No proctoring data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once students take an exam, integrity events appear here automatically.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="transition-shadow hover:shadow-md">
              <CardBody className="flex items-center gap-4 py-4">
                <div className="rounded-lg bg-sky-100 p-3 dark:bg-sky-900/40">
                  <Users className="h-5 w-5 text-sky-700 dark:text-sky-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{sessions.length}</p>
                  <p className="text-xs text-muted-foreground">Students tracked</p>
                </div>
              </CardBody>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardBody className="flex items-center gap-4 py-4">
                <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/40">
                  <ShieldAlert className="h-5 w-5 text-red-700 dark:text-red-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{flaggedCount}</p>
                  <p className="text-xs text-muted-foreground">Flagged attempts</p>
                </div>
              </CardBody>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardBody className="flex items-center gap-4 py-4">
                <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/40">
                  <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{avgScore}</p>
                  <p className="text-xs text-muted-foreground">Avg integrity / 100</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sessions table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  Live Sessions
                </CardTitle>
                <CardDescription>
                  Auto-refreshes every 10 seconds · click a row's report to open forensics
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Integrity</th>
                      <th className="px-4 py-3 font-medium">Flags</th>
                      <th className="px-4 py-3 font-medium">Events</th>
                      <th className="px-4 py-3 font-medium">Last activity</th>
                      <th className="px-4 py-3 font-medium text-right">Forensic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSessions && sessions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ) : sessions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                          No sessions recorded for this exam yet.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((s) => (
                        <tr
                          key={s.session_id}
                          className="border-b transition-colors last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  s.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                                }`}
                                title={s.online ? 'Online now' : 'Offline'}
                              />
                              <span className="font-medium tabular-nums">{s.admission_no}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={STATUS_BADGE[s.status] || 'bg-slate-100 text-slate-700'}>
                              {s.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <IntegrityScore score={s.score} level={s.level} />
                          </td>
                          <td className="px-4 py-3">
                            {s.flags.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <div className="flex max-w-[220px] flex-wrap gap-1">
                                {s.flags.slice(0, 2).map((f) => (
                                  <Badge key={f} className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                    {f}
                                  </Badge>
                                ))}
                                {s.flags.length > 2 && (
                                  <Badge className="bg-slate-100 text-slate-700">
                                    +{s.flags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{s.event_count}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(s.last_activity_at)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-primary hover:text-primary/80"
                              onClick={() => openReport(s.admission_no)}
                            >
                              <FileSearch className="h-3.5 w-3.5" />
                              Report
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Forensic report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Forensic Report — {report?.admission_no || ''}
              </DialogTitle>
              <DialogDescription>
                Complete integrity timeline for this student's attempt
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={reportLoading || !report}
              onClick={handleExportPdf}
              className="shrink-0 gap-1.5"
              title="Download as PDF for exam bodies"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </DialogHeader>

          {reportLoading || !report ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardBody className="py-4">
                    <IntegrityScore score={report.integrity.score} level={report.integrity.level} size="lg" />
                    <p className="mt-2 text-xs text-muted-foreground">Integrity score</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="py-4">
                    <p className="text-2xl font-bold tabular-nums">{report.timeline.length}</p>
                    <p className="text-xs text-muted-foreground">Recorded events</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(report.integrity.event_counts)
                        .filter(([, c]) => c > 0)
                        .slice(0, 4)
                        .map(([type, count]) => (
                          <Badge key={type} className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {EVENT_LABELS[type] || type} ×{count}
                          </Badge>
                        ))}
                    </div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="py-4">
                    <p className="text-2xl font-bold tabular-nums">{report.sessions.length}</p>
                    <p className="text-xs text-muted-foreground">Attempt session(s)</p>
                    {report.sessions[0] && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {report.sessions[0].total_minutes != null
                          ? `${report.sessions[0].total_minutes} min total`
                          : 'Attempt in progress'}
                      </p>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Flags */}
              {report.integrity.flags.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-semibold flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-red-500" /> Flags raised
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.integrity.flags.map((f) => (
                      <Badge key={f} className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> No integrity flags raised
                </p>
              )}

              {/* Timeline */}
              <div>
                <p className="mb-2 text-sm font-semibold">Event timeline</p>
                {report.timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No proctoring events recorded.</p>
                ) : (
                  <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
                    {report.timeline.map((ev, i) => {
                      const severityColor =
                        ev.severity >= 6
                          ? 'text-red-600'
                          : ev.severity >= 3
                            ? 'text-amber-600'
                            : 'text-slate-400';
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                            <span className="font-medium">
                              {EVENT_LABELS[ev.event_type] || ev.event_type}
                            </span>
                            {ev.details && Object.keys(ev.details).length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {ev.event_type === 'suspicious_speed'
                                  ? `${ev.details.avg_seconds_per_question}s/question · ${ev.details.questions} questions · ${ev.details.total_seconds}s total`
                                  : JSON.stringify(ev.details).slice(0, 60)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold ${severityColor}`}>
                              −{ev.severity}
                            </span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {fmtTime(ev.occurred_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
