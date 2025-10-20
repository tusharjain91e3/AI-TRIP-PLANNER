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
  providerKey?: string;
} & ComponentPropsWithoutRef<typeof TooltipTrigger>;

export const TooltipContainer = forwardRef<HTMLButtonElement, TooltipContainerProps>(
  function TooltipContainer({ text, children, providerKey = "randomKey", ...triggerProps }, ref) {
    return (
      <TooltipProvider key={providerKey}>
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
