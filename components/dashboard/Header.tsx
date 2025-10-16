"use client";

import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { Loading } from "@/components/shared/Loading";
import { cn } from "@/lib/utils";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import FeedbackSheet from "@/components/common/FeedbackSheet";
import Logo from "@/components/common/Logo";
import MobileMenu from "@/components/dashboard/MobileMenu";
import { CreditsDrawerWithDialog } from "@/components/shared/DrawerWithDialogGeneric";
import Link from "next/link";
import { useOptimisticTheme } from "@/hooks/useOptimisticTheme"; // Custom hook for instant theme switching

// Minimal loading spinner component
const AuthLoadingSpinner = () => (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    <span className="text-xs text-muted-foreground">Loading...</span>
  </div>
);

const Header = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [hasMounted, setHasMounted] = useState(false);
  const { theme, isThemeLoaded } = useOptimisticTheme();

  // Handle initial mount to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Early return during critical loading states
  if (!isLoaded || !hasMounted || !isThemeLoaded) {
    return (
      <header className={cn(
        "w-full border-b border-border/40 z-50 sticky top-0",
        "bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}>
        <nav className="lg:px-20 px-5 py-3 mx-auto">
          <div className="flex justify-between items-center w-full">
            <Logo />
            <AuthLoadingSpinner />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "w-full border-b border-border/40 z-50 sticky top-0 transition-colors duration-200",
        "bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60",
        theme === 'dark' ? 'bg-gray-900/60' : 'bg-white/60'
      )}
    >
      <nav className="lg:px-20 px-5 py-3 mx-auto">
        <div className="flex justify-between items-center w-full">
          <Logo />
          
          {/* Mobile menu - always available */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
          
          {/* Auth-aware right section */}
          <div className="flex items-center gap-2">
            {!isSignedIn ? (
              // Unauthenticated state
              <>
                <ThemeDropdown />
                <SignInButton 
                  mode="modal" 
                />
              </>
            ) : (
              // Authenticated state
              <div className="flex items-center gap-2">
                <Link
                  href="/community-plans"
                  className="whitespace-nowrap hidden md:block hover:underline cursor-pointer hover:underline-offset-4 text-foreground text-sm transition-colors"
                >
                  Community Plans
                </Link>
                <CreditsDrawerWithDialog />
                <FeedbackSheet />
                <ThemeDropdown />
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      userButtonBox: "hover:bg-accent",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;