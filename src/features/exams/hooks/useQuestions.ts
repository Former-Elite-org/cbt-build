import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '../services/questionService';
import { Question, CreateQuestionDto } from '../types/question.types';
import { ApiResponse } from '@/types/api.types';
import toast from 'react-hot-toast';

export const useQuestions = (examId: string | null) => {
  return useQuery({
    queryKey: ['questions', examId],
    queryFn: () => questionService.getByExam(examId!),
    enabled: !!examId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionDto) => questionService.create(data),
    onSuccess: (response: ApiResponse<Question>, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', variables.exam_id] });
      toast.success('Question added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create question');
    },
  });
};

export const useCreateQuestionsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questions: CreateQuestionDto[]) => questionService.createBulk(questions),
    onSuccess: (response: ApiResponse<Question[]>, variables) => {
      const examId = variables[0]?.exam_id;
      if (examId) {
        queryClient.invalidateQueries({ queryKey: ['questions', examId] });
      }
      toast.success(`${variables.length} questions added successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create questions');
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuestionDto> }) =>
      questionService.update(id, data),
    onSuccess: (response: ApiResponse<Question>, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update question');
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => questionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete question');
    },
  });
};

