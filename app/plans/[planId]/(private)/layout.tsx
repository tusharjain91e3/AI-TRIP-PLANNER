import {getAuthToken} from "@/app/auth";
import Header from "@/components/plan/Header";
import PlanLayoutContent from "@/components/plan/PlanLayoutContent";
import Progress from "@/components/Progress";
import {Toaster} from "@/components/ui/toaster";
import {api} from "@/convex/_generated/api";
import {Id} from "@/convex/_generated/dataModel";
import {Analytics} from "@vercel/analytics/react";
import {fetchQuery} from "convex/nextjs";
import {Metadata, ResolvingMetadata} from "next";
import {ReactNode} from "react";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{planId: string}>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const {planId} = await params;
  const token = await getAuthToken();

  try {
    const plan = await fetchQuery(
      api.plan.getSinglePlan,
      {id: planId as Id<"plan">, isPublic: false},
      {token}
    );
    return {
      title: plan ? plan.nameoftheplace : "Your Plan",
    };
  } catch (error) {
    return {
      title: "Unauthorized Access!",
    };
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{planId: string}>;
}) {
  const {planId} = await params;
  return (
    <>
      <Header isPublic={false} />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center bg-blue-50/40 dark:bg-background">
        <PlanLayoutContent planId={planId} isPublic={false}>
          {children}
        </PlanLayoutContent>
        <Progress />
        <Analytics />
        <Toaster />
      </main>
    </>
  );
}
