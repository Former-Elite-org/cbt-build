import { useEffect, useMemo, useState } from 'react';
import { _get } from '@/Helper';

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
  Sigma,
  Percent,
  Timer,
  Users,
  ClipboardList,
  ListChecks,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reliabilityService } from '../services/reliabilityService';
import { ReliabilityResult } from '../types/reliability.types';
import { useTeacherAccess } from '../hooks/useTeacherAccess';

const INTERP_META: Record<string, { variant: 'success' | 'default' | 'warning' | 'destructive'; pct: number }> = {
  Excellent: { variant: 'success', pct: 100 },
  Good: { variant: 'success', pct: 85 },
  Acceptable: { variant: 'default', pct: 70 },
  Questionable: { variant: 'warning', pct: 50 },
  Unacceptable: { variant: 'destructive', pct: 25 },
};

export default function ReliabilityPage() {
  const { isTeacher, selected_branch, subjectCodes } = useTeacherAccess();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [result, setResult] = useState<ReliabilityResult | null>(null);
  const [loading, setLoading] = useState(false);

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
      const res = await reliabilityService.analyze(selectedExamId);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        toast.error(res.message || 'Analysis failed');
      }
    } catch {
      toast.error('Failed to compute reliability');
    } finally {
      setLoading(false);
    }
  };

  const meta = useMemo(
    () => (result ? INTERP_META[result.interpretation] || INTERP_META.Questionable : null),
    [result]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Test Reliability</h2>
          <p className="text-sm text-muted-foreground">
            KR-20, Cronbach&apos;s Alpha, Standard Error of Measurement and split-half reliability
          </p>
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
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Calculate Reliability
          </Button>
        </CardBody>
      </Card>

      {!result && !loading && (
        <Card>
          <CardBody className="py-12 text-center text-muted-foreground">
            Select an exam and calculate reliability to see KR-20, Cronbach&apos;s alpha, SEM and more.
          </CardBody>
        </Card>
      )}

      {result && (
        <>
          {/* Headline card */}
          <Card>
            <CardBody className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">KR-20 Reliability</div>
                  <div className="text-4xl font-bold">{result.kr20.toFixed(2)}</div>
                  <Badge variant={meta?.variant || 'default'}>{result.interpretation}</Badge>
                </div>
                <div className="w-full max-w-md space-y-2">
                  <Progress value={meta?.pct || 0} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sample: {result.sample.students} students × {result.sample.items} items</span>
                    <span>SEM ± {result.sem}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sigma className="h-4 w-4" /> KR-20
                </div>
                <div className="mt-1 text-2xl font-bold">{result.kr20.toFixed(3)}</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Percent className="h-4 w-4" /> Cronbach&apos;s Alpha
                </div>
                <div className="mt-1 text-2xl font-bold">{result.cronbachs_alpha.toFixed(3)}</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" /> SEM
                </div>
                <div className="mt-1 text-2xl font-bold">{result.sem}</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> Std Dev
                </div>
                <div className="mt-1 text-2xl font-bold">{result.standard_deviation}</div>
              </CardBody>
            </Card>
          </div>

          {/* Split half + confidence intervals */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4" /> Split-Half (Spearman-Brown)
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="flex gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Raw r</div>
                    <div className="text-2xl font-bold">{result.split_half.r.toFixed(3)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Spearman-Brown</div>
                    <div className="text-2xl font-bold">{result.split_half.spearman_brown.toFixed(3)}</div>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecks className="h-4 w-4" /> Confidence Intervals
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid gap-2">
                  {Object.entries(result.confidence_intervals).map(([level, ci]) => (
                    <div key={level} className="flex items-center justify-between rounded border px-3 py-2">
                      <span className="text-sm font-medium">{level}</span>
                      <span className="text-sm text-muted-foreground">{ci.description}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="list-disc space-y-1 pl-5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{r}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}