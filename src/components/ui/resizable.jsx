import { MoreVertical } from "react-feather";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }.ComponentProps) => (
  
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}.ComponentProps & {
  withHandle?;
}) => (
  div]-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      
        
      
    )}
  
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

