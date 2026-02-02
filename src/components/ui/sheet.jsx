import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "react-feather";
import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef((({ className, ...props }, ref) => (
  
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]-in data-[state=closed]-out data-[state=closed]-300 data-[state=open]-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]-out-to-top data-[state=open]-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]-out-to-bottom data-[state=open]-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]-out-to-left data-[state=open]-in-from-left sm-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]-out-to-right data-[state=open]-in-from-right sm-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef,
    VariantProps {}

const SheetContent = React.forwardRef, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => (
    
      
      
        {children}
        
          
          Close
        
      
    
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }.HTMLAttributes) => (
  
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }.HTMLAttributes) => (
  
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef((({ className, ...props }, ref) => (
  
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef((({ className, ...props }, ref) => (
  
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};

