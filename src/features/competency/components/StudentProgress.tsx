/**
 * ═══════════════════════════════════════════════════════════════════════════
 * StudentProgress Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Displays student competency progress with visualizations
 */

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Target,
  Award,
  Loader2,
  BarChart3
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CompetencyProgress {
  id: string;
  competency_id: string;
  competency_code: string;
  competency_name: string;
  subject_code: string;
  current_level: string;
  proficiency_score: number;
  questions_attempted: number;
  questions_correct: number;
  last_assessed: string;
}

interface ProgressSummary {
  total_competencies: number;
  average_proficiency: number;
  by_level: Record<string, number>;
}

interface StudentProgressProps {
  admissionNo: string;
  subjectCode?: string;
}

const LEVEL_COLORS: Record<string, string> = {
  'Emerging': 'bg-red-100 text-red-800 border-red-200',
  'Developing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Proficient': 'bg-blue-100 text-blue-800 border-blue-200',
  'Advanced': 'bg-green-100 text-green-800 border-green-200',
  'Unknown': 'bg-gray-100 text-gray-800 border-gray-200'
};

export const StudentProgress: React.FC<StudentProgressProps> = ({
  admissionNo,
  subjectCode: initialSubject
}) => {
  const [progress, setProgress] = useState<CompetencyProgress[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchProgress();
  }, [admissionNo, selectedSubject]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = selectedSubject ? `?subject_code=${selectedSubject}` : '';
      const response = await api.get(`/cbt/student-competency/student/${admissionNo}${params}`);

      if (response.data.success) {
        const { progress: progressData, summary: summaryData } = response.data.data;
        
        setProgress(progressData);
        setSummary(summaryData);

        // Extract unique subjects
        const uniqueSubjects = Array.from(
          new Set(progressData.map((p: CompetencyProgress) => p.subject_code))
        );
        setSubjects(uniqueSubjects);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load student progress');
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyTrend = (score: number) => {
    if (score >= 70) {
      return { icon: TrendingUp, color: 'text-green-600', label: 'On Track' };
    } else if (score >= 50) {
      return { icon: Minus, color: 'text-yellow-600', label: 'Developing' };
    } else {
      return { icon: TrendingDown, color: 'text-red-600', label: 'Needs Support' };
    }
  };

  const getAccuracy = (attempted: number, correct: number) => {
    if (attempted === 0) return 0;
    return Math.round((correct / attempted) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading progress data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No progress data available for this student.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Student Progress
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Competency mastery tracking for {admissionNo}
          </p>
        </div>

        {/* Subject Filter */}
        {subjects.length > 0 && (
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{summary.total_competencies}</div>
                <p className="text-xs text-muted-foreground">Competencies</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{summary.average_proficiency}%</div>
                <p className="text-xs text-muted-foreground">Avg Proficiency</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {(summary.by_level['Proficient'] || 0) + (summary.by_level['Advanced'] || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Proficient+</p>
              </div>
              <Award className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.by_level['Developing'] || 0}
                </div>
                <p className="text-xs text-muted-foreground">Developing</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Proficiency Level Distribution</CardTitle>
          <CardDescription>Breakdown by mastery level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(summary.by_level).map(([level, count]) => {
              const percentage = summary.total_competencies > 0
                ? (count / summary.total_competencies) * 100
                : 0;

              return (
                <div key={level} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{level}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Competency Progress */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Competency Details</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {progress.map((comp) => {
            const trend = getProficiencyTrend(comp.proficiency_score);
            const accuracy = getAccuracy(comp.questions_attempted, comp.questions_correct);
            const TrendIcon = trend.icon;

            return (
              <Card key={comp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{comp.competency_name}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="outline" className="text-xs mr-2">
                          {comp.competency_code}
                        </Badge>
                        {comp.subject_code}
                      </CardDescription>
                    </div>
                    <Badge 
                      className={`${LEVEL_COLORS[comp.current_level] || LEVEL_COLORS['Unknown']} border`}
                      variant="outline"
                    >
                      {comp.current_level}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Proficiency Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                        <span className="font-medium">Proficiency</span>
                      </span>
                      <span className="font-bold">{comp.proficiency_score}%</span>
                    </div>
                    <Progress value={comp.proficiency_score} className="h-2" />
                  </div>

                  {/* Questions Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-muted rounded-md p-2">
                      <div className="font-bold">{comp.questions_attempted}</div>
                      <div className="text-xs text-muted-foreground">Attempted</div>
                    </div>
                    <div className="bg-muted rounded-md p-2">
                      <div className="font-bold">{comp.questions_correct}</div>
                      <div className="text-xs text-muted-foreground">Correct</div>
                    </div>
                    <div className="bg-muted rounded-md p-2">
                      <div className="font-bold">{accuracy}%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  {/* Last Assessed */}
                  <div className="text-xs text-muted-foreground">
                    Last assessed: {new Date(comp.last_assessed).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* No Data Message */}
      {progress.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No competency progress data found for the selected filters.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StudentProgress;
