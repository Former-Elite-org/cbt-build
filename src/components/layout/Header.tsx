// import { Menu } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useAuthStore } from "@/features/auth/store/authStore";
// import DarkModeToggle from "./DarkModeToggle";

// interface HeaderProps {
//   onMenuClick: () => void;
// }
// export function Header({ onMenuClick }: HeaderProps) {
//   const { user } = useAuthStore();

//   return (
//     <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-md shadow-sm px-4 md:px-9 lg:px-15">
//       <div className="flex h-full items-center justify-between px-4 lg:px-6">
//         {/* Mobile Menu Button */}
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={onMenuClick}
//           className="lg:hidden hover:bg-[#002a56] hover:text-white dark:hover:bg-gray-100 dark:hover:text-white transition-colors"
//         >
//           <Menu className="h-6 w-6 text-[#002a56] dark:text-gray-300 hover:text-white dark:hover:text-[#002a56]" />
//         </Button>

//         {/* Title/Spacer for mobile */}
//         <div className="flex-1 lg:hidden">
//           <h1 className="text-lg font-bold text-[#002a56] dark:text-white">
//             Elite CBT
//           </h1>
//         </div>

//         {/* User Info */}
//         <div className="flex p-4 items-center gap-3">
//           <div
//             className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold shadow-glow-sm hover:shadow-glow transition-all duration-300 hover:scale-110 cursor-pointer"
//           >
//             {(
//               user?.first_name?.[0] ||
//               user?.username?.[0] ||
//               "U"
//             ).toUpperCase()}
//           </div>
//           <div className="hidden md:block text-right">
//             {/* <p className="text-sm font-semibold text-gray-900 dark:text-white">
//               {user?.first_name || user?.username || 'User'}
//             </p> */}
//             <p className="text-xs text-[#002a56] dark:text-white capitalize font-medium">
//               {user?.user_type || "user"}
//             </p>
//           </div>
//         </div>
//         <div className="mb-3">
//           <DarkModeToggle />
//         </div>
//       </div>
//     </header>
//   );
// }

import { ChevronDown, FileText, LogOut, Menu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isStudentRole } from '@/lib/utils/roles';
import {
  requestTourReplay,
  tourRole,
  tourUserId,
} from '@/features/tour/tourConfig';
import DarkModeToggle from './DarkModeToggle';
import { SchoolBrandHeader } from './SchoolBrandHeader';

interface HeaderProps {
  onMenuClick?: () => void;
}

function displayName(user: any): string {
  return (
    user?.student_name ||
    user?.full_name ||
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    'Account'
  );
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const account = user as any;
  const student = isStudentRole(user?.user_type);
  const name = displayName(account);
  const initial = (name || 'U').charAt(0).toUpperCase();
  const subtitle = student
    ? `Adm. ${account?.admission_no || account?.user_id || ''}`.trim()
    : (user?.user_type || 'Staff');
  const role = tourRole(user?.user_type);

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden shrink-0 text-[#002a56] hover:bg-[#002a56]/10 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <SchoolBrandHeader compact />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <DarkModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#002a56]/30"
                aria-label="Account menu"
              >
                <span className="relative">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-blue-900 text-sm font-bold text-white shadow-sm">
                    {initial}
                  </span>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
                </span>
                <span className="hidden sm:flex flex-col items-start min-w-0 max-w-[10rem]">
                  <span className="text-sm font-semibold text-[#002a56] dark:text-white truncate w-full text-left">
                    {name}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 truncate w-full text-left">
                    {subtitle}
                  </span>
                </span>
                <ChevronDown className="hidden sm:block h-4 w-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-gray-900 text-[#002a56] dark:text-white border-gray-100 dark:border-gray-800"
            >
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold truncate">{name}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{subtitle}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              {student && (
                <DropdownMenuItem
                  data-tour="student-results"
                  onClick={() => navigate('/my-results')}
                  className="cursor-pointer gap-2"
                >
                  <FileText className="h-4 w-4" />
                  My Results
                </DropdownMenuItem>
              )}
              {role && (
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => requestTourReplay(tourUserId(user), role)}
                >
                  <Sparkles className="h-4 w-4" />
                  Replay tour
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
