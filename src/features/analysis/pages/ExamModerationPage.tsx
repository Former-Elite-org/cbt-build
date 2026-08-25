import { useCallback, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Clock,
  FileQuestion,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ExamModerationCounts,
  ExamStatus,
  ModeratedExam,
  examModerationService,
} from '../services/examModerationService';

const STATUS_META: Record<string, { variant: 'default' | 'warning' | 'success' | 'destructive' | 'outline'; label: string }> = {
  Draft: { variant: 'outline', label: 'Draft' },
  Pending: { variant: 'warning', label: 'Pending' },
  Approved: { variant: 'success', label: 'Approved' },
  Rejected: { variant: 'destructive', label: 'Rejected' },
};

const BOARDS = ['JAMB', 'WAEC', 'NECO', 'GCE', 'BECE'];

const STATUS_ORDER: ExamStatus[] = ['Draft', 'Pending', 'Approved', 'Rejected'];

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function ExamModerationPage() {
  const [exams, setExams] = useState<ModeratedExam[]>([]);
  const [counts, setCounts] = useState<ExamModerationCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ExamStatus | 'ALL'>('ALL');
  const [boardFilter, setBoardFilter] = useState<string>('ALL');
  const [searchInput, setSearchInput] = useState('');

  const [rejectDialog, setRejectDialog] = useState<ModeratedExam | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const openReject = (exam: ModeratedExam) => {
    setReason('');
    setRejectDialog(exam);
  };

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examModerationService.list({ status: filter, board: boardFilter, q: searchInput || undefined });
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [filter, boardFilter, searchInput]);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await examModerationService.counts();
      if (res.data) setCounts(res.data);
    } catch {
      /* counts are cosmetic */
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleApprove = async (exam: ModeratedExam) => {
    setSaving(true);
    try {
      await examModerationService.approve(exam.id);
      toast.success(`"${exam.subject_name}" approved — now visible to students`);
      fetchExams();
      fetchCounts();
    } catch {
      toast.error('Approval failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    if (!reason.trim()) {
      toast.error('A rejection reason is required');
      return;
    }
    setSaving(true);
    try {
      await examModerationService.reject(rejectDialog.id, reason.trim());
      toast.success(`"${rejectDialog.subject_name}" rejected`);
      setRejectDialog(null);
      setReason('');
      fetchExams();
      fetchCounts();
    } catch {
      toast.error('Rejection failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Board Bank Moderation</h2>
          <p className="text-sm text-muted-foreground">
            Approve or reject shared board practice exams. Approved exams are visible to students.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchExams(); fetchCounts(); }} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {STATUS_ORDER.map((s) => {
          const n = counts?.[s] ?? 0;
          const isActive = filter === s;
          return (
            <Card
              key={s}
              className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => setFilter(isActive ? 'ALL' : s)}
            >
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold tabular-nums">{n}</span>
                  <Badge variant={STATUS_META[s].variant}>{STATUS_META[s].label}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s === 'Draft' ? 'Awaiting approval' : s === 'Pending' ? 'In review' : s === 'Approved' ? 'Live' : 'Blocked'}
                </p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moderation Queue</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={boardFilter} onValueChange={setBoardFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All boards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All boards</SelectItem>
                {BOARDS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 sm:col-span-2">
              <Input
                placeholder="Search by subject, title or exam code…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchExams()}
              />
              <Button variant="secondary" onClick={fetchExams}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Exams table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : exams.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No exams match these filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => {
                  const meta = STATUS_META[exam.status] || STATUS_META.Draft;
                  return (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <p className="font-medium">{exam.title || `${exam.subject_name} Practice`}</p>
                        <p className="text-xs text-muted-foreground">
                          {exam.subject_name} · {exam.exam_category || exam.assessment_type || 'Board-Practice'}
                        </p>
                        {exam.rejection_reason && (
                          <p className="mt-1 max-w-[260px] truncate text-xs text-destructive" title={exam.rejection_reason}>
                            {exam.rejection_reason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{exam.board || '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <FileQuestion className="h-3.5 w-3.5 text-muted-foreground" />
                          {exam.total_questions}
                          <span className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {exam.duration}m
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {exam.status === 'Approved' ? fmtDate(exam.approval_date) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {exam.status === 'Approved' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReject(exam)}
                          >
                            <XCircle className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        ) : exam.status === 'Rejected' ? (
                          <Button size="sm" variant="secondary" onClick={() => handleApprove(exam)} disabled={saving}>
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                          </Button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReject(exam)}
                              disabled={saving}
                            >
                              <XCircle className="mr-1 h-3 w-3" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(exam)} disabled={saving}>
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Reject dialog */}
      <Dialog
        open={!!rejectDialog}
        onOpenChange={(o) => {
          if (!o) {
            setRejectDialog(null);
            setReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectDialog?.subject_name} exam</DialogTitle>
            <DialogDescription>
              {rejectDialog?.title || 'Board practice exam'} will be hidden from students. A reason is required.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Rejection reason</Label>
            <Textarea
              rows={3}
              placeholder="e.g. Duplicate of an existing paper, questions missing explanations, wrong answer key…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
