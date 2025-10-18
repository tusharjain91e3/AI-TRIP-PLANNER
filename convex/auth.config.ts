// convex/auth.config.ts
import { AuthConfig } from "convex/server";

const clerkDomain = "https://correct-duckling-27.clerk.accounts.dev";
const applicationIds = [
  "convex",
  "authenticated",
  "default",
  "pk_test_Y29ycmVjdC1kdWNrbGluZy0yNy5jbGVyay5hY2NvdW50cy5kZXYk",
  clerkDomain,
  `${clerkDomain}/`,
] as const;

export default {
  providers: applicationIds.flatMap((appId) => [
    {
      domain: clerkDomain,
      applicationID: appId,
    },
    {
      domain: `${clerkDomain}/`,
      applicationID: appId,
    },
  ]),
} satisfies AuthConfig;