import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ember: "bg-primary text-primary-foreground font-display uppercase text-[22px] tracking-[0.02em] active:scale-[0.99]",
        tile: "border border-border bg-card text-foreground font-semibold",
        selected: "border-2 border-primary bg-primary text-primary-foreground font-semibold [&_.text-muted-foreground]:text-primary-foreground/75",
        subtle: "bg-secondary text-foreground font-semibold",
        text: "text-muted-foreground hover:text-foreground",
      },
      size: { icon: "h-12 w-12 rounded-full", touch: "min-h-12 px-4 rounded-[14px]", hero: "h-16 w-full rounded-[16px] px-6" },
    },
    defaultVariants: { variant: "tile", size: "touch" },
  },
);
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = "button", ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
