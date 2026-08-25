/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Adaptive Testing Analytics Dashboard
 * ═══════════════════════════════════════════════════════════════════════════
 * Visualizations and analytics for adaptive testing performance
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Activity,
  Award,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdaptiveAnalyticsPage() {
  const { examId } = useParams();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [examId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/cbt/adaptive/analytics/${examId}`);
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for visualization
  const abilityTrajectory = [
    { item: 1, theta: 0.0, se: 2.0 },
    { item: 5, theta: 0.5, se: 1.2 },
    { item: 10, theta: 0.8, se: 0.6 },
    { item: 15, theta: 0.9, se: 0.35 },
    { item: 20, theta: 0.85, se: 0.28 },
  ];

  const abilityDistribution = [
    { range: '< -1.0', count: 12, label: 'Developing' },
    { range: '-1.0 to 0.0', count: 28, label: 'Approaching' },
    { range: '0.0 to 1.0', count: 45, label: 'Proficient' },
    { range: '> 1.0', count: 15, label: 'Advanced' },
  ];

  const itemExposure = [
    { id: 'Q1', exposure: 0.45, difficulty: -0.5 },
    { id: 'Q2', exposure: 0.32, difficulty: 0.0 },
    { id: 'Q3', exposure: 0.18, difficulty: 0.8 },
    { id: 'Q4', exposure: 0.52, difficulty: -1.2 },
    { id: 'Q5', exposure: 0.25, difficulty: 1.5 },
  ];

  const terminationStats = [
    { reason: 'SE Threshold Met', count: 65, percentage: 65 },
    { reason: 'Max Items Reached', count: 25, percentage: 25 },
    { reason: 'User Ended', count: 10, percentage: 10 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Adaptive Testing Analytics</h1>
                <p className="text-sm opacity-90">Performance insights and statistics</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Activity className="w-4 h-4 mr-1" />
              Live Data
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold">248</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Items</p>
                <p className="text-2xl font-bold">18.5</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Ability</p>
                <p className="text-2xl font-bold">0.72</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg SE</p>
                <p className="text-2xl font-bold">0.31</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Card>
        <CardBody className="p-6">
          <Tabs defaultValue="trajectory" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trajectory">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ability Trajectory
              </TabsTrigger>
              <TabsTrigger value="distribution">
                <BarChart3 className="w-4 h-4 mr-2" />
                Distribution
              </TabsTrigger>
              <TabsTrigger value="exposure">
                <Eye className="w-4 h-4 mr-2" />
                Item Exposure
              </TabsTrigger>
              <TabsTrigger value="termination">
                <Target className="w-4 h-4 mr-2" />
                Termination
              </TabsTrigger>
            </TabsList>

            {/* Ability Trajectory */}
            <TabsContent value="trajectory" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ability Convergence Over Items</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Shows how ability estimate (θ) and standard error (SE) change as more items are administered
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={abilityTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="item" label={{ value: 'Items Administered', position: 'insideBottom', offset: -5 }} />
                    <YAxis yAxisId="left" label={{ value: 'Ability (θ)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Standard Error', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="theta" stroke="#3b82f6" strokeWidth={3} name="Ability (θ)" />
                    <Line yAxisId="right" type="monotone" dataKey="se" stroke="#f59e0b" strokeWidth={3} name="Standard Error" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Ability Distribution */}
            <TabsContent value="distribution" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Student Ability Distribution</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Distribution of final ability estimates across all students
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={abilityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Students">
                      {abilityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {abilityDistribution.map((item, index) => (
                    <Card key={index} className="border-2" style={{ borderColor: COLORS[index % COLORS.length] }}>
                      <CardBody className="p-4 text-center">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {item.count}
                        </p>
                        <p className="text-xs text-gray-500">{item.range}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Item Exposure */}
            <TabsContent value="exposure" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Item Exposure Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Shows exposure rate vs difficulty for each item. Red line indicates max exposure threshold.
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" label={{ value: 'Item Difficulty (b)', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="exposure" label={{ value: 'Exposure Rate', angle: -90, position: 'insideLeft' }} domain={[0, 1]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Items" data={itemExposure} fill="#3b82f6">
                      {itemExposure.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.exposure > 0.4 ? '#ef4444' : '#3b82f6'} />
                      ))}
                    </Scatter>
                    <Line y={0.40} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card className="border-2 border-red-200">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Overexposed Items</p>
                          <p className="text-2xl font-bold text-red-600">
                            {itemExposure.filter(i => i.exposure > 0.4).length}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-red-600" />
                      </div>
                    </CardBody>
                  </Card>
                  <Card className="border-2 border-green-200">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Well-Distributed</p>
                          <p className="text-2xl font-bold text-green-600">
                            {itemExposure.filter(i => i.exposure <= 0.4).length}
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-green-600" />
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Termination Statistics */}
            <TabsContent value="termination" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Test Termination Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Breakdown of reasons why adaptive tests ended
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={terminationStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" label={{ value: 'Number of Sessions', position: 'insideBottom', offset: -5 }} />
                    <YAxis type="category" dataKey="reason" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Sessions">
                      {terminationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {terminationStats.map((stat, index) => (
                    <Card key={index} className="border-2" style={{ borderColor: COLORS[index % COLORS.length] }}>
                      <CardBody className="p-4">
                        <p className="text-sm font-medium mb-2">{stat.reason}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                            {stat.percentage}%
                          </span>
                          <span className="text-sm text-gray-500">({stat.count} sessions)</span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
