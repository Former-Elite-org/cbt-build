/**
 * ================================================================
 * CLASS PERFORMANCE TRENDS COMPONENT
 * ================================================================
 * Area chart showing class-wide ability trends over time with
 * statistical summary.
 *
 * Created: August 9, 2026
 * Part of: Enhanced Longitudinal Analytics (Step 5)
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Users, BarChart3, AlertCircle, Calendar } from 'lucide-react';

interface TrendDataPoint {
  assessment_date: string;
  student_count: number;
  total_assessments: number;
  avg_theta: number;
  stddev_theta: number;
  min_theta: number;
  max_theta: number;
  ci_lower?: number;
  ci_upper?: number;
}

interface ClassSummary {
  class_name: string;
  total_students: number;
  total_assessments: number;
  avg_theta: number;
  stddev_theta: number;
  min_theta: number;
  max_theta: number;
  high_performers: number;
  average_performers: number;
  below_average_performers: number;
  at_risk_students: number;
  first_assessment_date: string;
  last_assessment_date: string;
}

interface ClassPerformanceTrendsProps {
  className: string;
  subjectCode?: string;
  height?: number;
}

export const ClassPerformanceTrends: React.FC<ClassPerformanceTrendsProps> = ({
  className,
  subjectCode,
  height = 400
}) => {
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassTrends();
  }, [className, subjectCode]);

  const fetchClassTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (subjectCode) params.append('subjectCode', subjectCode);

      const response = await fetch(
        `/api/longitudinal/class/${encodeURIComponent(className)}/trends?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch class trends');
      }

      const result = await response.json();
      
      if (result.success) {
        setTrends(result.data.trends);
        setSummary(result.data.summary);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format data for chart
  const chartData = trends.map(point => ({
    date: formatDate(point.assessment_date),
    avgTheta: parseFloat(point.avg_theta.toFixed(2)),
    ciLower: point.ci_lower ? parseFloat(point.ci_lower.toFixed(2)) : null,
    ciUpper: point.ci_upper ? parseFloat(point.ci_upper.toFixed(2)) : null,
    studentCount: point.student_count,
    assessments: point.total_assessments
  }));

  const getPerformancePercentage = (count: number, total: number): string => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Data</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trends.length || !summary) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No trend data available for this class</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Class Performance Trends
        </h3>
        <p className="text-sm text-gray-600">
          {className}
          {subjectCode && <span> • {subjectCode}</span>}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Users className="w-4 h-4" />
            <div className="text-xs font-medium">Total Students</div>
          </div>
          <div className="text-2xl font-bold text-blue-900">{summary.total_students}</div>
          <div className="text-xs text-blue-600 mt-1">
            {summary.total_assessments} assessments
          </div>
        </div>

        {/* Average Ability */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-xs font-medium text-purple-700 mb-2">Class Average</div>
          <div className="text-2xl font-bold text-purple-900">
            {summary.avg_theta.toFixed(2)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            σ = {summary.stddev_theta.toFixed(2)}
          </div>
        </div>

        {/* High Performers */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-xs font-medium text-green-700 mb-2">High Performers</div>
          <div className="text-2xl font-bold text-green-900">
            {summary.high_performers}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {getPerformancePercentage(summary.high_performers, summary.total_students)}% of class
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="text-xs font-medium text-red-700 mb-2">At Risk</div>
          <div className="text-2xl font-bold text-red-900">
            {summary.at_risk_students}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {getPerformancePercentage(summary.at_risk_students, summary.total_students)}% of class
          </div>
        </div>
      </div>

      {/* Performance Distribution Bar */}
      <div className="mb-6">
        <div className="text-xs font-medium text-gray-700 mb-2">Performance Distribution</div>
        <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200">
          {/* High Performers */}
          <div
            className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${getPerformancePercentage(summary.high_performers, summary.total_students)}%` }}
          >
            {summary.high_performers > 0 && `${getPerformancePercentage(summary.high_performers, summary.total_students)}%`}
          </div>
          {/* Average Performers */}
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${getPerformancePercentage(summary.average_performers, summary.total_students)}%` }}
          >
            {summary.average_performers > 0 && `${getPerformancePercentage(summary.average_performers, summary.total_students)}%`}
          </div>
          {/* Below Average */}
          <div
            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${getPerformancePercentage(summary.below_average_performers, summary.total_students)}%` }}
          >
            {summary.below_average_performers > 0 && `${getPerformancePercentage(summary.below_average_performers, summary.total_students)}%`}
          </div>
          {/* At Risk */}
          <div
            className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${getPerformancePercentage(summary.at_risk_students, summary.total_students)}%` }}
          >
            {summary.at_risk_students > 0 && `${getPerformancePercentage(summary.at_risk_students, summary.total_students)}%`}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>High ({summary.high_performers})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Average ({summary.average_performers})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Below Avg ({summary.below_average_performers})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>At Risk ({summary.at_risk_students})</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Average Ability Over Time</h4>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTheta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Average Ability (θ)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => value.toFixed(2)}
            />
            <Legend />
            
            {/* Reference line at θ = 0 */}
            <ReferenceLine 
              y={0} 
              stroke="#9ca3af" 
              strokeDasharray="3 3" 
              label={{ value: 'Average Performance', position: 'right', fontSize: 10 }}
            />
            
            {/* Main Area */}
            <Area
              type="monotone"
              dataKey="avgTheta"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorTheta)"
              name="Class Average θ"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Date Range Info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded p-3">
        <Calendar className="w-4 h-4" />
        <span>
          <strong>Period:</strong> {formatDate(summary.first_assessment_date)} to {formatDate(summary.last_assessment_date)}
        </span>
      </div>
    </div>
  );
};

export default ClassPerformanceTrends;
