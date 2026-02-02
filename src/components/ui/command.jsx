import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "react-feather";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef((({ className, ...props }, ref) => (
  
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }) => {
  return (
    
      
        
          {children}
        
      
    
  );
};

const CommandInput = React.forwardRef((({ className, ...props }, ref) => (
  
    
    
  
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef((({ className, ...props }, ref) => (
  
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef(((props, ref) => );

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef((({ className, ...props }, ref) => (
  
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef((({ className, ...props }, ref) => (
  
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef((({ className, ...props }, ref) => (
  
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }.HTMLAttributes) => {
  return ;
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

