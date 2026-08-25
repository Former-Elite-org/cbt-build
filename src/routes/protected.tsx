import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole?: string;
  bare?: boolean; // skip AppLayout (used for onboarding, full-screen pages)
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ requiredRole, bare, children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.user_type !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (bare) {
    return <>{children || <Outlet />}</>;
  }

  return (
    <AppLayout>
      {children || <Outlet />}
    </AppLayout>
  );
};

