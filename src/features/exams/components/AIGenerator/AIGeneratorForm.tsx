// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Sparkles, Loader2 } from 'lucide-react';
// import { useAIGenerator } from '../../hooks/useAIGenerator';

// interface AIGeneratorFormProps {
//   questionCount?: number;
//   onQuestionCountChange?: (count: number) => void;
//   documentId?: string | null; // Allow passing documentId as prop
//   examTotalMarks?: number; // Total marks for the exam
//   onQuestionsGenerated?: (questions: any[]) => void; // Callback when questions are generated, passes questions
// }

// export function AIGeneratorForm({ 
//   questionCount: initialQuestionCount, 
//   onQuestionCountChange,
//   documentId: propDocumentId,
//   examTotalMarks,
//   onQuestionsGenerated
// }: AIGeneratorFormProps) {
//   const { documentId: hookDocumentId, generateQuestions, isGenerating } = useAIGenerator();
//   // Use prop documentId if provided, otherwise fallback to hook's documentId
//   const documentId = propDocumentId || hookDocumentId;
//   const [form, setForm] = useState({
//     question_count: initialQuestionCount || 10,
//     difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed',
//     question_types: ['Multiple Choice'] as string[],
//     subject: '',
//     grade_level: '',
//   });

//   const handleQuestionCountChange = (count: number) => {
//     setForm({ ...form, question_count: count });
//     if (onQuestionCountChange) {
//       onQuestionCountChange(count);
//     }
//   };

//   const handleGenerate = async () => {
//     if (!documentId) {
//       console.error('❌ [AIGeneratorForm] No documentId available. propDocumentId:', propDocumentId, 'hookDocumentId:', hookDocumentId);
//       alert('Please upload a document first');
//       return;
//     }

//     console.log('🚀 [AIGeneratorForm] Generating questions with documentId:', documentId);

//     if (form.question_count < 1 || form.question_count > 50) {
//       alert('Question count must be between 1 and 50');
//       return;
//     }

//     if (form.question_types.length === 0) {
//       alert('Please select at least one question type');
//       return;
//     }

//     try {
//       const result = await generateQuestions({
//         document_id: documentId, // Pass documentId explicitly
//         question_count: form.question_count,
//         difficulty: form.difficulty,
//         question_types: form.question_types,
//         subject: form.subject || undefined,
//         grade_level: form.grade_level || undefined,
//         total_marks: examTotalMarks, // Pass total marks for distribution
//       });
      
//       // Trigger callback after successful generation with questions data
//       if (result && result.questions && onQuestionsGenerated) {
//         console.log('✅ [AIGeneratorForm] Questions generated, calling onQuestionsGenerated callback with', result.questions.length, 'questions');
//         // Wait a bit for state to update, then call with questions
//         setTimeout(() => {
//           console.log('📞 [AIGeneratorForm] Executing onQuestionsGenerated callback with questions');
//           onQuestionsGenerated(result.questions);
//         }, 300);
//       }
//     } catch (error) {
//       console.error('Generation failed:', error);
//     }
//   };

//   if (!documentId) {
//     console.log('⚠️ [AIGeneratorForm] No documentId, showing upload message. propDocumentId:', propDocumentId, 'hookDocumentId:', hookDocumentId);
//     return (
//       <Card>
//         <CardBody className="text-center py-8">
//           <p className="text-gray-500">Please upload a document first</p>
//           <p className="text-xs text-gray-400 mt-2">Document ID: {propDocumentId || hookDocumentId || 'none'}</p>
//         </CardBody>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Sparkles className="w-5 h-5" />
//           AI Question Generation Settings
//         </CardTitle>
//       </CardHeader>
//       <CardBody className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="question_count">Number of Questions *</Label>
//             <Input
//               id="question_count"
//               type="number"
//               min={1}
//               max={50}
//               value={form.question_count}
//               onChange={(e) => {
//                 const count = parseInt(e.target.value) || 1;
//                 handleQuestionCountChange(count);
//               }}
//               required
//             />
//             <p className="text-xs text-gray-500">Between 1 and 50 questions</p>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="difficulty">Difficulty Level</Label>
//             <Select
//               value={form.difficulty}
//               onValueChange={(value: any) =>
//                 setForm({ ...form, difficulty: value })
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="easy">Easy</SelectItem>
//                 <SelectItem value="medium">Medium</SelectItem>
//                 <SelectItem value="hard">Hard</SelectItem>
//                 <SelectItem value="mixed">Mixed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="subject">Subject (Optional)</Label>
//             <Input
//               id="subject"
//               placeholder="e.g., Mathematics, English"
//               value={form.subject}
//               onChange={(e) => setForm({ ...form, subject: e.target.value })}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="grade_level">Grade Level (Optional)</Label>
//             <Input
//               id="grade_level"
//               placeholder="e.g., Grade 10, SS1"
//               value={form.grade_level}
//               onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label>Question Types *</Label>
//           <div className="flex flex-wrap gap-4">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={form.question_types.includes('Multiple Choice')}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setForm({
//                       ...form,
//                       question_types: [...form.question_types, 'Multiple Choice'],
//                     });
//                   } else {
//                     setForm({
//                       ...form,
//                       question_types: form.question_types.filter(
//                         (t) => t !== 'Multiple Choice'
//                       ),
//                     });
//                   }
//                 }}
//               />
//               <span>Multiple Choice</span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={form.question_types.includes('True/False')}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setForm({
//                       ...form,
//                       question_types: [...form.question_types, 'True/False'],
//                     });
//                   } else {
//                     setForm({
//                       ...form,
//                       question_types: form.question_types.filter((t) => t !== 'True/False'),
//                     });
//                   }
//                 }}
//               />
//               <span>True/False</span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={form.question_types.includes('Short Answer')}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setForm({
//                       ...form,
//                       question_types: [...form.question_types, 'Short Answer'],
//                     });
//                   } else {
//                     setForm({
//                       ...form,
//                       question_types: form.question_types.filter((t) => t !== 'Short Answer'),
//                     });
//                   }
//                 }}
//               />
//               <span>Short Answer</span>
//             </label>
//           </div>
//           {form.question_types.length === 0 && (
//             <p className="text-xs text-red-500">Please select at least one question type</p>
//           )}
//         </div>

//         <Button
//           onClick={handleGenerate}
//           disabled={isGenerating || form.question_types.length === 0 || form.question_count < 1}
//           className="w-full"
//           size="lg"
//         >
//           {isGenerating ? (
//             <>
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               Generating Questions...
//             </>
//           ) : (
//             <>
//               <Sparkles className="w-4 h-4 mr-2" />
//               Generate {form.question_count} Question{form.question_count !== 1 ? 's' : ''}
//             </>
//           )}
//         </Button>
//       </CardBody>
//     </Card>
//   );
// }
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAIGenerator } from '../../hooks/useAIGenerator';

interface AIGeneratorFormProps {
  questionCount?: number;
  onQuestionCountChange?: (count: number) => void;
  documentId?: string | null;
  examTotalMarks?: number;
  onQuestionsGenerated?: (questions: any[]) => void;
}

export function AIGeneratorForm({ 
  questionCount: initialQuestionCount, 
  onQuestionCountChange,
  documentId: propDocumentId,
  examTotalMarks,
  onQuestionsGenerated
}: AIGeneratorFormProps) {
  const { documentId: hookDocumentId, generateQuestions, isGenerating } = useAIGenerator();
  
  const documentId = propDocumentId || hookDocumentId;
  const [form, setForm] = useState({
    question_count: initialQuestionCount || 10,
    difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed',
    question_types: ['Multiple Choice'] as string[],
    subject: '',
    grade_level: '',
  });

  const handleQuestionCountChange = (count: number) => {
    setForm({ ...form, question_count: count });
    if (onQuestionCountChange) {
      onQuestionCountChange(count);
    }
  };

  const handleGenerate = async () => {
    if (!documentId) {
      console.error('❌ [AIGeneratorForm] No documentId available.');
      alert('Please upload a document first');
      return;
    }

    if (form.question_count < 1 || form.question_count > 50) {
      alert('Question count must be between 1 and 50');
      return;
    }

    if (form.question_types.length === 0) {
      alert('Please select at least one question type');
      return;
    }

    try {
      const result = await generateQuestions({
        document_id: documentId,
        question_count: form.question_count,
        difficulty: form.difficulty,
        question_types: form.question_types,
        subject: form.subject || undefined,
        grade_level: form.grade_level || undefined,
        total_marks: examTotalMarks,
      });
      
      if (result && result.questions && onQuestionsGenerated) {
        setTimeout(() => {
          onQuestionsGenerated(result.questions);
        }, 300);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  if (!documentId) {
    return (
      <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
        <CardBody className="text-center py-8 p-6">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Please upload a document first</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Document ID: {propDocumentId || hookDocumentId || 'none'}</p>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card className="bg-white dark:bg-gray-800 border-none shadow-md rounded-xl">
      <CardHeader className="border-b dark:border-gray-700 p-5">
        <CardTitle className="flex items-center gap-2 text-[#00356B] dark:text-white text-lg font-bold">
          <Sparkles className="w-5 h-5 text-[#00356B] dark:text-gray-300" />
          AI Question Generation Settings
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-5 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Number of Questions */}
          <div className="space-y-2">
            <Label htmlFor="question_count" className="text-gray-700 dark:text-gray-300 font-medium">Number of Questions *</Label>
            <Input
              id="question_count"
              type="number"
              min={1}
              max={50}
              value={form.question_count}
              onChange={(e) => {
                const count = parseInt(e.target.value) || 1;
                handleQuestionCountChange(count);
              }}
              required
              className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-10"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">Between 1 and 50 questions</p>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300 font-medium">Difficulty Level</Label>
            <Select
              value={form.difficulty}
              onValueChange={(value: any) =>
                setForm({ ...form, difficulty: value })
              }
            >
              <SelectTrigger className="rounded-lg dark:border-gray-700 text-gray-900 dark:text-white h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300 font-medium">Subject (Optional)</Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics, English"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-10"
            />
          </div>

          {/* Grade Level Field */}
          <div className="space-y-2">
            <Label htmlFor="grade_level" className="text-gray-700 dark:text-gray-300 font-medium">Grade Level (Optional)</Label>
            <Input
              id="grade_level"
              placeholder="e.g., Grade 10, SS1"
              value={form.grade_level}
              onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
              className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-10"
            />
          </div>
        </div>

        {/* Question Types Checkboxes */}
        <div className="space-y-2 border-t dark:border-gray-700 pt-4">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">Question Types *</Label>
          <div className="flex flex-wrap gap-5 mt-2">
            {/* Multiple Choice Option */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.question_types.includes('Multiple Choice')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setForm({
                      ...form,
                      question_types: [...form.question_types, 'Multiple Choice'],
                    });
                  } else {
                    setForm({
                      ...form,
                      question_types: form.question_types.filter((t) => t !== 'Multiple Choice'),
                    });
                  }
                }}
                className="w-4 h-4 text-[#00356B] rounded border-gray-300 dark:border-gray-700 focus:ring-[#00356B] bg-transparent"
              />
              <span>Multiple Choice</span>
            </label>

            {/* True/False Option */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.question_types.includes('True/False')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setForm({
                      ...form,
                      question_types: [...form.question_types, 'True/False'],
                    });
                  } else {
                    setForm({
                      ...form,
                      question_types: form.question_types.filter((t) => t !== 'True/False'),
                    });
                  }
                }}
                className="w-4 h-4 text-[#00356B] rounded border-gray-300 dark:border-gray-700 focus:ring-[#00356B] bg-transparent"
              />
              <span>True/False</span>
            </label>

            {/* Short Answer Option */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.question_types.includes('Short Answer')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setForm({
                      ...form,
                      question_types: [...form.question_types, 'Short Answer'],
                    });
                  } else {
                    setForm({
                      ...form,
                      question_types: form.question_types.filter((t) => t !== 'Short Answer'),
                    });
                  }
                }}
                className="w-4 h-4 text-[#00356B] rounded border-gray-300 dark:border-gray-700 focus:ring-[#00356B] bg-transparent"
              />
              <span>Short Answer</span>
            </label>
          </div>
          {form.question_types.length === 0 && (
            <p className="text-xs text-red-500 font-medium mt-1">Please select at least one question type</p>
          )}
        </div>

        {/* Generate Trigger Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || form.question_types.length === 0 || form.question_count < 1}
          className="w-full bg-[#00356B] hover:bg-[#00254B] text-white font-semibold mt-4 h-11 rounded-lg shadow-sm"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {form.question_count} Question{form.question_count !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardBody>
    </Card>
  );
}
