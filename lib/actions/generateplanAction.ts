"use server";
import { formSchemaType } from "@/components/NewPlanForm";
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getAuthToken } from "@/app/auth";
import { redirect } from "next/navigation";
import { differenceInDays } from "date-fns";

export async function generatePlanAction(formData: formSchemaType) {
  const token = await getAuthToken();
  const { placeName, activityPreferences, datesOfTravel, companion } = formData;

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  let userData: Doc<"users"> | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      userData = await fetchQuery(api.users.currentUser, {}, { token });
      break;
    } catch (error) {
      console.error(
        `[generatePlanAction] Unable to load user profile (attempt ${attempt}/3).`,
        error
      );
      if (attempt < 3) {
        await delay(300 * attempt);
      }
    }
  }

  if (!userData) {
    console.error(
      "[generatePlanAction] Aborting plan creation because user profile could not be retrieved after retries."
    );
    return null;
  }
  const totalCredits = (userData?.credits ?? 0) + (userData?.freeCredits ?? 0);
  if (totalCredits <= 0) {
    console.log(
      `unable to create ai travel plan due to low credits user:${userData?.userId}`
    );
    return null;
  }
  const planId: Id<"plan"> | null = await fetchMutation(
    api.plan.createEmptyPlan,
    {
      placeName,
      noOfDays: (
        differenceInDays(datesOfTravel.to, datesOfTravel.from) + 1
      ).toString(),
      activityPreferences,
      fromDate: datesOfTravel.from.getTime(),
      toDate: datesOfTravel.to.getTime(),
      companion,
      isGeneratedUsingAI: true,
    },
    { token }
  );

  if (planId === null) return null;

  type BackgroundTask =
    | {
        action: "images:generateAndStore";
        actionArgs: { prompt: string; planId: Id<"plan"> };
      }
    | {
        action: "plan:prepareBatch1";
        actionArgs: { planId: Id<"plan"> };
      }
    | {
        action: "plan:prepareBatch2";
        actionArgs: { planId: Id<"plan"> };
      }
    | {
        action: "plan:prepareBatch3";
        actionArgs: { planId: Id<"plan"> };
      };

  const backgroundTasks: BackgroundTask[] = [
    {
      action: "images:generateAndStore",
      actionArgs: {
        prompt: placeName,
        planId: planId,
      },
    },
    {
      action: "plan:prepareBatch1",
      actionArgs: {
        planId: planId,
      },
    },
    {
      action: "plan:prepareBatch2",
      actionArgs: {
        planId: planId,
      },
    },
    {
      action: "plan:prepareBatch3",
      actionArgs: {
        planId: planId,
      },
    },
  ];
  const runInline = async (task: BackgroundTask) => {
    try {
      switch (task.action) {
        case "images:generateAndStore":
          await fetchAction(api.images.generateAndStore, task.actionArgs, {
            token,
          });
          return true;
        case "plan:prepareBatch1":
          await fetchAction(api.plan.prepareBatch1, task.actionArgs, {
            token,
          });
          return true;
        case "plan:prepareBatch2":
          await fetchAction(api.plan.prepareBatch2, task.actionArgs, {
            token,
          });
          return true;
        case "plan:prepareBatch3":
          await fetchAction(api.plan.prepareBatch3, task.actionArgs, {
            token,
          });
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error(
        `[generatePlanAction] Inline execution failed for ${task.action} on plan ${planId}`,
        error
      );
      return false;
    }
  };

  for (const task of backgroundTasks) {
    let scheduled = false;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await fetchMutation(
          api.retrier.runAction,
          {
            action: task.action,
            actionArgs: task.actionArgs,
          },
          { token }
        );
        scheduled = true;
        break;
      } catch (error) {
        console.error(
          `[generatePlanAction] Failed to schedule ${task.action} (attempt ${attempt}/${maxAttempts}) for plan ${planId}`,
          error
        );
        if (attempt < maxAttempts) {
          await delay(250 * attempt);
        }
      }
    }

    if (!scheduled) {
      const inlined = await runInline(task);
      if (!inlined) {
        console.warn(
          `[generatePlanAction] Unable to schedule or inline ${task.action} for plan ${planId}`
        );
      }
    }
  }

  await fetchMutation(api.users.reduceUserCreditsByOne, {}, { token });
  redirect(`/plans/${planId}/plan?isNewPlan=true`);
}
