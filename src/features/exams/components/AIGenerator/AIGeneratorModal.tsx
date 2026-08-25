// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { DocumentUpload } from './DocumentUpload';
// import { AIGeneratorForm } from './AIGeneratorForm';
// import { QuestionPreview } from './QuestionPreview';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useAIGenerator } from '../../hooks/useAIGenerator';
// import { useCreateQuestionsBulk } from '../../hooks/useQuestions';
// import { Plus, Check, X, ArrowRight } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

// interface AIGeneratorModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   examId?: string;
//   examTotalMarks?: number; // Total marks for the exam
//   onQuestionsGenerated?: (count: number) => void;
// }

// export function AIGeneratorModal({
//   open,
//   onOpenChange,
//   examId,
//   examTotalMarks,
//   onQuestionsGenerated,
// }: AIGeneratorModalProps) {
//   const {
//     documentId: hookDocumentId,
//     questions,
//     isGenerating,
//     updateQuestion,
//     deleteQuestion,
//     setQuestions,
//     reset,
//     uploadDocument, // We'll use this to ensure documentId is set in hook
//   } = useAIGenerator();

//   const createQuestions = useCreateQuestionsBulk();
//   const [step, setStep] = useState<'upload' | 'generate' | 'review'>('upload');
//   // Store documentId locally to persist across renders - use hook's value as source of truth
//   const [localDocumentId, setLocalDocumentId] = useState<string | null>(null);
  
//   // Use hook's documentId as primary, fallback to local storage
//   const documentId = hookDocumentId || localDocumentId;
  
//   // Sync hook's documentId to local state for persistence
//   useEffect(() => {
//     if (hookDocumentId) {
//       console.log('📝 Document ID available from hook, syncing to local state:', hookDocumentId);
//       setLocalDocumentId(hookDocumentId);
//     }
//   }, [hookDocumentId]);
  
//   // If we have localDocumentId but hook doesn't have it yet, wait a bit for hook to catch up
//   useEffect(() => {
//     if (localDocumentId && !hookDocumentId) {
//       console.log('⏳ Waiting for hook to sync documentId. Local:', localDocumentId, 'Hook:', hookDocumentId);
//       // Hook should update soon, but we'll use localDocumentId in the meantime
//     }
//   }, [localDocumentId, hookDocumentId]);

//   // Auto-advance to generate step when document is uploaded
//   useEffect(() => {
//     if (documentId && step === 'upload' && open) {
//       console.log('🚀 [AUTO-ADVANCE] Document uploaded, moving to generate. documentId:', documentId, 'current step:', step);
//       // Force immediate step change to generate (skip settings)
//       setStep('generate');
//     }
//   }, [documentId, step, open]); // Watch documentId, step, and open
  
//   // Auto-advance to review step when questions are generated
//   useEffect(() => {
//     const shouldAdvance = questions.length > 0 && step === 'generate' && !isGenerating && open;
    
//     console.log('🔍 [AUTO-ADVANCE CHECK]', {
//       questionsLength: questions.length,
//       step,
//       isGenerating,
//       open,
//       shouldAdvance
//     });
    
//     if (shouldAdvance) {
//       console.log('🚀 [AUTO-ADVANCE] Questions generated, moving to review. count:', questions.length);
//       // Small delay to ensure state is fully updated
//       const timer = setTimeout(() => {
//         console.log('✅ [AUTO-ADVANCE] Executing step change to review');
//         setStep('review');
//       }, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [questions.length, isGenerating, step, open]); // Watch all relevant state
  
//   // Also watch for when isGenerating changes from true to false with questions
//   useEffect(() => {
//     if (questions.length > 0 && step === 'generate' && !isGenerating && open) {
//       console.log('🔄 [GENERATION COMPLETE] Questions ready, checking if we should advance...');
//       // Force check after generation completes with a small delay
//       const timer = setTimeout(() => {
//         if (questions.length > 0 && step === 'generate') {
//           console.log('✅ [FORCE ADVANCE] Moving to review step');
//           setStep('review');
//         }
//       }, 500);
//       return () => clearTimeout(timer);
//     }
//   }, [isGenerating, questions.length, step, open]);
  
//   // Reset when modal closes
//   useEffect(() => {
//     if (!open) {
//       console.log('🔄 [RESET] Modal closed, resetting to upload step');
//       setStep('upload');
//       setLocalDocumentId(null);
//       // Reset hook state when modal closes
//       reset();
//     }
//   }, [open, reset]);
  
//   // Debug: Log step changes and documentId state
//   useEffect(() => {
//     console.log('📍 [STEP CHANGE]', {
//       step,
//       hookDocumentId,
//       localDocumentId,
//       documentId: documentId,
//       questionsCount: questions.length,
//       open
//     });
//   }, [step, hookDocumentId, localDocumentId, documentId, questions.length, open]);

//   const handleAddAllToExam = async () => {
//     if (!examId || questions.length === 0) {
//       toast.error('No questions to add');
//       return;
//     }

//     try {
//       const questionsToAdd = questions.map((q) => ({
//         exam_id: examId,
//         question_text: q.question_text,
//         question_type: q.question_type,
//         options:
//           q.question_type === 'Multiple Choice' || q.question_type === 'True/False'
//             ? q.options?.map((opt) => ({
//                 option: opt.text,
//                 is_correct: opt.is_correct,
//                 marks: 0, // Options don't have individual marks - marks are for the question
//               }))
//             : undefined,
//         correct_answer: q.correct_answer || q.options?.find((o) => o.is_correct)?.text,
//         marks: q.marks,
//         question_hint: q.explanation,
//         case_sensitive: q.question_type === 'Short Answer' ? false : undefined,
//       }));

//       await createQuestions.mutateAsync(questionsToAdd as any);
      
//       if (onQuestionsGenerated) {
//         onQuestionsGenerated(questions.length);
//       }
      
//       toast.success(`Added ${questions.length} questions to exam!`);
      
//       // Full reset after successfully adding questions
//       setQuestions([]);
//       setStep('upload');
//       setLocalDocumentId(null);
//       reset(); // Reset the hook state including documentId
//       onOpenChange(false);
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to add questions');
//     }
//   };

//   const handleQuestionsGenerated = () => {
//     if (questions.length > 0) {
//       setStep('review');
//     }
//   };

//   const handleModalClose = (open: boolean) => {
//     if (!open) {
//       // Full reset when modal is closed manually (not after adding questions)
//       setQuestions([]);
//       setStep('upload');
//       setLocalDocumentId(null);
//       reset(); // Reset the hook state including documentId
//     }
//     onOpenChange(open);
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleModalClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl">AI Question Generator</DialogTitle>
//           <DialogDescription>
//             Upload a document and generate questions automatically using AI
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Step Indicator */}
//           <div className="flex items-center justify-center gap-2 text-sm">
//             <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary-600 font-semibold' : step !== 'upload' ? 'text-green-600' : 'text-gray-400'}`}>
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'}`}>
//                 {step !== 'upload' ? '✓' : '1'}
//               </div>
//               <span>Upload</span>
//             </div>
//             <div className="w-8 h-0.5 bg-gray-300"></div>
//             <div className={`flex items-center gap-2 ${step === 'generate' ? 'text-primary-600 font-semibold' : step === 'review' ? 'text-green-600' : 'text-gray-400'}`}>
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'generate' ? 'bg-primary-600 text-white' : step === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
//                 {step === 'review' ? '✓' : '2'}
//               </div>
//               <span>Generate</span>
//             </div>
//             <div className="w-8 h-0.5 bg-gray-300"></div>
//             <div className={`flex items-center gap-2 ${step === 'review' ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
//                 3
//               </div>
//               <span>Review</span>
//             </div>
//           </div>

//           {/* Step 1: Upload Document - ONLY show if step is upload AND no documentId */}
//           {step === 'upload' && !documentId && (
//             <div className="space-y-4">
//               <DocumentUpload 
//                 onUploadComplete={(uploadedDocumentId) => {
//                   console.log('📤 Upload complete callback triggered with documentId:', uploadedDocumentId);
//                   // Set local documentId immediately
//                   setLocalDocumentId(uploadedDocumentId);
//                   // Advance directly to generate step (skip settings)
//                   setStep('generate');
//                 }}
//               />
//             </div>
//           )}

//           {/* Step 2: Generate Questions */}
//           {step === 'generate' && (
//             <div className="space-y-4">
//               {!documentId ? (
//                 <Card>
//                   <CardBody className="text-center py-8">
//                     <p className="text-red-500 mb-4">Document ID is missing. Please go back and upload a document.</p>
//                     <Button onClick={() => {
//                       setStep('upload');
//                       setLocalDocumentId(null);
//                     }}>
//                       Go to Upload
//                     </Button>
//                   </CardBody>
//                 </Card>
//               ) : (
//                 <>
//                   {questions.length === 0 && (
//                     <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-blue-900 dark:text-blue-100">
//                         <strong>✓ Document Ready:</strong> Your document has been uploaded successfully. Configure and generate your questions below.
//                       </p>
//                     </div>
//                   )}
//                   <AIGeneratorForm
//                     documentId={documentId}
//                     examTotalMarks={examTotalMarks}
//                     onQuestionsGenerated={(generatedQuestions) => {
//                       console.log('📞 [AIGeneratorModal] onQuestionsGenerated callback received with', generatedQuestions?.length, 'questions');
//                       console.log('📊 [AIGeneratorModal] Current state:', { step, questionsLength: questions.length, isGenerating, generatedCount: generatedQuestions?.length });
                      
//                       // Ensure questions are set in the hook state
//                       if (generatedQuestions && generatedQuestions.length > 0) {
//                         console.log('✅ [AIGeneratorModal] Setting questions and advancing to review');
//                         setQuestions(generatedQuestions);
//                         // Advance to review after a brief delay to ensure state is set
//                         setTimeout(() => {
//                           if (step === 'generate') {
//                             console.log('✅ [AIGeneratorModal] Advancing to review from callback');
//                             setStep('review');
//                           }
//                         }, 100);
//                       }
//                     }}
//                   />
//                   {questions.length > 0 && (
//                     <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-6">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-base font-semibold text-green-900 dark:text-green-100 mb-1">
//                             ✅ <strong>{questions.length} questions generated successfully!</strong>
//                           </p>
//                           <p className="text-sm text-green-700 dark:text-green-300">
//                             Review and edit your questions before adding them to your exam.
//                           </p>
//                         </div>
//                         <Button 
//                           onClick={() => {
//                             console.log('👆 Manual review button clicked');
//                             setStep('review');
//                           }}
//                           className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
//                           size="lg"
//                         >
//                           Review Questions ({questions.length})
//                           <ArrowRight className="w-5 h-5 ml-2" />
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}

//           {/* Step 3: Review Questions */}
//           {step === 'review' && (
//             <div className="space-y-4">
//               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
//                 <p className="text-sm text-blue-900 dark:text-blue-100">
//                   <strong>Review & Edit Questions:</strong> You can edit, delete, or regenerate any question before adding them to your exam. Click the edit icon on any question to make changes.
//                 </p>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">
//                   Generated Questions ({questions.length})
//                 </h3>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => setStep('generate')}
//                   >
//                     Generate More
//                   </Button>
//                   {examId && questions.length > 0 && (
//                     <Button
//                       onClick={handleAddAllToExam}
//                       disabled={createQuestions.isPending}
//                       className="bg-green-600 hover:bg-green-700"
//                     >
//                       <Check className="w-4 h-4 mr-2" />
//                       Add {questions.length} Question{questions.length !== 1 ? 's' : ''} to Exam
//                     </Button>
//                   )}
//                 </div>
//               </div>

//               {questions.length === 0 ? (
//                 <Card>
//                   <CardBody className="text-center py-8">
//                     <p className="text-gray-500">No questions generated yet</p>
//                     <Button
//                       variant="outline"
//                       onClick={() => setStep('generate')}
//                       className="mt-4"
//                     >
//                       Go Back to Generate
//                     </Button>
//                   </CardBody>
//                 </Card>
//               ) : (
//               <div className="space-y-4 max-h-[500px] overflow-y-auto">
//                 {questions.map((question, index) => (
//                   <QuestionPreview
//                     key={index}
//                     question={question}
//                     index={index}
//                     onEdit={(idx, updates) => updateQuestion(idx, updates)}
//                     onDelete={(idx) => deleteQuestion(idx)}
//                   />
//                 ))}
//               </div>
//               )}
//             </div>
//           )}

//           {/* Navigation Steps */}
//           <div className="flex items-center justify-between pt-4 border-t">
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   if (step === 'review') setStep('generate');
//                   else if (step === 'generate') setStep('upload');
//                 }}
//                 disabled={step === 'upload'}
//               >
//                 Previous
//               </Button>
//             </div>
//             <Button variant="ghost" onClick={() => handleModalClose(false)}>
//               <X className="w-4 h-4 mr-2" />
//               Close
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DocumentUpload } from './DocumentUpload';
import { AIGeneratorForm } from './AIGeneratorForm';
import { QuestionPreview } from './QuestionPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAIGenerator } from '../../hooks/useAIGenerator';
import { useCreateQuestionsBulk } from '../../hooks/useQuestions';
import { Plus, Check, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

interface AIGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId?: string;
  examTotalMarks?: number;
  onQuestionsGenerated?: (count: number) => void;
}

export function AIGeneratorModal({
  open,
  onOpenChange,
  examId,
  examTotalMarks,
  onQuestionsGenerated,
}: AIGeneratorModalProps) {
  const {
    documentId: hookDocumentId,
    questions,
    isGenerating,
    updateQuestion,
    deleteQuestion,
    setQuestions,
    reset,
  } = useAIGenerator();

  const createQuestions = useCreateQuestionsBulk();
  const [step, setStep] = useState<'upload' | 'generate' | 'review'>('upload');
  const [localDocumentId, setLocalDocumentId] = useState<string | null>(null);
  
  const documentId = hookDocumentId || localDocumentId;
  
  useEffect(() => {
    if (hookDocumentId) {
      setLocalDocumentId(hookDocumentId);
    }
  }, [hookDocumentId]);
  
  useEffect(() => {
    if (documentId && step === 'upload' && open) {
      setStep('generate');
    }
  }, [documentId, step, open]);
  
  useEffect(() => {
    const shouldAdvance = questions.length > 0 && step === 'generate' && !isGenerating && open;
    if (shouldAdvance) {
      const timer = setTimeout(() => {
        setStep('review');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [questions.length, isGenerating, step, open]);
  
  useEffect(() => {
    if (questions.length > 0 && step === 'generate' && !isGenerating && open) {
      const timer = setTimeout(() => {
        if (questions.length > 0 && step === 'generate') {
          setStep('review');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, questions.length, step, open]);
  
  useEffect(() => {
    if (!open) {
      setStep('upload');
      setLocalDocumentId(null);
      reset();
    }
  }, [open, reset]);

  const handleAddAllToExam = async () => {
    if (!examId || questions.length === 0) {
      toast.error('No questions to add');
      return;
    }

    try {
      const questionsToAdd = questions.map((q) => ({
        exam_id: examId,
        question_text: q.question_text,
        question_type: q.question_type,
        options:
          q.question_type === 'Multiple Choice' || q.question_type === 'True/False'
            ? q.options?.map((opt) => ({
                option: opt.text,
                is_correct: opt.is_correct,
                marks: 0,
              }))
            : undefined,
        correct_answer: q.correct_answer || q.options?.find((o) => o.is_correct)?.text,
        marks: q.marks,
        question_hint: q.explanation,
        case_sensitive: q.question_type === 'Short Answer' ? false : undefined,
      }));

      await createQuestions.mutateAsync(questionsToAdd as any);
      
      if (onQuestionsGenerated) {
        onQuestionsGenerated(questions.length);
      }
      
      toast.success(`Added ${questions.length} questions to exam!`);
      
      setQuestions([]);
      setStep('upload');
      setLocalDocumentId(null);
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add questions');
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setQuestions([]);
      setStep('upload');
      setLocalDocumentId(null);
      reset();
    }
    onOpenChange(open);
  };
  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border dark:border-gray-800 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#00356B] dark:text-white">AI Question Generator</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Upload a document and generate questions automatically using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 text-sm border-b dark:border-gray-800 pb-4">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-[#00356B] dark:text-blue-400 font-semibold' : step !== 'upload' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'upload' ? 'bg-[#00356B] text-white' : 'bg-emerald-600 dark:bg-emerald-500 text-white'}`}>
                {step !== 'upload' ? '✓' : '1'}
              </div>
              <span>Upload</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div className={`flex items-center gap-2 ${step === 'generate' ? 'text-[#00356B] dark:text-blue-400 font-semibold' : step === 'review' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'generate' ? 'bg-[#00356B] text-white' : step === 'review' ? 'bg-emerald-600 dark:bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {step === 'review' ? '✓' : '2'}
              </div>
              <span>Generate</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div className={`flex items-center gap-2 ${step === 'review' ? 'text-[#00356B] dark:text-blue-400 font-semibold' : text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'review' ? 'bg-[#00356B] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                3
              </div>
              <span>Review</span>
            </div>
          </div>

          {/* Step 1: Upload Document */}
          {step === 'upload' && !documentId && (
            <div className="space-y-4">
              <DocumentUpload 
                onUploadComplete={(uploadedDocumentId) => {
                  console.log('📤 Upload complete callback triggered with documentId:', uploadedDocumentId);
                  setLocalDocumentId(uploadedDocumentId);
                  setStep('generate');
                }}
              />
            </div>
          )}

          {/* Step 2: Generate Questions */}
          {step === 'generate' && (
            <div className="space-y-4">
              {!documentId ? (
                <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <CardBody className="text-center py-8 p-6">
                    <p className="text-rose-500 dark:text-rose-400 mb-4 font-medium">Document ID is missing. Please go back and upload a document.</p>
                    <Button 
                      className="bg-[#00356B] text-white hover:bg-[#00254B]"
                      onClick={() => {
                        setStep('upload');
                        setLocalDocumentId(null);
                      }}
                    >
                      Go to Upload
                    </Button>
                  </CardBody>
                </Card>
              ) : (
                <>
                  {questions.length === 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        <strong>✓ Document Ready:</strong> Your document has been uploaded successfully. Configure and generate your questions below.
                      </p>
                    </div>
                  )}
                  <AIGeneratorForm
                    documentId={documentId}
                    examTotalMarks={examTotalMarks}
                    onQuestionsGenerated={(generatedQuestions) => {
                      console.log('📞 [AIGeneratorModal] onQuestionsGenerated received count:', generatedQuestions?.length);
                      if (generatedQuestions && generatedQuestions.length > 0) {
                        setQuestions(generatedQuestions);
                        setTimeout(() => {
                          if (step === 'generate') setStep('review');
                        }, 100);
                      }
                    }}
                  />

                  {questions.length > 0 && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500 dark:border-emerald-600 rounded-xl p-6 mt-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                            ✅ <strong>{questions.length} questions generated successfully!</strong>
                          </p>
                          <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            Review and edit your questions before adding them to your exam.
                          </p>
                        </div>
                        <Button 
                          onClick={() => {
                            console.log('👆 Manual review button clicked');
                            setStep('review');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shrink-0 w-full sm:w-auto"
                          size="lg"
                        >
                          Review Questions ({questions.length})
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/* Step 3: Review Questions */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Review & Edit Questions:</strong> You can edit, delete, or regenerate any question before adding them to your exam. Click the edit icon on any question to make changes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Generated Questions ({questions.length})
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={() => setStep('generate')}
                  >
                    Generate More
                  </Button>
                  {examId && questions.length > 0 && (
                    <Button
                      onClick={handleAddAllToExam}
                      disabled={createQuestions.isPending}
                      className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Add {questions.length} Question{questions.length !== 1 ? 's' : ''} to Exam
                    </Button>
                  )}
                </div>
              </div>

              {questions.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <CardBody className="text-center py-8 p-6">
                    <p className="text-gray-500 dark:text-gray-400">No questions generated yet</p>
                    <Button
                      variant="outline"
                      onClick={() => setStep('generate')}
                      className="mt-4 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Go Back to Generate
                    </Button>
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {questions.map((question, index) => (
                    <QuestionPreview
                      key={index}
                      question={question}
                      index={index}
                      onEdit={(idx, updates) => updateQuestion(idx, updates)}
                      onDelete={(idx) => deleteQuestion(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
                    {/* شريط أزرار التحكم السفلي الأخير داخل النافذة المنبثقة */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-800 mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs"
                onClick={() => {
                  if (step === 'review') setStep('generate');
                  else if (step === 'generate') setStep('upload');
                }}
                disabled={step === 'upload'}
              >
                Previous
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => handleModalClose(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg text-xs"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div> {/* إغلاق شريط أزرار التحكم السفلي */}
      </DialogContent>
    </Dialog>
  );
}