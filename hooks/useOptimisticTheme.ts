"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useOptimisticTheme = () => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [optimisticTheme, setOptimisticTheme] = useState<string | undefined>(undefined);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    // Handle initial theme resolution
    const resolved = resolvedTheme || systemTheme || 'light';
    setOptimisticTheme(resolved);
    setIsThemeLoaded(true);
  }, [resolvedTheme, systemTheme]);

  const updateTheme = (newTheme: string) => {
    // Optimistic update for instant UI feedback
    setOptimisticTheme(newTheme);
    setTheme(newTheme);
  };

  return {
    theme: optimisticTheme,
    setTheme: updateTheme,
    isThemeLoaded,
    resolvedTheme,
  };
};