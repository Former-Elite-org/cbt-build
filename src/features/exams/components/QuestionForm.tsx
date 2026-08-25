// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { X, Plus, Save } from 'lucide-react';
// import { CreateQuestionDto, QuestionOption, Question } from '../types/question.types';

// const questionSchema = z.object({
//   question_text: z.string().min(5, 'Question text must be at least 5 characters'),
//   question_type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
//   marks: z.number().min(1, 'Marks must be at least 1'),
//   question_hint: z.string().optional(),
//   options: z.array(z.object({
//     option: z.string().min(1),
//     is_correct: z.boolean(),
//     marks: z.number().optional(),
//   })).optional(),
//   correct_answer: z.string().optional(),
//   case_sensitive: z.boolean().optional(),
// });

// type QuestionFormData = z.infer<typeof questionSchema>;

// interface QuestionFormProps {
//   examId: string;
//   onSave: (question: CreateQuestionDto) => void;
//   onCancel: () => void;
//   initialData?: Question;
//   open: boolean;
// }

// export function QuestionForm({ examId, onSave, onCancel, initialData, open }: QuestionFormProps) {
//   const [options, setOptions] = useState<QuestionOption[]>(
//     initialData?.options || [
//       { option: '', is_correct: false, marks: 0 },
//       { option: '', is_correct: false, marks: 0 },
//     ]
//   );

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//     reset,
//   } = useForm<QuestionFormData>({
//     resolver: zodResolver(questionSchema),
//     defaultValues: {
//       question_type: initialData?.question_type || 'Multiple Choice',
//       question_text: initialData?.question_text || '',
//       marks: initialData?.marks || 1,
//       question_hint: initialData?.question_hint || '',
//       correct_answer: initialData?.correct_answer || '',
//       case_sensitive: initialData?.case_sensitive || false,
//     },
//   });

//   // Reset form when initialData changes or modal opens/closes
//   useEffect(() => {
//     if (open) {
//       if (initialData) {
//         reset({
//           question_type: initialData.question_type,
//           question_text: initialData.question_text,
//           marks: initialData.marks,
//           question_hint: initialData.question_hint || '',
//           // Don't set correct_answer for True/False when editing - it's determined by options
//           correct_answer: initialData.question_type === 'True/False' ? '' : (initialData.correct_answer || ''),
//           case_sensitive: initialData.case_sensitive || false,
//         });
//         setOptions(initialData.options || [
//           { option: '', is_correct: false, marks: 0 },
//           { option: '', is_correct: false, marks: 0 },
//         ]);
//       } else {
//         reset({
//           question_type: 'Multiple Choice',
//           question_text: '',
//           marks: 1,
//           question_hint: '',
//           correct_answer: '',
//           case_sensitive: false,
//         });
//         setOptions([
//           { option: '', is_correct: false, marks: 0 },
//           { option: '', is_correct: false, marks: 0 },
//         ]);
//       }
//     }
//   }, [open, initialData, reset]);

//   const questionType = watch('question_type');

//   // Auto-set True/False options when type changes
//   useEffect(() => {
//     if (questionType === 'True/False') {
//       setOptions([
//         { option: 'True', is_correct: false, marks: 0 },
//         { option: 'False', is_correct: false, marks: 0 },
//       ]);
//     } else if (questionType === 'Multiple Choice' && options.length < 2) {
//       setOptions([
//         { option: '', is_correct: false, marks: 0 },
//         { option: '', is_correct: false, marks: 0 },
//       ]);
//     }
//   }, [questionType]);

//   const handleAddOption = () => {
//     setOptions([...options, { option: '', is_correct: false, marks: 0 }]);
//   };

//   const handleRemoveOption = (index: number) => {
//     if (questionType === 'True/False') return; // Can't remove True/False options
//     setOptions(options.filter((_, i) => i !== index));
//   };

//   const handleOptionChange = (index: number, field: keyof QuestionOption, value: any) => {
//     const updated = [...options];
//     updated[index] = { ...updated[index], [field]: value };
//     setOptions(updated);
//   };

//   const handleToggleCorrect = (index: number) => {
//     if (questionType === 'Multiple Choice' || questionType === 'True/False') {
//       // Only one correct answer for multiple choice and true/false
//       const updated = options.map((opt, i) => ({
//         ...opt,
//         is_correct: i === index,
//       }));
//       setOptions(updated);
//     } else {
//       handleOptionChange(index, 'is_correct', !options[index].is_correct);
//     }
//   };

//   const onSubmit = (data: QuestionFormData) => {
//     if (questionType === 'Multiple Choice' || questionType === 'True/False') {
//       const validOptions = options.filter((opt) => opt.option.trim());
//       if (validOptions.length < 2) {
//         alert('Please provide at least 2 options');
//         return;
//       }
//       if (!validOptions.some((opt) => opt.is_correct)) {
//         alert('Please mark at least one option as correct');
//         return;
//       }
//     }

//     if (questionType === 'Short Answer' && !data.correct_answer?.trim()) {
//       alert('Please provide a correct answer for Short Answer questions');
//       return;
//     }

//     // For True/False questions, extract correct_answer from the selected option
//     let correctAnswerForTrueFalse = null;
//     if (questionType === 'True/False') {
//       const correctOption = options.find((opt) => opt.is_correct);
//       if (correctOption) {
//         correctAnswerForTrueFalse = correctOption.option; // "True" or "False"
//       }
//     }

//     const questionData: CreateQuestionDto = {
//       exam_id: examId,
//       question_text: data.question_text,
//       question_type: data.question_type,
//       marks: data.marks,
//       question_hint: data.question_hint,
//       ...(questionType === 'Multiple Choice' || questionType === 'True/False' ? {
//         options: options
//           .map((opt, index) => ({
//             ...opt,
//             // Preserve option_order if it exists (from editing), otherwise use index
//             option_order: opt.option_order !== undefined ? opt.option_order : index,
//             // Preserve option_label if it exists, otherwise calculate from order
//             option_label: opt.option_label || String.fromCharCode(65 + (opt.option_order !== undefined ? opt.option_order : index)),
//           }))
//           .filter((opt) => opt.option.trim()),
//       } : {}),
//       ...(questionType === 'True/False' && correctAnswerForTrueFalse && {
//         correct_answer: correctAnswerForTrueFalse,
//       }),
//       ...(questionType === 'Short Answer' && {
//         correct_answer: data.correct_answer,
//         case_sensitive: data.case_sensitive,
//       }),
//     };

//     onSave(questionData);
//   };

//   return (
//     <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {initialData ? 'Edit Question' : 'Add New Question'}
//           </DialogTitle>
//           <DialogDescription>
//             {initialData 
//               ? 'Update the question details below'
//               : 'Fill in the details to create a new question for this exam'
//             }
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Question Type */}
//           <div className="space-y-2">
//             <Label htmlFor="question_type">
//               Question Type <span className="text-red-500">*</span>
//             </Label>
//             <Select
//               value={questionType}
//               onValueChange={(value: any) => {
//                 setValue('question_type', value);
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
//                 <SelectItem value="True/False">True/False</SelectItem>
//                 <SelectItem value="Short Answer">Short Answer</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Question Text */}
//           <div className="space-y-2">
//             <Label htmlFor="question_text">
//               Question Text <span className="text-red-500">*</span>
//             </Label>
//             <Textarea
//               id="question_text"
//               {...register('question_text')}
//               rows={4}
//               placeholder="Enter your question here..."
//               className={errors.question_text ? 'border-red-500' : ''}
//             />
//             {errors.question_text && (
//               <p className="text-sm text-red-500">
//                 {errors.question_text.message}
//               </p>
//             )}
//           </div>

//           {/* Multiple Choice / True/False Options */}
//           {(questionType === 'Multiple Choice' || questionType === 'True/False') && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label>Options</Label>
//                 {questionType === 'Multiple Choice' && (
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={handleAddOption}
//                   >
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add Option
//                   </Button>
//                 )}
//               </div>

//               {options.map((option, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center gap-2 p-3 border rounded-lg"
//                 >
//                   <input
//                     type="radio"
//                     checked={option.is_correct}
//                     onChange={() => handleToggleCorrect(index)}
//                     className="w-5 h-5"
//                   />
//                   <Input
//                     value={option.option}
//                     onChange={(e) =>
//                       handleOptionChange(index, 'option', e.target.value)
//                     }
//                     placeholder={questionType === 'True/False' 
//                       ? option.option 
//                       : `Option ${String.fromCharCode(65 + index)}`
//                     }
//                     className="flex-1"
//                     disabled={questionType === 'True/False'}
//                   />
//                   {questionType === 'Multiple Choice' && (
//                     <Input
//                       type="number"
//                       value={option.marks || 0}
//                       onChange={(e) =>
//                         handleOptionChange(
//                           index,
//                           'marks',
//                           parseInt(e.target.value) || 0
//                         )
//                       }
//                       placeholder="Marks"
//                       className="w-24"
//                     />
//                   )}
//                   {questionType === 'Multiple Choice' && options.length > 2 && (
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleRemoveOption(index)}
//                     >
//                       <X className="w-4 h-4" />
//                     </Button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Short Answer - Correct Answer */}
//           {questionType === 'Short Answer' && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="correct_answer">
//                   Correct Answer <span className="text-red-500">*</span>
//                 </Label>
//                 <Textarea
//                   id="correct_answer"
//                   {...register('correct_answer')}
//                   rows={2}
//                   placeholder="Enter the correct answer..."
//                 />
//                 {errors.correct_answer && (
//                   <p className="text-sm text-red-500">
//                     {errors.correct_answer.message}
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="case_sensitive"
//                   {...register('case_sensitive')}
//                 />
//                 <Label htmlFor="case_sensitive">Case Sensitive</Label>
//               </div>
//             </>
//           )}

//           {/* Marks */}
//           <div className="space-y-2">
//             <Label htmlFor="marks">
//               Marks <span className="text-red-500">*</span>
//             </Label>
//             <Input
//               id="marks"
//               type="number"
//               min={1}
//               {...register('marks', { valueAsNumber: true })}
//               className={errors.marks ? 'border-red-500' : ''}
//             />
//             {errors.marks && (
//               <p className="text-sm text-red-500">{errors.marks.message}</p>
//             )}
//           </div>

//           {/* Hint */}
//           <div className="space-y-2">
//             <Label htmlFor="question_hint">Hint (Optional)</Label>
//             <Textarea
//               id="question_hint"
//               {...register('question_hint')}
//               rows={2}
//               placeholder="Optional hint for students..."
//             />
//           </div>

//           {/* Form Actions */}
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onCancel}>
//               Cancel
//             </Button>
//             <Button type="submit">
//               <Save className="w-4 h-4 mr-2" />
//               {initialData ? 'Update Question' : 'Save Question'}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Plus, Save } from 'lucide-react';
import { CreateQuestionDto, QuestionOption, Question } from '../types/question.types';

const questionSchema = z.object({
  question_text: z.string().min(5, 'Question text must be at least 5 characters'),
  question_type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
  marks: z.number().min(1, 'Marks must be at least 1'),
  question_hint: z.string().optional(),
  options: z.array(z.object({
    option: z.string().min(1),
    is_correct: z.boolean(),
    marks: z.number().optional(),
  })).optional(),
  correct_answer: z.string().optional(),
  case_sensitive: z.boolean().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  examId: string;
  onSave: (question: CreateQuestionDto) => void;
  onCancel: () => void;
  initialData?: Question;
  open: boolean;
}

export function QuestionForm({ examId, onSave, onCancel, initialData, open }: QuestionFormProps) {
  const [options, setOptions] = useState<QuestionOption[]>(
    initialData?.options || [
      { option: '', is_correct: false, marks: 0 },
      { option: '', is_correct: false, marks: 0 },
    ]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_type: initialData?.question_type || 'Multiple Choice',
      question_text: initialData?.question_text || '',
      marks: initialData?.marks || 1,
      question_hint: initialData?.question_hint || '',
      correct_answer: initialData?.correct_answer || '',
      case_sensitive: initialData?.case_sensitive || false,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          question_type: initialData.question_type,
          question_text: initialData.question_text,
          marks: initialData.marks,
          question_hint: initialData.question_hint || '',
          correct_answer: initialData.question_type === 'True/False' ? '' : (initialData.correct_answer || ''),
          case_sensitive: initialData.case_sensitive || false,
        });
        setOptions(initialData.options || [
          { option: '', is_correct: false, marks: 0 },
          { option: '', is_correct: false, marks: 0 },
        ]);
      } else {
        reset({
          question_type: 'Multiple Choice',
          question_text: '',
          marks: 1,
          question_hint: '',
          correct_answer: '',
          case_sensitive: false,
        });
        setOptions([
          { option: '', is_correct: false, marks: 0 },
          { option: '', is_correct: false, marks: 0 },
        ]);
      }
    }
  }, [open, initialData, reset]);

  const questionType = watch('question_type');

  useEffect(() => {
    if (questionType === 'True/False') {
      setOptions([
        { option: 'True', is_correct: false, marks: 0 },
        { option: 'False', is_correct: false, marks: 0 },
      ]);
    } else if (questionType === 'Multiple Choice' && options.length < 2) {
      setOptions([
        { option: '', is_correct: false, marks: 0 },
        { option: '', is_correct: false, marks: 0 },
      ]);
    }
  }, [questionType]);

  const handleAddOption = () => {
    setOptions([...options, { option: '', is_correct: false, marks: 0 }]);
  };

  const handleRemoveOption = (index: number) => {
    if (questionType === 'True/False') return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const handleToggleCorrect = (index: number) => {
    if (questionType === 'Multiple Choice' || questionType === 'True/False') {
      const updated = options.map((opt, i) => ({
        ...opt,
        is_correct: i === index,
      }));
      setOptions(updated);
    } else {
      handleOptionChange(index, 'is_correct', !options[index].is_correct);
    }
  };

  const onSubmit = (data: QuestionFormData) => {
    if (questionType === 'Multiple Choice' || questionType === 'True/False') {
      const validOptions = options.filter((opt) => opt.option.trim());
      if (validOptions.length < 2) {
        alert('Please provide at least 2 options');
        return;
      }
      if (!validOptions.some((opt) => opt.is_correct)) {
        alert('Please mark at least one option as correct');
        return;
      }
    }

    if (questionType === 'Short Answer' && !data.correct_answer?.trim()) {
      alert('Please provide a correct answer for Short Answer questions');
      return;
    }

    let correctAnswerForTrueFalse = null;
    if (questionType === 'True/False') {
      const correctOption = options.find((opt) => opt.is_correct);
      if (correctOption) {
        correctAnswerForTrueFalse = correctOption.option;
      }
    }

    const questionData: CreateQuestionDto = {
      exam_id: examId,
      question_text: data.question_text,
      question_type: data.question_type,
      marks: data.marks,
      question_hint: data.question_hint,
      ...(questionType === 'Multiple Choice' || questionType === 'True/False' ? {
        options: options
          .map((opt, index) => ({
            ...opt,
            option_order: opt.option_order !== undefined ? opt.option_order : index,
            option_label: opt.option_label || String.fromCharCode(65 + (opt.option_order !== undefined ? opt.option_order : index)),
          }))
          .filter((opt) => opt.option.trim()),
      } : {}),
      ...(questionType === 'True/False' && correctAnswerForTrueFalse && {
        correct_answer: correctAnswerForTrueFalse,
      }),
      ...(questionType === 'Short Answer' && {
        correct_answer: data.correct_answer,
        case_sensitive: data.case_sensitive,
      }),
    };

    onSave(questionData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border dark:border-gray-800 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#00356B] dark:text-white">
            {initialData ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {initialData 
              ? 'Update the question details below'
              : 'Fill in the details to create a new question for this exam'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Question Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="question_type" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
              Question Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={questionType}
              onValueChange={(value: any) => {
                setValue('question_type', value);
              }}
            >
              <SelectTrigger className="rounded-lg dark:border-gray-700 text-gray-900 dark:text-white h-10 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                <SelectItem value="True/False">True/False</SelectItem>
                <SelectItem value="Short Answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Formulation Field */}
          <div className="space-y-2">
            <Label htmlFor="question_text" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="question_text"
              {...register('question_text')}
              rows={4}
              placeholder="Enter your question here..."
              className={`rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white ${errors.question_text ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.question_text && (
              <p className="text-xs text-red-500 font-medium">{errors.question_text.message}</p>
            )}
          </div>

          {/* Multiple Choice / True/False Section */}
          {(questionType === 'Multiple Choice' || questionType === 'True/False') && (
            <div className="space-y-4 border-t dark:border-gray-800 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Options</Label>
                {questionType === 'Multiple Choice' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="h-8 border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border dark:border-gray-700 rounded-xl bg-transparent"
                  >
                    <input
                      type="radio"
                      checked={option.is_correct}
                      onChange={() => handleToggleCorrect(index)}
                      className="w-4 h-4 text-[#00356B] focus:ring-[#00356B] border-gray-300 dark:border-gray-700 bg-transparent shrink-0"
                    />
                    <Input
                      value={option.option}
                      onChange={(e) =>
                        handleOptionChange(index, 'option', e.target.value)
                      }
                      placeholder={questionType === 'True/False' 
                        ? option.option 
                        : `Option ${String.fromCharCode(65 + index)}`
                      }
                      className="flex-1 rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-9"
                      disabled={questionType === 'True/False'}
                    />
                    {questionType === 'Multiple Choice' && (
                      <Input
                        type="number"
                        value={option.marks || 0}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            'marks',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Marks"
                        className="w-20 rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-9"
                      />
                    )}
                    {questionType === 'Multiple Choice' && options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-rose-600 rounded-lg shrink-0"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Short Answer Textfield Section */}
          {questionType === 'Short Answer' && (
            <div className="space-y-4 border-t dark:border-gray-800 pt-4">
              <div className="space-y-2">
                <Label htmlFor="correct_answer" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                  Correct Answer <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="correct_answer"
                  {...register('correct_answer')}
                  rows={2}
                  placeholder="Enter the correct answer..."
                  className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
                />
                {errors.correct_answer && (
                  <p className="text-xs text-red-500 font-medium">{errors.correct_answer.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="case_sensitive"
                  {...register('case_sensitive')}
                  className="w-4 h-4 text-[#00356B] focus:ring-[#00356B] border-gray-300 dark:border-gray-700 bg-transparent rounded"
                />
                <Label htmlFor="case_sensitive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Case Sensitive</Label>
              </div>
            </div>
          )}

          {/* Global Question Marks Field */}
          <div className="space-y-2 border-t dark:border-gray-800 pt-4">
            <Label htmlFor="marks" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
              Marks <span className="text-red-500">*</span>
            </Label>
            <Input
              id="marks"
              type="number"
              min={1}
              {...register('marks', { valueAsNumber: true })}
              className={`w-32 rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-10 ${errors.marks ? 'border-red-500' : ''}`}
            />
            {errors.marks && (
              <p className="text-xs text-red-500 font-medium">{errors.marks.message}</p>
            )}
          </div>

          {/* Explanation Hint Field */}
          <div className="space-y-2">
            <Label htmlFor="question_hint" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Hint (Optional)</Label>
            <Textarea
              id="question_hint"
              {...register('question_hint')}
              rows={2}
              placeholder="Optional hint for students..."
              className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Action Trigger Buttons */}
          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t dark:border-gray-800">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="rounded-lg text-xs font-medium h-9 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="rounded-lg text-xs font-medium h-9 bg-[#00356B] hover:bg-[#00254B] text-white"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {initialData ? 'Update Question' : 'Save Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
