import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover-muted hover-muted-foreground focus-visible-none focus-visible-2 focus-visible-ring focus-visible-offset-2 disabled-events-none disabled-50 data-[state=on]-accent data-[state=on]-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover-accent hover-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef,
  React.ComponentPropsWithoutRef & VariantProps
>(({ className, variant, size, ...props }, ref) => (
  
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };

