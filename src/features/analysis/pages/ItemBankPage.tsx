import { useEffect, useMemo, useState } from 'react';
import { useTeacherAccess } from '../hooks/useTeacherAccess';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  RefreshCw,
  Trash2,
  Library,
  ShieldCheck,
  Loader2,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { itemBankService } from '../services/itemBankService';
import { ItemBankEntry, ItemBankFilters } from '../types/itemBank.types';

const QUALITY_META: Record<
  string,
  { badgeVariant: 'success' | 'default' | 'warning' | 'destructive'; icon: any }
> = {
  Excellent: { badgeVariant: 'success', icon: ShieldCheck },
  Good: { badgeVariant: 'default', icon: ShieldCheck },
  Fair: { badgeVariant: 'warning', icon: ShieldCheck },
  Poor: { badgeVariant: 'destructive', icon: ShieldCheck },
};

export default function ItemBankPage() {
  const { isTeacher, selected_branch, subjectCodes } = useTeacherAccess();
  const [entries, setEntries] = useState<ItemBankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ItemBankFilters>({});
  const [searchInput, setSearchInput] = useState('');

  const fetchItems = async (f?: ItemBankFilters) => {
    if (!selected_branch?.branch_id) return;
    setLoading(true);
    try {
      const res = await itemBankService.list({ ...f, branch_id: selected_branch.branch_id });
      const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      // Teachers only see items for subjects they are assigned to teach
      const scoped = isTeacher
        ? data.filter((e) => subjectCodes?.has(e.subject_code || ''))
        : data;
      setEntries(scoped);
    } catch (err) {
      toast.error('Failed to load item bank');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selected_branch?.branch_id]);

  const handleSearch = () => {
    fetchItems({ ...filters, q: searchInput });
  };

  const setFilter = (key: keyof ItemBankFilters, value: string) => {
    const next = { ...filters, [key]: value || undefined };
    setFilters(next);
    fetchItems(next);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this item from the bank?')) return;
    try {
      const res = await itemBankService.remove(id);
      if (res.success) {
        toast.success('Item removed');
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } else toast.error(res.message || 'Failed to remove item');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const qualityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      const q = e.quality_rating || 'Unrated';
      counts[q] = (counts[q] || 0) + 1;
    });
    return counts;
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Item Bank</h2>
          <p className="text-sm text-muted-foreground">
            Reusable question library with quality metrics and usage history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchItems()}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(['Excellent', 'Good', 'Fair', 'Poor'] as const).map((q) => (
          <Card key={q}>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{q}</span>
                <span className="text-2xl font-bold">{qualityCounts[q] || 0}</span>
              </div>
            </CardBody>
          </Card>
        ))}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{entries.length}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Library className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by keyword, topic, or subject..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Select value={filters.quality || ''} onValueChange={(v) => setFilter('quality', v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              {['Excellent', 'Good', 'Fair', 'Poor'].map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.status || ''} onValueChange={(v) => setFilter('status', v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {['Active', 'Inactive', 'Draft'].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardBody>
      </Card>

      {/* Items table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No items in the bank yet. Run item analysis and sync to build your library.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Subject / Topic</TableHead>
                  <TableHead>Bloom</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Discrimination</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => {
                  const meta = QUALITY_META[e.quality_rating || ''] || QUALITY_META.Fair;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="max-w-md">
                        <div className="truncate">{e.question_text || 'Untitled'}</div>
                        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                          {e.tags?.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{e.subject_name || e.subject_code || '—'}</div>
                        <div className="text-xs text-muted-foreground">{e.topic_name || ''}</div>
                      </TableCell>
                      <TableCell>{e.bloom_level || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={meta.badgeVariant}>
                          <>
                            <meta.icon className="mr-1 h-3 w-3" />
                            {e.quality_rating || 'Unrated'}
                          </>
                        </Badge>
                      </TableCell>
                      <TableCell>{e.avg_difficulty_index?.toFixed(2) ?? '—'}</TableCell>
                      <TableCell>{e.avg_discrimination_index?.toFixed(2) ?? '—'}</TableCell>
                      <TableCell>{e.times_used ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.status || 'Active'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.success(`Item ${e.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(e.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}