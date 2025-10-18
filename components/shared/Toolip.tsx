import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {ReactNode, forwardRef} from "react";

export const TooltipContainer = forwardRef<
  HTMLButtonElement,
  {
    text: string;
    children: ReactNode;
    key?: string;
  }
>(function TooltipContainer({ text, children, key = "randomKey" }, ref) {
  return (
    <TooltipProvider key={key}>
      <Tooltip>
        <TooltipTrigger asChild ref={ref as any}>{children}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[200px]">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
