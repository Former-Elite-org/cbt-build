import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get } from '@/Helper';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  RefreshCw,
  Loader2,
  FileText,
  BookOpen,
  Plus,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as React from 'react';
import { standardsService } from '../services/standardsService';
import { CurriculumStandard, StandardFilters } from '../types/standards.types';
import { useTeacherAccess } from '../hooks/useTeacherAccess';

const BODIES = ['WAEC', 'NECO', 'Cambridge', 'National'];

export default function StandardsPage() {
  const { isTeacher, selected_branch, subjectCodes, subjectOptions, classOptions } = useTeacherAccess();
  const [standards, setStandards] = useState<CurriculumStandard[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<StandardFilters>({});
  const [searchInput, setSearchInput] = useState('');

  // Import dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importBody, setImportBody] = useState('WAEC');
  const [importSubject, setImportSubject] = useState(subjectOptions[0]?.value || '');
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);

  // Map dialog state
  const [mapOpen, setMapOpen] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [alignment, setAlignment] = useState('Direct');
  const [mappedCodes, setMappedCodes] = useState<string[]>([]);
  const [existingMappings, setExistingMappings] = useState<CurriculumStandard[]>([]);
  const [mappingLoading, setMappingLoading] = useState(false);

  const fetchStandards = async (f?: StandardFilters) => {
    if (!selected_branch?.branch_id) return;
    setLoading(true);
    try {
      const res = await standardsService.list(f);
      const data = Array.isArray(res.data) ? res.data : [];
      setStandards(data);
    } catch {
      toast.error('Failed to load standards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, [selected_branch?.branch_id]);

  const handleSearch = () => {
    fetchStandards({ ...filters, q: searchInput });
  };

  const setFilter = (key: keyof StandardFilters, value: string) => {
    const next = { ...filters, [key]: value === 'ALL' ? undefined : value };
    setFilters(next);
    fetchStandards(next);
  };

  const bodyCount = (body: string) =>
    standards.filter((s) => s.standard_body === body).length;
  const bodies = Array.from(new Set(standards.map((s) => s.standard_body).filter(Boolean)));
  const mappedSet = useMemo(() => new Set(standards.map((s) => s.standard_code)), [standards]);

  const handleImport = async () => {
    let rows: any[];
    try {
      rows = JSON.parse(importJson);
      if (!Array.isArray(rows)) throw new Error('JSON must be an array');
    } catch {
      toast.error('Invalid JSON. Provide an array of standards.');
      return;
    }
    if (!importSubject) {
      toast.error('Select a subject');
      return;
    }
    setImporting(true);
    try {
      const res = await standardsService.import({
        standard_body: importBody,
        subject: importSubject,
        standards: rows,
      });
      toast.success(res.message || 'Standards imported');
      setImportOpen(false);
      setImportJson('');
      fetchStandards();
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const openMap = async () => {
    if (!selected_branch?.branch_id) return;
    setMapOpen(true);
    setExams([]);
    setQuestions([]);
    setSelectedExamId('');
    setSelectedQuestionId('');
    setMappedCodes([]);
    setExistingMappings([]);
    const all: any[] = [];
    let done = 0;
    const statuses = ['Draft', 'Completed', 'Released'];
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

  const onSelectExam = async (examId: string) => {
    setSelectedExamId(examId);
    setSelectedQuestionId('');
    setMappedCodes([]);
    setExistingMappings([]);
    _get(
      `exam-questions?query_type=select&exam_id=${examId}`,
      async (resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          setQuestions(resp.data);
          if (resp.data[0]) await onSelectQuestion(resp.data[0].id);
        } else {
          setQuestions([]);
        }
      },
      () => setQuestions([])
    );
  };

  const onSelectQuestion = async (questionId: string) => {
    setSelectedQuestionId(questionId);
    setMappedCodes([]);
    try {
      const res = await standardsService.getQuestionMappings(questionId);
      if (res.success && Array.isArray(res.data)) {
        setExistingMappings(res.data);
        setMappedCodes(res.data.map((m) => m.standard_code));
      }
    } catch {
      setExistingMappings([]);
    }
  };

  const toggleCode = (code: string) => {
    setMappedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleMap = async () => {
    if (!selectedQuestionId) return toast.error('Select a question');
    if (mappedCodes.length === 0) return toast.error('Select at least one standard');
    setMappingLoading(true);
    try {
      const res = await standardsService.mapQuestion(selectedQuestionId, {
        standard_codes: mappedCodes,
        alignment_strength: alignment,
      });
      toast.success(res.message || 'Standards mapped');
      setMapOpen(false);
    } catch {
      toast.error('Mapping failed');
    } finally {
      setMappingLoading(false);
    }
  };

  const importTemplate = `[
  { "standard_code": "WAEC-MAT-SSS3-099", "standard_text": "Sample standard statement." }
]`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Curriculum Standards</h2>
          <p className="text-sm text-muted-foreground">
            Official curriculum standards repository (WAEC, NECO, Cambridge, National)
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openMap}>
                <Link2 className="mr-2 h-4 w-4" /> Map to Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Map Question to Standards</DialogTitle>
                <DialogDescription>
                  Select an exam and question, then choose the curriculum standards it assesses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Exam</Label>
                  <Select value={selectedExamId} onValueChange={onSelectExam}>
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
                  <Label>Question</Label>
                  <Select value={selectedQuestionId} onValueChange={onSelectQuestion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a question" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions.map((q) => (
                        <SelectItem key={q.id || q.question_id} value={q.id}>
                          {String(q.question_text || 'Question').slice(0, 80)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Alignment Strength</Label>
                  <Select value={alignment} onValueChange={setAlignment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Supportive">Supportive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Standards</Label>
                    {existingMappings.length > 0 && (
                      <Badge variant="outline">{existingMappings.length} currently mapped</Badge>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto rounded border p-3">
                    {standards.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No standards available.</p>
                    ) : (
                      standards.map((s) => (
                        <label
                          key={s.id}
                          className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 hover:bg-accent/50"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={mappedCodes.includes(s.standard_code)}
                            onChange={() => toggleCode(s.standard_code)}
                          />
                          <span className="text-sm">
                            <span className="font-mono text-xs text-muted-foreground">
                              {s.standard_code}
                            </span>
                            &nbsp; &mdash; {s.standard_text}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setMapOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMap} disabled={mappingLoading}>
                  {mappingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Mapping
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Curriculum Standards</DialogTitle>
                <DialogDescription>
                  Bulk import standards as JSON. Duplicate codes are ignored.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Exam Body</Label>
                    <Select value={importBody} onValueChange={setImportBody}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BODIES.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Select value={importSubject} onValueChange={setImportSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Standards (JSON array)</Label>
                  <Textarea
                    rows={8}
                    placeholder={importTemplate}
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setImportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Body summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bodies.map((body) => (
          <Card key={body}>
            <CardBody className="p-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                {body}
              </span>
              <span className="text-2xl font-bold">{bodyCount(body)}</span>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> Standards
          </CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={filters.body || 'ALL'} onValueChange={(v) => setFilter('body', v)}>
              <SelectTrigger>
                <SelectValue placeholder="All bodies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All bodies</SelectItem>
                {BODIES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.subject || 'ALL'} onValueChange={(v) => setFilter('subject', v)}>
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All subjects</SelectItem>
                {subjectOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.grade || 'ALL'} onValueChange={(v) => setFilter('grade', v)}>
              <SelectTrigger>
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All grades</SelectItem>
                {classOptions.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-1 gap-2 lg:flex-row lg:items-center">
            <Input
              placeholder="Search by code, text, or strand..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="secondary" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : standards.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No standards found. Import curriculum standards to begin alignment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Body</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Strand</TableHead>
                  <TableHead>Standard Text</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standards.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.standard_code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.standard_body || '&mdash;'}</Badge>
                    </TableCell>
                    <TableCell>{s.subject_code || '&mdash;'}</TableCell>
                    <TableCell>{s.grade_level || '&mdash;'}</TableCell>
                    <TableCell>{s.strand || '&mdash;'}</TableCell>
                    <TableCell className="max-w-md truncate">{s.standard_text || '&mdash;'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}