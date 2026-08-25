/**
 * ================================================================
 * AT-RISK STUDENTS LIST COMPONENT
 * ================================================================
 * Table displaying students who need intervention based on
 * their ability scores with recommendations.
 *
 * Created: August 9, 2026
 * Part of: Enhanced Longitudinal Analytics (Step 5)
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  TrendingDown, 
  Mail,
  Users,
  Filter,
  Download
} from 'lucide-react';

interface AtRiskStudent {
  admission_no: string;
  first_name: string;
  last_name: string;
  class_name: string;
  email: string;
  total_assessments: number;
  average_theta: number;
  lowest_theta: number;
  highest_theta: number;
  theta_stddev: number;
  last_assessment_date: string;
  days_since_last_assessment: number;
  risk_level: 'Critical' | 'High Risk' | 'Moderate Risk' | 'Low Risk';
  recommendation: string;
}

interface AtRiskStudentsListProps {
  className?: string;
  threshold?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const AtRiskStudentsList: React.FC<AtRiskStudentsListProps> = ({
  className,
  threshold = 0.0,
  autoRefresh = false,
  refreshInterval = 60000
}) => {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAtRiskStudents();

    if (autoRefresh) {
      const interval = setInterval(fetchAtRiskStudents, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [className, threshold]);

  useEffect(() => {
    filterStudents();
  }, [students, selectedRiskLevel, searchTerm]);

  const fetchAtRiskStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (className) params.append('className', className);
      if (threshold !== undefined) params.append('threshold', threshold.toString());

      const response = await fetch(`/api/longitudinal/at-risk-students?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch at-risk students');
      }

      const result = await response.json();
      
      if (result.success) {
        setStudents(result.data.students);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Filter by risk level
    if (selectedRiskLevel !== 'All') {
      filtered = filtered.filter(s => s.risk_level === selectedRiskLevel);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.first_name.toLowerCase().includes(term) ||
        s.last_name.toLowerCase().includes(term) ||
        s.admission_no.toLowerCase().includes(term) ||
        s.class_name.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(filtered);
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'High Risk':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'Moderate Risk':
        return <TrendingDown className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const styles = {
      'Critical': 'bg-red-100 text-red-800 border-red-200',
      'High Risk': 'bg-orange-100 text-orange-800 border-orange-200',
      'Moderate Risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low Risk': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[riskLevel as keyof typeof styles]}`}>
        {riskLevel}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const exportToCSV = () => {
    const headers = ['Admission No', 'Name', 'Class', 'Risk Level', 'Avg Ability', 'Assessments', 'Last Assessment', 'Recommendation'];
    const rows = filteredStudents.map(s => [
      s.admission_no,
      `${s.first_name} ${s.last_name}`,
      s.class_name,
      s.risk_level,
      s.average_theta.toFixed(2),
      s.total_assessments,
      formatDate(s.last_assessment_date),
      `"${s.recommendation}"`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `at-risk-students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRiskLevelCounts = () => {
    return {
      'Critical': students.filter(s => s.risk_level === 'Critical').length,
      'High Risk': students.filter(s => s.risk_level === 'High Risk').length,
      'Moderate Risk': students.filter(s => s.risk_level === 'Moderate Risk').length,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading at-risk students...</p>
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

  const counts = getRiskLevelCounts();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              At-Risk Students
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Students who need intervention or additional support
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <div className="text-2xl font-bold text-red-900">{counts['Critical']}</div>
            <div className="text-xs text-red-700">Critical</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <div className="text-2xl font-bold text-orange-900">{counts['High Risk']}</div>
            <div className="text-xs text-orange-700">High Risk</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
            <div className="text-2xl font-bold text-yellow-900">{counts['Moderate Risk']}</div>
            <div className="text-xs text-yellow-700">Moderate Risk</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, admission no, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High Risk">High Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>
              {students.length === 0 
                ? 'No at-risk students found. Great job!' 
                : 'No students match the current filters'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Avg Ability
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Assessments
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Recommendation
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.admission_no} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{student.admission_no}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {student.class_name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(student.risk_level)}
                      {getRiskBadge(student.risk_level)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-gray-900">
                      {student.average_theta.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Range: {student.lowest_theta.toFixed(1)} - {student.highest_theta.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {student.total_assessments}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div>{formatDate(student.last_assessment_date)}</div>
                    <div className="text-xs text-gray-500">
                      {student.days_since_last_assessment} days ago
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <div className="line-clamp-2">{student.recommendation}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {student.email && (
                      <a
                        href={`mailto:${student.email}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Send email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filteredStudents.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} at-risk students
          </p>
        </div>
      )}
    </div>
  );
};

export default AtRiskStudentsList;
