import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#FF6B00] text-black shadow-[0_0_28px_rgba(255,107,0,0.28)] hover:bg-[#ff7f1f] hover:shadow-[0_0_38px_rgba(255,107,0,0.42)]",
        secondary: "border border-white/10 bg-white/8 text-white backdrop-blur-xl hover:border-white/20 hover:bg-white/14",
        ghost: "text-white/80 hover:bg-white/10 hover:text-white",
        outline: "border border-white/12 bg-black/25 text-white hover:border-[#FF6B00]/60 hover:text-[#FF6B00]"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-7 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
