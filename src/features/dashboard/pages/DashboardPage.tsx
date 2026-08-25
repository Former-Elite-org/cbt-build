import { useAuthStore } from '@/features/auth/store/authStore';
import AdminDashboardPage from './AdminDashboardPage';
import TeacherDashboardPage from './TeacherDashboardPage';
import StudentDashboardPage from './StudentDashboardPage';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const userType = user?.user_type?.toLowerCase() || '';

  if (userType === 'admin' || userType === 'branchadmin') {
    return <AdminDashboardPage />;
  }

  if (userType === 'teacher') {
    return <TeacherDashboardPage />;
  }

  if (userType === 'student') {
    return <StudentDashboardPage />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Unknown user type. Please contact support.</p>
    </div>
  );
}

