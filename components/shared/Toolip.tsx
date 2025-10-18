import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";

type TooltipContainerProps = {
  text: string;
  children: ReactNode;
  key?: string;
} & ComponentPropsWithoutRef<typeof TooltipTrigger>;

export const TooltipContainer = forwardRef<HTMLButtonElement, TooltipContainerProps>(
  function TooltipContainer({ text, children, key = "randomKey", ...triggerProps }, ref) {
    return (
      <TooltipProvider key={key}>
        <Tooltip>
          <TooltipTrigger asChild ref={ref as any} {...triggerProps}>
            {children}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[200px]">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);
