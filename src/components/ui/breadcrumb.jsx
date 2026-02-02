import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "react-feather";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef & {
    separator?.ReactNode;
  }
>(({ ...props }, ref) => );
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef>(
  ({ className, ...props }, ref) => (
    
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef>(
  ({ className, ...props }, ref) => (
    
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef & {
    asChild?;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return ;
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef>(
  ({ className, ...props }, ref) => (
    
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }.ComponentProps) => (
  svg]-3.5", className)} {...props}>
    {children ?? }
  
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }.ComponentProps) => (
  
    
    More
  
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

