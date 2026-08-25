import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get } from '@/Helper';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Plus,
  Loader2,
  Trash2,
  ClipboardList,
  Columns,
  Columns3,
  Target,
  PenLine,
  Save,
  ListChecks,
  ArrowLeft,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blueprintService } from '../services/blueprintService';
import { BLOOM_LEVELS, BloomLevel, BlueprintSpec, TestBlueprint } from '../types/blueprint.types';

interface SpecRow extends BlueprintSpec {
  key: number;
}

export default function TestBlueprintPage() {
  const [blueprints, setBlueprints] = useState<TestBlueprint[]>([]);
  const [loading, setLoading] = useState(false);

  // Editor state
  const [editing, setEditing] = useState<TestBlueprint | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const fetchBlueprints = () => {
    setLoading(true);
    blueprintService
      .list()
      .then((res) => {
        if (res.success) setBlueprints(res.data || []);
        else setBlueprints([]);
      })
      .catch(() => toast.error('Failed to load blueprints'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setBuilderOpen(true);
  };

  const openEdit = (bp: TestBlueprint) => {
    setEditing(bp);
    setBuilderOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this blueprint? This cannot be undone.')) return;
    blueprintService
      .remove(id)
      .then((res) => {
        if (res.success) {
          toast.success('Blueprint deleted');
          fetchBlueprints();
        } else toast.error(res.message || 'Delete failed');
      })
      .catch(() => toast.error('Failed to delete blueprint'));
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#00356B] dark:text-white tracking-tight">
            Test Blueprint
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-1.5">
            <Columns className="h-4 w-4" />
            Design balanced assessments across topics and cognitive levels
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-[#00356B] hover:bg-[#00254B] text-white font-semibold h-10 px-4 rounded-xl shadow-sm text-sm"
        >
          <Plus className="h-4 w-4" />
          New Blueprint
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : blueprints.length ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((bp) => (
            <Card
              key={bp.id}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <CardHeader className="p-4 pb-2 border-b dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/10">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold text-[#00356B] dark:text-white truncate">
                    {bp.title || bp.subject_code || 'Untitled Blueprint'}
                  </CardTitle>
                  <Badge variant={bp.status === 'Completed' ? 'success' : bp.status === 'Active' ? 'default' : 'outline'}>
                    {bp.status}
                  </Badge>
                </div>
                {bp.subject_code && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {bp.subject_code}
                  </span>
                )}
              </CardHeader>
              <CardBody className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Target className="h-4 w-4" /> {bp.specifications?.length || 0} specifications
                  </span>
                  <span className="font-semibold text-[#00356B] dark:text-white">
                    {bp.total_marks} marks
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-[#00356B] dark:text-gray-300 text-xs h-9 rounded-lg"
                    onClick={() => openEdit(bp)}
                  >
                    <PenLine className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 dark:border-gray-700 text-rose-600 dark:text-rose-400 hover:border-rose-300 text-xs h-9 rounded-lg"
                    onClick={() => handleDelete(bp.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
          <CardBody className="text-center py-12 p-6">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
              No blueprints yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a blueprint to plan topic and cognitive-level coverage before building your exam.
            </p>
            <Button onClick={openCreate} className="mt-5 gap-2 bg-[#00356B] text-white font-semibold rounded-xl">
              <Plus className="h-4 w-4" /> Create blueprint
            </Button>
          </CardBody>
        </Card>
      )}

      {builderOpen && (
        <BlueprintBuilder
          existing={editing}
          onClose={() => setBuilderOpen(false)}
          onSaved={() => {
            setBuilderOpen(false);
            fetchBlueprints();
          }}
        />
      )}
    </div>
  );
}

// ── Builder (create/edit) ────────────────────────────────────────────────────

function BlueprintBuilder({
  existing,
  onClose,
  onSaved,
}: {
  existing: TestBlueprint | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user, selected_branch, classes: assignedClasses, subjects: assignedSubjects } = useAuthStore();
  const isTeacher = ['teacher', 'exam_officer'].includes((user?.user_type || '').toLowerCase());
  const [subjectCode, setSubjectCode] = useState(existing?.subject_code || '');
  const [title, setTitle] = useState(existing?.title || '');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<SpecRow[]>(() => {
    const base = existing?.specifications?.length
      ? existing.specifications.map((s, i) => ({ ...s, key: i }))
      : [{ key: 0, topic_name: '', bloom_level: 'Remember' as BloomLevel, target_questions: 1, target_marks: 1 }];
    return base;
  });
  const [saving, setSaving] = useState(false);

  // Fetch subjects and classes on mount
  useEffect(() => {
    // Teachers only see their assigned classes and subjects (same as exam creation)
    if (isTeacher) {
      setSubjects(assignedSubjects);
      setClasses(assignedClasses);
      setLoadingSubjects(false);
      return;
    }

    if (!selected_branch?.branch_id) return;
    
    setLoadingSubjects(true);
    
    // Fetch subjects
    _get(
      `subjects?query_type=select-all&branch_id=${selected_branch.branch_id}`,
      (resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          console.log('📚 Subjects fetched:', resp.data);
          setSubjects(resp.data);
        } else {
          setSubjects([]);
        }
      },
      (err) => {
        console.error('Error fetching subjects:', err);
        setSubjects([]);
      }
    );
    
    // Fetch classes
    _get(
      `classes?query_type=select&branch_id=${selected_branch.branch_id}`,
      (resp) => {
        setLoadingSubjects(false);
        if (resp.success && Array.isArray(resp.data)) {
          console.log('🏫 Classes fetched:', resp.data);
          setClasses(resp.data);
        } else {
          setClasses([]);
        }
      },
      (err) => {
        setLoadingSubjects(false);
        console.error('Error fetching classes:', err);
        setClasses([]);
      }
    );
  }, [isTeacher, assignedSubjects, assignedClasses, selected_branch?.branch_id]);
  
  // Create combined options: Subject - Class
  const subjectClassOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];

    // Teachers: use their assigned subject-class pairs directly
    if (isTeacher) {
      subjects.forEach((tc) => {
        const subjectCode = tc.subject_code || tc.code || '';
        const subjectName = tc.subject || 'Unknown Subject';
        const classCode = tc.class_code || tc.class_name;
        const className = tc.class_name || classCode;
        options.push({ value: `${subjectCode}_${classCode}`, label: `${subjectName} - ${className}` });
      });
      return options;
    }

    subjects.forEach((subject) => {
      classes.forEach((classItem) => {
        const subjectCode = subject.subject_code || subject.code || '';
        const subjectName = subject.subject || 'Unknown Subject';
        const classCode = classItem.class_code || classItem.code || '';
        const className = classItem.class_name || classItem.name || '';
        
        const value = `${subjectCode}_${classCode}`;
        const label = `${subjectName} - ${className}`;
        
        options.push({ value, label });
      });
    });
    return options;
  }, [isTeacher, subjects, classes]);

  // Pre-select the class filter when editing an existing blueprint
  useEffect(() => {
    if (!existing?.subject_code || !classes.length) return;
    const cls = classes.find((c) =>
      existing.subject_code?.endsWith(`_${c.class_code || c.code || ''}`)
    );
    if (cls) setClassCode(cls.class_code || cls.code || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.subject_code, classes]);

  const classOptions = useMemo(() => {
    // Teachers: only classes they are assigned to teach
    if (isTeacher) {
      const seen = new Set<string>();
      const opts: { value: string; label: string }[] = [];
      subjects.forEach((tc) => {
        const code = tc.class_code || tc.class_name;
        const label = tc.class_name || code;
        if (code && !seen.has(code)) {
          seen.add(code);
          opts.push({ value: code, label });
        }
      });
      return opts;
    }
    return classes.map((c) => ({
      value: c.class_code || c.code || '',
      label: c.class_name || c.name || '',
    }));
  }, [isTeacher, subjects, classes]);

  // Narrow the subject list to the selected class to keep it short
  const filteredSubjectOptions = useMemo(
    () =>
      classCode
        ? subjectClassOptions.filter((o) => o.value.endsWith(`_${classCode}`))
        : subjectClassOptions,
    [subjectClassOptions, classCode]
  );

  const totals = useMemo(
    () => ({
      marks: rows.reduce((s, r) => s + (Number(r.target_marks) || 0), 0),
      questions: rows.reduce((s, r) => s + (Number(r.target_questions) || 0), 0),
    }),
    [rows]
  );

  const updateRow = (key: number, patch: Partial<SpecRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { key: Date.now(), topic_name: '', bloom_level: 'Remember' as BloomLevel, target_questions: 1, target_marks: 1 },
    ]);

  const removeRow = (key: number) => setRows((prev) => prev.filter((r) => r.key !== key));

  const validRows = rows.filter((r) => r.topic_name?.trim());

  const handleSave = () => {
    if (!validRows.length) {
      toast.error('Add at least one row with a topic name');
      return;
    }
    setSaving(true);
    const payload = {
      title: title || undefined,
      subject_code: subjectCode || undefined,
      specifications: validRows.map((r) => ({
        topic_name: r.topic_name,
        bloom_level: r.bloom_level,
        target_questions: Number(r.target_questions) || 0,
        target_marks: Number(r.target_marks) || 0,
        percentage_weight:
          totals.marks > 0 ? Number((((Number(r.target_marks) || 0) / totals.marks) * 100).toFixed(2)) : 0,
      })),
    };
    const req = existing
      ? blueprintService.update(existing.id, payload)
      : blueprintService.create(payload);
    req
      .then((res) => {
        if (res.success) {
          toast.success(existing ? 'Blueprint updated' : 'Blueprint created');
          onSaved();
        } else toast.error(res.message || 'Save failed');
      })
      .catch(() => toast.error('Failed to save blueprint'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 dark:text-gray-400">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-bold text-[#00356B] dark:text-white">
                {existing ? 'Edit Blueprint' : 'New Blueprint'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Specification matrix</p>
            </div>
          </div>
        </div>

        <CardBody className="p-5 space-y-5">
          {/* Basics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Title</Label>
              <Input
                placeholder="e.g. Mathematics Term Exam Blueprint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Class</Label>
              <Select
                value={classCode}
                onValueChange={(v) => {
                  setClassCode(v);
                  setSubjectCode((cur) => (cur && !cur.endsWith(`_${v}`) ? '' : cur));
                }}
              >
                <SelectTrigger className="rounded-lg text-sm h-9">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Subject</Label>
              {loadingSubjects ? (
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Loading subjects...</span>
                </div>
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between rounded-lg border-gray-200 dark:border-gray-700 text-left font-normal"
                    >
                      <span className="truncate">
                        {subjectCode
                          ? subjectClassOptions.find((option) => option.value === subjectCode)?.label
                          : "Select subject and class"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={classCode ? `Search subject in ${classOptions.find((c) => c.value === classCode)?.label}...` : 'Search subject...'}
                        className="h-9"
                      />
                      <CommandEmpty>
                        {classCode ? 'No subjects for this class.' : 'No subject found.'}
                      </CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredSubjectOptions.length === 0 ? (
                          <CommandItem disabled>
                            No subjects or classes available
                          </CommandItem>
                        ) : (
                          filteredSubjectOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={() => {
                                setSubjectCode(option.value);
                                setOpen(false);
                              }}
                            >
                              {option.label}
                              <Check
                                className={`ml-auto h-4 w-4 ${
                                  subjectCode === option.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="gap-1.5">
              <Target className="h-3.5 w-3.5" /> {totals.questions} questions
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> {totals.marks} marks
            </Badge>
          </div>

          {/* Matrix rows */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Columns3 className="h-4 w-4" /> Specifications
            </div>
            {rows.map((row, i) => (
              <div key={row.key} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-5">
                  <Label className="text-[10px] text-gray-400 mb-1 block">Topic</Label>
                  <Input
                    placeholder={`Topic ${i + 1}`}
                    value={row.topic_name}
                    onChange={(e) => updateRow(row.key, { topic_name: e.target.value })}
                    className="rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <Label className="text-[10px] text-gray-400 mb-1 block">Bloom's Level</Label>
                  <Select
                    value={row.bloom_level}
                    onValueChange={(v) => updateRow(row.key, { bloom_level: v as BloomLevel })}
                  >
                    <SelectTrigger className="rounded-lg text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOM_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <Label className="text-[10px] text-gray-400 mb-1 block">Marks</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.target_marks}
                    onChange={(e) => updateRow(row.key, { target_marks: Number(e.target.value) })}
                    className="rounded-lg text-sm h-9"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-[10px] text-gray-400 mb-1 block">Qts</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.target_questions}
                    onChange={(e) => updateRow(row.key, { target_questions: Number(e.target.value) })}
                    className="rounded-lg text-sm h-9"
                  />
                </div>
                <div className="col-span-1 flex items-end justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600"
                    onClick={() => removeRow(row.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRow} className="gap-2 border-dashed text-[#00356B] dark:text-white w-full rounded-lg">
              <Plus className="h-4 w-4" /> Add Topic Row
            </Button>
          </div>
        </CardBody>

        <div className="flex items-center justify-end gap-2 p-5 border-t dark:border-gray-800">
          <Button variant="ghost" onClick={onClose} className="text-gray-500 dark:text-gray-400">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#00356B] hover:bg-[#00254B] text-white font-semibold rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {existing ? 'Update' : 'Create'} Blueprint
          </Button>
        </div>
      </div>
    </div>
  );
}