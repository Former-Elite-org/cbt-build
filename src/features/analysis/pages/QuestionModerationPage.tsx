import { useEffect, useState } from 'react';
import { useTeacherAccess } from '../hooks/useTeacherAccess';

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
import { Search, RefreshCw, Loader2, ShieldCheck, Send, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { moderationService } from '../services/moderationService';
import { ModerationQuestion, ModerationStatus } from '../types/moderation.types';

const STATUS_META: Record<string, { variant: 'default' | 'warning' | 'success' | 'destructive' | 'outline' }> = {
  Draft: { variant: 'outline' },
  'Pending Review': { variant: 'warning' },
  'Under Review': { variant: 'default' },
  'Needs Revision': { variant: 'warning' },
  Approved: { variant: 'success' },
  Rejected: { variant: 'destructive' },
};

const STATUSES: ModerationStatus[] = [
  'Draft',
  'Pending Review',
  'Under Review',
  'Needs Revision',
  'Approved',
  'Rejected',
];

export default function QuestionModerationPage() {
  const { isTeacher, selected_branch, subjectCodes } = useTeacherAccess();
  const [questions, setQuestions] = useState<ModerationQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ModerationStatus | 'ALL'>('ALL');
  const [searchInput, setSearchInput] = useState('');

  const [dialog, setDialog] = useState<{
    question: ModerationQuestion | null;
    action: 'review' | 'submit';
  } | null>(null);
  const [note, setNote] = useState('');
  const [action, setAction] = useState<'start' | 'approve' | 'reject' | 'revise'>('approve');
  const [saving, setSaving] = useState(false);

  const fetchQuestions = async (status?: ModerationStatus | 'ALL', q?: string) => {
    if (!selected_branch?.branch_id) return;
    setLoading(true);
    try {
      const res = await moderationService.list({
        status: status && status !== 'ALL' ? status : undefined,
        q: q || undefined,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      // Teachers only see questions for subjects they are assigned to teach
      const scoped = isTeacher
        ? data.filter((item) => subjectCodes?.has((item as any).subject_code || ''))
        : data;
      setQuestions(scoped);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(filter);
  }, [selected_branch?.branch_id, filter]);

  const handleSearch = () => {
    fetchQuestions(filter, searchInput);
  };

  const counts = (value: ModerationStatus) => questions.filter((q) => q.moderation.status === value).length;

  const openReview = (question: ModerationQuestion) => {
    setDialog({ question, action: 'review' });
    setNote(question.moderation.review_note || '');
    setAction((question.moderation.status as string) === 'Pending Review' ? 'start' : 'approve');
  };

  const openSubmit = (question: ModerationQuestion) => {
    setDialog({ question, action: 'submit' });
    setNote('');
  };

  const handleAction = async () => {
    if (!dialog?.question) return;
    setSaving(true);
    try {
      if (dialog.action === 'submit') {
        await moderationService.submit(dialog.question.id);
        toast.success('Submitted for review');
      } else {
        const res = await moderationService.review(dialog.question.id, { action, note });
        toast.success(res.message || `Marked ${action}`);
      }
      setDialog(null);
      fetchQuestions(filter);
    } catch {
      toast.error('Action failed');
    } finally {
      setSaving(false);
    }
  };

  const nextActionFor = (q: ModerationQuestion): string => {
    switch (q.moderation.status) {
      case 'Draft':
        return 'Submit for Review';
      case 'Needs Revision':
        return 'Submit for Review';
      case 'Pending Review':
        return 'Start Review';
      case 'Under Review':
        return 'Approve / Reject';
      default:
        return 'View';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Question Moderation</h2>
          <p className="text-sm text-muted-foreground">
            Peer review workflow: Draft → Pending Review → Under Review → Approved / Rejected
          </p>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={() => fetchQuestions(filter)} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.map((s) => (
          <Card key={s}>
            <CardBody className="p-3 text-center">
              <div className="text-2xl font-bold">{counts(s)}</div>
              <div className="text-xs text-muted-foreground">{s}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moderation Queue</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as ModerationStatus | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="Search question text..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="secondary" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Questions table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No questions in the moderation queue.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="max-w-md truncate">{q.question_text || '—'}</TableCell>
                    <TableCell className="text-xs">{q.question_type || '—'}</TableCell>
                    <TableCell className="text-xs">{q.topic_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_META[q.moderation.status]?.variant || 'outline'}>
                        {q.moderation.status}
                      </Badge>
                      {q.moderation.review_note && (
                        <div className="mt-1 max-w-[200px] truncate text-xs text-muted-foreground">
                          {q.moderation.review_note}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{q.moderation.reviewer_name || '—'}</TableCell>
                    <TableCell className="text-right">
                      {q.moderation.status === 'Draft' || q.moderation.status === 'Needs Revision' ? (
                        <Button size="sm" variant="secondary" onClick={() => openSubmit(q)}>
                          <Send className="mr-1 h-3 w-3" /> Submit
                        </Button>
                      ) : q.moderation.status === 'Approved' || q.moderation.status === 'Rejected' ? (
                        <Button size="sm" variant="ghost" onClick={() => openReview(q)}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => openReview(q)}>
                          <ShieldCheck className="mr-1 h-3 w-3" /> {nextActionFor(q)}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Action dialog */}
      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.action === 'submit'
                ? 'Submit for Review'
                : `Review Question — ${dialog?.question?.moderation.status || ''}`}
            </DialogTitle>
            <DialogDescription>
              {dialog?.question?.question_text || ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {dialog?.action === 'review' && (
              <div>
                <Label>Decision</Label>
                <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">Start Review</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="revise">Needs Revision</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>{dialog?.action === 'submit' ? 'Note (optional)' : 'Review Note'}</Label>
              <Textarea
                rows={3}
                placeholder={
                  dialog?.action === 'submit'
                    ? 'Optionally add a note for the reviewer'
                    : 'Add a review note or revision instructions'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialog?.action === 'review' ? 'Apply Decision' : 'Submit for Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}