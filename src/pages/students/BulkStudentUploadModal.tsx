import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get, _post } from '@/Helper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2, Upload, Download, X, Plus, CheckCircle2, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkStudentUploadModal({ open, onClose, onSuccess }: Props) {
  const { user, selected_branch } = useAuthStore();
  const [rows, setRows] = useState<any[]>([
    { student_name: '', sex: '', section: '', class_code: '', class_name: '', admission_no: '' },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'manual' | 'excel'>('manual');
  const [defaultPassword, setDefaultPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);

  useEffect(() => {
    if (!open || !user?.school_id || !selected_branch?.branch_id) return;
    _get(
      `get-sections?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
      (res: any) => { if (res.success) setSections(res.data || []); },
      () => {}
    );
    _get(
      `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
      (res: any) => { if (res.success) setAllClasses(res.data || []); },
      () => {}
    );
  }, [open, user?.school_id, selected_branch?.branch_id]);

  const classesForSection = (sectionName: string) => {
    if (!sectionName) return [];
    const parents = allClasses.filter(
      (c) => (c.section || '').toLowerCase() === sectionName.toLowerCase() && !c.parent_id
    );
    const result: any[] = [];
    parents.forEach((p) => {
      result.push(p);
      allClasses
        .filter((c) => c.parent_id === p.class_code)
        .forEach((arm) => result.push({ ...arm, _isArm: true }));
    });
    return result;
  };

  const TEMPLATE_FIELDS = [
    'student_name', 'admission_no', 'sex', 'section', 'class_name',
    'date_of_birth', 'religion', 'blood_group',
  ];

  const downloadTemplate = () => {
    const sample = {
      student_name: 'John Doe', admission_no: '', sex: 'Male',
      section: sections[0]?.section_name || 'JSS',
      class_name: allClasses[0]?.class_name || 'JSS1',
      date_of_birth: '', religion: '', blood_group: '',
    };
    const ws = XLSX.utils.json_to_sheet([sample], { header: TEMPLATE_FIELDS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'Student_Upload_Template.xlsx');
    toast.success('Template downloaded!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(ws) as any[];
      if (!parsed.length) { toast.error('File is empty'); return; }
      const enriched = parsed.map((row) => {
        const match = allClasses.find(
          (c) => c.class_name?.toLowerCase() === String(row.class_name || '').toLowerCase()
        );
        return { ...row, class_code: match?.class_code || '', class_name: match?.class_name || row.class_name || '' };
      });
      setRows(enriched);
      toast.success(`${parsed.length} records loaded`);
    };
    reader.readAsArrayBuffer(f);
  };

  const addRow = () =>
    setRows((r) => [...r, { student_name: '', sex: '', section: '', class_code: '', class_name: '', admission_no: '' }]);

  const updateRow = (i: number, field: string, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const removeRow = (i: number) =>
    setRows((r) => r.filter((_, idx) => idx !== i));

  const updateSection = (i: number, section: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, section, class_code: '', class_name: '' } : row)));

  const updateClass = (i: number, class_code: string) => {
    const cls = allClasses.find((c) => c.class_code === class_code);
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, class_code, class_name: cls?.class_name || '' } : row))
    );
  };

  const validRows = rows.filter((r) => r.student_name?.trim());

  const handleSubmit = () => {
    if (!validRows.length) { toast.error('Add at least one student'); return; }
    setLoading(true);
    const payload = validRows.map((r) => ({
      ...r,
      school_id: user?.school_id,
      branch_id: selected_branch?.branch_id,
      status: 'Active',
      password: defaultPassword || '123456',
    }));
    _post(
      'students/bulk',
      payload,
      (res: any) => {
        setLoading(false);
        if (res.success) { toast.success(res.message || `${validRows.length} students added!`); onSuccess(); }
        else toast.error(res.message || 'Bulk upload failed');
      },
      () => { setLoading(false); toast.error('Network error'); }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-4xl bg-white dark:bg-gray-900 border-none shadow-xl p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Bulk Add Students</h3>
            <p className="text-xs text-gray-400 mt-0.5">Fill rows manually or upload an Excel file</p>
          </div>
          <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl">
            {(['manual', 'excel'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                  mode === m ? 'bg-[#002a56] text-white dark:bg-sky-600' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {m === 'manual' ? '✏️ Fill Rows' : '📄 Excel Upload'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mode === 'manual' ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      {['Student Name *', 'Adm No', 'Gender', 'Section *', 'Class *', ''].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                    {rows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="px-2 py-1.5">
                          <Input value={row.student_name || ''} onChange={(e) => updateRow(i, 'student_name', e.target.value)}
                            placeholder="Full name" className="h-8 text-xs rounded-lg border-gray-100 dark:border-gray-800 min-w-[150px]" />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input value={row.admission_no || ''} onChange={(e) => updateRow(i, 'admission_no', e.target.value)}
                            placeholder="Auto-gen" className="h-8 text-xs rounded-lg border-gray-100 dark:border-gray-800 w-24" />
                        </td>
                        <td className="px-2 py-1.5">
                          <select value={row.sex || ''} onChange={(e) => updateRow(i, 'sex', e.target.value)}
                            className="h-8 text-xs rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 w-24 cursor-pointer">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <select value={row.section || ''} onChange={(e) => updateSection(i, e.target.value)}
                            className="h-8 text-xs rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 min-w-[100px] cursor-pointer">
                            <option value="">Section</option>
                            {sections.map((s) => (
                              <option key={s.section_id || s.section_name} value={s.section_name}>{s.section_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <select value={row.class_code || ''} onChange={(e) => updateClass(i, e.target.value)}
                            disabled={!row.section}
                            className="h-8 text-xs rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 min-w-[130px] cursor-pointer disabled:opacity-40">
                            <option value="">Select class</option>
                            {classesForSection(row.section || '').map((c) => (
                              <option key={c.class_code} value={c.class_code}>
                                {c._isArm ? `  ↳ ${c.class_name}` : c.class_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <button type="button" onClick={() => removeRow(i)}
                            className="h-7 w-7 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addRow}
                className="w-full h-9 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-400 hover:border-[#002a56] hover:text-[#002a56] transition-colors flex items-center justify-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Another Row
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-400 font-semibold leading-relaxed">
                {'💡 Use '}
                <strong>class_name</strong>
                {' in the Excel file (e.g. "JSS1", "Primary 3"). The system will match it automatically.'}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="button" onClick={downloadTemplate} variant="ghost"
                  className="h-10 text-xs font-bold rounded-xl border border-gray-100 dark:border-gray-800 gap-1.5 text-gray-600 dark:text-gray-400">
                  <Download className="h-3.5 w-3.5 text-[#002a56]" /> Download Template
                </Button>
                <label className="relative flex-1 h-10 flex items-center px-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 cursor-pointer hover:border-[#002a56] transition-colors">
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload className="h-3.5 w-3.5 text-amber-500 mr-2 shrink-0" />
                  <span className="text-xs font-bold text-gray-400 truncate">
                    {file ? `✓ ${file.name}` : 'Click to upload .xlsx file'}
                  </span>
                </label>
              </div>
              {rows.length > 1 && mode === 'excel' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {rows.length} students loaded — {rows.filter((r) => r.class_code).length} with matched classes
                </div>
              )}
            </div>
          )}

          {/* Shared default password */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Default Password for all students
            </Label>
            <div className="relative max-w-xs">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                placeholder="Default: 123456"
                className="h-9 text-xs rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 pr-9"
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Students can change this after first login.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-400 font-semibold">
            {validRows.length} valid student{validRows.length !== 1 ? 's' : ''} queued
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-xs font-bold rounded-xl text-gray-400">
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading || !validRows.length}
              className="h-9 text-xs font-bold rounded-xl bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 gap-1.5 shadow-sm disabled:opacity-40">
              {loading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Uploading...</>
                : <><CheckCircle2 className="h-3.5 w-3.5" />Submit {validRows.length} Students</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
