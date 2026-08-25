import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gift, ArrowRight, CheckCircle2, History } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  caConversionService,
  CASetupOption,
  CAScorePreviewRow,
  CAConversionRecord,
} from '../services/caConversionService';

interface ConvertToCAExamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  examTitle: string;
  subjectName?: string;
  className?: string;
}

export default function ConvertToCAExamModal({
  open,
  onOpenChange,
  examId,
  examTitle,
  subjectName,
  className,
}: ConvertToCAExamModalProps) {
  const [setups, setSetups] = useState<CASetupOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSetupId, setSelectedSetupId] = useState<string | number>('');
  const [preview, setPreview] = useState<CAScorePreviewRow[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [alreadyConverted, setAlreadyConverted] = useState<CAConversionRecord[]>([]);
  const [history, setHistory] = useState<CAConversionRecord[]>([]);

  // Setups already converted for THIS exam (from history) → show as done/disabled.
  const convertedSetupIds = new Set(
    alreadyConverted.filter((r) => r.source_type === 'cbt' && r.source_id === examId).map((r) => String(r.ca_setup_id))
  );

  useEffect(() => {
    if (!open) return;
    setSetups([]);
    setSelectedSetupId('');
    setPreview(null);
    setAlreadyConverted([]);
    setHistory([]);
    setLoading(true);
    caConversionService
      .getSetups()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSetups(res.data);
        } else {
          toast.error(res.message || 'Failed to load CA setups');
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to load CA setups'))
      .finally(() => setLoading(false));

    caConversionService
      .getHistory(200)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setHistory(res.data);
          setAlreadyConverted(res.data.filter((r) => r.source_type === 'cbt' && r.source_id === examId));
        }
      })
      .catch(() => {});
  }, [open, examId]);

  const loadPreview = async (setupId: string | number) => {
    setSelectedSetupId(setupId);
    if (!setupId) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    setPreview(null);
    try {
      const res = await caConversionService.previewConversion(examId, setupId);
      if (res.success) {
        setPreview(Array.isArray(res.preview) ? res.preview : []);
      } else {
        toast.error(res.message || 'Could not preview conversion');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not preview conversion');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedSetupId) return;
    setConverting(true);
    try {
      const res = await caConversionService.convert(examId, selectedSetupId);
      if (res.success) {
        toast.success(res.message || 'Scores saved to weekly CA/Exam scores');
        onOpenChange(false);
      } else {
        toast.error(res.message || 'Conversion failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-white dark:bg-gray-900 border-none shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#002a56] dark:text-white font-bold">
            <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Convert Exam to CA / Exam Score
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            Push this completed exam&apos;s results into the school&apos;s term report
            (EndOfTermReport). Score is scaled to the selected assessment&apos;s maximum.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-3">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{examTitle}</p>
            {(subjectName || className) && (
              <p className="text-xs text-gray-400">
                {[subjectName, className].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {/* CA Setup selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500">Target Assessment Type</Label>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : setups.length === 0 ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No active CA setups found. Please activate a CA setup in Elite Core first.
              </p>
            ) : (
              <div className="grid max-h-56 gap-1.5 overflow-y-auto pr-1">
                {setups.map((s) => (
                  <button
                    key={String(s.id)}
                    onClick={() => loadPreview(s.id)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      selectedSetupId === s.id
                        ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-500/10'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {s.ca_type}
                      {s.week_number ? ` (Week ${s.week_number})` : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        max {s.max_score}
                      </Badge>
                      {s.section && (
                        <span className="text-[10px] text-gray-400">{s.section}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {previewLoading && (
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          )}
          {!previewLoading && preview && preview.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-gray-100 p-2 dark:border-gray-800">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Preview — {preview.length} student{preview.length === 1 ? '' : 's'}
              </p>
              {preview.slice(0, 12).map((row) => (
                <div
                  key={row.admissionNo}
                  className="flex items-center justify-between rounded-lg px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <span className="font-mono text-gray-500">{row.admissionNo}</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    {row.raw_score}/{row.total_marks} ({row.percentage}%) →{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">{row.score}</strong>
                    <span className="text-gray-400">/{row.maxScore}</span>
                  </span>
                </div>
              ))}
              {preview.length > 12 && (
                <p className="px-1 text-[10px] text-gray-400">+{preview.length - 12} more…</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={converting}
            className="rounded-xl text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={!selectedSetupId || converting || previewLoading}
            className="gap-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Converting…
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" /> Convert to {preview?.[0]?.caType || 'CA'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
