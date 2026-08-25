import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resultApprovalService } from '../services/resultApprovalService';
import { ApprovalStatusResponse, PrintLogQuery } from '../services/resultApprovalService';

/** Per-class approval state for an exam's results. */
export const useApprovalStatus = (examId: string | null) => {
  return useQuery<ApprovalStatusResponse>({
    queryKey: ['result-approval-status', examId],
    queryFn: () => resultApprovalService.getStatus(examId!).then((res) => res.data),
    enabled: !!examId,
  });
};

/** Approve an exam's results for selected classes. */
export const useApproveResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, classCodes }: { examId: string; classCodes: string[] }) =>
      resultApprovalService.approve(examId, classCodes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['result-approval-status', variables.examId] });
    },
  });
};

/** Reject an exam's results for selected classes. */
export const useRejectResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, classCodes, reason }: { examId: string; classCodes: string[]; reason: string }) =>
      resultApprovalService.reject(examId, classCodes, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['result-approval-status', variables.examId] });
    },
  });
};

/** Release an exam's results (gated by school approval policy). */
export const useReleaseResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, classCodes }: { examId: string; classCodes: string[] }) =>
      resultApprovalService.release(examId, classCodes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['result-approval-status', variables.examId] });
    },
  });
};

/** Recent report print logs. */
export const usePrintLogs = (params?: PrintLogQuery) => {
  return useQuery({
    queryKey: ['report-print-logs', params],
    queryFn: () => resultApprovalService.getPrintLogs(params).then((res) => res.data),
  });
};

/** Log a report print action. */
export const useLogPrint = () => {
  return useMutation({
    mutationFn: resultApprovalService.logPrint,
  });
};
