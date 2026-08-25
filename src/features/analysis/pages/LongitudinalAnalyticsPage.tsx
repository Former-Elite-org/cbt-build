/**
 * ================================================================
 * LONGITUDINAL ANALYTICS PAGE
 * ================================================================
 * Main page integrating all longitudinal analytics components:
 * - Student Growth Trajectory
 * - At-Risk Students List
 * - Class Performance Trends
 * - Growth Rate Comparison
 *
 * Created: August 9, 2026
 * Part of: Enhanced Longitudinal Analytics (Step 5)
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import StudentGrowthTrajectory from '../components/StudentGrowthTrajectory';
import AtRiskStudentsList from '../components/AtRiskStudentsList';
import ClassPerformanceTrends from '../components/ClassPerformanceTrends';
import GrowthRateComparison from '../components/GrowthRateComparison';

type ViewMode = 'overview' | 'student' | 'class' | 'at-risk' | 'growth-rates';

export const LongitudinalAnalyticsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data - replace with actual API calls
  const [classes] = useState(['SS1A', 'SS1B', 'SS2A', 'SS2B', 'SS3A']);
  const [subjects] = useState(['MTH', 'ENG', 'PHY', 'CHM', 'BIO']);

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger refresh in child components
    window.location.reload();
  };

  const getViewTitle = (): string => {
    switch (viewMode) {
      case 'student':
        return 'Student Growth Trajectory';
      case 'class':
        return 'Class Performance Trends';
      case 'at-risk':
        return 'At-Risk Students';
      case 'growth-rates':
        return 'Growth Rate Comparison';
      default:
        return 'Longitudinal Analytics Overview';
    }
  };

  const renderFilters = () => {
    if (viewMode === 'overview') return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Student Filter (for student view) */}
          {viewMode === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Admission No
              </label>
              <input
                type="text"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                placeholder="Enter admission number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Class Filter */}
          {(viewMode === 'class' || viewMode === 'at-risk' || viewMode === 'growth-rates') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class {viewMode === 'at-risk' && '(Optional)'}
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {viewMode === 'at-risk' ? 'All Classes' : 'Select Class'}
                </option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          {(viewMode === 'student' || viewMode === 'class') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject (Optional)
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range (for student and class views) */}
          {(viewMode === 'student' || viewMode === 'class') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'student':
        if (!selectedStudent) {
          return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Enter a student admission number to view their growth trajectory</p>
            </div>
          );
        }
        return (
          <StudentGrowthTrajectory
            admissionNo={selectedStudent}
            subjectCode={selectedSubject || undefined}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
          />
        );

      case 'class':
        if (!selectedClass) {
          return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Select a class to view performance trends</p>
            </div>
          );
        }
        return (
          <ClassPerformanceTrends
            className={selectedClass}
            subjectCode={selectedSubject || undefined}
          />
        );

      case 'at-risk':
        return (
          <AtRiskStudentsList
            className={selectedClass || undefined}
            threshold={0.0}
            autoRefresh={true}
          />
        );

      case 'growth-rates':
        if (!selectedClass) {
          return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Select a class to compare student growth rates</p>
            </div>
          );
        }
        return (
          <GrowthRateComparison
            className={selectedClass}
            showTopN={20}
          />
        );

      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Longitudinal Analytics</h2>
              <p className="text-blue-100 text-lg">
                Track student growth, identify at-risk students, and analyze performance trends over time
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <button
                onClick={() => setViewMode('student')}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">📈</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Student Trajectory</h3>
                <p className="text-sm text-gray-600">View individual growth over time</p>
              </button>

              <button
                onClick={() => setViewMode('class')}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">👥</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Class Trends</h3>
                <p className="text-sm text-gray-600">Analyze class-wide performance</p>
              </button>

              <button
                onClick={() => setViewMode('at-risk')}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-red-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">⚠️</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">At-Risk Students</h3>
                <p className="text-sm text-gray-600">Identify students needing support</p>
              </button>

              <button
                onClick={() => setViewMode('growth-rates')}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">📊</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Growth Rates</h3>
                <p className="text-sm text-gray-600">Compare student progress</p>
              </button>
            </div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Key Features
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Track individual student ability growth over time with confidence intervals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Identify at-risk students automatically with intervention recommendations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Analyze class-wide performance trends and distribution</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Compare growth rates across students with percentile rankings</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Data Insights
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 font-bold">→</span>
                    <span>Based on Item Response Theory (IRT) ability estimates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 font-bold">→</span>
                    <span>Longitudinal tracking across multiple assessments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 font-bold">→</span>
                    <span>Filter by subject, class, and date range</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 font-bold">→</span>
                    <span>Export data to CSV for further analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Advanced longitudinal analytics powered by IRT
              </p>
            </div>
            <div className="flex items-center gap-3">
              {viewMode !== 'overview' && (
                <button
                  onClick={() => {
                    setViewMode('overview');
                    setSelectedStudent('');
                    setSelectedClass('');
                    setSelectedSubject('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Back to Overview
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderFilters()}
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            Last refreshed: {lastRefresh.toLocaleTimeString()} • Using IRT-based ability estimates
          </p>
        </div>
      </div>
    </div>
  );
};

export default LongitudinalAnalyticsPage;
