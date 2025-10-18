"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";

import { ReactNode, Suspense, useEffect, useState } from "react";

// Initialize Convex client with better error handling
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is not defined. Please check your .env.local file."
  );
}

console.log("🔗 Connecting to Convex:", convexUrl);

const convex = new ConvexReactClient(convexUrl, {
  verbose: true, // Enable verbose logging in development
});

function decodeJwtClaims(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Failed to decode Clerk JWT", error);
    return null;
  }
}

function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("✅ ConvexClientProvider mounted");
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      >
        <ClerkTokenLogger />
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </Suspense>
  );
}

function ClerkTokenLogger() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }
    if (!isLoaded) return;
    getToken({ template: "convex", skipCache: true })
      .then((token) => {
        if (!token) return;
        const claims = decodeJwtClaims(token);
        if (claims) {
          console.log("🔐 Clerk token claims", {
            iss: claims.iss,
            aud: claims.aud,
          });
        }
      })
      .catch((error) => {
        console.warn("Failed to fetch Clerk token", error);
      });
  }, [getToken, isLoaded]);

  return null;
}

export default ConvexClientProvider;
