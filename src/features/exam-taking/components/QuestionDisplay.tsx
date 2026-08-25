import { Question } from '@/features/exams/types/question.types';
import { ExamAnswer } from '../types/exam-taking.types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getAlpha } from '@/lib/utils/format';
import { CheckCircle2, Circle } from 'lucide-react';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answer?: ExamAnswer;
  onAnswerChange: (answer: string | string[]) => void;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
}: QuestionDisplayProps) {
  const currentAnswer = answer?.answer;

  const handleMultipleChoiceChange = (optionIndex: number) => {
    const optionValue = getAlpha(optionIndex);
    onAnswerChange(optionValue);
  };

  const handleMultipleAnswerChange = (optionIndex: number, checked: boolean) => {
    const optionValue = getAlpha(optionIndex);
    const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
    
    if (checked) {
      onAnswerChange([...currentAnswers, optionValue]);
    } else {
      onAnswerChange(currentAnswers.filter((a) => a !== optionValue));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              Question {questionNumber} of {totalQuestions}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{question.question_type}</Badge>
              <Badge variant="outline">{question.marks} marks</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Question Text */}
        <div>
          <p className="text-gray-900 dark:text-white text-lg whitespace-pre-wrap">
            {question.question_text}
          </p>
        </div>

        {/* Question Image/Attachment */}
        {question.attachment_url && (
          <div className="border rounded-lg p-4">
            <img
              src={question.attachment_url}
              alt="Question attachment"
              className="max-w-full h-auto rounded"
            />
          </div>
        )}

        {/* Answer Input Based on Question Type */}
        {question.question_type === 'Multiple Choice' && question.options && question.options.length > 0 && (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const optionLetter = getAlpha(index);
              const isSelected =
                currentAnswer === optionLetter ||
                (Array.isArray(currentAnswer) && currentAnswer.includes(optionLetter));
              
              // Handle different option formats from API (option_text, option, option_label)
              const optionText = (option as any).option_text || (option as any).option || option.option || '';
              const optionLabel = (option as any).option_label || optionLetter;

              return (
                <label
                  key={index}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.question_id}`}
                    value={optionLetter}
                    checked={currentAnswer === optionLetter}
                    onChange={() => handleMultipleChoiceChange(index)}
                    className="mt-1 w-5 h-5 text-primary-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">
                      {optionLabel}.
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">{optionText}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  )}
                </label>
              );
            })}
          </div>
        )}

        {question.question_type === 'Essay' && (
          <div className="space-y-2">
            <Label htmlFor="essay-answer">Your Answer</Label>
            <Textarea
              id="essay-answer"
              rows={8}
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[200px]"
            />
            <p className="text-sm text-gray-500">
              Make sure your answer is clear and well-structured.
            </p>
          </div>
        )}

        {question.question_type === 'Fill in the Blanks' && (
          <div className="space-y-2">
            <Label htmlFor="fill-answer">Your Answer</Label>
            <Input
              id="fill-answer"
              type="text"
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
            />
            <p className="text-sm text-gray-500">
              {question.case_sensitive
                ? 'Note: Answers are case-sensitive.'
                : 'Note: Answers are not case-sensitive.'}
            </p>
          </div>
        )}

        {question.question_type === 'True/False' && (
          <div className="flex gap-4">
            {['True', 'False'].map((value) => {
              const isSelected = currentAnswer === value;

              return (
                <label
                  key={value}
                  className={`flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all flex-1 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.question_id}`}
                    value={value}
                    checked={currentAnswer === value}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary-600 ml-auto" />
                  )}
                </label>
              );
            })}
          </div>
        )}

        {question.question_type === 'Short Answer' && (
          <div className="space-y-2">
            <Label htmlFor="short-answer">Your Answer</Label>
            <Textarea
              id="short-answer"
              rows={4}
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your answer here..."
              className="min-h-[100px]"
            />
            <p className="text-sm text-gray-500">
              {question.case_sensitive
                ? 'Note: Answers are case-sensitive.'
                : 'Note: Answers are not case-sensitive.'}
            </p>
          </div>
        )}

        {/* Question Hint (if available) */}
        {question.question_hint && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-1">Hint:</p>
            <p className="text-sm text-blue-800">{question.question_hint}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

