/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Competency Page
 * ═══════════════════════════════════════════════════════════════════════════
 * Surfaces the competency-based assessment framework:
 *  - Competency Map — hierarchy of competencies + prerequisites (subject filter)
 *  - Student Progress — per-student proficiency across competencies
 *
 * Part of: Phase 3 — Competency-Based Assessment Framework
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import {
  Network,
  Target,
  Search,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import CompetencyMap from '../components/CompetencyMap';
import StudentProgress from '../components/StudentProgress';

type TabMode = 'map' | 'progress';

export default function CompetencyPage() {
  const [tab, setTab] = useState<TabMode>('map');
  const [admissionNo, setAdmissionNo] = useState('');
  const [searchedAdmission, setSearchedAdmission] = useState('');

  const handleSearch = () => {
    setSearchedAdmission(admissionNo.trim());
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Network className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competency-Based Assessment</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track competencies, prerequisites, and student proficiency across subjects
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabMode)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Competency Map
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Student Progress
          </TabsTrigger>
        </TabsList>

        {/* Competency map */}
        <TabsContent value="map" className="mt-6">
          <CompetencyMap />
        </TabsContent>

        {/* Student progress */}
        <TabsContent value="progress" className="mt-6 space-y-4">
          <Card>
            <CardBody className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="competency-admission" className="text-xs font-semibold">
                  Student Admission No
                </Label>
                <Input
                  id="competency-admission"
                  placeholder="e.g. ELT/26/0001"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  className="w-64"
                />
              </div>
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Load Progress
              </Button>
            </CardBody>
          </Card>

          {searchedAdmission ? (
            <StudentProgress admissionNo={searchedAdmission} />
          ) : (
            <Card>
              <CardBody className="py-12 text-center">
                <Target className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 font-medium">Enter a student admission number to view their competency progress</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Shows proficiency levels, accuracy, and level distribution per competency.
                </p>
              </CardBody>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
