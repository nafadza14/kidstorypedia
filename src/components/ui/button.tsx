import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-zinc-200 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-white/30 bg-transparent text-white hover:bg-white hover:text-black",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
        ghost: "text-white/80 hover:text-white hover:bg-white/10",
        link: "text-white underline underline-offset-4 hover:opacity-70 p-0 h-auto",
        dark: "bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-full text-sm",
        sm: "h-9 px-4 rounded-full text-xs",
        lg: "h-13 px-8 rounded-full text-base",
        icon: "h-10 w-10 rounded-full",
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
