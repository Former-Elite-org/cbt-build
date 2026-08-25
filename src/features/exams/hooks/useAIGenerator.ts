import { useState } from 'react';
import { aiService, GeneratedQuestion } from '../services/aiService';
import { useAuthStore } from '@/features/auth/store/authStore';
import toast from 'react-hot-toast';
import { UploadDocumentResponse } from '../services/aiService';

export const useAIGenerator = () => {
  const { user, selected_branch } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');

  const uploadDocument = async (file: File) => {
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School information not available');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await aiService.uploadDocument(
        file,
        {
          school_id: user.school_id,
          branch_id: selected_branch.branch_id,
        },
        (progress) => setUploadProgress(progress)
      );

      if (response.success && response.data) {
        setDocumentId(response.data.document_id);
        setExtractedText(response.data.extracted_text);
        toast.success('Document uploaded successfully!');
        return response.data;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const generateQuestions = async (params: {
    question_count?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    question_types?: string[];
    subject?: string;
    grade_level?: string;
    document_id?: string; // Allow passing documentId directly
  }) => {
    // Use passed document_id or fallback to hook's documentId
    const docId = params.document_id || documentId;
    
    if (!docId) {
      toast.error('Please upload a document first');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await aiService.generateQuestions({
        document_id: docId,
        question_count: params.question_count,
        difficulty: params.difficulty,
        question_types: params.question_types,
        subject: params.subject,
        grade_level: params.grade_level,
      });

      if (response.success && response.data) {
        setQuestions(response.data.questions);
        toast.success(`Generated ${response.data.questions.length} questions!`);
        return response.data;
      } else {
        throw new Error('Generation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate questions');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateQuestion = async (index: number, context?: string) => {
    if (!documentId) return;

    try {
      const response = await aiService.regenerateQuestion(
        documentId,
        index,
        context
      );

      if (response.success && response.data) {
        const updated = [...questions];
        updated[index] = response.data.question;
        setQuestions(updated);
        toast.success('Question regenerated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate question');
    }
  };

  const updateQuestion = (index: number, updates: Partial<GeneratedQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    toast.success('Question deleted');
  };

  const reset = () => {
    setDocumentId(null);
    setQuestions([]);
    setExtractedText('');
    setUploadProgress(0);
  };

  return {
    // State
    isUploading,
    isGenerating,
    uploadProgress,
    documentId,
    questions,
    extractedText,

    // Actions
    uploadDocument,
    generateQuestions,
    regenerateQuestion,
    updateQuestion,
    deleteQuestion,
    setQuestions,
    reset,
  };
};

