// import { DocumentUpload } from './DocumentUpload';
// import { AIGeneratorForm } from './AIGeneratorForm';
// import { QuestionPreview } from './QuestionPreview';
// import { Button } from '@/components/ui/button';
// import { useAIGenerator } from '../../hooks/useAIGenerator';
// import { useCreateQuestionsBulk } from '../../hooks/useQuestions';
// import { Check, ArrowRight, X } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

// interface AIGeneratorTabProps {
//   examId?: string;
//   examTotalMarks?: number;
//   onQuestionsCreated?: () => void;
// }

// export function AIGeneratorTab({
//   examId,
//   examTotalMarks,
//   onQuestionsCreated,
// }: AIGeneratorTabProps) {
//   const {
//     documentId: hookDocumentId,
//     questions,
//     isGenerating,
//     updateQuestion,
//     deleteQuestion,
//     setQuestions,
//     reset,
//   } = useAIGenerator();

//   const createQuestions = useCreateQuestionsBulk();
//   const [step, setStep] = useState<'upload' | 'generate' | 'review'>('upload');
//   const [localDocumentId, setLocalDocumentId] = useState<string | null>(null);
  
//   const documentId = hookDocumentId || localDocumentId;
  
//   // Sync hook's documentId to local state
//   useEffect(() => {
//     if (hookDocumentId) {
//       setLocalDocumentId(hookDocumentId);
//     }
//   }, [hookDocumentId]);

//   // Auto-advance to generate step when document is uploaded
//   useEffect(() => {
//     if (documentId && step === 'upload') {
//       setStep('generate');
//     }
//   }, [documentId, step]);
  
//   // Auto-advance to review step when questions are generated
//   useEffect(() => {
//     if (questions.length > 0 && step === 'generate' && !isGenerating) {
//       const timer = setTimeout(() => {
//         setStep('review');
//       }, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [questions.length, isGenerating, step]);

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
//                 marks: 0,
//               }))
//             : undefined,
//         correct_answer: q.correct_answer || q.options?.find((o) => o.is_correct)?.text,
//         marks: q.marks,
//         question_hint: q.explanation, // Only hard questions will have this
//         case_sensitive: q.question_type === 'Short Answer' ? false : undefined,
//       }));

//       await createQuestions.mutateAsync(questionsToAdd as any);
      
//       toast.success(`Added ${questions.length} questions to exam!`);
      
//       // Reset state
//       setQuestions([]);
//       setStep('upload');
//       setLocalDocumentId(null);
//       reset();
      
//       // Call callback to refresh questions and switch tabs
//       if (onQuestionsCreated) {
//         onQuestionsCreated();
//       }
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to add questions');
//     }
//   };

//   const handleReset = () => {
//     setQuestions([]);
//     setStep('upload');
//     setLocalDocumentId(null);
//     reset();
//   };

//   return (
//     <div className="space-y-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
//       {/* Step Indicator */}
//       <div className="flex items-center justify-center gap-2 text-sm">
//         <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-green-600 dark:text-green-400'}`}>
//           <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'}`}>
//             {step !== 'upload' ? '✓' : '1'}
//           </div>
//           <span>Upload</span>
//         </div>
//         <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
//         <div className={`flex items-center gap-2 ${step === 'generate' ? 'text-primary-600 dark:text-primary-400 font-semibold' : step === 'review' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
//           <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'generate' ? 'bg-primary-600 text-white' : step === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
//             {step === 'review' ? '✓' : '2'}
//           </div>
//           <span>Generate</span>
//         </div>
//         <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
//         <div className={`flex items-center gap-2 ${step === 'review' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
//           <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-primary-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
//             3
//           </div>
//           <span>Review & Create</span>
//         </div>
//       </div>

//       {/* Step 1: Upload Document */}
//       {step === 'upload' && !documentId && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Step 1: Upload Document</CardTitle>
//           </CardHeader>
//           <CardBody>
//             <DocumentUpload 
//               onUploadComplete={(uploadedDocumentId) => {
//                 setLocalDocumentId(uploadedDocumentId);
//                 setStep('generate');
//               }}
//             />
//           </CardBody>
//         </Card>
//       )}

//       {/* Step 2: Generate Questions */}
//       {step === 'generate' && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Step 2: Generate Questions</CardTitle>
//           </CardHeader>
//           <CardBody>
//             {!documentId ? (
//               <div className="text-center py-8">
//                 <p className="text-red-500 mb-4">Document ID is missing. Please go back and upload a document.</p>
//                 <Button onClick={() => {
//                   setStep('upload');
//                   setLocalDocumentId(null);
//                 }}>
//                   Go to Upload
//                 </Button>
//               </div>
//             ) : (
//               <>
//                 {questions.length === 0 && (
//                   <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
//                     <p className="text-sm text-blue-900 dark:text-blue-100">
//                       <strong>✓ Document Ready:</strong> Your document has been uploaded successfully. Configure and generate your questions below.
//                     </p>
//                   </div>
//                 )}
//                 <AIGeneratorForm
//                   documentId={documentId}
//                   examTotalMarks={examTotalMarks}
//                   onQuestionsGenerated={(generatedQuestions) => {
//                     if (generatedQuestions && generatedQuestions.length > 0) {
//                       setQuestions(generatedQuestions);
//                       setTimeout(() => {
//                         if (step === 'generate') {
//                           setStep('review');
//                         }
//                       }, 100);
//                     }
//                   }}
//                 />
//                 {questions.length > 0 && (
//                   <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-6 mt-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-base font-semibold text-green-900 dark:text-green-100 mb-1">
//                           ✅ <strong>{questions.length} questions generated successfully!</strong>
//                         </p>
//                         <p className="text-sm text-green-700 dark:text-green-300">
//                           Review and edit your questions before adding them to your exam.
//                         </p>
//                       </div>
//                       <Button 
//                         onClick={() => setStep('review')}
//                         className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
//                         size="lg"
//                       >
//                         Review Questions ({questions.length})
//                         <ArrowRight className="w-5 h-5 ml-2" />
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </CardBody>
//         </Card>
//       )}

//       {/* Step 3: Review Questions */}
//       {step === 'review' && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Step 3: Review & Create Questions</CardTitle>
//           </CardHeader>
//           <CardBody>
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
//                     onClick={handleReset}
//                   >
//                     <X className="w-4 h-4 mr-2" />
//                     Start Over
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
//                 <div className="text-center py-8">
//                   <p className="text-gray-500 mb-4">No questions generated yet</p>
//                   <Button
//                     variant="outline"
//                     onClick={() => setStep('generate')}
//                   >
//                     Go Back to Generate
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="space-y-4 max-h-[500px] overflow-y-auto">
//                   {questions.map((question, index) => (
//                     <QuestionPreview
//                       key={index}
//                       question={question}
//                       index={index}
//                       onEdit={(idx, updates) => updateQuestion(idx, updates)}
//                       onDelete={(idx) => deleteQuestion(idx)}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </CardBody>
//         </Card>
//       )}
//     </div>
//   );
// }

import { DocumentUpload } from './DocumentUpload';
import { AIGeneratorForm } from './AIGeneratorForm';
import { QuestionPreview } from './QuestionPreview';
import { Button } from '@/components/ui/button';
import { useAIGenerator } from '../../hooks/useAIGenerator';
import { useCreateQuestionsBulk } from '../../hooks/useQuestions';
import { Check, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

interface AIGeneratorTabProps {
  examId?: string;
  examTotalMarks?: number;
  onQuestionsCreated?: () => void;
}

export function AIGeneratorTab({
  examId,
  examTotalMarks,
  onQuestionsCreated,
}: AIGeneratorTabProps) {
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
    if (documentId && step === 'upload') {
      setStep('generate');
    }
  }, [documentId, step]);
  
  useEffect(() => {
    if (questions.length > 0 && step === 'generate' && !isGenerating) {
      const timer = setTimeout(() => {
        setStep('review');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [questions.length, isGenerating, step]);

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
      
      toast.success(`Added ${questions.length} questions to exam!`);
      
      setQuestions([]);
      setStep('upload');
      setLocalDocumentId(null);
      reset();
      
      if (onQuestionsCreated) {
        onQuestionsCreated();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add questions');
    }
  };

  const handleReset = () => {
    setQuestions([]);
    setStep('upload');
    setLocalDocumentId(null);
    reset();
  };
  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm border-b dark:border-gray-800 pb-4">
        <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-[#00356B] dark:text-blue-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'upload' ? 'bg-[#00356B] text-white' : 'bg-emerald-600 dark:bg-emerald-500 text-white'}`}>
            {step !== 'upload' ? '✓' : '1'}
          </div>
          <span>Upload</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div className={`flex items-center gap-2 ${step === 'generate' ? 'text-[#00356B] dark:text-blue-400 font-semibold' : step === 'review' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'generate' ? 'bg-[#00356B] text-white' : step === 'review' ? 'bg-emerald-600 dark:bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
            {step === 'review' ? '✓' : '2'}
          </div>
          <span>Generate</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div className={`flex items-center gap-2 ${step === 'review' ? 'text-[#00356B] dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'review' ? 'bg-[#00356B] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
            3
          </div>
          <span>Review & Create</span>
        </div>
      </div>

      {/* Step 1: Upload Document */}
      {step === 'upload' && !documentId && (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 p-4 border-b dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-white text-base font-bold">Step 1: Upload Document</CardTitle>
          </CardHeader>
          <CardBody className="p-5">
            <DocumentUpload 
              onUploadComplete={(uploadedDocumentId) => {
                setLocalDocumentId(uploadedDocumentId);
                setStep('generate');
              }}
            />
          </CardBody>
        </Card>
      )}

      {/* Step 2: Generate Questions */}
      {step === 'generate' && (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 p-4 border-b dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-white text-base font-bold">Step 2: Generate Questions</CardTitle>
          </CardHeader>
          <CardBody className="p-5">
            {!documentId ? (
              <div className="text-center py-8">
                <p className="text-rose-500 dark:text-rose-400 mb-4 font-medium">Document ID is missing. Please go back and upload a document.</p>
                <Button 
                  className="bg-[#00356B] hover:bg-[#00254B] text-white"
                  onClick={() => {
                    setStep('upload');
                    setLocalDocumentId(null);
                  }}
                >
                  Go to Upload
                </Button>
              </div>
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
                    if (generatedQuestions && generatedQuestions.length > 0) {
                      setQuestions(generatedQuestions);
                      setTimeout(() => {
                        if (step === 'generate') {
                          setStep('review');
                        }
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
                        onClick={() => setStep('review')}
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
          </CardBody>
        </Card>
      )}

      {/* Step 3: Review Questions */}
      {step === 'review' && (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 p-4 border-b dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-white text-base font-bold">Step 3: Review & Create Questions</CardTitle>
          </CardHeader>
          <CardBody className="p-5">
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
                    onClick={handleReset}
                    className="flex-1 sm:flex-initial border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Start Over
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
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No questions generated yet</p>
                  <Button
                    variant="outline"
                    onClick={() => setStep('generate')}
                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Go Back to Generate
                  </Button>
                </div>
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
          </CardBody>
        </Card>
      )}
    </div>
  );
}
