import Plan from "@/components/plan/Plan";
import { PlanDebugger } from "@/components/debug/PlanDebugger";

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams?: Promise<{ isNewPlan?: string }>;
}) {
  const { planId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const isNewPlan = resolvedSearchParams?.isNewPlan
    ? resolvedSearchParams.isNewPlan === "true" || resolvedSearchParams.isNewPlan === "1"
    : false;
  
  return (
    <div className="space-y-4">
      {/* Debug panel - remove this after testing */}
      <PlanDebugger planId={planId} />
      
      <Plan planId={planId} isNewPlan={isNewPlan} isPublic={false} />
    </div>
  );
}
