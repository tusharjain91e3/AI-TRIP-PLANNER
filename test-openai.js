import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // load your .env.local file

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testKey() {
  try {
    const models = await client.models.list();
    console.log("✅ API key is working!");
    console.log("Available models:", models.data.slice(0, 3)); // show first 3
  } catch (error) {
    console.error("❌ API key test failed:", error.message);
  }
}

testKey();
