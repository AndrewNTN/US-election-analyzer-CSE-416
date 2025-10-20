import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface TableTooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  maxWidth?: string;
}

export function TableTooltip({
  content,
  children,
  side = "top",
  maxWidth = "max-w-xs",
}: TableTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          hideArrow
          className={`${maxWidth} rounded-lg bg-white px-3 py-2 text-sm leading-snug text-gray-800 shadow-lg border border-gray-200`}
          sideOffset={5}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
