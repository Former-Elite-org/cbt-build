import { useAuthStore } from '@/features/auth/store/authStore';
import { isAdminRole, isStudentRole, isTeacherRole } from '@/lib/utils/roles';
import AdminResultsPage from './AdminResultsPage';
import TeacherResultsPage from './TeacherResultsPage';
import StudentResultsPage from './StudentResultsPage';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResultsPage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isAdminRole(user?.user_type)) {
    return <AdminResultsPage />;
  }

  if (isTeacherRole(user?.user_type)) {
    return <TeacherResultsPage />;
  }

  if (isStudentRole(user?.user_type)) {
    return <StudentResultsPage />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Unknown user type. Please contact support.</p>
    </div>
  );
}

