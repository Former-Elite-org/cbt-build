// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { _put } from '@/Helper';
// import { useExam } from '../hooks/useExams';
// import { useQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from '../hooks/useQuestions';
// import { AIGeneratorTab } from '../components/AIGenerator/AIGeneratorTab';
// import { QuestionList } from '../components/QuestionList';
// import { QuestionForm } from '../components/QuestionForm';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ArrowLeft, Plus, Sparkles, Loader2, Send, CheckCircle, Calendar, Clock, FileText } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Badge } from '@/components/ui/badge';
// import { Question, CreateQuestionDto } from '../types/question.types';
// import toast from 'react-hot-toast';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';

// export default function ManageQuestionsPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { user } = useAuthStore();
//   const [showQuestionForm, setShowQuestionForm] = useState(false);
//   const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
//   const [showSendDialog, setShowSendDialog] = useState(false);
//   const [sendingToAdmin, setSendingToAdmin] = useState(false);
//   const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');

//   // Redirect if ID is missing
//   useEffect(() => {
//     if (!id) {
//       toast.error('Exam ID is missing');
//       navigate('/exams');
//     }
//   }, [id, navigate]);

//   const { data: examData, isLoading: examLoading, refetch: refetchExam } = useExam(id || null);
//   const { data: questionsData, isLoading: questionsLoading, refetch: refetchQuestions } = useQuestions(id || null);
//   const createQuestion = useCreateQuestion();
//   const updateQuestion = useUpdateQuestion();
//   const deleteQuestion = useDeleteQuestion();

//   const exam = examData?.data;
//   const questions = questionsData?.data || [];

//   const isDraft = exam?.status === 'Draft' || exam?.status === 'Rejected';
//   const canEdit = isDraft;

//   const handleAddQuestion = async (questionData: CreateQuestionDto) => {
//     if (!id) return;

//     try {
//       await createQuestion.mutateAsync({
//         ...questionData,
//         exam_id: id,
//       });
//       setShowQuestionForm(false);
//       refetchQuestions();
//     } catch (error) {
//       console.error('Failed to add question:', error);
//     }
//   };

//   const handleUpdateQuestion = async (questionData: CreateQuestionDto) => {
//     const questionId = editingQuestion?.question_id || editingQuestion?.id;
//     if (!questionId) {
//       toast.error('Question ID is missing');
//       return;
//     }

//     console.log('🔄 [UPDATE] Starting update with:', { questionId, questionData });
    
//     try {
//       const result = await updateQuestion.mutateAsync({
//         id: questionId,
//         data: questionData,
//       });
//       console.log('✅ [UPDATE] Update successful:', result);
//       setEditingQuestion(null);
//       setShowQuestionForm(false);
//       refetchQuestions();
//       toast.success('Question updated successfully!');
//     } catch (error: any) {
//       console.error('❌ [UPDATE] Failed to update question:', error);
//       toast.error(error?.message || 'Failed to update question');
//     }
//   };

//   const handleEditQuestion = (question: Question) => {
//     if (!canEdit) {
//       toast.error('You can only edit questions when the exam is in Draft status');
//       return;
//     }
//     setEditingQuestion(question);
//     setShowQuestionForm(true);
//   };

//   const handleDeleteQuestion = async (questionId: string) => {
//     if (!canEdit) {
//       toast.error('You can only delete questions when the exam is in Draft status');
//       return;
//     }

//     if (!questionId) {
//       toast.error('Question ID is missing');
//       return;
//     }

//     if (confirm('Are you sure you want to delete this question?')) {
//       try {
//         await deleteQuestion.mutateAsync(questionId);
//         refetchQuestions();
//       } catch (error) {
//         console.error('Failed to delete question:', error);
//         toast.error('Failed to delete question');
//       }
//     }
//   };

//   const handleQuestionsCreated = () => {
//     setActiveTab('manual');
//     refetchQuestions();
//   };

//   const handleSendToAdmin = () => {
//     if (!id || !exam) return;

//     if (questions.length === 0) {
//       toast.error('Please add at least one question before sending to admin');
//       return;
//     }

//     setSendingToAdmin(true);
//     _put(
//       `examinations?query_type=status&id=${id}`,
//       {
//         status: 'Pending',
//         teacher_id: user?.user_id || user?.id,
//       },
//       (res: any) => {
//         setSendingToAdmin(false);
//         if (res.success) {
//           toast.success('Exam sent to admin for approval successfully!');
//           setShowSendDialog(false);
//           refetchExam();
//           navigate('/exams');
//         } else {
//           toast.error(res.message || 'Failed to send exam to admin');
//         }
//       },
//       (err: any) => {
//         setSendingToAdmin(false);
//         console.error('Error sending to admin:', err);
//         toast.error(err.message || 'An error occurred while sending to admin');
//       }
//     );
//   };

//   if (examLoading) {
//     return (
//       <div className="space-y-4">
//         <Skeleton className="h-8 w-64" />
//         <Skeleton className="h-64 w-full" />
//       </div>
//     );
//   }

//   if (!exam) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-500">Exam not found</p>
//         <Button onClick={() => navigate('/exams')} className="mt-4">
//           Back to Exams
//         </Button>
//       </div>
//     );
//   }

//   // Fix: Ensure all q.marks are parsed as numbers before summing, to avoid string concatenation.
//   const totalMarks = questions.reduce((sum, q) => sum + (parseFloat(String(q.marks)) || 0), 0);

//   const getStatusColor = (status: string) => {
//     const statusLower = (status || '').toLowerCase();
//     if (statusLower === 'approved') return 'bg-green-500 text-white';
//     if (statusLower === 'pending') return 'bg-yellow-500 text-white';
//     if (statusLower === 'draft') return 'bg-gray-500 text-white';
//     if (statusLower === 'rejected') return 'bg-red-500 text-white';
//     return 'bg-gray-500 text-white';
//   };

//   return (
//     <div className="space-y-6 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <Button
//             variant="ghost"
//             onClick={() => navigate('/exams')}
//             className="mb-4"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Exams
//           </Button>
//           <h1 className="text-3xl font-bold text-[#002a56] dark:text-white">{exam.assessment_type || exam.title}</h1>
//           <p className="text-[#002a56] dark:text-gray-400 mt-1">Manage questions for this exam</p>
//         </div>
//         <div className="flex items-center gap-4">
//           <Badge variant="outline" className="text-sm border border-[#002a56] text-[#002a56] dark:border-gray-700 dark:text-gray-300">
//             {questions.length} Question{questions.length !== 1 ? 's' : ''}
//           </Badge>
//           <Badge variant="outline" className="text-sm border border-[#002a56] text-[#002a56] dark:border-gray-700 dark:text-gray-300">Total: {totalMarks} marks</Badge>
//           {isDraft && questions.length > 0 && (
//             <Button
//               onClick={() => setShowSendDialog(true)}
//               className="gap-2 text-white dark:text-white"
//             >
//               <Send className="w-4 h-4" />
//               Send to Admin 
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Exam Info Card */}
//       <Card className="shadow-lg animate-fade-in">
//         <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//           <CardTitle className="text-[#002]">Exam Information</CardTitle>
//         </CardHeader>
//         <CardBody>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="flex items-start gap-3">
//               <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
//                 <p className="font-semibold text-gray-900 dark:text-white">{exam.commence_date}</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
//                 <p className="font-semibold text-gray-900  dark:text-white">{exam.duration} minutes</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
//                 <Badge className={getStatusColor(exam.status)}>
//                   {exam.status || 'Draft'}
//                 </Badge>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Total Marks</p>
//                 <p className="font-semibold text-gray-900 dark:text-white ">{totalMarks}</p>
//               </div>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

//       {/* Question Management */}
//       <Tabs className='text-[#002a56] dark:text-white' value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
//         <TabsList>
//           <TabsTrigger value="manual">Manual Questions</TabsTrigger>
//           <TabsTrigger value="ai">
//             <Sparkles className="w-4 h-4 mr-2" />
//             AI Generator
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="manual" className="space-y-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900  dark:text-white">Questions</h3>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 {canEdit 
//                   ? 'Add questions manually or use AI to generate them'
//                   : 'This exam is not in Draft status. Questions cannot be edited.'
//                 }
//               </p>
//             </div>
//             {canEdit && (
//               <Button onClick={() => {
//                 setEditingQuestion(null);
//                 setShowQuestionForm(true);
//               }} className="gap-2">
//                 <Plus className="w-4 h-4" />
//                 Add Question
//               </Button>
//             )}
//           </div>

//           {questionsLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3].map((i) => (
//                 <Skeleton key={i} className="h-48 w-full" />
//               ))}
//             </div>
//           ) : questions.length > 0 ? (
//             <QuestionList
//               questions={questions}
//               onDelete={handleDeleteQuestion}
//               onEdit={handleEditQuestion}
//               canEdit={canEdit}
//             />
//           ) : (
//             <Card>
//               <CardBody className="text-center py-12">
//                 <p className="text-gray-500 mb-4">No questions added yet</p>
//                 {canEdit ? (
//                   <Button onClick={() => {
//                     setEditingQuestion(null);
//                     setShowQuestionForm(true);
//                   }}>
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add First Question
//                   </Button>
//                 ) : (
//                   <p className="text-sm text-gray-400">This exam is not in Draft status. Questions cannot be added.</p>
//                 )}
//               </CardBody>
//             </Card>
//           )}

//           {/* Question Form Modal */}
//           {canEdit && (
//             <QuestionForm
//               examId={id!}
//               onSave={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
//               onCancel={() => {
//                 setShowQuestionForm(false);
//                 setEditingQuestion(null);
//               }}
//               initialData={editingQuestion || undefined}
//               open={showQuestionForm}
//             />
//           )}
//         </TabsContent>

//         <TabsContent value="ai">
//           {canEdit ? (
//             <AIGeneratorTab
//               examId={id}
//               examTotalMarks={exam?.total_marks}
//               onQuestionsCreated={handleQuestionsCreated}
//             />
//           ) : (
//             <Card>
//               <CardBody>
//                 <p className="text-gray-500">This exam is not in Draft status. Questions cannot be generated.</p>
//               </CardBody>
//             </Card>
//           )}
//         </TabsContent>
//       </Tabs>

//       {/* Send to Admin Dialog */}
//       <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="text-gradient-primary">Send Exam to Admin</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to send this exam to admin for approval? Once sent, you won't be able to edit it until it's approved or rejected.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="py-4">
//             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
//               <p className="text-sm text-blue-900 dark:text-blue-100">
//                 <strong>Exam Summary:</strong>
//               </p>
//               <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
//                 <li>• Total Questions: {questions.length}</li>
//                 <li>• Total Marks: {totalMarks}</li>
//                 <li>• Status: Will change from "Draft" to "Pending"</li>
//               </ul>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowSendDialog(false)}
//               disabled={sendingToAdmin}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSendToAdmin}
//               disabled={sendingToAdmin || questions.length === 0}
//               className="gap-2"
//             >
//               {sendingToAdmin ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Sending...
//                 </>
//               ) : (
//                 <>
//                   <Send className="w-4 h-4" />
//                   Send to Admin
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _put } from '@/Helper';
import { useExam } from '../hooks/useExams';
import { useQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from '../hooks/useQuestions';
import { AIGeneratorTab } from '../components/AIGenerator/AIGeneratorTab';
import { QuestionList } from '../components/QuestionList';
import { QuestionForm } from '../components/QuestionForm';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  Loader2, 
  Send, 
  CheckCircle, 
  Calendar, 
  Clock, 
  FileText,
  HelpCircle,
  Award,
  AlertTriangle,
  ChevronLeft,
  Settings,
  ShieldCheck,
  Zap,
  Info // 👈 تأكد من إضافة هذه الكلمة هنا ليختفي الخطأ تماماً
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Question, CreateQuestionDto } from '../types/question.types';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ManageQuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Design & Operation States
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendingToAdmin, setSendingToAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');

  // Verify route validity
  useEffect(() => {
    if (!id) {
      toast.error('Exam ID is missing');
      navigate('/exams');
    }
  }, [id, navigate]);

  // Server Integration Hooks
  const { data: examData, isLoading: examLoading, refetch: refetchExam } = useExam(id || null);
  const { data: questionsData, isLoading: questionsLoading, refetch: refetchQuestions } = useQuestions(id || null);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const exam = examData?.data;
  const questions = questionsData?.data || [];

  const isDraft = exam?.status === 'Draft' || exam?.status === 'Rejected';
  const canEdit = isDraft;

  // Total accumulation math logic parsed safely
  const totalMarks = questions.reduce((sum, q) => sum + (parseFloat(String(q.marks)) || 0), 0);

  // Status badging utility with modernized style palettes
  const getStatusColor = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'approved') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (statusLower === 'pending') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    if (statusLower === 'draft') return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    if (statusLower === 'rejected') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  };
   const handleAddQuestion = async (questionData: CreateQuestionDto) => {
    if (!id) return;

    try {
      await createQuestion.mutateAsync({
        ...questionData,
        exam_id: id,
      });
      setShowQuestionForm(false);
      refetchQuestions();
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  const handleUpdateQuestion = async (questionData: CreateQuestionDto) => {
    const questionId = editingQuestion?.question_id || editingQuestion?.id;
    if (!questionId) {
      toast.error('Question ID is missing');
      return;
    }

    console.log('🔄 [UPDATE] Starting update with:', { questionId, questionData });
    
    try {
      const result = await updateQuestion.mutateAsync({
        id: questionId,
        data: questionData,
      });
      console.log('✅ [UPDATE] Update successful:', result);
      setEditingQuestion(null);
      setShowQuestionForm(false);
      refetchQuestions();
      toast.success('Question updated successfully!');
    } catch (error: any) {
      console.error('❌ [UPDATE] Failed to update question:', error);
      toast.error(error?.message || 'Failed to update question');
    }
  };

  const handleEditQuestion = (question: Question) => {
    if (!canEdit) {
      toast.error('You can only edit questions when the exam is in Draft status');
      return;
    }
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!canEdit) {
      toast.error('You can only delete questions when the exam is in Draft status');
      return;
    }

    if (!questionId) {
      toast.error('Question ID is missing');
      return;
    }

    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion.mutateAsync(questionId);
        refetchQuestions();
      } catch (error) {
        console.error('Failed to delete question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  const handleQuestionsCreated = () => {
    setActiveTab('manual');
    refetchQuestions();
  };

  const handleSendToAdmin = () => {
    if (!id || !exam) return;

    if (questions.length === 0) {
      toast.error('Please add at least one question before sending to admin');
      return;
    }

    setSendingToAdmin(true);
    _put(
      `examinations?query_type=status&id=${id}`,
      {
        status: 'Pending',
        teacher_id: user?.user_id || user?.id,
      },
      (res: any) => {
        setSendingToAdmin(false);
        if (res.success) {
          toast.success('Exam sent to admin for approval successfully!');
          setShowSendDialog(false);
          refetchExam();
          navigate('/exams');
        } else {
          toast.error(res.message || 'Failed to send exam to admin');
        }
      },
      (err: any) => {
        setSendingToAdmin(false);
        console.error('Error sending to admin:', err);
        toast.error(err.message || 'An error occurred while sending to admin');
      }
    );
  };

  // Loading Skeleton State for Premium Feel
  if (examLoading) {
    return (
      <div className="space-y-6 p-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  // Not Found State Visuals
  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 dark:bg-slate-950 min-h-screen p-6">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Examination Profile Missing</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-sm">The examination entity you are trying to access could not be identified or retrieved.</p>
        <Button 
          onClick={() => navigate('/exams')} 
          className="mt-6 bg-[#00345A] hover:bg-[#00234] dark:bg-gray-600 text-white rounded-xl shadow-md font-semibold gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }
    return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      
      {/* Top Breadcrumb Header Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate('/exams')}
            className="group mb-2 p-0 text-slate-500 dark:text-slate-400 hover:text-[#00345A] dark:hover:text-gray-400 hover:bg-transparent transition-colors font-medium flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Examinations
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-50 tracking-tight">
              {exam.assessment_type || exam.title}
            </h1>
            <Badge className={`px-2.5 py-0.5 border font-semibold text-xs rounded-full ${getStatusColor(exam.status)}`}>
              {exam.status || 'Draft'}
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Construct, arrange, and manage evaluation structures and scoring configurations.
          </p>
        </div>

        {/* Top Quick Status Counters */}
        <div className="flex flex-wrap items-center gap-3 sm:self-end xl:self-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 px-4 py-2 rounded-xl shadow-sm">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Metrics</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {questions.length} Question{questions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 px-4 py-2 rounded-xl shadow-sm">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Evaluation</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{totalMarks} Total Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Profile Exam Info Grid Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-900/50 border-b border-slate-100 dark:border-slate-800/50 px-5 py-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-400 animate-spin-slow" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Exam Configuration Details</h3>
        </div>
        <CardBody className="p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="flex items-center gap-3.5 p-3 rounded-xl ">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Commence Date</p>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{exam.commence_date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl ">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Allowed Duration</p>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{exam.duration} Minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl ">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approval State</p>
                <div className="pt-0.5">
                  <Badge className={`px-2 py-0 border text-[11px] font-medium rounded-md ${getStatusColor(exam.status)}`}>
                    {exam.status || 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl ">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aggregated Score</p>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{totalMarks} / {exam.total_marks || '—'}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Question Management Workspace */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit border border-slate-200/40 dark:border-slate-800/40">
          <TabsTrigger 
            value="manual"
            className="rounded-lg py-2 px-4 text-sm font-semibold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#00345A] dark:data-[state=active]:text-gray-200 data-[state=active]:shadow-sm"
          >
            Manual Workspace
          </TabsTrigger>
          <TabsTrigger 
            value="ai"
            className="rounded-lg py-2 px-4 text-sm font-semibold transition-all flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#00345A] dark:data-[state=active]:text-gray-400 data-[state=active]:shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            AI Generator Core
          </TabsTrigger>
        </TabsList>

        {/* Manual Configuration Tab Panel */}
        <TabsContent value="manual" className="space-y-5 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Examination Content</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {canEdit 
                  ? 'Inject assessment structures manually or initialize automatic AI orchestration.'
                  : 'This examination structure is verified and immutable in its current status.'
                }
              </p>
            </div>
            {canEdit && (
              <Button 
                onClick={() => {
                  setEditingQuestion(null);
                  setShowQuestionForm(true);
                }} 
                className="bg-[#00345A] hover:bg-[#002A3A] text-white font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            )}
          </div>

          {/* Dynamic Questions Display Area */}
          {questionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
              ))}
            </div>
          ) : questions.length > 0 ? (
            <QuestionList
              questions={questions}
              onDelete={handleDeleteQuestion}
              onEdit={handleEditQuestion}
              canEdit={canEdit}
            />
          ) : (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent rounded-2xl">
              <CardBody className="text-center py-16 bg-white dark:bg-slate-900/30 rounded-2xl">
                <HelpCircle className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Question Pool Vacant</h4>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-xs mx-auto mb-6">No assessment entries have been populated inside this database profile yet.</p>
                {canEdit ? (
                  <Button 
                    onClick={() => {
                      setEditingQuestion(null);
                      setShowQuestionForm(true);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Insert Initial Item
                  </Button>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">Read-Only Session Mode Active</p>
                )}
              </CardBody>
            </Card>
          )}

          {/* Question Overlay Builder Form Modal */}
          {canEdit && (
            <QuestionForm
              examId={id!}
              onSave={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
              onCancel={() => {
                setShowQuestionForm(false);
                setEditingQuestion(null);
              }}
              initialData={editingQuestion || undefined}
              open={showQuestionForm}
            />
          )}
        </TabsContent>

        {/* AI Intelligent Agent System Panel */}
        <TabsContent value="ai" className="outline-none">
          {canEdit ? (
            <AIGeneratorTab
              examId={id}
              examTotalMarks={exam?.total_marks}
              onQuestionsCreated={handleQuestionsCreated}
            />
          ) : (
            <Card className="bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
              <CardBody className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                <Zap className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
                Intelligent Generation Engine deactivated because evaluation profile is finalized.
              </CardBody>
            </Card>
          )}
        </TabsContent>
      </Tabs>


          {isDraft && questions.length > 0 && (
            <Button
              onClick={() => setShowSendDialog(true)}
              className="bg-gradient-to-r from-[#00345A] to-red-950 hover:from-[#002A3A] hover:to-red-900 text-white font-bold w-full px-5 py-5 rounded-xl shadow-md shadow-blue-500/10 border-0 flex items-center gap-2 transition-all active:scale-98"
            >
              <Send className="w-4 h-4 fill-current" />
              Send to Admin
            </Button>
          )}
      {/* Administrative Synchronization Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="border-0 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Send className="h-5 w-5 text-[#00345A]" />
              Dispatch to Administration
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pt-1">
              You are launching an approval workflow request. Modifying data configurations will be restricted until official audit logs are published by administration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-[#00345A]" />
                Aggregated Payload Summary:
              </p>
              <ul className="space-y-1.5 text-sm text-[#00345A] dark:text-gray-200 font-medium">
                <li className="flex justify-between border-b border-blue-100/30 pb-1"><span>• Compiled Questions:</span> <span>{questions.length} Entry</span></li>
                <li className="flex justify-between border-b border-blue-100/30 pb-1"><span>• Accumulated Score:</span> <span>{totalMarks} Marks</span></li>
                <li className="flex justify-between"><span>• Operational Workflow:</span> <span className="font-bold text-[#00345A] dark:text-gray-400">Draft ➔ Pending Audit</span></li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setShowSendDialog(false)}
              disabled={sendingToAdmin}
              className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl px-4"
            >
              Cancel Transaction
            </Button>
            <Button
              onClick={handleSendToAdmin}
              disabled={sendingToAdmin || questions.length === 0}
              className="bg-gradient-to-r from-[#00345A] to-red-950 hover:from-[#002A3A] hover:to-red-900 text-white font-bold rounded-xl px-5 flex items-center gap-2 border-0"
            >
              {sendingToAdmin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 fill-current" />
                  Confirm Dispatch
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}





