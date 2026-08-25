import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected';
import { PublicRoute } from './public';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import StudentRegisterPage from '@/features/auth/pages/StudentRegisterPage';
import ParentRegisterPage from '@/features/auth/pages/ParentRegisterPage';
import OnboardingPage from '@/features/auth/pages/OnboardingPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ExamListPage from '@/features/exams/pages/ExamListPage';
import CreateExamPage from '@/features/exams/pages/CreateExamPage';
import ManageQuestionsPage from '@/features/exams/pages/ManageQuestionsPage';
import TakeExamPage from '@/features/exam-taking/pages/TakeExamPage';
import ResultsPage from '@/features/results/pages/ResultsPage';
import AdminResultsPage from '@/features/results/pages/AdminResultsPage';
import TeacherResultsPage from '@/features/results/pages/TeacherResultsPage';
import ViewResultPage from '@/features/results/pages/ViewResultPage';
import StudentResultsPage from '@/features/results/pages/StudentResultsPage';
import SectionManager from '@/pages/school-Setup/SectionManager';
import ClassesManager from '@/pages/school-Setup/ClassesManager';
import SubjectsManager from '@/pages/school-Setup/SubjectsManager';
import TeacherList from '@/pages/teachers/index';
import StudentList from '@/pages/students/StudentList';
import SchoolTermSetup from '@/pages/school-Setup/SchoolTermSetup';
import ExamGradeSetup from '@/pages/school-Setup/ExamGradeSetup';

// Create router configuration
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/student-register',
    element: (
      <PublicRoute>
        <StudentRegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/parent-register',
    element: (
      <PublicRoute>
        <ParentRegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute bare>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'exams',
        children: [
          {
            index: true,
            element: <ExamListPage />,
          },
          {
            path: 'create',
            element: <CreateExamPage />,
          },
          {
            path: ':id/questions',
            element: <ManageQuestionsPage />,
          },
          {
            path: ':id/take',
            element: <TakeExamPage />,
          },
        ],
      },
      {
        path: 'results',
        element: <ResultsPage />, // This will route to appropriate page based on user type
      },
      {
        path: 'admin-results',
        element: <AdminResultsPage />,
      },
      {
        path: 'teacher-results',
        element: <TeacherResultsPage />,
      },
      {
        path: 'examresults/:id',
        element: <ViewResultPage />,
      },
      {
        path: 'studentresult/:id',
        element: <StudentResultsPage />,
      },
      {
        path: 'my-results',
        element: <StudentResultsPage />,
      },
      // School Management Routes
      {
        path: 'school',
        children: [
          {
            path: 'sections',
            element: <SectionManager />,
          },
          {
            path: 'classes',
            element: <ClassesManager />,
          },
          {
            path: 'subjects',
            element: <SubjectsManager />,
          },
          // {
          //   path: 'terms',
          //   element: <SchoolTermSetup />,
          // },
          // {
          //   path: 'exam-grading',
          //   element: <ExamGradeSetup />,
          // },
        ],
      },
      // Teachers Routes
      {
        path: 'teachers',
        children: [
          {
            path: 'list',
            element: <TeacherList />,
          },
        ],
      },
      // Students Routes
      {
        path: 'students',
        children: [
          {
            path: 'list',
            element: <StudentList />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

