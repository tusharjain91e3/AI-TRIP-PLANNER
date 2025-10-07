// components/shared/Loading.tsx
"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * A loading spinner component.
 *
 * @param {LoadingProps} props - Loading spinner props.
 * @param {string} props.size - Size of the loading spinner.
 * @param {string} props.className - Additional class names for the loading spinner.
 * @example
 * <Loading size="sm" className="bg-primary" />
 */
/*******  7f0891c0-f54f-45a4-b368-77d7e0dc8d1c  *******/export const Loading = ({ size = "md", className }: LoadingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};