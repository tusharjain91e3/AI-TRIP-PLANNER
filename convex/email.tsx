"use node";
import { ConvexError, v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Resend } from "resend";
import InviteEmail from "./InviteEmail";
import React from "react";
import { getIdentityOrThrow } from "./utils";
// import { rateLimiter } from "./rateLimit";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new ConvexError(
    "Missing RESEND_API_KEY environment variable. Please set it in your Convex dashboard."
  );
}

const resend = new Resend(resendApiKey);

export const sendInvite = action({
  args: { planId: v.id("plan"), email: v.string() },
  async handler(ctx, args) {
    const identity = await getIdentityOrThrow(ctx);
    const { subject } = identity;
    if (!subject) return;
    // Rate limiting commented out
    // const status = await rateLimiter.check(ctx, "sendEmailInvite", {
    //   key: subject,
    // });
    // console.log({
    //   rateLimitStatus: status,
    //   userId: subject,
    //   planId: args.planId,
    // });
    // await rateLimiter.limit(ctx, "sendEmailInvite", {
    //   key: subject,
    //   throws: true,
    // });

    const result = await ctx.runQuery(api.plan.PlanAdmin, {
      planId: args.planId,
    });

    if (!result || !result.isPlanAdmin) {
      console.log(
        `${subject} is not plan admin of ${args.planId} to invite others`
      );
      throw new ConvexError("You must be a plan admin to invite others");
    }

    const { token, id } = await ctx.runMutation(api.token.createToken, {
      planId: args.planId,
      email: args.email,
    });
//todo
    const BASE_URL = process.env.HOSTING_URL ?? "https://travelplannerai.site";

    const { data, error } = await resend.emails.send({
      from: "Travel Planner AI <onboarding@resend.dev>",
      to: args.email,
      subject: `You've been invited to join a travel plan`,
      react: (
        <InviteEmail
          projectName={result.planName!}
          inviteLink={`${BASE_URL}/dashboard/join?token=${token}`}
        />
      ),
    });

    if (error) {
      await ctx.runMutation(api.token.deletInvite, { id });
      console.log({ error });
      throw new ConvexError({
        message: error.message,
      });
    }
  },
});
