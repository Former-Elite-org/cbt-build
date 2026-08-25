import { useEffect, useMemo, useState } from 'react';
import { _get } from '@/Helper';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2,
  FileText,
  Download,
  Trophy,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reportingService } from '../services/reportingService';
import { ExamReport, StudentReportData, SubjectReportData } from '../services/reportingService';
import { useTeacherAccess } from '../hooks/useTeacherAccess';

export default function ReportsPage() {
  const { isTeacher, selected_branch, subjectOptions, classOptions, getSubjectsForClass } = useTeacherAccess();
  const [tab, setTab] = useState('exam');
  const [exams, setExams] = useState<any[]>([]);

  // Exam report
  const [examId, setExamId] = useState('');
  const [examReport, setExamReport] = useState<ExamReport | null>(null);
  const [examLoading, setExamLoading] = useState(false);

  // Student report
  const [stuExamId, setStuExamId] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentReport, setStudentReport] = useState<StudentReportData | null>(null);
  const [stuLoading, setStuLoading] = useState(false);

  // Subject report — class first, subjects filtered by the selected class
  const [subjectClass, setSubjectClass] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectReport, setSubjectReport] = useState<SubjectReportData | null>(null);
  const [subjLoading, setSubjLoading] = useState(false);

  const subjectSelectorOptions = useMemo(
    () => getSubjectsForClass(subjectClass || null),
    [getSubjectsForClass, subjectClass]
  );

  const handleSubjectClassChange = (v: string) => {
    setSubjectClass(v === '__all__' ? '' : v);
    setSubject('');
    setSubjectReport(null);
  };

  const handleSubjectChange = (v: string) => {
    setSubject(v);
    setSubjectReport(null);
  };

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
              ? merged.filter((e) => subjectOptions?.some((s) => s.value === e.subject_code))
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

  const loadExamReport = async () => {
    if (!examId) return toast.error('Select an exam');
    setExamLoading(true);
    try {
      const res = await reportingService.getExamReport(examId);
      if (res.success && res.data) setExamReport(res.data);
      else toast.error(res.message || 'No report data');
    } catch {
      toast.error('Failed to load exam report');
    } finally {
      setExamLoading(false);
    }
  };

  const loadStudentReport = async () => {
    if (!stuExamId) return toast.error('Select an exam');
    if (!admissionNo.trim()) return toast.error('Enter admission number');
    setStuLoading(true);
    try {
      const res = await reportingService.getStudentReport(stuExamId, admissionNo.trim());
      if (res.success && res.data) setStudentReport(res.data);
      else toast.error(res.message || 'No result for this student');
    } catch {
      toast.error('Failed to load student report');
    } finally {
      setStuLoading(false);
    }
  };

  const loadSubjectReport = async () => {
    if (!selected_branch?.branch_id) return;
    if (!subject) return;
    setSubjLoading(true);
    try {
      const res = await reportingService.getSubjectReport({
        branch_id: selected_branch.branch_id,
        subject,
        class_name: subjectClass || undefined,
      });
      if (res.success && res.data) setSubjectReport(res.data);
      else toast.error(res.message || 'No data');
    } catch {
      toast.error('Failed to load subject report');
    } finally {
      setSubjLoading(false);
    }
  };

  useEffect(() => {
    if (selected_branch?.branch_id && tab === 'subject') loadSubjectReport();
  }, [subject, subjectClass, selected_branch?.branch_id, tab]);

  // ─── PDF export ───────────────────────────────────────────────────────────
  const exportExamPdf = () => {
    if (!examReport) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Professional Exam Report', 40, 40);
    doc.setFontSize(10);
    doc.text(`Exam: ${examReport.exam.title || examReport.exam.id}`, 40, 58);
    doc.text(`Subject: ${examReport.exam.subject_code || 'N/A'}`, 40, 72);
    doc.text(`Students: ${examReport.student_count ?? examReport.aggregate.sample_size ?? 0}`, 40, 86);
    autoTable(doc, {
      startY: 100,
      head: [['Metric', 'Value']],
      body: [
        ['Mean', String(examReport.aggregate?.mean ?? '')],
        ['Median', String(examReport.aggregate?.median ?? '')],
        ['Standard Deviation', String(examReport.aggregate?.std_dev ?? '')],
        ['Highest', String(examReport.aggregate?.highest ?? '')],
        ['Lowest', String(examReport.aggregate?.lowest ?? '')],
        ['Pass Rate (%)', String(examReport.aggregate?.pass_rate ?? '')],
      ],
    });
    const gradeBody = Object.entries(examReport.grade_distribution || {}).map(([g, c]) => [g, String(c)]);
    if (gradeBody.length) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Grade', 'Students']],
        body: gradeBody,
      });
    }
    if (examReport.topic_mastery?.length) {
      autoTable(doc, {
        startY: gradeBody.length ? (doc as any).lastAutoTable.finalY + 16 : 100,
        head: [['Topic', 'Items', 'Mastery %']],
        body: examReport.topic_mastery.map((t) => [t.topic, String(t.total ?? ''), String(t.mastery_percentage ?? '')]),
      });
    }
    doc.save(`exam-report-${examReport.exam.id}.pdf`);
  };

  const exportStudentPDF = () => {
    if (!studentReport) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Student Professional Report', 40, 40);
    doc.setFontSize(10);
    doc.text(`Exam: ${studentReport.exam?.title || ''}`, 40, 58);
    doc.text(`Student: ${studentReport.student?.admission_no || ''}`, 40, 72);
    doc.text(`Score: ${studentReport.student?.total_score ?? 0} / ${studentReport.student?.max_score ?? 0} (${studentReport.student?.percentage ?? 0}%)`, 40, 86);
    doc.text(
      `Grade: ${studentReport.student?.grade || 'N/A'}  •  Position: ${studentReport.student?.position ?? '-'} of ${studentReport.student?.out_of ?? '-'}`,
      40,
      100
    );
    autoTable(doc, {
      startY: 120,
      head: [['Topic', 'Correct', 'Total', 'Mastery %', 'Marks']],
      body: (studentReport.topic_breakdown || []).map((t) => [
        t.topic,
        String(t.correct ?? 0),
        String(t.total ?? 0),
        String(t.mastery_percentage ?? 0),
        `${t.earned_marks ?? 0}/${t.max_marks ?? 0}`,
      ]),
    });
    if (studentReport.question_detail?.length) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Question', 'Type', 'Topic', 'Result']],
        body: studentReport.question_detail.map((q) => [
          String(q.question_text || '').slice(0, 60),
          q.question_type || '',
          q.topic_name || '',
          q.correct ? `Correct (${q.obtained ?? 0}/${q.marks ?? 0})` : `Incorrect (${q.obtained ?? 0}/${q.marks ?? 0})`,
        ]),
      });
    }
    doc.save(`student-report-${studentReport.student?.admission_no}.pdf`);
  };

  const exportSubjectExcel = () => {
    if (!subjectReport) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        subjectReport.exams.map((e) => ({
          Exam: e.title,
          Subject: e.subject_code,
          Mean: e.mean,
          Median: e.median,
          'Pass Rate %': e.pass_rate,
          Students: e.students,
          'Std Dev': e.std_dev,
        }))
      ),
      'Exams'
    );
    XLSX.writeFile(wb, `subject-report-${subjectReport.subject || 'all'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Professional Reporting</h2>
        <p className="text-sm text-muted-foreground">
          Exam, per-student and subject reports with PDF & Excel export
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="exam">Exam Report</TabsTrigger>
          <TabsTrigger value="student">Student Report</TabsTrigger>
          <TabsTrigger value="subject">Subject Report</TabsTrigger>
        </TabsList>

        <TabsContent value="exam" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class / Exam Report</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.id || e.exam_id} value={e.id || e.exam_id}>
                      {e.title || e.name || e.exam_name || e.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={loadExamReport} disabled={examLoading || !examId}>
                  {examLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
                <Button variant="outline" onClick={exportExamPdf} disabled={!examReport}>
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>
            </CardBody>
          </Card>

          {examReport && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Mean" value={String(examReport.aggregate?.mean ?? '—')} />
                <StatCard label="Pass Rate" value={`${examReport.aggregate?.pass_rate ?? '—'}%`} />
                <StatCard label="Students" value={String(examReport.student_count ?? examReport.aggregate?.sample_size ?? '—')} />
                <StatCard label="Reliability" value={examReport.reliability?.kr20 ? String(examReport.reliability.kr20).slice(0, 5) : '—'} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ClipboardList className="h-4 w-4" /> Grade Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(examReport.grade_distribution || {}).map(([g, v]) => (
                        <Badge key={g} variant="outline" className="px-3 py-1">
                          {g}: <span className="ml-1 font-bold">{v}</span>
                        </Badge>
                      ))}
                    </div>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="h-4 w-4" /> Topics
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="space-y-2">
                    {(examReport.topic_mastery || []).map((t) => (
                      <div key={t.topic} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                        <span>{t.topic}</span>
                        <span className="text-muted-foreground">{t.mastery_percentage ?? 0}%</span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Report</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Exam</Label>
                  <Select value={stuExamId} onValueChange={setStuExamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((e) => (
                        <SelectItem key={e.id || e.exam_id} value={e.id || e.exam_id}>
                          {e.title || e.name || e.exam_name || e.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Admission Number</Label>
                  <Input
                    placeholder="e.g. ADM-2024-001"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadStudentReport()}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadStudentReport} disabled={stuLoading || !stuExamId}>
                  {stuLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
                <Button variant="outline" onClick={exportStudentPDF} disabled={!studentReport}>
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>
            </CardBody>
          </Card>

          {studentReport && (
            <>
              <Card>
                <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard label="Score" value={`${studentReport.student?.total_score ?? 0}/${studentReport.student?.max_score ?? 0}`} />
                  <StatCard label="Percentage" value={`${studentReport.student?.percentage ?? 0}%`} />
                  <StatCard label="Grade" value={studentReport.student?.grade || 'N/A'} />
                  <StatCard label="Position" value={`${studentReport.student?.position ?? '-'}/${studentReport.student?.out_of ?? '-'}`} />
                  <StatCard label="Correct" value={`${studentReport.student?.correct_answers ?? 0}/${studentReport.student?.answered_questions ?? 0}`} />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4" /> Question Breakdown
                  </CardTitle>
                </CardHeader>
                <CardBody className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentReport.question_detail.map((q) => (
                        <TableRow key={q.question_id}>
                          <TableCell className="max-w-md truncate">{q.question_text || '—'}</TableCell>
                          <TableCell className="text-xs">{q.topic_name || '—'}</TableCell>
                          <TableCell>
                            <Badge variant={q.correct ? 'success' : 'destructive'}>
                              {q.correct ? `Correct ${q.obtained ?? 0}/${q.marks ?? 0}` : `Incorrect ${q.obtained ?? 0}/${q.marks ?? 0}`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="subject" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subject Report</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={subjectClass || '__all__'} onValueChange={handleSubjectClassChange}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All classes</SelectItem>
                  {classOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={subjectSelectorOptions.length ? 'Subject' : 'Select a class first'} />
                </SelectTrigger>
                <SelectContent>
                  {subjectSelectorOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={loadSubjectReport} disabled={subjLoading || !subject}>
                  {subjLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load
                </Button>
                <Button variant="outline" onClick={exportSubjectExcel} disabled={!subjectReport}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </CardBody>
          </Card>

          {subjectReport && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Exams" value={String(subjectReport.overall?.exams ?? 0)} />
                <StatCard label="Total Students" value={String(subjectReport.overall?.students ?? 0)} />
                <StatCard label="Avg Mean" value={String(subjectReport.overall?.avg_mean ?? 0)} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" /> Exams
                  </CardTitle>
                </CardHeader>
                <CardBody className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Mean</TableHead>
                        <TableHead>Median</TableHead>
                        <TableHead>Pass Rate</TableHead>
                        <TableHead>Students</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(subjectReport.exams || []).map((e) => (
                        <TableRow key={e.exam_id}>
                          <TableCell className="max-w-md truncate">{e.title || e.exam_id}</TableCell>
                          <TableCell>{e.mean ?? '—'}</TableCell>
                          <TableCell>{e.median ?? '—'}</TableCell>
                          <TableCell>{e.pass_rate ?? '—'}%</TableCell>
                          <TableCell>{e.students ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
      </CardBody>
    </Card>
  );
}