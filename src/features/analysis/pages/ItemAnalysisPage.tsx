import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get } from '@/Helper';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ClipboardList,
  ListChecks,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { itemAnalysisService } from '../services/itemAnalysisService';
import { ItemAnalysis, ItemAnalysisResponse, QualityFlag } from '../types/itemAnalysis.types';

const QUALITY_META: Record<
  QualityFlag,
  { label: string; badgeVariant: 'success' | 'warning' | 'destructive' | 'default'; icon: any }
> = {
  Excellent: { label: 'Excellent', badgeVariant: 'success', icon: CheckCircle2 },
  Good: { label: 'Good', badgeVariant: 'default', icon: CheckCircle2 },
  'Needs Review': { label: 'Needs Review', badgeVariant: 'warning', icon: AlertTriangle },
  Reject: { label: 'Reject', badgeVariant: 'destructive', icon: XCircle },
};

const QUALITY_KEYS: QualityFlag[] = ['Excellent', 'Good', 'Needs Review', 'Reject'];

export default function ItemAnalysisPage() {
  const { selected_branch } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [analysis, setAnalysis] = useState<ItemAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | QualityFlag>('all');

  const fetchExams = () => {
    if (!selected_branch?.branch_id) return;
    setExamsLoading(true);
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
            // Deduplicate by exam id
            const seen = new Set();
            const merged = all.filter((e) => {
              const id = e.id || e.exam_id;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
            setExams(merged);
            setExamsLoading(false);
          }
        },
        () => {
          done += 1;
          if (done === statuses.length) {
            setExams([]);
            setExamsLoading(false);
          }
        }
      );
    });
  };

  useEffect(() => {
    fetchExams();
  }, [selected_branch?.branch_id]);

  const runAnalysis = (examId: string) => {
    if (!examId) return;
    setSelectedExamId(examId);
    setLoading(true);
    setAnalysis(null);
    itemAnalysisService
      .analyzeExam(examId)
      .then((res) => {
        if (res.success) {
          setAnalysis(res);
        } else {
          toast.error(res.message || 'Analysis failed');
        }
      })
      .catch(() => toast.error('Failed to run item analysis'))
      .finally(() => setLoading(false));
  };

  const items: ItemAnalysis[] = useMemo(() => analysis?.analysis || [], [analysis]);
  const filtered = useMemo(
    () => (activeTab === 'all' ? items : items.filter((i) => i.quality_flag === activeTab)),
    [items, activeTab]
  );

  const counts = useMemo(() => {
    const c: Record<QualityFlag, number> = {
      Excellent: 0,
      Good: 0,
      'Needs Review': 0,
      Reject: 0,
    };
    items.forEach((i) => {
      if (c[i.quality_flag] !== undefined) c[i.quality_flag] += 1;
    });
    return c;
  }, [items]);

  const summary = useMemo(() => analysis?.summary || {}, [analysis]);
  const qCounts = summary.quality_distribution as Record<string, number> | undefined;
  const avgDifficulty = (summary.avg_difficulty ?? 0) * 100;
  const avgDiscrimination = summary.avg_discrimination ?? 0;
  const totalAnalyzed = summary.total_analyzed ?? items.length;

  // Weighted quality score: Excellent=100, Good=75, Needs Review=50, Reject=0
  const qualityScore = useMemo(() => {
    if (totalAnalyzed === 0) return 0;
    const weights: Record<QualityFlag, number> = {
      Excellent: 100,
      Good: 75,
      'Needs Review': 50,
      Reject: 0,
    };
    const total = items.reduce((sum, i) => sum + (weights[i.quality_flag] ?? 0), 0);
    return total / totalAnalyzed;
  }, [items, totalAnalyzed]);

  const difficultyProgressClass = (level: string) => {
    switch (level) {
      case 'Very Easy':
        return 'bg-sky-500';
      case 'Easy':
        return 'bg-emerald-500';
      case 'Moderate':
        return 'bg-amber-500';
      case 'Hard':
        return 'bg-orange-500';
      default:
        return 'bg-rose-500';
    }
  };

  const difficultyLabel = (level: string) => {
    switch (level) {
      case 'Very Easy':
        return 'Very Easy';
      case 'Easy':
        return 'Easy';
      case 'Moderate':
        return 'Moderate';
      case 'Hard':
        return 'Hard';
      default:
        return 'Very Hard';
    }
  };

  const getDiscFlag = (index: number) =>
    index >= 0.3
      ? 'text-emerald-600 dark:text-emerald-400'
      : index >= 0.2
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#00356B] dark:text-white tracking-tight">
            Item Analysis
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" />
            Psychometric quality assessment of exam questions
          </p>
        </div>
        {analysis && (
          <Button
            onClick={() => runAnalysis(selectedExamId)}
            disabled={loading}
            className="gap-2 bg-[#00356B] hover:bg-[#00254B] text-white font-semibold h-10 px-4 rounded-xl shadow-sm text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Re-run Analysis
          </Button>
        )}
      </div>

      {/* Exam Selector */}
      <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
        <CardBody className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
            <Select value={selectedExamId || undefined} onValueChange={runAnalysis}>
              <SelectTrigger className="w-full sm:w-80 rounded-lg text-[#00356B] dark:text-white">
                <SelectValue placeholder="Select an exam to analyze..." />
              </SelectTrigger>
              <SelectContent>
                {exams.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    {examsLoading ? 'Loading exams...' : 'No completed/released exams found'}
                  </div>
                )}
                {exams.map((exam: any) => (
                  <SelectItem key={exam.id || exam.exam_id} value={String(exam.id || exam.exam_id)}>
                    {exam.assessment_type || exam.title || exam.exam_code} ·{' '}
                    {(exam.commence_date || '').slice(0, 10)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {examsLoading
                ? 'Loading exams...'
                : `${exams.length} exam(s) available. Requires completed exams with student responses.`}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
          <CardBody className="p-10 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#00356B]" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Running psychometric analysis...
            </p>
          </CardBody>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !analysis && !examsLoading && (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
          <CardBody className="text-center py-12 p-6">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Select an exam to view item analysis
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Difficulty index, discrimination index, distractor analysis, and quality flags will be
              calculated for each question.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {analysis && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Difficulty</p>
                  <p className="text-2xl font-bold text-[#00356B] dark:text-white mt-1">
                    {avgDifficulty.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Ideal range 40-70% (moderate)</p>
                </div>
                <Activity className="h-8 w-8 text-sky-500" />
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Discrimination</p>
                  <p className="text-2xl font-bold text-[#00356B] dark:text-white mt-1">
                    {avgDiscrimination.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Higher is better (&gt; 0.3)</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Items Analyzed</p>
                  <p className="text-2xl font-bold text-[#00356B] dark:text-white mt-1">
                    {totalAnalyzed}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">questions with responses</p>
                </div>
                <ListChecks className="h-8 w-8 text-purple-500" />
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quality Score</p>
                  <p className="text-2xl font-bold text-[#00356B] dark:text-white mt-1">
                    {qualityScore.toFixed(1)}%
                  </p>
                  <Progress value={qualityScore} className="h-2 mt-2 bg-gray-200 dark:bg-gray-700" />
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </CardBody>
            </Card>
          </div>

          {/* Quality Distribution */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
            <CardHeader className="p-5 border-b dark:border-gray-700/50">
              <CardTitle className="text-base font-bold text-[#00356B] dark:text-white">
                Quality Distribution
              </CardTitle>
            </CardHeader>
            <CardBody className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {QUALITY_KEYS.map((flag) => {
                  const meta = QUALITY_META[flag];
                  const Icon = meta.icon;
                  const count = qCounts?.[flag] ?? counts[flag];
                  return (
                    <div
                      key={flag}
                      className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/30 dark:bg-gray-900/20"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="h-6 w-6 text-[#00356B] dark:text-white" />
                        <Badge variant={meta.badgeVariant}>{flag}</Badge>
                      </div>
                      <p className="text-3xl font-black text-[#00356B] dark:text-white mt-3">{count}</p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Item Table */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <div className="p-5 pb-0">
                <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl max-w-lg border border-gray-200/50 dark:border-gray-600/50">
                  <TabsTrigger value="all" className="rounded-lg text-xs font-semibold py-2">
                    All ({items.length})
                  </TabsTrigger>
                  {QUALITY_KEYS.map((flag) => (
                    <TabsTrigger key={flag} value={flag} className="rounded-lg text-xs font-semibold py-2">
                      {flag} ({counts[flag]})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <TabsContent value={activeTab} className="mt-4 focus-visible:outline-none">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-gray-500">#</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 w-[28%]">Question</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">Type</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">Difficulty</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">Discrimination</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">Recommendations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No items in this category.
                          </TableCell>
                        </TableRow>
                      )}
                      {filtered.map((item, idx) => (
                        <TableRow key={item.question_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                          <TableCell className="text-sm text-gray-500">{idx + 1}</TableCell>
                          <TableCell className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-xs truncate">
                            {item.question_text}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.question_type || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 min-w-[7rem]">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {difficultyLabel(item.difficulty.level)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {(item.difficulty.index * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress
                                value={item.difficulty.index * 100}
                                className={`h-1.5 ${difficultyProgressClass(item.difficulty.level)}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-semibold ${getDiscFlag(item.discrimination.index)}`}>
                              {item.discrimination.index.toFixed(2)}
                            </span>
                            <p className="text-[11px] text-gray-500">{item.discrimination.quality}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={QUALITY_META[item.quality_flag].badgeVariant}>
                              {item.quality_flag}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.recommendations?.length ? (
                              <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                {item.recommendations.slice(0, 2).map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
}