import { v } from "convex/values";
import { internal } from "./_generated/api";
import { ActionCtx, action, internalMutation, query } from "./_generated/server";
import { createApi } from "unsplash-js";
import { Id } from "./_generated/dataModel";

type UnsplashClient = ReturnType<typeof createApi>;

let unsplashApi: UnsplashClient | null = null;

const getUnsplashClient = (): UnsplashClient | null => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn("UNSPLASH_ACCESS_KEY missing; falling back to generated image.");
    return null;
  }

  if (!unsplashApi) {
    unsplashApi = createApi({ accessKey });
  }

  return unsplashApi;
};

const FALLBACK_COLORS = [
  "#0ea5e9",
  "#6366f1",
  "#12b981",
  "#f97316",
  "#ec4899",
  "#14b8a6",
];

const sanitizeLabel = (label: string) =>
  label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildFallbackImage = (prompt: string) => {
  const trimmedPrompt = prompt.trim().slice(0, 40) || "Your Next Adventure";
  const hash = trimmedPrompt
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
  const title = sanitizeLabel(trimmedPrompt);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${color}" stop-opacity="0.6" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#grad)" />
  <g transform="translate(120, 200)">
    <text x="0" y="0" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="72" fill="#ffffff" font-weight="700">
      ${title}
    </text>
    <text x="0" y="140" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="36" fill="#f8fafc" opacity="0.9">
      Adventure awaits • Curated by Travel Planner AI
    </text>
  </g>
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });

  return { blob };
};

const storeImageForPlan = async (
  ctx: ActionCtx,
  planId: Id<"plan">,
  image: Blob
) => {
  const storageId = await ctx.storage.store(image);
  const storedUrl = await ctx.storage.getUrl(storageId);
  const imageUrl = storedUrl;

  if (!imageUrl) {
    console.warn(`Unable to resolve image URL for plan ${planId}`);
    return;
  }

  await ctx.runMutation(internal.images.updateStorageId, {
    storageId,
    planId,
    imageUrl,
  });
};

const writeFallbackImage = async (
  ctx: ActionCtx,
  planId: Id<"plan">,
  prompt: string,
  errorLabel: string,
  error?: unknown
) => {
  if (error) {
    console.error(errorLabel, error);
  } else {
    console.warn(errorLabel);
  }

  const { blob } = buildFallbackImage(prompt);
  await storeImageForPlan(ctx, planId, blob);
};

export const generateAndStore = action({
  args: { prompt: v.string(), planId: v.id("plan") },
  handler: async (ctx, { planId, prompt }) => {
    const targetPrompt = prompt || "";
    const client = getUnsplashClient();

    if (!client) {
      await writeFallbackImage(
        ctx,
        planId,
        targetPrompt,
        "Using generated fallback image due to missing Unsplash credentials."
      );
      return null;
    }

    try {
      const name = targetPrompt.split(",")[0] ?? targetPrompt;
      const imageObject = await client.search.getPhotos({
        query: name,
        page: 1,
        perPage: 1,
      });

      const result = imageObject?.response?.results?.[0];
      const imageSource = result?.urls?.regular;

      if (!result || !imageSource) {
        await writeFallbackImage(
          ctx,
          planId,
          targetPrompt,
          `No Unsplash results found for "${name}"; using fallback image.`
        );
        return null;
      }

      const response = await fetch(imageSource);

      if (!response.ok) {
        throw new Error(`Unsplash fetch failed with status ${response.status}`);
      }

      const image = await response.blob();
      await storeImageForPlan(ctx, planId, image);
      return null;
    } catch (error) {
      await writeFallbackImage(
        ctx,
        planId,
        targetPrompt,
        "Unsplash image generation failed; using fallback image.",
        error
      );
      return null;
    }
  },
});

export const updateStorageId = internalMutation({
  args: {
    storageId: v.id("_storage"),
    planId: v.id("plan"),
    imageUrl: v.string(),
  },
  handler: async (ctx, { storageId, planId, imageUrl }) => {
    const plan = await ctx.db.get(planId);
    await ctx.db.patch(planId, {
      storageId: storageId,
      imageUrl,
      contentGenerationState: {
        ...plan!.contentGenerationState,
        imagination: true,
      },
    });
  },
});

export const getImageUrl = query({
  args: { storageId: v.union(v.id("_storage"), v.null()) },
  handler: async (ctx, { storageId }) => {
    if (storageId === null) return null;
    const id = storageId as Id<"_storage">;
    const url = await ctx.storage.getUrl(id);
    return url;
  },
});
