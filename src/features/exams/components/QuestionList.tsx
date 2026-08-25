// import { Question } from '../types/question.types';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
// import { getAlpha } from '@/lib/utils/format';

// interface QuestionListProps {
//   questions: Question[];
//   onEdit: (question: Question) => void;
//   onDelete: (questionId: string) => void;
//   canEdit?: boolean;
// }

// export function QuestionList({ questions, onEdit, onDelete, canEdit = true }: QuestionListProps) {
//   return (
//     <div className="space-y-4">
//       {questions.map((question, index) => (
//         <Card key={question.question_id || question.id || index}>
//           <CardHeader>
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-2">
//                   <CardTitle className="text-lg">
//                     Question {index + 1}
//                   </CardTitle>
//                   <Badge variant="outline">{question.question_type}</Badge>
//                   <Badge variant="outline">{question.marks} marks</Badge>
//                 </div>
//               </div>
//               {canEdit && (
//                 <div className="flex gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => onEdit(question)}
//                   >
//                     <Edit2 className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => {
//                       const questionId = question.question_id || question.id;
//                       if (questionId) {
//                         onDelete(questionId);
//                       } else {
//                         console.error('Question ID is missing:', question);
//                       }
//                     }}
//                     className="text-red-600 hover:text-red-700"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </CardHeader>
//           <CardBody>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
//                   {question.question_text}
//                 </p>
//               </div>

//               {(question.question_type === 'Multiple Choice' || question.question_type === 'True/False') && question.options && (
//                 <div className="space-y-2">
//                   {question.options.map((option, optIdx) => (
//                     <div
//                       key={optIdx}
//                       className={`p-3 rounded-lg border ${
//                         option.is_correct
//                           ? 'bg-green-50 border-green-200'
//                           : 'bg-gray-50 border-gray-200 dark:text-gray-900'
//                       }`}
//                     >
//                       <div className="flex items-start gap-2 text-gray-900 dark:text-gray-900">
//                         <span className="font-semibold">
//                           {getAlpha(optIdx)}.
//                         </span>
//                         <span className="text-[#00356B] font-medium">{option.option}</span>
//                         {option.is_correct && (
//                           <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {question.question_hint && (
//                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-sm font-semibold text-blue-900 mb-1">
//                     Hint:
//                   </p>
//                   <p className="text-sm text-blue-800">{question.question_hint}</p>
//                 </div>
//               )}
//             </div>
//           </CardBody>
//         </Card>
//       ))}
//     </div>
//   );
// }

import { Question } from '../types/question.types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { getAlpha } from '@/lib/utils/format';

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  canEdit?: boolean;
}

export function QuestionList({ questions, onEdit, onDelete, canEdit = true }: QuestionListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card key={question.question_id || question.id || index} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-50 dark:border-gray-700/50 p-4 bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base font-bold text-[#00356B] dark:text-white">
                    Question {index + 1}
                  </CardTitle>
                  <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-full text-xs">
                    {question.question_type}
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-full text-xs">
                    {question.marks} marks
                  </Badge>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                    onClick={() => onEdit(question)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                    onClick={() => {
                      const questionId = question.question_id || question.id;
                      if (questionId) {
                        onDelete(questionId);
                      } else {
                        console.error('Question ID is missing:', question);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed text-sm">
                  {question.question_text}
                </p>
              </div>

              {/* Multiple Choice / True/False Options Display */}
              {(question.question_type === 'Multiple Choice' || question.question_type === 'True/False') && question.options && (
                <div className="space-y-2 mt-2">
                  {question.options.map((option, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border transition-colors text-sm ${
                        option.is_correct
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300'
                          : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2 text-gray-900 dark:text-gray-100">
                        <span className="font-bold text-gray-500 dark:text-gray-400 shrink-0">
                          {getAlpha(optIdx)}.
                        </span>
                        <span className="flex-1 min-w-0 break-words font-medium text-gray-800 dark:text-gray-200">
                          {option.option}
                        </span>
                        {option.is_correct && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answer Display */}
              {question.question_type === 'Short Answer' && question.correct_answer && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl text-sm">
                  <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                    Correct Answer:
                  </p>
                  <p className="text-blue-800 dark:text-blue-400 leading-relaxed whitespace-pre-wrap">{question.correct_answer}</p>
                  {question.case_sensitive && (
                    <Badge variant="outline" className="mt-2 bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 rounded-full text-[10px] font-semibold">
                      Case Sensitive
                    </Badge>
                  )}
                </div>
              )}

              {/* Hint Display */}
              {question.question_hint && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-sm">
                  <p className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                    Hint:
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-400 leading-relaxed">{question.question_hint}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
