/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Adaptive Testing Configuration Component
 * ═══════════════════════════════════════════════════════════════════════════
 * Admin interface for configuring Computer Adaptive Testing (CAT) parameters
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Settings,
  Target,
  BarChart3,
  Shield,
  Info,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface AdaptiveConfigProps {
  examId: string;
  examTitle?: string;
  onSave?: () => void;
}

export default function AdaptiveTestConfig({ examId, examTitle, onSave }: AdaptiveConfigProps) {
  const [config, setConfig] = useState({
    exam_id: examId,
    is_adaptive: false,
    starting_theta: 0.000,
    starting_se: 2.000,
    min_items: 20,
    max_items: 50,
    termination_rule: 'se_threshold',
    target_se: 0.30,
    selection_method: 'max_info',
    content_balancing: true,
    exposure_control: true,
    max_exposure: 0.25,
    estimation_method: 'MLE',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/cbt/adaptive/config', config);
      toast.success('Configuration saved!');
      setHasChanges(false);
      onSave?.();
    } catch (error: any) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: any) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Adaptive Testing</h2>
                <p className="text-sm opacity-90">{examTitle || examId}</p>
              </div>
            </div>
            <Switch
              checked={config.is_adaptive}
              onCheckedChange={(checked) => updateConfig({ is_adaptive: checked })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Configuration */}
      <Card>
        <CardBody className="p-6 space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="termination">Termination</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Starting Ability (θ)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.starting_theta}
                    onChange={(e) => updateConfig({ starting_theta: parseFloat(e.target.value) })}
                    disabled={!config.is_adaptive}
                  />
                </div>
                <div>
                  <Label>Starting SE</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.starting_se}
                    onChange={(e) => updateConfig({ starting_se: parseFloat(e.target.value) })}
                    disabled={!config.is_adaptive}
                  />
                </div>
                <div>
                  <Label>Min Items</Label>
                  <Input
                    type="number"
                    value={config.min_items}
                    onChange={(e) => updateConfig({ min_items: parseInt(e.target.value) })}
                    disabled={!config.is_adaptive}
                  />
                </div>
                <div>
                  <Label>Max Items</Label>
                  <Input
                    type="number"
                    value={config.max_items}
                    onChange={(e) => updateConfig({ max_items: parseInt(e.target.value) })}
                    disabled={!config.is_adaptive}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="termination" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label>Termination Rule</Label>
                  <Select
                    value={config.termination_rule}
                    onValueChange={(value) => updateConfig({ termination_rule: value })}
                    disabled={!config.is_adaptive}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="se_threshold">SE Threshold</SelectItem>
                      <SelectItem value="fixed_length">Fixed Length</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target SE</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.target_se}
                    onChange={(e) => updateConfig({ target_se: parseFloat(e.target.value) })}
                    disabled={!config.is_adaptive}
                  />
                  <p className="text-xs text-gray-500 mt-1">≤ 0.30 for high precision</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exposure Control</Label>
                    <p className="text-xs text-gray-500">Prevent item overuse</p>
                  </div>
                  <Switch
                    checked={config.exposure_control}
                    onCheckedChange={(checked) => updateConfig({ exposure_control: checked })}
                    disabled={!config.is_adaptive}
                  />
                </div>
                {config.exposure_control && (
                  <div>
                    <Label>Max Exposure Rate</Label>
                    <Input
                      type="number"
                      step="0.05"
                      value={config.max_exposure}
                      onChange={(e) => updateConfig({ max_exposure: parseFloat(e.target.value) })}
                      disabled={!config.is_adaptive}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Content Balancing</Label>
                    <p className="text-xs text-gray-500">Balance topic coverage</p>
                  </div>
                  <Switch
                    checked={config.content_balancing}
                    onCheckedChange={(checked) => updateConfig({ content_balancing: checked })}
                    disabled={!config.is_adaptive}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <div>
              {hasChanges && (
                <Badge variant="outline" className="text-amber-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
