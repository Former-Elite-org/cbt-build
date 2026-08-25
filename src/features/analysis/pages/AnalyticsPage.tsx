import { useEffect, useMemo, useState } from 'react';
import { _get } from '@/Helper';
import * as XLSX from 'xlsx';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  BarChart3,
  Download,
  Trophy,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsResult, TrendResult } from '../types/analytics.types';
import { useTeacherAccess } from '../hooks/useTeacherAccess';

const TREND_META: Record<string, { icon: any; className: string; label: string }> = {
  improving: { icon: TrendingUp, className: 'text-emerald-600', label: 'Improving' },
  declining: { icon: TrendingDown, className: 'text-red-600', label: 'Declining' },
  stable: { icon: Minus, className: 'text-muted-foreground', label: 'Stable' },
};

export default function AnalyticsPage() {
  const { isTeacher, selected_branch, subjectCodes, subjectOptions } = useTeacherAccess();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [trendSubject, setTrendSubject] = useState('');
  const [trend, setTrend] = useState<TrendResult | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const fetchExams = () => {
    if (!selected_branch?.branch_id) return;
    const all: any[] = [];
    let done = 0;
    const statuses = ['Completed', 'Released'];
    statuses.forEach((status) => {
      _get(
        `examinations?query_type=select&status=${status}&branch_id=${selected_branch.branch_id}`,
        (resp) => {
          if (resp.success && Array.isArray(resp.data)) all.push(...resp.data);
          done += 1;
          if (done === statuses.length) {
            const seen = new Set();
            const merged = all.filter((e) => {
              const id = e.id || e.exam_id;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
            // Teachers only see exams for subjects they are assigned to teach
            const scoped = isTeacher
              ? merged.filter((e) => subjectCodes?.has(e.subject_code))
              : merged;
            setExams(scoped);
          }
        },
        () => {
          done += 1;
        }
      );
    });
  };

  useEffect(() => {
    fetchExams();
  }, [selected_branch?.branch_id]);

  const runAnalysis = async () => {
    if (!selectedExamId) return toast.error('Select an exam first');
    setLoading(true);
    try {
      const res = await analyticsService.getExamAnalytics(selectedExamId);
      if (res.success && res.data) setResult(res.data);
      else toast.error(res.message || 'Analysis failed');
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const runTrend = async () => {
    if (!selected_branch?.branch_id) return;
    if (!trendSubject) return;
    setTrendLoading(true);
    try {
      const res = await analyticsService.getTrends({
        branch_id: selected_branch.branch_id,
        subject: trendSubject,
      });
      if (res.success && res.data) setTrend(res.data);
      else toast.error(res.message || 'No trend data');
    } catch {
      toast.error('Failed to load trends');
    } finally {
      setTrendLoading(false);
    }
  };

  useEffect(() => {
    if (selected_branch?.branch_id) runTrend();
  }, [trendSubject, selected_branch?.branch_id]);

  const maxBin = useMemo(
    () => (result ? Math.max(...result.distribution.map((b) => b.count), 1) : 1),
    [result]
  );
  const maxTopic = useMemo(
    () => (result ? Math.max(...result.topic_mastery.map((t) => t.mastery_percentage), 1) : 1),
    [result]
  );

  const exportExcel = () => {
    if (!result) return;
    const summaryRows = [
      { Metric: 'Mean Score', Value: result.summary.mean },
      { Metric: 'Median Score', Value: result.summary.median },
      { Metric: 'Standard Deviation', Value: result.summary.std_dev },
      { Metric: 'Highest', Value: result.summary.highest },
      { Metric: 'Lowest', Value: result.summary.lowest },
      { Metric: 'Pass Rate (%)', Value: result.summary.pass_rate },
      { Metric: 'Sample Size', Value: result.summary.sample_size },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Summary');
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(result.distribution),
      'Distribution'
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(result.topic_mastery), 'Topic Mastery');
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(result.top_students),
      'Top Students'
    );
    XLSX.writeFile(wb, `analytics-${result.exam_id}.xlsx`);
  };

  const trendMeta = trend ? TREND_META[trend.trend] || TREND_META.stable : null;
  const maxScore = trend ? Math.max(...trend.scores.map((s) => s || 0), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Score distributions, performance levels, topic mastery and cross-exam trends
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={!result}>
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Exam selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Exam</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choose a completed exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e.id || e.exam_id} value={e.id || e.exam_id}>
                  {e.title || e.name || e.exam_name || e.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={runAnalysis} disabled={loading || !selectedExamId}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            Analyze
          </Button>
        </CardBody>
      </Card>

      {!result && !loading && (
        <Card>
          <CardBody className="py-12 text-center text-muted-foreground">
            Select an exam to view its analytics dashboard.
          </CardBody>
        </Card>
      )}

      {result && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardBody className="p-4">
                <div className="text-sm text-muted-foreground">Mean Score</div>
                <div className="mt-1 text-2xl font-bold">{result.summary.mean}</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="text-sm text-muted-foreground">Median</div>
                <div className="mt-1 text-2xl font-bold">{result.summary.median}</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="text-sm text-muted-foreground">Pass Rate</div>
                <div className="mt-1 text-2xl font-bold">{result.summary.pass_rate}%</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="text-sm text-muted-foreground">Students</div>
                <div className="mt-1 flex items-center gap-2 text-2xl font-bold">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {result.summary.sample_size}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Score distribution histogram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" /> Score Distribution
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="flex items-end gap-1" style={{ height: '160px' }}>
                  {result.distribution.map((b) => (
                    <div key={b.bucket} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary/70"
                        style={{ height: `${(b.count / maxBin) * 100}%`, minHeight: b.count > 0 ? '4px' : '2px' }}
                        title={`${b.bucket}: ${b.count}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>0</span>
                  <span>100</span>
                </div>
              </CardBody>
            </Card>

            {/* Performance levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" /> Performance Levels
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Excellent (70-100)</span>
                    <span className="font-semibold">{result.performance_levels.excellent}</span>
                  </div>
                  <Progress value={(result.performance_levels.excellent / Math.max(result.summary.sample_size, 1)) * 100} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Good (50-69)</span>
                    <span className="font-semibold">{result.performance_levels.good}</span>
                  </div>
                  <Progress value={(result.performance_levels.good / Math.max(result.summary.sample_size, 1)) * 100} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Fair (40-49)</span>
                    <span className="font-semibold">{result.performance_levels.fair}</span>
                  </div>
                  <Progress value={(result.performance_levels.fair / Math.max(result.summary.sample_size, 1)) * 100} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Poor (&lt;40)</span>
                    <span className="font-semibold">{result.performance_levels.poor}</span>
                  </div>
                  <Progress value={(result.performance_levels.poor / Math.max(result.summary.sample_size, 1)) * 100} />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Topic mastery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4" /> Topic Mastery
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {result.topic_mastery.length === 0 ? (
                <p className="text-sm text-muted-foreground">No topic data available.</p>
              ) : (
                result.topic_mastery.map((t) => (
                  <div key={t.topic}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{t.topic}</span>
                      <span className="text-muted-foreground">
                        {t.mastery_percentage}% ({t.correct}/{t.total})
                      </span>
                    </div>
                    <Progress value={(t.mastery_percentage / maxTopic) * 100} />
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* Top students */}
          {result.top_students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4" /> Top Students
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {result.top_students.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                    <span>
                      <span className="mr-2 font-mono text-xs text-muted-foreground">#{i + 1}</span>
                      {s.admission_no}
                    </span>
                    <span className="flex items-center gap-2">
                      {s.grade && <Badge variant="outline">{s.grade}</Badge>}
                      <span className="font-semibold">{s.percentage}%</span>
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Trend analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" /> Performance Trend
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={trendSubject} onValueChange={setTrendSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={runTrend} disabled={trendLoading}>
              {trendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Load Trend
            </Button>
            {trend && trendMeta && (
              <span className={`flex items-center gap-1 text-sm font-medium ${trendMeta.className}`}>
                <trendMeta.icon className="h-4 w-4" /> {trendMeta.label} ({trend.growth_rate}%)
              </span>
            )}
          </div>
          {trend && trend.exams.length > 0 ? (
            <div className="space-y-2">
              {trend.exams.map((e, i) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-40 truncate text-xs text-muted-foreground">
                    {e.title || e.id}
                  </div>
                  <div className="flex-1">
                    <Progress value={(e.mean_score || 0) / (maxScore || 1) * 100} />
                  </div>
                  <div className="w-12 text-right text-sm font-semibold">{e.mean_score || 0}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {trendLoading ? 'Loading...' : 'No trend data for this subject yet.'}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}