import {
  batch1Schema,
  batch2Schema,
  batch3Schema
} from "./schemas";

import OpenAI from "openai";

// Lazy initialization pattern for OpenAI client
let openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (openai) {
    return openai;
  }
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not configured. " +
      "Please check your Convex environment variables in the dashboard."
    );
  }
  
  if (apiKey.trim() === "") {
    throw new Error(
      "OPENAI_API_KEY environment variable is empty. " +
      "Please set a valid API key in your Convex environment variables."
    );
  }
  
  // Validate API key format (starts with 'sk-')
  if (!apiKey.startsWith('sk-')) {
    console.warn("OPENAI_API_KEY may be malformed - expected to start with 'sk-'");
  }
  
  openai = new OpenAI({ 
    apiKey,
    timeout: 30000, // 30 second timeout
    maxRetries: 3,
  });
  
  return openai;
};

const promptSuffix = `Generate travel data according to the schema in JSON format.
Do not return anything in your response outside of curly braces. 
Generate response as per the function schema provided. 
Dates given, activity preference and travelling companion may influence like 50% while generating plan.`;

// Robust API call function with error handling
const callOpenAIApi = async (prompt: string, schema: any, description: string) => {
  try {
    const client = getOpenAIClient();
    
    console.log("Calling OpenAI API with prompt:", prompt.substring(0, 200) + "...");
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful travel assistant. Always respond with valid JSON matching the provided schema." 
        },
        { role: "user", content: prompt },
      ],
      functions: [{ 
        name: "set_travel_details", 
        parameters: schema, 
        description 
      }],
      function_call: { name: "set_travel_details" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!response.choices?.[0]?.message?.function_call?.arguments) {
      throw new Error("OpenAI response missing function call arguments");
    }

    return response;
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
    
    throw new Error("OpenAI API call failed with unknown error");
  }
}

// Type definitions
type OpenAIInputType = {
  userPrompt: string;
  activityPreferences?: string[];
  fromDate?: number;
  toDate?: number;
  companion?: string;
};

// Batch 1 generator
export const generatebatch1 = async (promptText: string) => {
  const prompt = `${promptText}. ${promptSuffix}`;
  const description = `Generate information about a place or location according to the schema:

- About the Place: A string containing information about the place (minimum 50 words)
- Best Time to Visit: A string specifying the best time to visit

Ensure the response adheres exactly to the schema and is in valid JSON format.`;

  return await callOpenAIApi(prompt, batch1Schema, description);
}

// Batch 2 generator
export const generatebatch2 = async (inputParams: OpenAIInputType) => {
  const description = `Generate recommendations for an adventurous trip:

- Top Adventures Activities: Array of 5+ activities with locations
- Local Cuisine Recommendations: Array of local food recommendations  
- Packing Checklist: Array of packing items

Ensure the response adheres exactly to the schema and is in valid JSON format.`;

  return await callOpenAIApi(getPrompt(inputParams), batch2Schema, description);
}

// Batch 3 generator  
export const generatebatch3 = async (inputParams: OpenAIInputType) => {
  const description = `Generate a travel itinerary and top places:

- Itinerary: Array of daily itineraries with morning/afternoon/evening activities
- Top Places to Visit: Array of places with names and coordinates

Ensure the response adheres exactly to the schema and is in valid JSON format.`;

  return await callOpenAIApi(getPrompt(inputParams), batch3Schema, description);
}

// Improved prompt builder
const getPrompt = ({ 
  userPrompt, 
  activityPreferences, 
  companion, 
  fromDate, 
  toDate 
}: OpenAIInputType): string => {
  let prompt = userPrompt;

  // Add date information if available
  if (fromDate && toDate) {
    const fromDateStr = new Date(fromDate).toLocaleDateString();
    const toDateStr = new Date(toDate).toLocaleDateString();
    prompt += ` Travel dates: ${fromDateStr} to ${toDateStr}.`;
  }

  // Add companion information if available
  if (companion && companion.trim().length > 0) {
    prompt += ` Travelling with: ${companion.trim()}.`;
  }

  // Add activity preferences if available
  if (activityPreferences && activityPreferences.length > 0) {
    const activities = activityPreferences.filter(a => a && a.trim().length > 0);
    if (activities.length > 0) {
      prompt += ` Activity preferences: ${activities.join(", ")}.`;
    }
  }

  prompt += ` ${promptSuffix}`;
  return prompt;
}