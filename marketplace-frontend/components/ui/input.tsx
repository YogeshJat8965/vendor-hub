import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#9C8E82] selection:bg-[#CDB79E] selection:text-white dark:bg-[#EEDDCC]/30 border-[#CDC0B0] h-12 w-full min-w-0 rounded-xl border bg-[#EEDDCC]/30 px-4 py-2 font-body text-base shadow-sm transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#CDB79E] focus-visible:ring-[#CDB79E]/20 focus-visible:ring-2",
        "aria-invalid:ring-[#B85C5C]/20 dark:aria-invalid:ring-[#B85C5C]/40 aria-invalid:border-[#B85C5C]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
