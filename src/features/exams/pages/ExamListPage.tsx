import { useAuthStore } from '@/features/auth/store/authStore';
import { isAdminRole, isStudentRole, isTeacherRole } from '@/lib/utils/roles';
import ExamsManagerPage from './ExamsManagerPage';
import TeachersExamPage from './TeachersExamPage';
import StudentExamListPage from './StudentExamListPage';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExamListPage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isAdminRole(user?.user_type)) {
    return <ExamsManagerPage />;
  }

  if (isTeacherRole(user?.user_type)) {
    return <TeachersExamPage />;
  }

  if (isStudentRole(user?.user_type)) {
    return <StudentExamListPage />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Unknown user type. Please contact support.</p>
    </div>
  );
}

