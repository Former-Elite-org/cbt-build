import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useExams } from '@/features/exams/hooks/useExams';
import { useApprovalStatus, useApproveResults, useRejectResults, useReleaseResults } from '../hooks/useResultApproval';
import { ClassApproval, ApprovalStatus } from '../services/resultApprovalService';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Rocket, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<ApprovalStatus, { label: string; className: string }> = {
  Approved: { label: 'Approved', className: 'bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-2.5 py-0.5 text-xs font-semibold' },
  Rejected: { label: 'Rejected', className: 'bg-rose-500 text-white hover:bg-rose-600 rounded-full px-2.5 py-0.5 text-xs font-semibold' },
  Pending: { label: 'Pending', className: 'bg-amber-500 text-white hover:bg-amber-600 rounded-full px-2.5 py-0.5 text-xs font-semibold' },
};

export default function ResultApprovalPage() {
  const { selected_branch } = useAuthStore();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [rejectingClass, setRejectingClass] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: examsData, isLoading: examsLoading } = useExams({
    branch_id: selected_branch?.branch_id || '',
  });
  const exams = examsData?.data || [];

  const { data: approvalData, isLoading: approvalLoading } = useApprovalStatus(selectedExamId);
  const approveMutation = useApproveResults();
  const rejectMutation = useRejectResults();
  const releaseMutation = useReleaseResults();

  const statuses: ClassApproval[] = approvalData?.statuses || [];
  const requireApproval = approvalData?.require_approval ?? false;

  // Merge approval rows into exam cards (an exam has a single class via class_name).
  const examApprovalMap = new Map<string, ClassApproval>();
  statuses.forEach((s) => examApprovalMap.set(s.class_code, s));

  const getExamClassCode = (exam: any): string => exam.class_code || exam.class_name || '';

  const handleApprove = async (exam: any) => {
    const classCode = getExamClassCode(exam);
    if (!classCode) return toast.error('This exam has no class code');
    try {
      await approveMutation.mutateAsync({ examId: exam.id, classCodes: [classCode] });
      toast.success('Results approved for this class');
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve results');
    }
  };

  const handleReject = async (exam: any) => {
    const classCode = getExamClassCode(exam);
    if (!classCode) return toast.error('This exam has no class code');
    try {
      await rejectMutation.mutateAsync({ examId: exam.id, classCodes: [classCode], reason: rejectReason });
      setRejectingClass(null);
      setRejectReason('');
      toast.success('Results rejected for this class');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject results');
    }
  };

  const handleRelease = async (exam: any) => {
    const classCode = getExamClassCode(exam);
    if (!classCode) return toast.error('This exam has no class code');
    try {
      await releaseMutation.mutateAsync({ examId: exam.id, classCodes: [classCode] });
      toast.success('Results released to students');
    } catch (e: any) {
      // Backend returns { requiresApproval: true } when nothing is approved yet.
      const requiresApproval = e?.data?.requiresApproval === true;
      toast.error(requiresApproval ? 'Please approve the results first, then release.' : (e.message || 'Failed to release results'));
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#00356B] dark:text-white tracking-tight">
            Result Approval
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
            Approve, reject, and release CBT exam results to students.
          </p>
          {requireApproval && (
            <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-300/50 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              This school requires approval before results are released
            </span>
          )}
        </div>
      </div>

      {examsLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : exams.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam: any) => {
            const examId = exam.id || exam.exam_id;
            const classCode = getExamClassCode(exam);
            const approval = classCode ? examApprovalMap.get(classCode) : undefined;
            const status: ApprovalStatus = approval?.approval_status || 'Pending';
            const isMutating = approveMutation.isPending || rejectMutation.isPending || releaseMutation.isPending;
            return (
              <Card
                key={examId}
                className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl overflow-hidden"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-[#00356B] dark:text-white line-clamp-1">
                      {exam.title || exam.assessment_type}
                    </CardTitle>
                    <Badge className={STATUS_BADGE[status].className}>{STATUS_BADGE[status].label}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {exam.subject_name && (
                      <Badge variant="outline" className="text-[#00356B] dark:text-blue-400 border border-[#00356B]/30 dark:border-blue-500/30 bg-[#00356B]/5 dark:bg-blue-500/10 rounded-full text-[10px] font-semibold px-2.5 py-0.5">{exam.subject_name}</Badge>
                    )}
                    {exam.class_name && (
                      <Badge variant="outline" className="text-[#00356B] dark:text-blue-400 border border-[#00356B]/30 dark:border-blue-500/30 bg-[#00356B]/5 dark:bg-blue-500/10 rounded-full text-[10px] font-semibold px-2.5 py-0.5">{exam.class_name}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="p-4 pt-2">
                  {approval?.rejection_reason && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mb-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-2.5 py-1.5">
                      <strong>Reason:</strong> {approval.rejection_reason}
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t dark:border-gray-700/50 pt-3 mt-2">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Approved by</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                        {approval?.approved_by || '—'}
                        {approval?.approval_date ? ` • ${new Date(approval.approval_date).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#00356B] dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs h-8 rounded-lg font-semibold px-3"
                      onClick={() => setSelectedExamId(selectedExamId === examId ? null : examId)}
                    >
                      {selectedExamId === examId ? 'Hide' : 'Details'}
                    </Button>
                  </div>

                  {/* Detail + actions panel */}
                  {selectedExamId === examId && (
                    <div className="mt-3 space-y-3">
                      {approvalLoading ? (
                        <Skeleton className="h-16 w-full rounded-lg bg-gray-100 dark:bg-gray-700" />
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 px-3 rounded-lg text-xs"
                              onClick={() => handleApprove(exam)}
                              disabled={isMutating || status === 'Approved'}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold h-9 px-3 rounded-lg text-xs"
                              onClick={() => setRejectingClass(rejectingClass === classCode ? null : classCode)}
                              disabled={isMutating || status === 'Rejected'}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1.5 bg-[#00356B] hover:bg-[#00254B] text-white font-semibold h-9 px-3 rounded-lg text-xs"
                              onClick={() => handleRelease(exam)}
                              disabled={isMutating}
                            >
                              <Rocket className="h-3.5 w-3.5" />
                              Release
                            </Button>
                          </div>
                          {rejectingClass === classCode && (
                            <div className="flex gap-2">
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection..."
                                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-xs text-gray-900 dark:text-white focus-visible:ring-[#00356B] outline-none"
                              />
                              <Button
                                size="sm"
                                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold h-9 px-3 rounded-lg text-xs"
                                onClick={() => handleReject(exam)}
                                disabled={!rejectReason.trim()}
                              >
                                Confirm
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
          <CardBody className="text-center py-12 p-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No exams found</p>
          </CardBody>
        </Card>
      )}

      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs h-8 rounded-lg font-semibold"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {!requireApproval && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200/60 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          This school does not require result approval — results are released directly after the exam. Ask a super admin to enable "Require Result Approval" in school settings to use this workflow.
        </div>
      )}
    </div>
  );
}
