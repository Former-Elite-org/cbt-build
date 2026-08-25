import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  Download,
  Filter,
  Search,
  Eye,
  FileText,
  Calendar,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { useAuthStore } from '@/features/auth/store/authStore';

interface StudentResult {
  id: string;
  studentName: string;
  studentId: string;
  examTitle: string;
  subject: string;
  class: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  timeSpent: number;
  submittedAt: string;
  status: 'completed' | 'in-progress' | 'not-started';
}

interface ExamAnalytics {
  examId: string;
  examTitle: string;
  subject: string;
  class: string;
  totalStudents: number;
  completedBy: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageTime: number;
  date: string;
}

const StudentResults: React.FC = () => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [analytics, setAnalytics] = useState<ExamAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedView, setSelectedView] = useState<'results' | 'analytics'>('results');

  const { user, selected_branch } = useAuthStore();

  useEffect(() => {
    fetchResultsData();
  }, [selected_branch]);

  const fetchResultsData = async () => {
    try {
      setLoading(true);
      
      // Mock student results data
      const mockResults: StudentResult[] = [
        {
          id: '1',
          studentName: 'John Smith',
          studentId: 'ST001',
          examTitle: 'Mathematics Mid-term',
          subject: 'Mathematics',
          class: 'Grade 10A',
          score: 85,
          totalMarks: 100,
          percentage: 85,
          grade: 'A',
          timeSpent: 105,
          submittedAt: '2024-12-15T11:45:00',
          status: 'completed'
        },
        {
          id: '2',
          studentName: 'Sarah Johnson',
          studentId: 'ST002',
          examTitle: 'Mathematics Mid-term',
          subject: 'Mathematics',
          class: 'Grade 10A',
          score: 92,
          totalMarks: 100,
          percentage: 92,
          grade: 'A+',
          timeSpent: 98,
          submittedAt: '2024-12-15T11:38:00',
          status: 'completed'
        },
        {
          id: '3',
          studentName: 'Mike Davis',
          studentId: 'ST003',
          examTitle: 'Physics Quiz',
          subject: 'Physics',
          class: 'Grade 11B',
          score: 38,
          totalMarks: 50,
          percentage: 76,
          grade: 'B+',
          timeSpent: 55,
          submittedAt: '2024-12-12T15:00:00',
          status: 'completed'
        },
        {
          id: '4',
          studentName: 'Emily Wilson',
          studentId: 'ST004',
          examTitle: 'Chemistry Lab Test',
          subject: 'Chemistry',
          class: 'Grade 12A',
          score: 68,
          totalMarks: 75,
          percentage: 90.7,
          grade: 'A+',
          timeSpent: 82,
          submittedAt: '2024-12-18T11:22:00',
          status: 'completed'
        }
      ];

      // Mock analytics data
      const mockAnalytics: ExamAnalytics[] = [
        {
          examId: '1',
          examTitle: 'Mathematics Mid-term',
          subject: 'Mathematics',
          class: 'Grade 10A',
          totalStudents: 32,
          completedBy: 30,
          averageScore: 82.3,
          highestScore: 98,
          lowestScore: 45,
          passRate: 87.5,
          averageTime: 102,
          date: '2024-12-15'
        },
        {
          examId: '2',
          examTitle: 'Physics Quiz',
          subject: 'Physics',
          class: 'Grade 11B',
          totalStudents: 28,
          completedBy: 28,
          averageScore: 75.8,
          highestScore: 95,
          lowestScore: 32,
          passRate: 78.6,
          averageTime: 52,
          date: '2024-12-12'
        }
      ];

      setResults(mockResults);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching results data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800 border-green-200';
      case 'A': return 'bg-green-100 text-green-700 border-green-200';
      case 'B+': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'B': return 'bg-blue-100 text-[#00356B] border-blue-200';
      case 'C+': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || result.subject === subjectFilter;
    const matchesClass = classFilter === 'all' || result.class === classFilter;
    const matchesGrade = gradeFilter === 'all' || result.grade === gradeFilter;
    
    return matchesSearch && matchesSubject && matchesClass && matchesGrade;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Results & Analytics</h1>
              <p className="text-gray-600 mt-1">Monitor student performance and exam analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={selectedView === 'results' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView('results')}
                >
                  Results
                </Button>
                <Button
                  variant={selectedView === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView('analytics')}
                >
                  Analytics
                </Button>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Results',
              value: results.length,
              icon: <FileText className="h-8 w-8 text-blue-600" />,
              change: '+12%',
              changeType: 'positive'
            },
            {
              title: 'Average Score',
              value: `${Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)}%`,
              icon: <Target className="h-8 w-8 text-green-600" />,
              change: '+3.2%',
              changeType: 'positive'
            },
            {
              title: 'Pass Rate',
              value: `${Math.round((results.filter(r => r.percentage >= 60).length / results.length) * 100)}%`,
              icon: <Award className="h-8 w-8 text-purple-600" />,
              change: '+5.1%',
              changeType: 'positive'
            },
            {
              title: 'Completed Exams',
              value: analytics.reduce((acc, a) => acc + a.completedBy, 0),
              icon: <Users className="h-8 w-8 text-orange-600" />,
              change: '+8',
              changeType: 'positive'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className={`text-sm flex items-center gap-1 ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'positive' ? 
                          <TrendingUp className="h-3 w-3" /> : 
                          <TrendingDown className="h-3 w-3" />
                        }
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedView === 'results' ? (
          <>
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by student name, exam, or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                      <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                      <SelectItem value="Grade 12A">Grade 12A</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* Results Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Student Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{result.studentName}</p>
                              <p className="text-sm text-gray-500">{result.studentId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{result.examTitle}</p>
                              <p className="text-sm text-gray-500">{result.class}</p>
                            </div>
                          </TableCell>
                          <TableCell>{result.subject}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{result.score}/{result.totalMarks}</p>
                              <p className="text-sm text-gray-500">{result.percentage}%</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatTime(result.timeSpent)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(result.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          /* Analytics View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {analytics.map((exam, index) => (
              <Card key={exam.examId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{exam.examTitle}</CardTitle>
                      <p className="text-sm text-gray-600">{exam.subject} • {exam.class}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(exam.date).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold">{exam.completedBy}/{exam.totalStudents}</p>
                      <Progress value={(exam.completedBy / exam.totalStudents) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-blue-600">{exam.averageScore}%</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>High: {exam.highestScore}%</span>
                        <span>Low: {exam.lowestScore}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                      <p className="text-2xl font-bold text-green-600">{exam.passRate}%</p>
                      <Progress value={exam.passRate} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Average Time</p>
                      <p className="text-2xl font-bold text-purple-600">{formatTime(exam.averageTime)}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Per student</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;
