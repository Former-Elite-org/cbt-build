/**
 * ================================================================
 * GROWTH RATE COMPARISON COMPONENT
 * ================================================================
 * Bar chart comparing student growth rates with class average
 * and percentile rankings.
 *
 * Created: August 9, 2026
 * Part of: Enhanced Longitudinal Analytics (Step 5)
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertCircle, Filter } from 'lucide-react';

interface StudentGrowthRate {
  admission_no: string;
  first_name: string;
  last_name: string;
  class_name: string;
  total_assessments: number;
  starting_theta: number;
  current_theta: number;
  total_growth: number;
  first_assessment_date: string;
  last_assessment_date: string;
  days_elapsed: number;
  growth_rate_per_day: number;
  growth_rate_per_month: number;
  average_theta: number;
  theta_stddev: number;
}

interface ClassAverage {
  avg_class_growth_rate_per_month: number;
  stddev_growth_rate: number;
  min_growth_rate: number;
  max_growth_rate: number;
  student_count: number;
}

interface GrowthRateComparisonProps {
  className: string;
  height?: number;
  showTopN?: number;
}

export const GrowthRateComparison: React.FC<GrowthRateComparisonProps> = ({
  className,
  height = 400,
  showTopN
}) => {
  const [students, setStudents] = useState<StudentGrowthRate[]>([]);
  const [classAverage, setClassAverage] = useState<ClassAverage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'growth' | 'current'>('growth');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');

  useEffect(() => {
    fetchGrowthRates();
  }, [className]);

  const fetchGrowthRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/longitudinal/class/${encodeURIComponent(className)}/growth-rates`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch growth rates');
      }

      const result = await response.json();
      
      if (result.success) {
        setStudents(result.data.students);
        setClassAverage(result.data.classAverage);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedData = () => {
    let filtered = [...students];

    // Apply filter
    switch (filterType) {
      case 'positive':
        filtered = filtered.filter(s => s.growth_rate_per_month > 0);
        break;
      case 'negative':
        filtered = filtered.filter(s => s.growth_rate_per_month < 0);
        break;
    }

    // Apply sorting
    if (sortBy === 'growth') {
      filtered.sort((a, b) => b.growth_rate_per_month - a.growth_rate_per_month);
    } else {
      filtered.sort((a, b) => b.current_theta - a.current_theta);
    }

    // Apply top N limit if specified
    if (showTopN && showTopN > 0) {
      filtered = filtered.slice(0, showTopN);
    }

    return filtered;
  };

  const getBarColor = (growthRate: number, classAvg: number): string => {
    if (growthRate > classAvg + 0.1) return '#10b981'; // Green - above average
    if (growthRate < classAvg - 0.1) return '#ef4444'; // Red - below average
    return '#3b82f6'; // Blue - average
  };

  const getPercentileRank = (student: StudentGrowthRate): number => {
    const sortedGrowth = students
      .map(s => s.growth_rate_per_month)
      .sort((a, b) => a - b);
    
    const index = sortedGrowth.findIndex(g => g >= student.growth_rate_per_month);
    return ((index + 1) / sortedGrowth.length) * 100;
  };

  const getGrowthIcon = (growthRate: number) => {
    if (growthRate > 0.1) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (growthRate < -0.1) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading growth rates...</p>
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

  if (!students.length || !classAverage) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No growth rate data available for this class</p>
      </div>
    );
  }

  const filteredData = getFilteredAndSortedData();
  
  // Format data for chart
  const chartData = filteredData.map(student => ({
    name: `${student.first_name} ${student.last_name.charAt(0)}.`,
    fullName: `${student.first_name} ${student.last_name}`,
    admissionNo: student.admission_no,
    growthRate: parseFloat(student.growth_rate_per_month.toFixed(3)),
    currentTheta: parseFloat(student.current_theta.toFixed(2)),
    totalGrowth: parseFloat(student.total_growth.toFixed(2))
  }));

  const topPerformers = filteredData.slice(0, 3);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-blue-600" />
          Student Growth Rate Comparison
        </h3>
        <p className="text-sm text-gray-600">{className}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Class Average Growth */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-xs font-medium text-blue-700 mb-2">Class Avg Growth</div>
          <div className="text-2xl font-bold text-blue-900">
            {classAverage.avg_class_growth_rate_per_month.toFixed(3)}
          </div>
          <div className="text-xs text-blue-600 mt-1">θ per month</div>
        </div>

        {/* Best Growth */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-xs font-medium text-green-700 mb-2">Best Growth</div>
          <div className="text-2xl font-bold text-green-900">
            {classAverage.max_growth_rate.toFixed(3)}
          </div>
          <div className="text-xs text-green-600 mt-1">θ per month</div>
        </div>

        {/* Lowest Growth */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="text-xs font-medium text-red-700 mb-2">Lowest Growth</div>
          <div className="text-2xl font-bold text-red-900">
            {classAverage.min_growth_rate.toFixed(3)}
          </div>
          <div className="text-xs text-red-600 mt-1">θ per month</div>
        </div>

        {/* Total Students */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-xs font-medium text-purple-700 mb-2">Students Tracked</div>
          <div className="text-2xl font-bold text-purple-900">
            {classAverage.student_count}
          </div>
          <div className="text-xs text-purple-600 mt-1">with ≥2 assessments</div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-yellow-600" />
          <h4 className="font-semibold text-gray-900">Top 3 Growth Leaders</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {topPerformers.map((student, index) => (
            <div key={student.admission_no} className="bg-white rounded-lg p-3 border border-yellow-200">
              <div className="text-xs text-gray-600 mb-1">#{index + 1}</div>
              <div className="font-semibold text-gray-900 text-sm">
                {student.first_name} {student.last_name}
              </div>
              <div className="text-lg font-bold text-green-600 mt-1">
                +{student.growth_rate_per_month.toFixed(3)}
              </div>
              <div className="text-xs text-gray-600">θ/month</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'growth' | 'current')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="growth">Growth Rate</option>
            <option value="current">Current Ability</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'positive' | 'negative')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Students</option>
            <option value="positive">Positive Growth Only</option>
            <option value="negative">Negative Growth Only</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={80}
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ 
                value: 'Growth Rate (θ per month)', 
                angle: -90, 
                position: 'insideLeft', 
                style: { fontSize: '12px' } 
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'growthRate') {
                  return [
                    <>
                      <div><strong>{props.payload.fullName}</strong></div>
                      <div>Growth Rate: {value.toFixed(3)} θ/month</div>
                      <div>Current Ability: {props.payload.currentTheta}</div>
                      <div>Total Growth: {props.payload.totalGrowth > 0 ? '+' : ''}{props.payload.totalGrowth}</div>
                    </>,
                    ''
                  ];
                }
                return [value, name];
              }}
            />
            <Legend />
            
            {/* Reference line for class average */}
            <ReferenceLine 
              y={classAverage.avg_class_growth_rate_per_month} 
              stroke="#9ca3af" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Class Average', 
                position: 'right', 
                fontSize: 10,
                fill: '#6b7280'
              }}
            />
            
            {/* Bars with dynamic colors */}
            <Bar dataKey="growthRate" name="Growth Rate" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.growthRate, classAverage.avg_class_growth_rate_per_month)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Above Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Below Average</span>
        </div>
      </div>
    </div>
  );
};

export default GrowthRateComparison;
