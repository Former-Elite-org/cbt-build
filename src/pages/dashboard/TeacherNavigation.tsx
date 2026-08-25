// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Home,
//   FileText,
//   BarChart3,
//   Users,
//   Settings,
//   Bell,
//   Search,
//   Menu,
//   X,
//   LogOut,
//   User,
//   BookOpen,
//   Calendar,
//   Award,
//   HelpCircle
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import ModernTeacherDashboard from './ModernTeacherDashboard';
// import ExamManagement from './ExamManagement';
// import StudentResults from './StudentResults';

// interface NavigationItem {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
//   component: React.ComponentType;
//   badge?: number;
// }

// const TeacherNavigation: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const { user, logout } = useAuthStore();

//   const navigationItems: NavigationItem[] = [
//     {
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: <Home className="h-5 w-5" />,
//       component: ModernTeacherDashboard
//     },
//     {
//       id: 'exams',
//       label: 'Exam Management',
//       icon: <FileText className="h-5 w-5" />,
//       component: ExamManagement,
//       badge: 3
//     },
//     {
//       id: 'results',
//       label: 'Student Results',
//       icon: <BarChart3 className="h-5 w-5" />,
//       component: StudentResults
//     },
//     {
//       id: 'students',
//       label: 'My Students',
//       icon: <Users className="h-5 w-5" />,
//       component: () => <div className="p-6">Students component coming soon...</div>
//     },
//     {
//       id: 'schedule',
//       label: 'Schedule',
//       icon: <Calendar className="h-5 w-5" />,
//       component: () => <div className="p-6">Schedule component coming soon...</div>
//     },
//     {
//       id: 'grades',
//       label: 'Grade Book',
//       icon: <Award className="h-5 w-5" />,
//       component: () => <div className="p-6">Grade Book component coming soon...</div>
//     }
//   ];

//   const ActiveComponent = navigationItems.find(item => item.id === activeTab)?.component || ModernTeacherDashboard;

//   const handleLogout = () => {
//     logout();
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <AnimatePresence>
//         {(sidebarOpen || window.innerWidth >= 1024) && (
//           <motion.div
//             initial={{ x: -300 }}
//             animate={{ x: 0 }}
//             exit={{ x: -300 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//             className="fixed lg:relative z-30 flex flex-col w-64 h-full bg-white border-r border-gray-200 shadow-lg lg:shadow-none"
//           >
//             {/* Sidebar Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                   <BookOpen className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="font-bold text-gray-900 dark:text-white">CBT Teacher</h2>
//                   <p className="text-xs text-gray-500">Dashboard</p>
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="lg:hidden"
//                 onClick={() => setSidebarOpen(false)}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>

//             {/* Navigation Items */}
//             <nav className="flex-1 p-4 space-y-2">
//               {navigationItems.map((item) => (
//                 <motion.button
//                   key={item.id}
//                   whileHover={{ x: 4 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => {
//                     setActiveTab(item.id);
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
//                     activeTab === item.id
//                       ? 'bg-blue-50 text-[#00356B] border border-blue-200'
//                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-white'
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     {item.icon}
//                     <span className="font-medium">{item.label}</span>
//                   </div>
//                   {item.badge && (
//                     <Badge variant="secondary" className="bg-blue-100 text-[#00356B]">
//                       {item.badge}
//                     </Badge>
//                   )}
//                 </motion.button>
//               ))}
//             </nav>

//             {/* User Profile Section */}
//             <div className="p-4 border-t border-gray-200">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="w-full justify-start p-3">
//                     <div className="flex items-center gap-3">
//                       <Avatar className="h-8 w-8">
//                         <AvatarImage src={user?.avatar} />
//                         <AvatarFallback>
//                           {user?.first_name?.[0]}{user?.last_name?.[0]}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="text-left">
//                         <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
//                         <p className="text-xs text-gray-500">Teacher</p>
//                       </div>
//                     </div>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem>
//                     <User className="mr-2 h-4 w-4" />
//                     Profile
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <Settings className="mr-2 h-4 w-4" />
//                     Settings
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <HelpCircle className="mr-2 h-4 w-4" />
//                     Help & Support
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={handleLogout} className="text-red-600">
//                     <LogOut className="mr-2 h-4 w-4" />
//                     Logout
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Navigation */}
//         <header className="bg-white border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="lg:hidden"
//                 onClick={() => setSidebarOpen(true)}
//               >
//                 <Menu className="h-5 w-5" />
//               </Button>
              
//               <div className="relative hidden md:block">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   placeholder="Search exams, students, results..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10 w-80"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <Button variant="ghost" size="sm" className="relative">
//                 <Bell className="h-5 w-5" />
//                 <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
//                   3
//                 </Badge>
//               </Button>

//               <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
//                 <span>Welcome back,</span>
//                 <span className="font-medium text-gray-900 dark:text-white">{user?.first_name}!</span>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-auto">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="h-full"
//           >
//             <ActiveComponent />
//           </motion.div>
//         </main>
//       </div>

//       {/* Mobile Overlay */}
//       {sidebarOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default TeacherNavigation;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  BarChart3,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
  Calendar,
  Award,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/store/authStore';
import ModernTeacherDashboard from './ModernTeacherDashboard';
import ExamManagement from './ExamManagement';
import StudentResults from './StudentResults';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  badge?: number;
  color?: string;
}

const TeacherNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New exam submission from Class 5A', time: '5 min ago', read: false },
    { id: 2, message: '3 students haven\'t submitted assignments', time: '1 hour ago', read: false },
    { id: 3, message: 'Parent-teacher meeting scheduled', time: '2 hours ago', read: true }
  ]);
  const { user, logout } = useAuthStore();

  // Check for screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      component: ModernTeacherDashboard,
      color: 'text-blue-500'
    },
    {
      id: 'exams',
      label: 'Exam Management',
      icon: <FileText className="h-5 w-5" />,
      component: ExamManagement,
      badge: 3,
      color: 'text-purple-500'
    },
    {
      id: 'results',
      label: 'Student Results',
      icon: <BarChart3 className="h-5 w-5" />,
      component: StudentResults,
      color: 'text-green-500'
    },
    {
      id: 'students',
      label: 'My Students',
      icon: <Users className="h-5 w-5" />,
      component: () => <div className="p-6">Students component coming soon...</div>,
      color: 'text-orange-500'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      component: () => <div className="p-6">Schedule component coming soon...</div>,
      color: 'text-red-500'
    },
    {
      id: 'grades',
      label: 'Grade Book',
      icon: <Award className="h-5 w-5" />,
      component: () => <div className="p-6">Grade Book component coming soon...</div>,
      color: 'text-yellow-500'
    }
  ];

  const ActiveComponent = navigationItems.find(item => item.id === activeTab)?.component || ModernTeacherDashboard;

  const handleLogout = () => {
    logout();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300`}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <>
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:relative z-30 flex flex-col w-72 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 shadow-2xl lg:shadow-none"
            >
              {/* Sidebar Header */}
              <div className="relative p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50"></div>
                      <div className="relative w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        CBT Teacher
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Empower Learning</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* User Profile Summary */}
              <div className="mx-4 mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Senior Teacher</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">92% Performance</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge className={`${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900 text-[#00356B] dark:text-blue-300'}`}>
                        {item.badge}
                      </Badge>
                    )}
                    {activeTab === item.id && (
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Bottom Section */}
              <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Confirm Logout</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Yes, Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.aside>

            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                {/* Breadcrumb */}
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Teacher Panel</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {navigationItems.find(item => item.id === activeTab)?.label}
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Mark all as read
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}>
                          <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 hover:bg-transparent">
                      <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 transition-all cursor-pointer">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Welcome Text */}
                <div className="hidden lg:block text-sm">
                  <span className="text-gray-500">Welcome back,</span>
                  <span className="font-semibold text-gray-900 dark:text-white ml-1">
                    {user?.first_name}!
                  </span>
                  <Sparkles className="inline-block h-3 w-3 ml-1 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default TeacherNavigation;