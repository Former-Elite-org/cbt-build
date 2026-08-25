// import { Button } from '@/components/ui/button';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Edit2, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';
// import { GeneratedQuestion } from '../../services/aiService';
// import { useAIGenerator } from '../../hooks/useAIGenerator';
// import { useState } from 'react';

// interface QuestionPreviewProps {
//   question: GeneratedQuestion;
//   index: number;
//   onEdit?: (index: number, updates: Partial<GeneratedQuestion>) => void;
//   onDelete?: (index: number) => void;
// }

// export function QuestionPreview({
//   question,
//   index,
//   onEdit,
//   onDelete,
// }: QuestionPreviewProps) {
//   const { regenerateQuestion } = useAIGenerator();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedQuestion, setEditedQuestion] = useState(question);

//   const handleSave = () => {
//     if (onEdit) {
//       onEdit(index, editedQuestion);
//     }
//     setIsEditing(false);
//   };

//   const handleRegenerate = async () => {
//     try {
//       await regenerateQuestion(index, question.source_context);
//     } catch (error) {
//       console.error('Regeneration failed:', error);
//     }
//   };

//   const difficultyColors = {
//     easy: 'bg-green-100 text-green-800',
//     medium: 'bg-yellow-100 text-yellow-800',
//     hard: 'bg-red-100 text-red-800',
//   };

//   return (
//     <Card className="mb-4">
//       <CardHeader>
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <div className="flex items-center gap-2 mb-2">
//               <CardTitle className="text-lg">Question {index + 1}</CardTitle>
//               <Badge variant="outline" className={difficultyColors[question.difficulty]}>
//                 {question.difficulty}
//               </Badge>
//               <Badge variant="outline">{question.question_type}</Badge>
//               <Badge variant="outline">{question.marks} marks</Badge>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             {!isEditing && (
//               <>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => setIsEditing(true)}
//                 >
//                   <Edit2 className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleRegenerate}
//                 >
//                   <RotateCcw className="w-4 h-4" />
//                 </Button>
//                 {onDelete && (
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => onDelete(index)}
//                     className="text-red-600 hover:text-red-700"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </CardHeader>
//       <CardBody>
//         {isEditing ? (
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Question Text *</Label>
//               <Textarea
//                 value={editedQuestion.question_text}
//                 onChange={(e) =>
//                   setEditedQuestion({
//                     ...editedQuestion,
//                     question_text: e.target.value,
//                   })
//                 }
//                 rows={4}
//                 placeholder="Enter the question text..."
//                 className="min-h-[100px]"
//               />
//             </div>

//             {(editedQuestion.question_type === 'Multiple Choice' || editedQuestion.question_type === 'True/False') &&
//               editedQuestion.options && (
//                 <div className="space-y-2">
//                   <Label>Options * (Select the correct answer)</Label>
//                   {editedQuestion.options.map((option, optIdx) => (
//                     <div key={optIdx} className="flex items-center gap-3 p-2 border rounded-lg">
//                       <input
//                         type="radio"
//                         name={`correct-option-${index}`}
//                         checked={option.is_correct}
//                         onChange={(e) => {
//                           const newOptions = editedQuestion.options!.map((opt, idx) => ({
//                             ...opt,
//                             is_correct: idx === optIdx,
//                           }));
//                           setEditedQuestion({
//                             ...editedQuestion,
//                             options: newOptions,
//                           });
//                         }}
//                         className="w-5 h-5"
//                       />
//                       <Input
//                         value={option.text}
//                         onChange={(e) => {
//                           const newOptions = [...editedQuestion.options!];
//                           newOptions[optIdx] = {
//                             ...option,
//                             text: e.target.value,
//                           };
//                           setEditedQuestion({
//                             ...editedQuestion,
//                             options: newOptions,
//                           });
//                         }}
//                         disabled={editedQuestion.question_type === 'True/False'}
//                         placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
//                         className="flex-1"
//                       />
//                       {option.is_correct && (
//                         <Badge className="bg-green-500 text-white">Correct</Badge>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}

//             {editedQuestion.question_type === 'Short Answer' && (
//               <div className="space-y-2">
//                 <Label>Correct Answer *</Label>
//                 <Textarea
//                   value={editedQuestion.correct_answer || ''}
//                   onChange={(e) =>
//                     setEditedQuestion({
//                       ...editedQuestion,
//                       correct_answer: e.target.value,
//                     })
//                   }
//                   rows={3}
//                   placeholder="Enter the expected correct answer..."
//                   className="min-h-[80px]"
//                 />
//               </div>
//             )}
            
//             <div className="space-y-2">
//               <Label>Marks</Label>
//               <Input
//                 type="number"
//                 min={1}
//                 value={editedQuestion.marks}
//                 onChange={(e) =>
//                   setEditedQuestion({
//                     ...editedQuestion,
//                     marks: parseInt(e.target.value) || 1,
//                   })
//                 }
//                 className="w-32"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Explanation / Hint (Optional)</Label>
//               <Textarea
//                 value={editedQuestion.explanation || ''}
//                 onChange={(e) =>
//                   setEditedQuestion({
//                     ...editedQuestion,
//                     explanation: e.target.value,
//                   })
//                 }
//                 rows={2}
//                 placeholder="Optional explanation or hint for students..."
//               />
//             </div>

//             <div className="flex gap-2">
//               <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
//                 <CheckCircle2 className="w-4 h-4 mr-2" />
//                 Save Changes
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setEditedQuestion(question);
//                   setIsEditing(false);
//                 }}
//               >
//                 Cancel
//               </Button>
//             </div>
            
//             <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <p className="text-xs text-yellow-800">
//                 💡 <strong>Tip:</strong> Make sure to review the question text, options, and correct answer before saving. Changes will be reflected in the review list.
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div>
//               <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
//                 {question.question_text}
//               </p>
//             </div>

//             {(question.question_type === 'Multiple Choice' || question.question_type === 'True/False') &&
//               question.options && (
//                 <div className="space-y-2">
//                   {question.options.map((option, optIdx) => (
//                     <div
//                       key={optIdx}
//                       className={`p-3 rounded-lg border ${
//                         option.is_correct
//                           ? 'bg-green-50 border-green-200'
//                           : 'bg-gray-50 border-gray-200'
//                       }`}
//                     >
//                       <div className="flex items-start gap-2">
//                         <span className="font-semibold">
//                           {String.fromCharCode(65 + optIdx)}.
//                         </span>
//                         <span>{option.text}</span>
//                         {option.is_correct && (
//                           <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//             {question.question_type === 'Short Answer' && question.correct_answer && (
//               <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <p className="text-sm font-semibold text-blue-900 mb-1">
//                   Correct Answer:
//                 </p>
//                 <p className="text-sm text-blue-800">{question.correct_answer}</p>
//               </div>
//             )}

//             {question.explanation && (
//               <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <p className="text-sm font-semibold text-blue-900 mb-1">
//                   Explanation:
//                 </p>
//                 <p className="text-sm text-blue-800">{question.explanation}</p>
//               </div>
//             )}

//             {question.source_context && (
//               <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
//                 <p className="text-xs text-gray-500">Source Context:</p>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {question.source_context.substring(0, 200)}...
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </CardBody>
//     </Card>
//   );
// }

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { GeneratedQuestion } from '../../services/aiService';
import { useAIGenerator } from '../../hooks/useAIGenerator';
import { useState } from 'react';

interface QuestionPreviewProps {
  question: GeneratedQuestion;
  index: number;
  onEdit?: (index: number, updates: Partial<GeneratedQuestion>) => void;
  onDelete?: (index: number) => void;
}

export function QuestionPreview({
  question,
  index,
  onEdit,
  onDelete,
}: QuestionPreviewProps) {
  const { regenerateQuestion } = useAIGenerator();
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);

  const handleSave = () => {
    if (onEdit) {
      onEdit(index, editedQuestion);
    }
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    try {
      await regenerateQuestion(index, question.source_context);
    } catch (error) {
      console.error('Regeneration failed:', error);
    }
  };

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    hard: 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
  };
  return (
    <Card className="mb-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-50 dark:border-gray-700/50 p-4 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-bold text-gray-800 dark:text-white">Question {index + 1}</CardTitle>
              <Badge variant="outline" className={`font-semibold rounded-full px-2.5 py-0.5 text-xs ${difficultyColors[question.difficulty]}`}>
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-full text-xs">{question.question_type}</Badge>
              <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-full text-xs">{question.marks} marks</Badge>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                  onClick={handleRegenerate}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(index)}
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-5">
        {isEditing ? (
          /* وضع التعديل التفاعلي */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Question Text *</Label>
              <Textarea
                value={editedQuestion.question_text}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    question_text: e.target.value,
                  })
                }
                rows={4}
                placeholder="Enter the question text..."
                className="min-h-[100px] rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {(editedQuestion.question_type === 'Multiple Choice' || editedQuestion.question_type === 'True/False') &&
              editedQuestion.options && (
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Options * (Select the correct answer)</Label>
                  <div className="space-y-2 mt-1">
                    {editedQuestion.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3 p-3 border dark:border-gray-700 rounded-xl bg-transparent">
                        <input
                          type="radio"
                          name={`correct-option-${index}`}
                          checked={option.is_correct}
                          onChange={() => {
                            const newOptions = editedQuestion.options!.map((opt, idx) => ({
                              ...opt,
                              is_correct: idx === optIdx,
                            }));
                            setEditedQuestion({
                              ...editedQuestion,
                              options: newOptions,
                            });
                          }}
                          className="w-4 h-4 text-[#00356B] focus:ring-[#00356B] border-gray-300 dark:border-gray-700 bg-transparent shrink-0"
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...editedQuestion.options!];
                            newOptions[optIdx] = {
                              ...option,
                              text: e.target.value,
                            };
                            setEditedQuestion({
                              ...editedQuestion,
                              options: newOptions,
                            });
                          }}
                          disabled={editedQuestion.question_type === 'True/False'}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 rounded-lg h-9 bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
                        />
                        {option.is_correct && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-full px-2.5 py-0.5">Correct</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {editedQuestion.question_type === 'Short Answer' && (
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Correct Answer *</Label>
                <Textarea
                  value={editedQuestion.correct_answer || ''}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      correct_answer: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Enter the expected correct answer..."
                  className="min-h-[80px] rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Marks</Label>
              <Input
                type="number"
                min={1}
                value={editedQuestion.marks}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    marks: parseInt(e.target.value) || 1,
                  })
                }
                className="w-32 rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-9"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Explanation / Hint (Optional)</Label>
              <Textarea
                value={editedQuestion.explanation || ''}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    explanation: e.target.value,
                  })
                }
                rows={2}
                placeholder="Optional explanation or hint for students..."
                className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-9 rounded-lg px-4 text-xs">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 h-9 rounded-lg px-4 text-xs"
                onClick={() => {
                  setEditedQuestion(question);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
            
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                💡 <strong>Tip:</strong> Make sure to review the question text, options, and correct answer before saving. Changes will be reflected in the review list.
              </p>
            </div>
          </div>
        ) : (
          /* وضع القراءة الافتراضي للبطاقة */
          <div className="space-y-4">
            <div>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed text-sm">
                {question.question_text}
              </p>
            </div>

            {(question.question_type === 'Multiple Choice' || question.question_type === 'True/False') &&
              question.options && (
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
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-gray-500 dark:text-gray-400 shrink-0">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1 min-w-0 break-words">{option.text}</span>
                        {option.is_correct && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {question.question_type === 'Short Answer' && question.correct_answer && (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl text-sm">
                <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                  Correct Answer:
                </p>
                <p className="text-blue-800 dark:text-blue-400 leading-relaxed">{question.correct_answer}</p>
              </div>
            )}

            {question.explanation && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-sm">
                <p className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                  Explanation:
                </p>
                <p className="text-indigo-800 dark:text-indigo-400 leading-relaxed">{question.explanation}</p>
              </div>
            )}

            {question.source_context && (
              <div className="p-3 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800 rounded-xl text-xs">
                <p className="font-semibold text-gray-400 dark:text-gray-400 shrink-0">Source Context:</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed italic break-words">
                  {question.source_context.substring(0, 200)}...
                </p>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
