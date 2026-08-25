import * as React from "react"

import { cn } from "@/lib/utils/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base ring-offset-background dark:ring-offset-gray-800 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground dark:file:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 focus-visible:ring-offset-0 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 hover:border-primary-300 dark:hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900 transition-all duration-300 shadow-sm dark:shadow-gray-900 focus-visible:shadow-glow-sm md:text-sm text-gray-900 dark:text-white dark:text-gray-100",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
