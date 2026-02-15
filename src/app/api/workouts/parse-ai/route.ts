import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { EXERCISES } from "@/lib/constants/exercises";

const SYSTEM_PROMPT = `You are a workout data parser. Parse workout text in ANY format and extract structured workout data.

EXERCISE NAMES (use EXACTLY these names):
${EXERCISES.map((ex) => ex.name).join(", ")}

OUTPUT FORMAT (JSON only, no markdown):
{
  "workouts": [
    {
      "workoutName": "string (default: 'Imported Workout' or '<first exercise> Day')",
      "date": "YYYY-MM-DD (ISO date string)",
      "type": "strength",
      "exercises": [
        {
          "name": "string (MUST match one of the exercise names above, use fuzzy matching)",
          "sets": [
            {
              "setNumber": 1,
              "reps": 10,
              "weight": 60,
              "weightUnit": "kg" or "lbs"
            }
          ]
        }
      ]
    }
  ]
}

RULES:
1. Extract ALL workouts from the text (can span multiple days/weeks/months)
2. Recognize ANY format: chat logs, WhatsApp messages, notes, structured lists, etc.
3. Detect dates in ANY format (ISO, DD/MM/YY, "Jan 15", "yesterday", etc.)
4. If no date found, use today's date
5. Match exercise names fuzzily to the official list (e.g., "bench" → "Bench Press", "lat pull" → "Lat Pulldown")
6. Extract sets, reps, and weight from patterns like: "3x10 @ 60kg", "10 reps 60kg", "3 sets 10 reps", "60kg x 10", etc.
7. Infer weight unit from context (kg/lbs) or default to "kg"
8. If multiple entries for the same exercise on the same day, combine them (increment setNumber)
9. Ignore noise: system messages, media references, emojis, irrelevant chat
10. Return valid JSON only, no markdown code blocks`;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Parse this workout text and return ONLY valid JSON (no markdown, no code blocks):\n\n${text}`,
      temperature: 0.1,
    });

    // Convert to ReadableStream that the client can consume
    return result.toTextStreamResponse();
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
