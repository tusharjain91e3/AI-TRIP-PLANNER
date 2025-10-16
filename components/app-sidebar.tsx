"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FiltersType, NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Suspense } from "react";

function AppSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  // Get current filters from URL - simplified without useSearchParams
  const getCurrentFilters = React.useCallback((): FiltersType => {
    return {
      companionId: "", // Default empty since useSearchParams removed
      location: "",
    };
  }, []);

  const handleFilterChange = (newFilters: FiltersType) => {
    const updatedSearchParams = new URLSearchParams();

    // Handle pageNo
    updatedSearchParams.delete("pageNumber");

    // Handle companionId
    if (newFilters.companionId) {
      updatedSearchParams.set("companionId", newFilters.companionId);
    } else {
      updatedSearchParams.delete("companionId");
    }

    // Handle location
    if (newFilters.location) {
      updatedSearchParams.set("location", newFilters.location);
    } else {
      updatedSearchParams.delete("location");
    }

    // Create the new URL
    const newUrl = `${window.location.pathname}?${updatedSearchParams.toString()}`;
    setOpenMobile(false);
    // Update the URL
    router.push(newUrl);
  };

  // Get current filters from URL
  const currentFilters = getCurrentFilters();

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <NavMain
          initialFilters={currentFilters}
          onFilterChange={handleFilterChange}
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppSidebarContent {...props} />
    </Suspense>
  );
}
