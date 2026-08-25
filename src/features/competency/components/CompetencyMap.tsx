/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CompetencyMap Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Visualizes competency hierarchy with prerequisites and relationships
 */

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Network,
  Loader2 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Competency {
  id: string;
  competency_code: string;
  competency_name: string;
  subject_code: string;
  description?: string;
  prerequisites: string[];
  children: string[];
  proficiency_levels: {
    levels: Array<{
      level: number;
      name: string;
      description: string;
      min_score: number;
      max_score: number;
    }>;
  };
}

interface CompetencyMapProps {
  subjectCode?: string;
  onCompetencySelect?: (competency: Competency) => void;
}

export const CompetencyMap: React.FC<CompetencyMapProps> = ({
  subjectCode: initialSubject,
  onCompetencySelect
}) => {
  const [competencies, setCompetencies] = useState<Map<string, Competency>>(new Map());
  const [roots, setRoots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);

  // Fetch competency hierarchy
  useEffect(() => {
    fetchCompetencies();
  }, [selectedSubject]);

  const fetchCompetencies = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = selectedSubject ? `?subject_code=${selectedSubject}` : '';
      const response = await api.get(`/cbt/competencies/hierarchy/tree${params}`);

      if (response.data.success) {
        const { competencies: compList, roots: rootList } = response.data.data;
        
        // Convert array to Map
        const compMap = new Map<string, Competency>();
        compList.forEach((comp: Competency) => {
          compMap.set(comp.id, comp);
        });

        setCompetencies(compMap);
        setRoots(rootList);

        // Extract unique subjects
        const uniqueSubjects = Array.from(
          new Set(compList.map((c: Competency) => c.subject_code))
        );
        setSubjects(uniqueSubjects);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load competencies');
    } finally {
      setLoading(false);
    }
  };

  // Render competency node
  const renderCompetencyNode = (compId: string, level: number = 0) => {
    const comp = competencies.get(compId);
    if (!comp) return null;

    const isSelected = selectedCompetency === compId;
    const hasChildren = comp.children.length > 0;
    const hasPrerequisites = comp.prerequisites.length > 0;

    return (
      <div key={compId} className="mb-4">
        <Card
          className={`
            transition-all duration-200 cursor-pointer
            ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
            ${level > 0 ? 'ml-8' : ''}
          `}
          onClick={() => {
            setSelectedCompetency(compId);
            onCompetencySelect?.(comp);
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {hasPrerequisites && (
                    <Badge variant="outline" className="text-xs">
                      Prerequisites: {comp.prerequisites.length}
                    </Badge>
                  )}
                  <span>{comp.competency_name}</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  <Badge variant="secondary" className="mr-2">
                    {comp.competency_code}
                  </Badge>
                  {comp.subject_code}
                </CardDescription>
              </div>
              {hasChildren && (
                <Badge variant="default" className="ml-2">
                  {comp.children.length} dependent{comp.children.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardHeader>

          {comp.description && (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{comp.description}</p>
              
              {/* Proficiency levels */}
              {comp.proficiency_levels?.levels && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {comp.proficiency_levels.levels.map((level) => (
                    <Badge
                      key={level.level}
                      variant="outline"
                      className="text-xs"
                    >
                      L{level.level}: {level.name} ({level.min_score}-{level.max_score})
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Render children */}
        {hasChildren && (
          <div className="mt-2 pl-4 border-l-2 border-muted">
            {comp.children.map((childId) => renderCompetencyNode(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render prerequisite connections
  const renderPrerequisiteInfo = () => {
    if (!selectedCompetency) return null;

    const comp = competencies.get(selectedCompetency);
    if (!comp) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-4 w-4" />
            Competency Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prerequisites */}
          {comp.prerequisites.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Prerequisites:</h4>
              <div className="space-y-2">
                {comp.prerequisites.map((prereqId) => {
                  const prereq = competencies.get(prereqId);
                  return prereq ? (
                    <div
                      key={prereqId}
                      className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-mono text-xs">{prereq.competency_code}</span>
                      <span className="flex-1">{prereq.competency_name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Dependents */}
          {comp.children.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Leads to ({comp.children.length}):
              </h4>
              <div className="space-y-2">
                {comp.children.map((childId) => {
                  const child = competencies.get(childId);
                  return child ? (
                    <div
                      key={childId}
                      className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md"
                    >
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                      <span className="font-mono text-xs">{child.competency_code}</span>
                      <span className="flex-1">{child.competency_name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading competency map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Competency Map
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Explore competency hierarchy and prerequisites
          </p>
        </div>

        {/* Subject Filter */}
        {subjects.length > 0 && (
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{competencies.size}</div>
            <p className="text-xs text-muted-foreground">Total Competencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{roots.length}</div>
            <p className="text-xs text-muted-foreground">Root Competencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Competency Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {roots.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No competencies found for the selected subject.
              </AlertDescription>
            </Alert>
          ) : (
            roots.map((rootId) => renderCompetencyNode(rootId))
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {selectedCompetency ? (
            renderPrerequisiteInfo()
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  Select a competency to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetencyMap;
