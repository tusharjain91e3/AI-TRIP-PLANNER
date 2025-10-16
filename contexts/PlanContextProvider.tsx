"use client";
import { Doc } from "@/convex/_generated/dataModel";
import usePlan from "@/hooks/usePlan";
import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  Suspense,
} from "react";

import AccessDenied from "@/components/plan/AccessDenied";

type planStateType = Doc<"plan">["contentGenerationState"] & {
  weather: boolean;
};

type PlanContextType = {
  planState: planStateType;
  setPlanState: Dispatch<SetStateAction<planStateType>>;
  shouldShowAlert: boolean;
  plan:
    | (Doc<"plan"> & { isSharedPlan: boolean } & Pick<
          Doc<"planSettings">,
          | "activityPreferences"
          | "companion"
          | "fromDate"
          | "toDate"
          | "isPublished"
        >)
    | null
    | undefined;
  isLoading: boolean;
};

const defaultPlanState: planStateType = {
  imagination: false,
  abouttheplace: false,
  adventuresactivitiestodo: false,
  topplacestovisit: false,
  itinerary: false,
  localcuisinerecommendations: false,
  packingchecklist: false,
  besttimetovisit: false,
  weather: false,
};

const PlanContext = createContext<PlanContextType | undefined>({
  planState: defaultPlanState,
  setPlanState: () => {},
  shouldShowAlert: false,
  plan: undefined,
  isLoading: false,
});

export const usePlanContext = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlanContext must be used within a PlanContextProvider");
  }
  return context;
};

const PlanContextProviderContent = ({
  children,
  planId,
  isPublic,
}: {
  children: React.ReactNode;
  planId: string;
  isPublic: boolean;
}) => {
  const [planState, setPlanState] = useState<planStateType>(defaultPlanState);

  const isNewPlan = false; // Default to false since useSearchParams is removed

  const { shouldShowAlert, plan, isLoading, error } = usePlan(
    planId,
    isNewPlan,
    isPublic
  );

  useEffect(() => {
    if (isLoading || !plan) return;

    setPlanState((state) => ({
      ...plan.contentGenerationState,
      weather: state.weather,
    }));
  }, [plan]);

  return (
    <PlanContext.Provider
      value={{ planState, shouldShowAlert, plan, isLoading, setPlanState }}
    >
      {error ? <AccessDenied /> : children}
    </PlanContext.Provider>
  );
};

const PlanContextProvider = ({
  children,
  planId,
  isPublic,
}: {
  children: React.ReactNode;
  planId: string;
  isPublic: boolean;
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanContextProviderContent planId={planId} isPublic={isPublic}>
        {children}
      </PlanContextProviderContent>
    </Suspense>
  );
};

export default PlanContextProvider;
