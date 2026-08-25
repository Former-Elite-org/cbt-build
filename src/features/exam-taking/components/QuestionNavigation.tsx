// import { Question } from '@/features/exams/types/question.types';
// import { ExamAnswer } from '../types/exam-taking.types';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils/cn';

// interface QuestionNavigationProps {
//   questions: Question[];
//   answers: Record<string, ExamAnswer>;
//   currentIndex: number;
//   onQuestionClick: (index: number) => void;
// }

// export function QuestionNavigation({
//   questions,
//   answers,
//   currentIndex,
//   onQuestionClick,
// }: QuestionNavigationProps) {
//   const getQuestionStatus = (question: Question, index: number) => {
//     if (index === currentIndex) return 'current';
//     const answer = answers[question.question_id || question.id!];
//     // Check if answer exists and has a value (string or array with content)
//     if (answer) {
//       if (typeof answer.answer === 'string' && answer.answer.trim()) return 'answered';
//       if (Array.isArray(answer.answer) && answer.answer.length > 0) return 'answered';
//     }
//     return 'unanswered';
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'current':
//         return <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />;
//       case 'answered':
//         return <CheckCircle2 className="w-4 h-4 text-green-600" />;
//       default:
//         return <Circle className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getStatusColor = (status: string, index: number) => {
//     switch (status) {
//       case 'current':
//         // Active/current question - make it very prominent with blue
//         return 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 border-2 shadow-md ring-2 ring-blue-300 dark:ring-[#00356B]';
//       case 'answered':
//         return 'border-green-500 bg-green-50 dark:bg-green-900/20';
//       default:
//         return 'border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800';
//     }
//   };

//   return (
//     <Card className="sticky top-20">
//       <CardHeader>
//         <CardTitle className="text-lg">Question Navigation</CardTitle>
//       </CardHeader>
//       <CardBody>
//         <div className="space-y-2 max-h-[600px] overflow-y-auto">
//           {questions.map((question, index) => {
//             const status = getQuestionStatus(question, index);

//             return (
//               <Button
//                 key={question.question_id || index}
//                 variant="outline"
//                 className={cn(
//                   'w-full justify-start h-auto p-3 transition-all',
//                   getStatusColor(status, index),
//                   status === 'current' && 'font-bold'
//                 )}
//                 onClick={() => onQuestionClick(index)}
//               >
//                 <div className="flex items-center gap-3 w-full">
//                   {getStatusIcon(status)}
//                   <div className="flex-1 text-left">
//                     <div className={cn(
//                       'font-semibold',
//                       status === 'current' && 'text-[#00356B] dark:text-blue-300'
//                     )}>
//                       Question {index + 1}
//                       {status === 'current' && (
//                         <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
//                           Active
//                         </span>
//                       )}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {question.marks} marks
//                     </div>
//                   </div>
//                 </div>
//               </Button>
//             );
//           })}
//         </div>

//         {/* Summary */}
//         <div className="mt-4 pt-4 border-t space-y-2 text-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <CheckCircle2 className="w-4 h-4 text-green-600" />
//               <span className="text-gray-600">Answered</span>
//             </div>
//             <span className="font-semibold">
//               {Object.keys(answers).filter((id) => answers[id].answer).length}
//             </span>
//           </div>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Circle className="w-4 h-4 text-gray-400" />
//               <span className="text-gray-600">Unanswered</span>
//             </div>
//             <span className="font-semibold">
//               {questions.length - Object.keys(answers).filter((id) => answers[id].answer).length}
//             </span>
//           </div>
//         </div>
//       </CardBody>
//     </Card>
//   );
// }


import { Question } from '@/features/exams/types/question.types';
import { ExamAnswer } from '../types/exam-taking.types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, AlertCircle, Bookmark, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface QuestionNavigationProps {
  questions: Question[];
  answers: Record<string, ExamAnswer>;
  currentIndex: number;
  onQuestionClick: (index: number) => void;
  onSubmit?: () => void; // Call this when the submit button is clicked at the bottom
}

export function QuestionNavigation({
  questions,
  answers,
  currentIndex,
  onQuestionClick,
  onSubmit,
}: QuestionNavigationProps) {
  
  // Safe computation of question processing state
  const getQuestionStatus = (question: Question, index: number) => {
    if (index === currentIndex) return 'current';
    const answer = answers[question.question_id || question.id!];
    
    if (answer) {
      if (typeof answer.answer === 'string' && answer.answer.trim()) return 'answered';
      if (Array.isArray(answer.answer) && answer.answer.length > 0) return 'answered';
    }
    return 'unanswered';
  };

  // Modern functional icon mapping with soft animations
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return (
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <AlertCircle className="w-4 h-4 animate-pulse" />
          </div>
        );
      case 'answered':
        return (
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
            <Circle className="w-4 h-4" />
          </div>
        );
    }
  };

  // State colors calibrated for focus retention and aesthetic appeal
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/30 border-2 shadow-sm shadow-blue-500/5 ring-1 ring-blue-400/20';
      case 'answered':
        return 'border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20';
      default:
        return 'border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300';
    }
  };

  const isLastQuestion = currentIndex === questions.length - 1;
  const completedCount = Object.keys(answers).filter((id) => answers[id]?.answer).length;

  return (
    <Card className="sticky top-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-blue-500" />
          Question Navigation
        </CardTitle>
      </CardHeader>
      
      <CardBody className="p-4">
        {/* Scrollable Questions Grid Dashboard */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {questions.map((question, index) => {
            const status = getQuestionStatus(question, index);

            return (
              <Button
                key={question.question_id || index}
                variant="outline"
                className={cn(
                  'w-full justify-start h-auto p-3 transition-all duration-150 rounded-xl border flex items-center',
                  getStatusColor(status),
                  status === 'current' && 'font-bold border-blue-500'
                )}
                onClick={() => onQuestionClick(index)}
              >
                <div className="flex items-center gap-3 w-full">
                  {getStatusIcon(status)}
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm font-medium tracking-tight',
                        status === 'current' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                      )}>
                        Question {index + 1}
                      </span>
                      
                      {status === 'current' && (
                        <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                      {question.marks} marks assigned
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Analytical Progress Metrics Summary Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Metrics</span>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
              {completedCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <HelpCircle className="w-4 h-4" />
              <span>Awaiting Response</span>
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {questions.length - completedCount}
            </span>
          </div>

          {/* Action Zone at the Bottom */}
          <div className="pt-2">
            {isLastQuestion ? (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors text-sm"
                onClick={() => onSubmit?.()}
              >
                Submit Examination
              </Button>
            ) : (
              <Button 
                variant="secondary"
                className="w-full font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 py-2.5 rounded-xl text-sm transition-colors"
                onClick={() => onQuestionClick(currentIndex + 1)}
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
