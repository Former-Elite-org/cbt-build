import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get } from '../../Helper';

interface DashboardStats {
  totalExams: number;
  activeExams: number;
  totalStudents: number;
  completedExams: number;
  averageScore: number;
  pendingGrading: number;
}

interface RecentExam {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  status: 'active' | 'completed' | 'draft';
  participants: number;
  averageScore?: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

const ModernTeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    completedExams: 0,
    averageScore: 0,
    pendingGrading: 0
  });
  
  const [recentExams, setRecentExams] = useState<RecentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, selected_branch } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, [selected_branch]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setStats({
        totalExams: 24,
        activeExams: 3,
        totalStudents: 156,
        completedExams: 18,
        averageScore: 78.5,
        pendingGrading: 5
      });

      setRecentExams([
        {
          id: '1',
          title: 'Mathematics Mid-term Exam',
          subject: 'Mathematics',
          class: 'Grade 10A',
          date: '2024-12-15',
          status: 'active',
          participants: 32,
          averageScore: 82.3
        },
        {
          id: '2',
          title: 'Physics Chapter 5 Quiz',
          subject: 'Physics',
          class: 'Grade 11B',
          date: '2024-12-12',
          status: 'completed',
          participants: 28,
          averageScore: 75.8
        },
        {
          id: '3',
          title: 'Chemistry Lab Assessment',
          subject: 'Chemistry',
          class: 'Grade 12A',
          date: '2024-12-18',
          status: 'draft',
          participants: 0
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Create New Exam',
      description: 'Set up a new examination',
      icon: <Plus className="h-6 w-6" />,
      action: () => console.log('Create exam'),
      color: 'bg-blue-500'
    },
    {
      title: 'View All Exams',
      description: 'Manage your examinations',
      icon: <FileText className="h-6 w-6" />,
      action: () => console.log('View exams'),
      color: 'bg-green-500'
    },
    {
      title: 'Student Results',
      description: 'Review exam results',
      icon: <BarChart3 className="h-6 w-6" />,
      action: () => console.log('View results'),
      color: 'bg-purple-500'
    },
    {
      title: 'Grade Papers',
      description: 'Grade pending submissions',
      icon: <CheckCircle className="h-6 w-6" />,
      action: () => console.log('Grade papers'),
      color: 'bg-orange-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your classes today
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Exams',
              value: stats.totalExams,
              icon: <FileText className="h-8 w-8 text-blue-600" />,
              change: '+12%',
              changeType: 'positive'
            },
            {
              title: 'Active Exams',
              value: stats.activeExams,
              icon: <Clock className="h-8 w-8 text-green-600" />,
              change: '+3',
              changeType: 'positive'
            },
            {
              title: 'Total Students',
              value: stats.totalStudents,
              icon: <Users className="h-8 w-8 text-purple-600" />,
              change: '+8%',
              changeType: 'positive'
            },
            {
              title: 'Average Score',
              value: `${stats.averageScore}%`,
              icon: <Target className="h-8 w-8 text-orange-600" />,
              change: '+2.3%',
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
                      <p className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={action.action}
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Exams and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Exams */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recent Exams
                  </span>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentExams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{exam.title}</h4>
                        <p className="text-sm text-gray-600">{exam.subject} • {exam.class}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(exam.status)}>
                            {exam.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {exam.participants} participants
                          </span>
                          {exam.averageScore && (
                            <span className="text-xs text-gray-500">
                              Avg: {exam.averageScore}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Exam Completion Rate</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Average Student Performance</span>
                    <span className="text-sm text-gray-600">78.5%</span>
                  </div>
                  <Progress value={78.5} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Grading Progress</span>
                    <span className="text-sm text-gray-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Pending Tasks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Papers to grade</span>
                      <Badge variant="secondary">{stats.pendingGrading}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Exams to review</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Feedback pending</span>
                      <Badge variant="secondary">8</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Mathematics Exam',
                    time: '10:00 AM - 12:00 PM',
                    date: 'Today',
                    class: 'Grade 10A',
                    type: 'exam'
                  },
                  {
                    title: 'Physics Quiz Review',
                    time: '2:00 PM - 3:00 PM',
                    date: 'Tomorrow',
                    class: 'Grade 11B',
                    type: 'review'
                  },
                  {
                    title: 'Chemistry Lab Test',
                    time: '9:00 AM - 11:00 AM',
                    date: 'Dec 18',
                    class: 'Grade 12A',
                    type: 'exam'
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <Badge variant={item.type === 'exam' ? 'default' : 'secondary'}>
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.class}</p>
                    <p className="text-sm text-gray-500">{item.time}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{item.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernTeacherDashboard;
