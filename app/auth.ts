import {auth} from "@clerk/nextjs/server";

export async function getAuthToken() {
  try {
    const { getToken } = await auth();
    return await getToken({template: "convex"}) ?? undefined;
  } catch (error) {
    console.error("Error fetching auth token:", error);
    return undefined; // Or throw the error if you prefer to propagate it
  }
}
