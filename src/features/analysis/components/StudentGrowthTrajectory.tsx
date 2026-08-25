/**
 * ================================================================
 * STUDENT GROWTH TRAJECTORY COMPONENT
 * ================================================================
 * Line chart displaying individual student's ability growth over time
 * with confidence intervals.
 *
 * Created: August 9, 2026
 * Part of: Enhanced Longitudinal Analytics (Step 5)
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

interface TrajectoryData {
  id: string;
  admission_no: string;
  theta: number;
  theta_se: number;
  theta_lower_ci: number;
  theta_upper_ci: number;
  assessment_date: string;
  exam_name: string;
  subject_code: string;
}

interface Summary {
  totalAssessments: number;
  startingTheta: number;
  currentTheta: number;
  totalGrowth: number;
  averageTheta: number;
  minTheta: number;
  maxTheta: number;
  firstAssessmentDate: string;
  lastAssessmentDate: string;
}

interface StudentInfo {
  admissionNo: string;
  firstName: string;
  lastName: string;
  className: string;
}

interface StudentGrowthTrajectoryProps {
  admissionNo: string;
  subjectCode?: string;
  startDate?: string;
  endDate?: string;
  height?: number;
}

export const StudentGrowthTrajectory: React.FC<StudentGrowthTrajectoryProps> = ({
  admissionNo,
  subjectCode,
  startDate,
  endDate,
  height = 400
}) => {
  const [trajectory, setTrajectory] = useState<TrajectoryData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrajectory();
  }, [admissionNo, subjectCode, startDate, endDate]);

  const fetchTrajectory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (subjectCode) params.append('subjectCode', subjectCode);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(
        `/api/longitudinal/student/${admissionNo}/trajectory?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch trajectory data');
      }

      const result = await response.json();
      
      if (result.success) {
        setTrajectory(result.data.trajectory);
        setSummary(result.data.summary);
        setStudentInfo(result.data.studentInfo);
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

  const getTrendIcon = () => {
    if (!summary) return null;
    
    const growth = summary.totalGrowth;
    
    if (growth > 0.3) {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else if (growth < -0.3) {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    } else {
      return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrendText = () => {
    if (!summary) return '';
    
    const growth = summary.totalGrowth;
    
    if (growth > 0.3) {
      return 'Strong Growth';
    } else if (growth > 0.1) {
      return 'Moderate Growth';
    } else if (growth < -0.3) {
      return 'Declining';
    } else if (growth < -0.1) {
      return 'Slight Decline';
    } else {
      return 'Stable';
    }
  };

  const getTrendColor = () => {
    if (!summary) return 'text-gray-600';
    
    const growth = summary.totalGrowth;
    
    if (growth > 0.1) {
      return 'text-green-600';
    } else if (growth < -0.1) {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  };

  const getAbilityLevel = (theta: number): string => {
    if (theta >= 2.0) return 'Exceptional';
    if (theta >= 1.0) return 'High';
    if (theta >= 0.0) return 'Average';
    if (theta >= -1.0) return 'Below Average';
    return 'At Risk';
  };

  const getAbilityColor = (theta: number): string => {
    if (theta >= 2.0) return 'text-purple-600 bg-purple-50';
    if (theta >= 1.0) return 'text-green-600 bg-green-50';
    if (theta >= 0.0) return 'text-blue-600 bg-blue-50';
    if (theta >= -1.0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Format data for chart
  const chartData = trajectory.map(point => ({
    date: formatDate(point.assessment_date),
    theta: parseFloat(point.theta.toFixed(2)),
    lower: parseFloat(point.theta_lower_ci.toFixed(2)),
    upper: parseFloat(point.theta_upper_ci.toFixed(2)),
    examName: point.exam_name,
    subject: point.subject_code
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trajectory data...</p>
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

  if (!trajectory.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No trajectory data available for this student</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      {studentInfo && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {studentInfo.firstName} {studentInfo.lastName}
          </h3>
          <p className="text-sm text-gray-600">
            {studentInfo.className} • {studentInfo.admissionNo}
            {subjectCode && <span> • {subjectCode}</span>}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Current Ability */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Current Ability</div>
            <div className="text-2xl font-bold text-blue-900">
              {summary.currentTheta.toFixed(2)}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded mt-2 inline-block ${getAbilityColor(summary.currentTheta)}`}>
              {getAbilityLevel(summary.currentTheta)}
            </div>
          </div>

          {/* Total Growth */}
          <div className={`bg-gradient-to-br rounded-lg p-4 ${
            summary.totalGrowth >= 0 
              ? 'from-green-50 to-green-100' 
              : 'from-red-50 to-red-100'
          }`}>
            <div className={`text-sm mb-1 ${
              summary.totalGrowth >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              Total Growth
            </div>
            <div className={`text-2xl font-bold ${
              summary.totalGrowth >= 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {summary.totalGrowth > 0 ? '+' : ''}{summary.totalGrowth.toFixed(2)}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{getTrendText()}</span>
            </div>
          </div>

          {/* Average Ability */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-sm text-purple-700 mb-1">Average</div>
            <div className="text-2xl font-bold text-purple-900">
              {summary.averageTheta.toFixed(2)}
            </div>
            <div className="text-xs text-purple-600 mt-2">
              Range: {summary.minTheta.toFixed(2)} to {summary.maxTheta.toFixed(2)}
            </div>
          </div>

          {/* Assessments */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-700 mb-1">Assessments</div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalAssessments}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {formatDate(summary.firstAssessmentDate)} - {formatDate(summary.lastAssessmentDate)}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Ability Trajectory Over Time</h4>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Ability (θ)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
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
            
            {/* Confidence Interval Area */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#93c5fd"
              fillOpacity={0.2}
              name="Upper CI"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#93c5fd"
              fillOpacity={0.2}
              name="Lower CI"
            />
            
            {/* Main Ability Line */}
            <Line
              type="monotone"
              dataKey="theta"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 5 }}
              activeDot={{ r: 7 }}
              name="Ability (θ)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Info */}
      <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded p-3">
        <strong>Note:</strong> The shaded blue area represents the 95% confidence interval. 
        A wider interval indicates higher uncertainty in the ability estimate.
      </div>
    </div>
  );
};

export default StudentGrowthTrajectory;
