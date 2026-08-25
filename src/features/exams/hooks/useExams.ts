import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '../services/examService';
import { Exam, CreateExamDto, UpdateExamDto, ExamQueryParams } from '../types/exam.types';
import { ApiResponse } from '@/types/api.types';
import toast from 'react-hot-toast';

export const useExams = (params?: ExamQueryParams) => {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => examService.getAll(params),
    // Enable query if params exist (branch_id can be undefined for admins)
    enabled: params !== undefined,
  });
};

export const useExam = (id: string | null) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examService.getById(id!),
    enabled: !!id,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamDto) => examService.create(data),
    onSuccess: (response: ApiResponse<Exam>) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create exam');
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamDto }) =>
      examService.update(id, data),
    onSuccess: (response: ApiResponse<Exam>, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', variables.id] });
      toast.success('Exam updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update exam');
    },
  });
};

export const useUpdateExamStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      rejection_reason,
    }: {
      id: string;
      status: string;
      rejection_reason?: string;
    }) => examService.updateStatus(id, status, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update exam status');
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete exam');
    },
  });
};

