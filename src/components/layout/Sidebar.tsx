// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { useAuth } from '@/features/auth/hooks/useAuth';
// import { cn } from '@/lib/utils/cn';
// import {
//   LayoutDashboard,
//   FileText,
//   Users,
//   GraduationCap,
//   School,
//   Calendar,
//   Settings,
//   BookOpen,
//   LogOut,
//   Menu,
//   X,
//   ChevronRight,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// interface SidebarProps {
//   isOpen: boolean;
//   onToggle: () => void;
// }

// export function Sidebar({ isOpen, onToggle }: SidebarProps) {
//   const { user } = useAuthStore();
//   const { logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   if (user?.user_type === 'Student') return null;

//   const isAdmin = user?.user_type?.toLowerCase().includes('admin');
//   const isTeacher = user?.user_type === 'Teacher';

//   const isActive = (path: string) => {
//     return location.pathname === path || location.pathname.startsWith(path + '/');
//   };

//   const handleLogout = () => {
//     logout();
//   };

//   const navItems = [
//     {
//       icon: LayoutDashboard,
//       label: 'Dashboard',
//       path: '/dashboard',
//       roles: ['Admin', 'BranchAdmin', 'Teacher'],
//     },
//     {
//       icon: FileText,
//       label: 'Exams',
//       path: '/exams',
//       roles: ['Admin', 'BranchAdmin', 'Teacher'],
//     },
//     {
//       icon: BookOpen,
//       label: 'Results',
//       path: '/results',
//       roles: ['Admin', 'BranchAdmin', 'Teacher'],
//     },
//     ...(isAdmin
//       ? [
//           {
//             icon: BookOpen,
//             label: 'Exam Reports',
//             path: '/exam/reports',
//             roles: ['Admin', 'BranchAdmin'],
//           },
//         ]
//       : []),
//     ...(isTeacher
//       ? [
//           {
//             icon: BookOpen,
//             label: 'Exam Results',
//             path: '/exam/results',
//             roles: ['Teacher'],
//           },
//         ]
//       : []),
//   ];

//   const adminItems = isAdmin
//     ? [
//         { icon: School, label: 'School Sections', path: '/school/sections' },
//         { icon: School, label: 'School Classes', path: '/school/classes' },
//         { icon: BookOpen, label: 'School Subjects', path: '/school/subjects' },
//         { icon: Users, label: 'School Students', path: '/students/list' },
//         { icon: GraduationCap, label: 'School Teachers', path: '/teachers/list' },
//         { icon: Calendar, label: 'Term Manager', path: '/school/terms' },
//         { icon: Settings, label: 'Exam Grade Setup', path: '/school/exam-grading' },
//       ]
//     : [];

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
//           onClick={onToggle}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={cn(
//           'fixed left-0 top-0 z-50 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 ease-in-out',
//           isOpen ? 'w-64' : 'w-16',
//           'lg:translate-x-0',
//           !isOpen && '-translate-x-full lg:translate-x-0'
//         )}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//           {isOpen && (
//             <div className="flex items-center gap-2 animate-slide-in">
//               <div className="w-8 h-8 rounded-lg dark:bg-gray-700/20 flex items-center justify-center shadow-md">
//                 <img
//                   src="/logo192.png"
//                   alt="Elite CBT"
//                   className="w-6 h-6"
//                 />
//               </div>
//               <span className="font-bold text-[#002a56] dark:text-white text-lg bg-gradient-to-r from-primary-600 to-accent-600 dark:from-white dark:to-gray-200 bg-clip-text ">
//                 Elite CBT
//               </span>
//             </div>
//           )}
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onToggle}
//             className="lg:block hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
//           >
//             <ChevronRight
//               className={cn(
//                 'h-5 w-5 transition-transform duration-300',
//                 isOpen && 'rotate-180'
//               )}
//             />
//           </Button>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onToggle}
//             className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
//           >
//             <X className="h-5 w-5" />
//           </Button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto py-4">
//           <div className="space-y-1 px-2">
//             {navItems.map((item, index) => {
//               const Icon = item.icon;
//               const active = isActive(item.path);
//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   onClick={() => {
//                     // Close on mobile
//                     if (window.innerWidth < 1024) {
//                       onToggle();
//                     }
//                   }}
//                   className={cn(
//                     'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden',
//                     active
//                       ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-md'
//                       : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1'
//                   )}
//                   style={{
//                     animationDelay: `${index * 50}ms`
//                   }}
//                 >
//                   <Icon className={cn(
//                     "h-5 w-5 flex-shrink-0 transition-colors duration-200",
//                     active ? "text-[#002a56] dark:text-gray-100" : "text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
//                   )} />
//                   {isOpen && <span className={cn("animate-slide-in", active ? "text-[#002a56] dark:text-gray-100" : "")}>{item.label}</span>}
//                   {active && (
//                     <div className="absolute right-0 top-0 h-full w-1 bg-primary-600 dark:bg-primary-400 rounded-l-full" />
//                   )}
//                 </Link>
//               );
//             })}
//           </div>

//           {/* Admin Section */}
//           {isAdmin && isOpen && (
//             <div className="px-2 mt-6 animate-fade-in">
//               <div className="px-3 py-2 text-xs font-semibold text-[#002a56] dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
//                 <div className="h-1 w-1 rounded-full bg-[#002a56] dark:bg-gray-500 animate-pulse" />
//                 School Management
//               </div>
//               <div className="space-y-1 mt-2">
//                 {adminItems.map((item, index) => {
//                   const Icon = item.icon;
//                   const active = isActive(item.path);
//                   return (
//                     <Link
//                       key={item.path}
//                       to={item.path}
//                       onClick={() => {
//                         if (window.innerWidth < 1024) {
//                           onToggle();
//                         }
//                       }}
//                       className={cn(
//                         'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
//                         active
//                           ? 'bg-primary-500 dark:bg-primary-600 text-[#002a56] dark:text-gray-100 shadow-sm'
//                           : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1'
//                       )}
//                       style={{
//                         animationDelay: `${index * 50}ms`
//                       }}
//                     >
//                       <Icon className={cn(
//                         "h-5 w-5 flex-shrink-0 transition-colors duration-200",
//                         active ? "text-[#002a56] dark:text-gray-100" : "text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
//                       )} />
//                       {isOpen && <span>{item.label}</span>}
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </nav>

//         {/* Footer - Logout */}
//         <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
//           <Button
//             variant="ghost"
//             onClick={handleLogout}
//             className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 font-medium group rounded-lg"
//           >
//             <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
//             {isOpen && <span>Logout</span>}
//           </Button>
//         </div>
//       </aside>
//     </>
//   );
// }


import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isAdminRole, isStudentRole } from '@/lib/utils/roles';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  School,
  BookOpen,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EliteBrandMark } from './SchoolBrandHeader';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const location = useLocation();

  if (isStudentRole(user?.user_type)) return null;

  const isAdmin = isAdminRole(user?.user_type);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      tour: 'nav-dashboard',
    },
    {
      icon: FileText,
      label: 'Exams',
      path: '/exams',
      tour: 'nav-exams',
    },
    {
      icon: BookOpen,
      label: 'Results',
      path: '/results',
      tour: 'nav-results',
    },
  ];

  const adminItems = isAdmin
    ? [
        { icon: School, label: 'School Sections', path: '/school/sections' },
        { icon: School, label: 'School Classes', path: '/school/classes' },
        { icon: BookOpen, label: 'School Subjects', path: '/school/subjects' },
        { icon: Users, label: 'School Students', path: '/students/list' },
        { icon: GraduationCap, label: 'School Teachers', path: '/teachers/list' },
      ]
    : [];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-lg flex flex-col transition-all duration-300 ease-in-out',
          isOpen ? 'w-64' : 'w-20 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center overflow-hidden min-w-0">
            <EliteBrandMark compact logoOnly />
          </div>

          {/* Toggle Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:flex hidden h-8 w-8 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden h-8 w-8 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Navigation Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar">
          {/* Main Items */}
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  data-tour={item.tour}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                    active
                      ? 'bg-[#002a56] text-white shadow-md shadow-[#002a56]/10 dark:bg-red-900/30 dark:shadow-red-600/10'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-[#002a56] dark:hover:text-gray-200'
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-200",
                    active ? "text-white" : "text-gray-400 group-hover:text-[#002a56] dark:group-hover:text-gray-200"
                  )} />
                  {isOpen ? (
                    <span className="animate-in fade-in duration-200 whitespace-nowrap">{item.label}</span>
                  ) : (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-transform z-50 pointer-events-none font-normal">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Management Section */}
          {isAdmin && (
            <div className="space-y-2 px-3" data-tour="nav-school">
              {isOpen && (
                <div className="px-3 py-2 text-xs font-semibold text-[#002a56] dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#002a56] dark:bg-gray-500 animate-pulse" />
                  School Management
                </div>
              )}
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                        active
                          ? 'bg-[#002a56] text-white shadow-md shadow-[#002a56]/10 dark:bg-sky-700'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-[#002a56] dark:hover:text-gray-200'
                      )}
                    >
                      <Icon className={cn(
                        "h-4.5 w-4.5 shrink-0 transition-colors duration-200",
                        active ? "text-white" : "text-gray-400 group-hover:text-[#002a56] dark:group-hover:text-gray-200"
                      )} />
                      {isOpen ? (
                        <span className="animate-in fade-in duration-200 text-[13px] whitespace-nowrap">{item.label}</span>
                      ) : (
                        <div className="absolute left-16 scale-0 group-hover:scale-100 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-transform z-50 pointer-events-none font-normal">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer Area: Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group relative"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0 text-red-500 group-hover:translate-x-0.5 transition-transform" />
            {isOpen ? (
              <span className="animate-in fade-in duration-200">Logout</span>
            ) : (
              <div className="absolute left-16 scale-0 group-hover:scale-100 bg-red-600 text-white text-xs rounded px-2 py-1 transition-transform z-50 pointer-events-none font-normal">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
