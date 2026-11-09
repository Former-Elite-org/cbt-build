// 
import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/features/auth/store/authStore';
import { isStudentRole } from '@/lib/utils/roles';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import { cn } from '@/lib/utils/cn';
import { FlowTour } from '@/features/tour/FlowTour';
import { TOUR_OPEN_SIDEBAR } from '@/features/tour/tourConfig';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const open = () => setSidebarOpen(true);
    window.addEventListener(TOUR_OPEN_SIDEBAR, open);
    return () => window.removeEventListener(TOUR_OPEN_SIDEBAR, open);
  }, []);

  // Student layout - full width
  if (isStudentRole(user?.user_type)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-in fade-in duration-300">
        <FlowTour />
        <main className="w-full min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <FlowTour />
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Wrapper */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20' // تم التعديل إلى pl-20 ليتوافق مع أبعاد السايدبار الجديد w-20
        )}
      >
        {/* Header Component */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content View Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
