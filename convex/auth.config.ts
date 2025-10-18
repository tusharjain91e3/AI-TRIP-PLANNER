// convex/auth.config.ts
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!, // Your Clerk Issuer URL
      applicationID: "convex", // This must be the exact string "convex"
    },
  ],
} satisfies AuthConfig;