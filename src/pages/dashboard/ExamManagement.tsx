import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  FileText,
  Settings,
  Download,
  Upload,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/features/auth/store/authStore';

interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'scheduled';
  participants: number;
  completedBy: number;
  averageScore?: number;
  createdAt: string;
}

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { user, selected_branch } = useAuthStore();

  useEffect(() => {
    fetchExams();
  }, [selected_branch]);

  useEffect(() => {
    filterExams();
  }, [exams, searchQuery, statusFilter, subjectFilter]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockExams: Exam[] = [
        {
          id: '1',
          title: 'Mathematics Mid-term Examination',
          subject: 'Mathematics',
          class: 'Grade 10A',
          duration: 120,
          totalQuestions: 50,
          totalMarks: 100,
          startDate: '2024-12-15T09:00:00',
          endDate: '2024-12-15T11:00:00',
          status: 'active',
          participants: 32,
          completedBy: 28,
          averageScore: 82.3,
          createdAt: '2024-12-01T10:00:00'
        },
        {
          id: '2',
          title: 'Physics Chapter 5 Quiz',
          subject: 'Physics',
          class: 'Grade 11B',
          duration: 60,
          totalQuestions: 25,
          totalMarks: 50,
          startDate: '2024-12-12T14:00:00',
          endDate: '2024-12-12T15:00:00',
          status: 'completed',
          participants: 28,
          completedBy: 28,
          averageScore: 75.8,
          createdAt: '2024-12-05T14:30:00'
        },
        {
          id: '3',
          title: 'Chemistry Lab Assessment',
          subject: 'Chemistry',
          class: 'Grade 12A',
          duration: 90,
          totalQuestions: 30,
          totalMarks: 75,
          startDate: '2024-12-18T10:00:00',
          endDate: '2024-12-18T11:30:00',
          status: 'scheduled',
          participants: 25,
          completedBy: 0,
          createdAt: '2024-12-08T16:00:00'
        },
        {
          id: '4',
          title: 'English Literature Essay',
          subject: 'English',
          class: 'Grade 11A',
          duration: 180,
          totalQuestions: 5,
          totalMarks: 100,
          startDate: '2024-12-20T09:00:00',
          endDate: '2024-12-20T12:00:00',
          status: 'draft',
          participants: 0,
          completedBy: 0,
          createdAt: '2024-12-10T11:00:00'
        }
      ];
      setExams(mockExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = exams;

    if (searchQuery) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.class.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(exam => exam.subject === subjectFilter);
    }

    setFilteredExams(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-3 w-3" />;
      case 'completed': return <FileText className="h-3 w-3" />;
      case 'scheduled': return <Calendar className="h-3 w-3" />;
      case 'draft': return <Edit className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ExamCard: React.FC<{ exam: Exam; index: number }> = ({ exam, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {exam.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {exam.subject} • {exam.class}
              </p>
            </div>
            <Badge className={`${getStatusColor(exam.status)} flex items-center gap-1`}>
              {getStatusIcon(exam.status)}
              {exam.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{exam.duration} mins</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{exam.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{exam.participants} students</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart3 className="h-4 w-4" />
              <span>{exam.totalMarks} marks</span>
            </div>
          </div>

          {exam.status === 'active' && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Progress</span>
                <span className="text-green-700 font-medium">
                  {exam.completedBy}/{exam.participants}
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(exam.completedBy / exam.participants) * 100}%` }}
                />
              </div>
            </div>
          )}

          {exam.averageScore && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#00356B]">Average Score</span>
                <span className="text-[#00356B] font-bold">{exam.averageScore}%</span>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>Start: {formatDate(exam.startDate)}</p>
            <p>End: {formatDate(exam.endDate)}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
              <p className="text-gray-600 mt-1">Create, manage, and monitor your examinations</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                Create Exam
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search exams by title, subject, or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Exams', value: exams.length, color: 'blue' },
            { title: 'Active', value: exams.filter(e => e.status === 'active').length, color: 'green' },
            { title: 'Scheduled', value: exams.filter(e => e.status === 'scheduled').length, color: 'yellow' },
            { title: 'Completed', value: exams.filter(e => e.status === 'completed').length, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Exams Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {filteredExams.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No exams found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter !== 'all' || subjectFilter !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Get started by creating your first exam'}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam, index) => (
                <ExamCard key={exam.id} exam={exam} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Exam Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-gray-600">Exam creation form will be implemented here...</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button>Create Exam</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamManagement;
