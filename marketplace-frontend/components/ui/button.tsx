import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-body font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-[1.02] hover:shadow-warm-sm",
  {
    variants: {
      variant: {
        default: "bg-[#2C2621] text-white hover:bg-[#2C2621]/90",
        destructive:
          "bg-[#B85C5C] text-white hover:bg-[#B85C5C]/90 focus-visible:ring-[#B85C5C]/20",
        outline:
          "border border-[#CDC0B0] bg-white text-[#2C2621] shadow-warm-sm hover:bg-[#E7DBCD]",
        secondary:
          "bg-[#CDB79E] text-[#2C2621] hover:bg-[#CDB79E]/80",
        ghost:
          "hover:bg-[#E7DBCD]/50 hover:text-[#2C2621] shadow-none hover:shadow-none hover:scale-100",
        link: "text-[#2C2621] underline-offset-4 hover:underline shadow-none hover:shadow-none hover:scale-100",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-lg px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3.5",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-6",
        icon: "size-11",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
