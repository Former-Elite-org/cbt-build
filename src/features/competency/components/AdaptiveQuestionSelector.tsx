/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AdaptiveQuestionSelector Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Intelligently selects next question based on competency mastery levels
 */

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Competency {
  id: string;
  competency_code: string;
  competency_name: string;
  subject_code: string;
  current_proficiency?: number;
  questions_attempted?: number;
  mastery_level?: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  competency_id: string;
  competency_name?: string;
  weight?: number;
}

interface AdaptiveQuestionSelectorProps {
  examId: string;
  admissionNo: string;
  subjectCode?: string;
  onQuestionSelect?: (question: Question) => void;
  onComplete?: () => void;
}

export const AdaptiveQuestionSelector: React.FC<AdaptiveQuestionSelectorProps> = ({
  examId,
  admissionNo,
  subjectCode,
  onQuestionSelect,
  onComplete
}) => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    explanation?: string;
  } | null>(null);
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    initializeSession();
  }, [examId, admissionNo]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student's current competency progress
      const progressParams = subjectCode ? `?subject_code=${subjectCode}` : '';
      const progressResponse = await api.get(
        `/cbt/student-competency/student/${admissionNo}${progressParams}`
      );

      if (progressResponse.data.success) {
        const progressData = progressResponse.data.data.progress;
        setCompetencies(progressData.map((p: any) => ({
          id: p.competency_id,
          competency_code: p.competency_code,
          competency_name: p.competency_name,
          subject_code: p.subject_code,
          current_proficiency: p.proficiency_score,
          questions_attempted: p.questions_attempted,
          mastery_level: p.current_level
        })));
      }

      // Load first question
      await loadNextQuestion();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize adaptive session');
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setFeedback(null);

      // Find competency that needs most work (lowest proficiency)
      const targetCompetency = selectTargetCompetency();

      if (!targetCompetency) {
        // No more competencies to assess
        onComplete?.();
        return;
      }

      // Get questions for this competency
      const questionsResponse = await api.get(
        `/cbt/question-competency/by-competency/${targetCompetency.id}?include_details=true`
      );

      if (questionsResponse.data.success && questionsResponse.data.data.length > 0) {
        const questions = questionsResponse.data.data;
        
        // Select question based on current proficiency level
        const selectedQuestion = selectOptimalQuestion(questions, targetCompetency);
        
        if (selectedQuestion) {
          setCurrentQuestion({
            ...selectedQuestion,
            competency_name: targetCompetency.competency_name
          });
          onQuestionSelect?.(selectedQuestion);
        }
      } else {
        // No questions available for this competency, try next
        await loadNextQuestion();
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load next question');
    } finally {
      setLoading(false);
    }
  };

  const selectTargetCompetency = (): Competency | null => {
    if (competencies.length === 0) return null;

    // Priority order:
    // 1. Competencies with < 70% proficiency (not yet proficient)
    // 2. Competencies with fewer questions attempted
    // 3. Lowest proficiency score

    const needsWork = competencies.filter(c => 
      (c.current_proficiency || 0) < 70
    );

    if (needsWork.length > 0) {
      // Sort by questions attempted (ascending) then proficiency (ascending)
      needsWork.sort((a, b) => {
        const attemptsA = a.questions_attempted || 0;
        const attemptsB = b.questions_attempted || 0;
        
        if (attemptsA !== attemptsB) {
          return attemptsA - attemptsB;
        }
        
        return (a.current_proficiency || 0) - (b.current_proficiency || 0);
      });

      return needsWork[0];
    }

    // All competencies are proficient, maintain mastery
    return competencies.reduce((lowest, current) => 
      (current.current_proficiency || 0) < (lowest.current_proficiency || 0)
        ? current
        : lowest
    );
  };

  const selectOptimalQuestion = (questions: any[], competency: Competency): Question | null => {
    if (questions.length === 0) return null;

    const proficiency = competency.current_proficiency || 0;

    // Select difficulty based on proficiency level
    let targetDifficulty: string;
    if (proficiency < 50) {
      targetDifficulty = 'Easy';
    } else if (proficiency < 70) {
      targetDifficulty = 'Medium';
    } else {
      targetDifficulty = 'Hard';
    }

    // Try to find question of target difficulty
    const targetQuestions = questions.filter(q => 
      q.difficulty_level === targetDifficulty
    );

    if (targetQuestions.length > 0) {
      // Return random question from target difficulty
      return targetQuestions[Math.floor(Math.random() * targetQuestions.length)];
    }

    // Fallback to any available question
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    try {
      setAnswerSubmitted(true);

      // Submit answer and get feedback
      const response = await api.post('/cbt/adaptive/submit-response', {
        exam_id: examId,
        admission_no: admissionNo,
        question_id: currentQuestion.id,
        answer: selectedAnswer,
        competency_id: currentQuestion.competency_id
      });

      if (response.data.success) {
        const { correct, explanation, proficiency_update } = response.data.data;
        
        setFeedback({ correct, explanation });
        
        // Update local competency proficiency
        if (proficiency_update) {
          setCompetencies(prev => prev.map(c => 
            c.id === currentQuestion.competency_id
              ? { ...c, current_proficiency: proficiency_update.new_proficiency }
              : c
          ));
        }

        // Update session stats
        setSessionStats(prev => ({
          questionsAnswered: prev.questionsAnswered + 1,
          correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
          totalQuestions: prev.totalQuestions
        }));
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    }
  };

  const handleNextQuestion = async () => {
    await loadNextQuestion();
  };

  if (loading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading adaptive assessment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!currentQuestion) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Assessment Complete</AlertTitle>
        <AlertDescription>
          You have completed all available competency assessments.
        </AlertDescription>
      </Alert>
    );
  }

  const accuracy = sessionStats.questionsAnswered > 0
    ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Adaptive Assessment</h2>
            <p className="text-sm text-muted-foreground">
              Personalized question selection
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionStats.questionsAnswered}</div>
              <div className="text-xs text-muted-foreground">Answered</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Current Competency Info */}
      <Alert className="border-primary/50 bg-primary/5">
        <Target className="h-4 w-4" />
        <AlertTitle>Current Focus</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{currentQuestion.competency_name}</span>
          <Badge variant="outline">
            {currentQuestion.difficulty_level} Question
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Question Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                Question {sessionStats.questionsAnswered + 1}
              </CardTitle>
              <CardDescription className="mt-2">
                <Badge variant="secondary" className="mr-2">
                  {currentQuestion.question_type}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.difficulty_level}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="text-lg font-medium">
            {currentQuestion.question_text}
          </div>

          {/* Answer Input (placeholder - customize based on question type) */}
          {!answerSubmitted && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Select your answer:</div>
              {/* Add your answer options here based on question type */}
              <div className="space-y-2">
                <Button
                  variant={selectedAnswer === 'A' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedAnswer('A')}
                >
                  A. Option A
                </Button>
                <Button
                  variant={selectedAnswer === 'B' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedAnswer('B')}
                >
                  B. Option B
                </Button>
                <Button
                  variant={selectedAnswer === 'C' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedAnswer('C')}
                >
                  C. Option C
                </Button>
                <Button
                  variant={selectedAnswer === 'D' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedAnswer('D')}
                >
                  D. Option D
                </Button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {answerSubmitted && feedback && (
            <Alert className={feedback.correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              {feedback.correct ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle className={feedback.correct ? 'text-green-800' : 'text-red-800'}>
                {feedback.correct ? 'Correct!' : 'Incorrect'}
              </AlertTitle>
              {feedback.explanation && (
                <AlertDescription className={feedback.correct ? 'text-green-700' : 'text-red-700'}>
                  {feedback.explanation}
                </AlertDescription>
              )}
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {!answerSubmitted ? (
              <Button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Competency Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Competency Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competencies.slice(0, 5).map((comp) => (
              <div key={comp.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{comp.competency_name}</span>
                  <span className="text-muted-foreground">
                    {comp.current_proficiency?.toFixed(0) || 0}%
                  </span>
                </div>
                <Progress 
                  value={comp.current_proficiency || 0} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveQuestionSelector;
