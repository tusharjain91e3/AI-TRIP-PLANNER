import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "./_generated/dataModel";

export const paginatedPublishedPlans = query({
  args: {
    companion: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { companion, paginationOpts }) => {
    try {
      let paginatedPlanSettings: PaginationResult<Doc<"planSettings">>;
      if (companion) {
        paginatedPlanSettings = await ctx.db
          .query("planSettings")
          .withIndex("by_isPublished_companion_creationTime", (q) =>
            q.eq("isPublished", true).eq("companion", companion)
          )
          .paginate(paginationOpts);
      } else {
        paginatedPlanSettings = await ctx.db
          .query("planSettings")
          .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
          .paginate(paginationOpts);
      }

      const pageOfSettings = paginatedPlanSettings.page;

      const plans = await Promise.all(
        pageOfSettings.map(async (setting) => {
          const plan = await ctx.db.get(setting.planId);
          if (plan === null) {
            return null;
          }
          return {
            ...plan,
            isSharedPlan: false,
            fromDate: setting?.fromDate,
            toDate: setting?.toDate,
          };
        })
      );

      const validPlans = plans.filter(Boolean);

      return { ...paginatedPlanSettings, page: validPlans };
    } catch (error: any) {
      console.error("Error in paginatedPublishedPlans:", error);
      throw new Error(`Error in paginatedPublishedPlans: ${error.message}`);
    }
  },
});