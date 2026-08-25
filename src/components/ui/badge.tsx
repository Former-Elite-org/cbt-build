import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:scale-105 animate-scale-in",
  {
    variants: {
      variant: {
        default:
          "border-transparent gradient-primary text-white hover:shadow-glow-sm dark:shadow-gray-900",
        secondary:
          "border-transparent bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500",
        destructive:
          "border-transparent gradient-danger text-white hover:shadow-accent-glow dark:shadow-gray-900",
        outline: "text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-gray-600",
        success: "border-transparent gradient-success text-white hover:shadow-success-glow dark:shadow-gray-900",
        warning: "border-transparent gradient-accent text-white hover:shadow-accent-glow dark:shadow-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
