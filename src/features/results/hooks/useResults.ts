import { useQuery } from '@tanstack/react-query';
import { resultService } from '../services/resultService';
import { ResultQueryParams } from '../types/result.types';

export const useResults = (params?: ResultQueryParams) => {
  return useQuery({
    queryKey: ['results', params],
    queryFn: () => resultService.getAll(params),
  });
};

export const useDetailedResult = (examId: string | null, admissionNo: string | null) => {
  return useQuery({
    queryKey: ['detailed-result', examId, admissionNo],
    queryFn: () => resultService.getDetailed(examId!, admissionNo!),
    enabled: !!examId && !!admissionNo,
  });
};

export const useStudentResults = (admissionNo?: string) => {
  return useQuery({
    queryKey: ['student-results', admissionNo],
    queryFn: () => resultService.getStudentResults(admissionNo),
  });
};

