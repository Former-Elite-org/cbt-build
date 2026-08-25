import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background dark:ring-offset-gray-800 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "gradient-primary text-white hover:shadow-glow hover:scale-105 shadow-sm dark:shadow-gray-900",
        destructive:
          "gradient-danger text-white hover:shadow-accent-glow hover:scale-105 shadow-sm dark:shadow-gray-900",
        outline:
          "border-2 border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 hover:border-primary-500 dark:hover:border-primary-500 text-primary-600 dark:text-primary-400 shadow-sm",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-white dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 shadow-sm",
        ghost: "hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 text-gray-700 dark:text-gray-300",
        link: "text-primary-600 dark:text-primary-400 underline-offset-4 hover:underline hover:text-primary-700 dark:hover:text-primary-300",
        success: "gradient-success text-white hover:shadow-success-glow hover:scale-105 shadow-sm dark:shadow-gray-900",
        accent: "gradient-accent text-white hover:shadow-accent-glow hover:scale-105 shadow-sm dark:shadow-gray-900",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
