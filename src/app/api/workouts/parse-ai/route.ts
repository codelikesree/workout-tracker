import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { EXERCISES } from "@/lib/constants/exercises";

const SYSTEM_PROMPT = `You are a workout data parser. Extract ALL workouts from the text and return ONLY valid JSON.

EXERCISE NAMES - use fuzzy matching to these exact names:
${EXERCISES.map((ex) => ex.name).join(", ")}

OUTPUT JSON SCHEMA:
{
  "workouts": [
    {
      "workoutName": "Chest Day",
      "date": "2025-06-08",
      "type": "strength",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": [
            {"setNumber": 1, "reps": 10, "weight": 60, "weightUnit": "kg"}
          ]
        }
      ]
    }
  ]
}

RULES:
- Extract ALL workout dates from text (DD/MM/YY, "June 8", etc)
- Match exercises to names above (e.g., "BP" → "Bench Press", "Lat pull" → "Lat Pulldown")
- Parse sets: "3x10 @ 60kg" = 3 sets, "10*3" = 3 sets, etc.
- Ignore noise: timestamps, emojis, stickers, system messages
- Return ONLY JSON, no markdown`;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate JSON response from AI
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Extract all workouts from this text and return ONLY the JSON object with no extra text:\n\n${text}`,
      temperature: 0,
    });

    // Clean and parse response
    let jsonText = result.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*\n/, "")
        .replace(/\n```\s*$/, "")
        .trim();
    }

    // Parse and validate JSON
    const parsed = JSON.parse(jsonText);

    if (!parsed.workouts || !Array.isArray(parsed.workouts)) {
      throw new Error("AI returned invalid structure - missing workouts array");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Handle rate limit errors
    if (
      error instanceof Error &&
      (error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("rate limit"))
    ) {
      return new Response(
        JSON.stringify({
          error:
            "AI service rate limit exceeded. Please try again in a few moments.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle other API errors
    if (error instanceof Error && error.message.includes("API key")) {
      return new Response(
        JSON.stringify({
          error: "AI service configuration error. Please contact support.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.error("AI parsing error:", error);

    // Better error message for JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return new Response(
        JSON.stringify({
          error: "AI returned invalid JSON. The data might be too large or complex. Try with less data.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Failed to parse workout data. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
