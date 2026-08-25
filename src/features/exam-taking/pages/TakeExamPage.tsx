import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamTaking } from '../hooks/useExamTaking';
import { ExamTimer } from '../components/ExamTimer';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { QuestionNavigation } from '../components/QuestionNavigation';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  Send,
  Calculator as CalculatorIcon,
  BookOpen
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calculator } from '../components/Calculator';
import { Dictionary } from '../components/Dictionary';
import toast from 'react-hot-toast';

export default function TakeExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  const {
    exam,
    questions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    startTime,
    isSubmitted,
    handleAnswerChange,
    goToQuestion,
    goToNext,
    goToPrevious,
    submitExam,
    getAnswerForQuestion,
    getAnsweredCount,
    getProgressPercentage,
  } = useExamTaking(id || null);

  // Prevent page refresh/close during exam
  useEffect(() => {
    if (!exam || isSubmitted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be saved.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exam, isSubmitted]);

  // Show warning when time is low
  useEffect(() => {
    if (!exam) return;
    
    const checkTime = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const remaining = exam.duration * 60 - elapsed;
      
      if (remaining <= 300 && !showWarning) { // 5 minutes
        setShowWarning(true);
        toast.error('Less than 5 minutes remaining!');
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [exam, startTime, showWarning]);

  // Auto-start exam if no instructions
  useEffect(() => {
    if (exam && (!exam.instructions || !exam.instructions.trim()) && showInstructions && !examStarted) {
      setShowInstructions(false);
      setExamStarted(true);
    }
  }, [exam, showInstructions, examStarted]);

  // Show instructions dialog if exam has instructions and hasn't started
  const handleStartExam = () => {
    setShowInstructions(false);
    setExamStarted(true);
  };

  // Auto-submit when time is up
  useEffect(() => {
    if (!exam || !examStarted || isSubmitted) return;

    const checkTime = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const remaining = (exam.duration || 60) * 60 - elapsed;
      
      if (remaining <= 0) {
        clearInterval(checkTime);
        handleTimeUp();
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [exam, examStarted, isSubmitted, startTime]);

  if (!exam || !questions.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show instructions dialog before starting exam (only show instructions, not description)
  const hasInstructions = exam.instructions && exam.instructions.trim();
  if (showInstructions && hasInstructions && !examStarted) {
    return (
      <Dialog open={showInstructions} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Exam Instructions</DialogTitle>
            <DialogDescription>
              Please read the instructions carefully before starting the exam.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {exam.instructions}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Important:</strong> Once you click "Start Exam", the timer will begin and you cannot pause it. 
                The exam will automatically submit when time ends. Make sure you are ready before proceeding.
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                <strong>⏰ Auto-Submit:</strong> Your exam will automatically submit when the time limit ({exam.duration || 60} minutes) is reached. 
                Make sure to review all your answers before time runs out.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => navigate('/exams')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartExam}
              className="bg-primary-600 hover:bg-primary-700"
            >
              I Understand, Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Exam Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your answers have been submitted. Redirecting to results...
            </p>
            <Button onClick={() => navigate(`/examresults/${id}`)}>
              View Results
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleTimeUp = () => {
    toast.error('Time is up! Submitting your exam automatically...');
    submitExam(true); // Pass true to indicate auto-submit
  };

  const handleSubmitClick = () => {
    const unanswered = questions.length - getAnsweredCount();
    if (unanswered > 0) {
      setShowSubmitDialog(true);
    } else {
      submitExam();
    }
  };

  const progressPercentage = getProgressPercentage();
  const answeredCount = getAnsweredCount();
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirm('Are you sure you want to leave? Your progress will be saved.')) {
                    navigate('/exams');
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Exam
              </Button>
              <div>
                <h1 className="text-xl font-bold">{exam.title}</h1>
                <p className="text-sm text-gray-500">
                  {questions.length} Questions | Total Marks: {exam.total_marks}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {answeredCount} / {questions.length} Answered
              </Badge>
              <Button
                onClick={handleSubmitClick}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Timer */}
            <ExamTimer
              duration={exam.duration || 60} // Use exam duration, fallback to 60 if not set
              onTimeUp={handleTimeUp}
              startTime={startTime}
            />

            {/* Warning Alert */}
            {showWarning && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-900">
                  <strong>Time Warning:</strong> Less than 5 minutes remaining! Please submit your exam soon.
                </AlertDescription>
              </Alert>
            )}

            {/* Progress Bar */}
            <Card>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressPercentage} />
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      {answeredCount} Answered
                    </span>
                    <span className="flex items-center gap-1">
                      <Circle className="w-3 h-3 text-gray-400" />
                      {unansweredCount} Unanswered
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Current Question */}
            {currentQuestion && (
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                answer={getAnswerForQuestion(currentQuestion.question_id!)}
                onAnswerChange={(answer) =>
                  handleAnswerChange(
                    currentQuestion.question_id!,
                    answer,
                    currentQuestion.question_type
                  )
                }
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {exam.allow_calculator && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCalculator(true)}
                  >
                    <CalculatorIcon className="w-4 h-4 mr-2" />
                    Calculator
                  </Button>
                )}
                {exam.allow_dictionary && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDictionary(true)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Dictionary
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={goToNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  Skip
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
                <Button
                  onClick={goToNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Question Navigation */}
          <div className="lg:col-span-1">
            <QuestionNavigation
              questions={questions}
              answers={answers}
              currentIndex={currentQuestionIndex}
              onQuestionClick={goToQuestion}
            />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
              Are you sure you want to submit? You cannot change answers after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSubmitDialog(false);
                submitExam();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calculator Dialog */}
      <Calculator open={showCalculator} onOpenChange={setShowCalculator} />

      {/* Dictionary Dialog */}
      <Dictionary open={showDictionary} onOpenChange={setShowDictionary} />
    </div>
  );
}

