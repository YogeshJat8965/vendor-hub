import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-body font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[#EEDDCC] text-[#2C2621] border-[#CDC0B0] [a&]:hover:bg-[#E7DBCD]",
        secondary:
          "bg-[#E7DBCD] text-[#6B5E54] [a&]:hover:bg-[#CDC0B0]",
        destructive:
          "bg-[#B85C5C] text-white [a&]:hover:bg-[#B85C5C]/90 focus-visible:ring-[#B85C5C]/20",
        outline:
          "border-[#CDC0B0] text-[#2C2621] [a&]:hover:bg-[#E7DBCD] [a&]:hover:text-[#2C2621]",
        ghost: "[a&]:hover:bg-[#E7DBCD] [a&]:hover:text-[#2C2621]",
        link: "text-[#2C2621] underline-offset-4 [a&]:hover:underline",
        premium: "bg-[#2C2621] text-[#EEDDCC] shadow-warm-sm",
        success: "bg-[#5B8C5A]/10 text-[#5B8C5A]",
        warning: "bg-[#C4975A]/10 text-[#C4975A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
