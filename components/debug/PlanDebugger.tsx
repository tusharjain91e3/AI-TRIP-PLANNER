"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
    
/**
 * Debug Component to visualize the data flow and plan generation state
 * Shows real-time updates as AI generates content
 */
export function PlanDebugger({ planId }: { planId: string }) {
  const { user, isSignedIn, isLoaded } = useUser();
  
  // Real-time query that updates automatically
  const plan = useQuery(
    api.plan.getSinglePlan,
    isSignedIn ? { id: planId as any, isPublic: false } : "skip"
  );

  if (!isLoaded) {
    return <div className="p-4 text-muted-foreground">Loading auth...</div>;
  }

  if (!isSignedIn) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Not Authenticated</CardTitle>
          <CardDescription>Please sign in to view plan data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Plan Data...</CardTitle>
          <CardDescription>Fetching from Convex...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { contentGenerationState } = plan;

  const sections = [
    { key: "imagination", label: "Image", value: plan.imageUrl },
    { key: "abouttheplace", label: "About", value: plan.abouttheplace },
    { key: "besttimetovisit", label: "Best Time", value: plan.besttimetovisit },
    { key: "adventuresactivitiestodo", label: "Activities", value: plan.adventuresactivitiestodo },
    { key: "topplacestovisit", label: "Top Places", value: plan.topplacestovisit },
    { key: "itinerary", label: "Itinerary", value: plan.itinerary },
    { key: "localcuisinerecommendations", label: "Cuisine", value: plan.localcuisinerecommendations },
    { key: "packingchecklist", label: "Packing", value: plan.packingchecklist },
  ];

  const completedCount = Object.values(contentGenerationState).filter(Boolean).length;
  const totalCount = Object.keys(contentGenerationState).length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plan Generation Status</CardTitle>
            <CardDescription className="mt-1">
              {plan.nameoftheplace} - Real-time updates from Convex
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{progress}%</div>
            <div className="text-xs text-muted-foreground">
              {completedCount} of {totalCount} complete
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((section) => {
          const isComplete = contentGenerationState[section.key as keyof typeof contentGenerationState];
          const hasContent = Array.isArray(section.value) 
            ? section.value.length > 0 
            : Boolean(section.value);

          return (
            <div
              key={section.key}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                )}
                <div>
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {isComplete ? (
                      hasContent ? (
                        <span className="text-green-600">✓ Generated</span>
                      ) : (
                        <span className="text-orange-600">⚠ Empty</span>
                      )
                    ) : (
                      <span className="text-yellow-600">⏳ Generating...</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge variant={isComplete ? "default" : "secondary"}>
                {isComplete ? "Complete" : "Processing"}
              </Badge>
            </div>
          );
        })}

        {/* User Info */}
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-1">
          <div><strong>User:</strong> {user.emailAddresses[0]?.emailAddress}</div>
          <div><strong>Plan ID:</strong> {planId}</div>
          <div><strong>AI Generated:</strong> {plan.isGeneratedUsingAI ? "Yes" : "No"}</div>
          <div><strong>Shared Plan:</strong> {plan.isSharedPlan ? "Yes" : "No"}</div>
        </div>
      </CardContent>
    </Card>
  );
}
