import { CiDark, CiLight } from "react-icons/ci";
import { useTheme } from "@/contexts/ThemeContext";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="h-10 w-10 pt-1 mt-3 text-center hidden lg:flex justify-center text-2xl rounded-full  border-[#002a56] text-[#002a56] dark:hover:gradient-primary dark:text-white transition-colors duration-300"
    >
      {theme === 'dark' ?  <CiDark /> : <CiLight /> }
    </button>
  );
}
