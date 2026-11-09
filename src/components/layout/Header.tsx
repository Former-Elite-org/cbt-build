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

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";
import DarkModeToggle from "./DarkModeToggle";
import { ReplayTourButton } from "@/features/tour/FlowTour";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-[#002a56] hover:bg-[#002a56]/10 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-lg font-bold tracking-tight text-[#002a56] dark:text-white lg:hidden">
            Elite CBT
          </h1>
        </div>

        {/* Right Section: Actions & User Profile */}
        <div className="flex items-center gap-4">
          <ReplayTourButton className="hidden sm:inline-flex h-8 text-xs text-gray-500" />
          {/* Dark Mode Toggle */}
          <div className="flex items-center">
            <DarkModeToggle />
          </div>

          {/* Divider */}
          <span className="h-6 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

          {/* User Info & Avatar */}
          <div className="flex items-center gap-3 pl-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Role
              </span>
              <p className="text-sm font-semibold capitalize text-[#002a56] dark:text-gray-200">
                {user?.user_type || "user"}
              </p>
            </div>

            {/* Avatar Container */}
            <div className="relative group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-blue-900 font-bold text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg dark:from-red-500/40 dark:to-blue-600/50 cursor-pointer">
                {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
              </div>
              {/* Subtle online indicator ring */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
