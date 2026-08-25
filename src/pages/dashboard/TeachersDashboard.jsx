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
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/features/auth/store/authStore';

const TeachersDashboard = () => {
  const { user } = useAuthStore();

  const stats = {
    totalExams: 24,
    activeExams: 3,
    totalStudents: 156,
    averageScore: 78.5
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.first_name || 'Teacher'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your classes today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Exams',
              value: stats.totalExams,
              icon: <FileText className="h-8 w-8 text-blue-600" />,
              change: '+12%'
            },
            {
              title: 'Active Exams',
              value: stats.activeExams,
              icon: <Clock className="h-8 w-8 text-green-600" />,
              change: '+3'
            },
            {
              title: 'Total Students',
              value: stats.totalStudents,
              icon: <Users className="h-8 w-8 text-purple-600" />,
              change: '+8%'
            },
            {
              title: 'Average Score',
              value: `${stats.averageScore}%`,
              icon: <Target className="h-8 w-8 text-orange-600" />,
              change: '+2.3%'
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
                      <p className="text-sm text-green-600">{stat.change} from last month</p>
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
                <BookOpen className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Create New Exam', icon: <Plus className="h-6 w-6" />, color: 'bg-blue-500' },
                  { title: 'View All Exams', icon: <FileText className="h-6 w-6" />, color: 'bg-green-500' },
                  { title: 'Student Results', icon: <BarChart3 className="h-6 w-6" />, color: 'bg-purple-500' },
                  { title: 'Grade Papers', icon: <CheckCircle className="h-6 w-6" />, color: 'bg-orange-500' }
                ].map((action, index) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Mathematics Mid-term', class: 'Grade 10A', status: 'active', participants: 32 },
                  { title: 'Physics Quiz', class: 'Grade 11B', status: 'completed', participants: 28 },
                  { title: 'Chemistry Lab Test', class: 'Grade 12A', status: 'scheduled', participants: 25 }
                ].map((exam, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{exam.title}</h4>
                      <p className="text-sm text-gray-600">{exam.class} • {exam.participants} students</p>
                    </div>
                    <Badge className={
                      exam.status === 'active' ? 'bg-green-100 text-green-800' :
                      exam.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {exam.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
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
                  <span className="text-sm font-medium">Average Performance</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeachersDashboard;
