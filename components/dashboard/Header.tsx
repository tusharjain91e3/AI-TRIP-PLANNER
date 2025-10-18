"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import FeedbackSheet from "@/components/common/FeedbackSheet";
import Logo from "@/components/common/Logo";
import MobileMenu from "@/components/dashboard/MobileMenu";
const CreditsDrawerWithDialog = dynamic(
  () => import("@/components/shared/DrawerWithDialogGeneric").then((mod) => mod.CreditsDrawerWithDialog),
  { ssr: false }
);
import Link from "next/link";
import { useOptimisticTheme } from "@/hooks/useOptimisticTheme";

// Skeleton loader for credits to prevent layout shift
const CreditsSkeleton = () => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 animate-pulse">
    <div className="w-16 h-4 bg-muted rounded" />
  </div>
);

const Header = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [hasMounted, setHasMounted] = useState(false);
  const { theme, isThemeLoaded } = useOptimisticTheme();

  // Handle initial mount to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Show minimal skeleton during initial load to prevent layout shift
  if (!isLoaded || !hasMounted || !isThemeLoaded) {
    return (
      <header className={cn(
        "w-full border-b border-border/40 z-50 sticky top-0",
        "bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}>
        <nav className="lg:px-20 px-5 py-3 mx-auto">
          <div className="flex justify-between items-center w-full">
            <Logo />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            </div>
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
                  className="whitespace-nowrap hidden md:block hover:underline cursor-pointer hover:underline-offset-4 text-foreground text-sm transition-colors px-3 py-2 rounded-md hover:bg-accent"
                >
                  Community Plans
                </Link>
                
                {/* Credits with skeleton fallback */}
                <div className="hidden sm:block">
                  <CreditsDrawerWithDialog />
                </div>
                
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