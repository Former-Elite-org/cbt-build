/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Adaptive Exam Page
 * ═══════════════════════════════════════════════════════════════════════════
 * Computer Adaptive Testing (CAT) exam interface with real-time ability tracking
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Target,
  Award,
  BarChart3,
  Clock,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adaptiveService } from '../services/adaptiveService';
import type { AdaptiveSession, NextItemData, AbilityEstimate } from '../types/adaptive.types';

export default function AdaptiveExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  // Session state
  const [session, setSession] = useState<AdaptiveSession | null>(null);
  const [currentItem, setCurrentItem] = useState<NextItemData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [ability, setAbility] = useState<AbilityEstimate | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  
  // Feedback state — ability progress only, never correct answers.
  const [lastResponse, setLastResponse] = useState<{
    theta: number | null;
    answered: boolean;
  } | null>(null);

  // Start session
  const startSession = async () => {
    if (!examId) return;
    
    setLoading(true);
    try {
      // Identity comes from the JWT on the server — no client-supplied identity.
      const response = await adaptiveService.startAdaptiveSession({
        exam_id: examId
      });

      if (response.success) {
        setSession(response.data);
        setAbility({
          theta: response.data.initial_theta,
          se: response.data.initial_se,
          confidence_95: { lower: -999, upper: 999 },
          reliability: 0,
          method: 'initial'
        });
        setShowInstructions(false);
        await loadNextItem(response.data.session_id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start session');
      console.error('Start session error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load next item
  const loadNextItem = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await adaptiveService.getNextItem(sessionId);

      if (response.session_complete) {
        // Session terminated
        setSessionEnded(true);
        setShowEndDialog(true);
        return;
      }

      if (response.success && response.data) {
        setCurrentItem(response.data);
        setSelectedAnswer('');
        setLastResponse(null);
        setQuestionStartTime(Date.now());
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load next question');
      console.error('Load next item error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!selectedAnswer || !currentItem || !session) {
      toast.error('Please select an answer');
      return;
    }

    setSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      
      const response = await adaptiveService.submitResponse({
        session_id: session.session_id,
        item_admin_id: currentItem.item_admin_id,
        answer: selectedAnswer,
        time_spent: timeSpent
      });

      if (response.success) {
        setAbility(response.data.updated_ability);
        setLastResponse({
          theta: response.data.updated_ability?.theta ?? null,
          answered: true
        });

        // Show feedback briefly, then load next item
        setTimeout(() => {
          loadNextItem(session.session_id);
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
      console.error('Submit answer error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // End session manually
  const handleEndSession = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await adaptiveService.endSession(session.session_id);
      
      if (response.success) {
        toast.success('Exam completed successfully!');
        navigate(`/results/adaptive/${session.session_id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to end session');
      console.error('End session error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get ability level description
  const getAbilityDescription = (theta: number): { label: string; color: string; icon: JSX.Element } => {
    if (theta < -1.0) return { 
      label: 'Developing', 
      color: 'text-yellow-600', 
      icon: <TrendingDown className="w-4 h-4" /> 
    };
    if (theta < 0.5) return { 
      label: 'Approaching', 
      color: 'text-blue-600', 
      icon: <Minus className="w-4 h-4" /> 
    };
    if (theta < 1.5) return { 
      label: 'Proficient', 
      color: 'text-green-600', 
      icon: <Target className="w-4 h-4" /> 
    };
    return { 
      label: 'Advanced', 
      color: 'text-purple-600', 
      icon: <TrendingUp className="w-4 h-4" /> 
    };
  };

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (!currentItem || !session) return 0;
    return (currentItem.items_administered / session.max_items) * 100;
  };

  // Prevent page refresh
  useEffect(() => {
    if (!session || sessionEnded) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your adaptive test is in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session, sessionEnded]);

  // Instructions Dialog
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <Card className="max-w-2xl mx-auto mt-12">
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Adaptive Assessment
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Computer-Adaptive Testing with Real-time Ability Estimation
            </p>
          </CardHeader>

          <CardBody className="space-y-6 p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                How Adaptive Testing Works
              </h3>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Questions adapt to your ability level in real-time
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Your ability (θ) is estimated after each response
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Test ends when precision target is met or max questions reached
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Fewer questions needed compared to traditional tests
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Key Features
              </h3>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Real-time ability tracking and visualization
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Immediate feedback after each question
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Precision measurement with confidence intervals
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Adaptive difficulty based on performance
                </li>
              </ul>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Note:</strong> Once you start, you cannot pause or go back to previous questions. 
                Each question is selected specifically for your current ability level.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={startSession}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Starting...' : 'Start Adaptive Test'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Main exam interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header with Ability Display */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ability Estimate */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Brain className="w-4 h-4" />
                  Current Ability (θ)
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold">
                    {ability?.theta.toFixed(2) || '0.00'}
                  </span>
                  {ability && (
                    <Badge variant="secondary" className={`${getAbilityDescription(ability.theta).color} bg-white/20`}>
                      {getAbilityDescription(ability.theta).icon}
                      <span className="ml-1">{getAbilityDescription(ability.theta).label}</span>
                    </Badge>
                  )}
                </div>
                <div className="text-xs opacity-75">
                  SE: {ability?.se.toFixed(3) || '2.000'} | 
                  Reliability: {((ability?.reliability || 0) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Question {currentItem?.items_administered || 0} of {session?.max_items || 0}</span>
                    <span>{getProgressPercentage().toFixed(0)}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
                  <div className="text-xs opacity-75">
                    Min: {session?.min_items} | Target SE: {session?.target_se}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Award className="w-4 h-4" />
                  Performance
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{currentItem?.progress.current || 0}</div>
                    <div className="text-xs opacity-75">Answered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {ability?.confidence_95 ? 
                        `${ability.confidence_95.lower.toFixed(1)} - ${ability.confidence_95.upper.toFixed(1)}` 
                        : '--'}
                    </div>
                    <div className="text-xs opacity-75">95% CI</div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Question Card */}
        {loading ? (
          <Card>
            <CardBody className="p-8 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </CardBody>
          </Card>
        ) : currentItem ? (
          <Card>
            <CardHeader className="border-b bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline">Question {currentItem.progress.current}</Badge>
                  {currentItem.question.topic && (
                    <Badge variant="secondary" className="ml-2">{currentItem.question.topic}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor((Date.now() - questionStartTime) / 1000)}s</span>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-8 space-y-6">
              {/* Question Text */}
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-4">
                  {currentItem.question.text}
                </h3>
              </div>

              {/* Last Response Feedback — progress only, no correct answers */}
              {lastResponse?.answered && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <AlertDescription>
                      <span className="text-blue-800 dark:text-blue-200 font-medium">
                        Response recorded. Current ability estimate: {lastResponse.theta !== null ? lastResponse.theta.toFixed(2) : 'updating…'}
                      </span>
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(currentItem.question.options).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedAnswer(key.toUpperCase())}
                    disabled={submitting}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === key.toUpperCase()
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        selectedAnswer === key.toUpperCase()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {key.toUpperCase()}
                      </div>
                      <div className="flex-1 pt-1">
                        {value}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowEndDialog(true)}
                  disabled={submitting}
                >
                  End Test
                </Button>
                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Adaptive Test?</DialogTitle>
            <DialogDescription>
              {sessionEnded ? (
                'Your adaptive test has been completed. Click "View Results" to see your final score.'
              ) : (
                `You have answered ${currentItem?.progress.current || 0} of ${session?.max_items || 0} questions. 
                Are you sure you want to end the test now?`
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {!sessionEnded && (
              <Button variant="outline" onClick={() => setShowEndDialog(false)}>
                Continue Testing
              </Button>
            )}
            <Button onClick={handleEndSession} disabled={loading}>
              {loading ? 'Ending...' : 'View Results'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
