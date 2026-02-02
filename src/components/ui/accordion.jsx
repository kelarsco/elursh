import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "react-feather";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef((({ className, ...props }, ref) => (
  
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef((({ className, children, ...props }, ref) => (
  
    svg]-180",
        className,
      )}
      {...props}
    >
      {children}
      
    
  
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef((({ className, children, ...props }, ref) => (
  
    {children}
  
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

