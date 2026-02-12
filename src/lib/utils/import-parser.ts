import { EXERCISES } from "@/lib/constants/exercises";

interface ParsedExercise {
  name: string;
  sets: Array<{
    setNumber: number;
    reps: number;
    weight: number;
    weightUnit: "kg" | "lbs";
  }>;
}

interface ParsedWorkout {
  workoutName: string;
  date: Date;
  type: "strength" | "cardio" | "flexibility" | "hiit" | "sports" | "other";
  exercises: ParsedExercise[];
}

// ─── Exercise name index ───────────────────────────────────────────────

const exerciseIndex = new Map<string, string>();
for (const ex of EXERCISES) {
  exerciseIndex.set(ex.name.toLowerCase(), ex.name);
}

// Short aliases (first word >= 4 chars)
const exerciseAliases = new Map<string, string>();
for (const ex of EXERCISES) {
  const lower = ex.name.toLowerCase();
  const firstWord = lower.split(" ")[0];
  if (firstWord.length >= 4 && !exerciseAliases.has(firstWord)) {
    exerciseAliases.set(firstWord, ex.name);
  }
}

// Pre-compute for fuzzy matching
const exerciseNames = EXERCISES.map((ex) => ex.name);

// ─── Common gym abbreviations / slang ─────────────────────────────────

const gymAbbreviations = new Map<string, string>([
  // Bicep variations
  ["biceps curl", "Dumbbell Curl"],
  ["bicep curl", "Dumbbell Curl"],
  ["bies bar", "EZ Bar Curl"],
  ["bies preacher bar", "Preacher Curl"],
  ["bies preacher", "Preacher Curl"],
  ["preacher bar", "Preacher Curl"],

  // Tricep variations
  ["tries push down", "Tricep Pushdown"],
  ["tries pushdown", "Tricep Pushdown"],
  ["tri push down", "Tricep Pushdown"],
  ["tri pushdown", "Tricep Pushdown"],
  ["tries machine", "Tricep Extension Machine"],
  ["tri machine", "Tricep Extension Machine"],

  // Shoulder
  ["sh press", "Shoulder Press"],
  ["shoulder press db", "Dumbbell Shoulder Press"],
  ["lat raise db", "Dumbbell Lateral Raise"],
  ["lat raise", "Lateral Raise"],

  // Chest
  ["bp", "Bench Press"],
  ["db chest press", "Dumbbell Bench Press"],
  ["up b press", "Incline Bench Press"],
  ["chest fly", "Chest Fly"],

  // Back
  ["lat pull", "Lat Pulldown"],
  ["lat pulldown", "Lat Pulldown"],
  ["low row", "Seated Cable Row"],

  // Legs
  ["stand leg curl", "Standing Leg Curl"],
  ["standing leg curl", "Standing Leg Curl"],
  ["sit down curl", "Seated Leg Curl"],
  ["seated curl", "Seated Leg Curl"],
  ["lie down curl", "Lying Leg Curl"],
  ["lying curl", "Lying Leg Curl"],
  ["rear kick", "Glute Kickback"],
  ["glute kick", "Glute Kickback"],
  ["leg ext", "Leg Extension"],

  // Core
  ["abs", "Ab Crunch Machine"],

  // Compound / shorthand
  ["hammer", "Hammer Curl"],
  ["hammers", "Hammer Curl"],
]);

// ─── Fuzzy matching ─────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

function fuzzyMatchExercise(candidate: string): string | null {
  const lower = candidate.toLowerCase().trim();
  if (lower.length < 3) return null;

  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const name of exerciseNames) {
    const nameLower = name.toLowerCase();
    const maxAllowed = Math.min(Math.ceil(nameLower.length * 0.3), 4);

    if (Math.abs(lower.length - nameLower.length) > maxAllowed) continue;

    const dist = levenshtein(lower, nameLower);
    if (dist < bestDistance && dist <= maxAllowed) {
      bestDistance = dist;
      bestMatch = name;
    }
  }

  return bestMatch;
}

function extractExerciseCandidate(line: string): string {
  let cleaned = line.replace(/^[\s\-•*#>]+/, "");
  cleaned = cleaned.replace(/^\d+[.)]\s*/, "");

  // Remove everything after workout data patterns
  cleaned = cleaned.replace(/\s*:?\s*\d+\s*[x×*]\s*\d+.*$/i, "");
  cleaned = cleaned.replace(/\s*:?\s*\d+\s*(?:sets?|reps?|kg|lbs?|mins?|min|cal).*$/i, "");
  cleaned = cleaned.replace(/\s*:?\s*\d+(?:\.\d+)?\s*(?:kg|lbs?)\s*.*$/i, "");
  // Strip trailing numbers (weight values etc.)
  cleaned = cleaned.replace(/\s+\d[\d\s./x×*@]*$/, "");

  return cleaned.trim();
}

// ─── Chat line cleaning ─────────────────────────────────────────────────

/**
 * Strip WhatsApp / chat prefixes from lines:
 * - [DD/MM/YY, HH:MM:SS AM/PM] Name: ...
 * - [YYYY-MM-DD, HH:MM:SS] Name: ...
 * - HH:MM - Name: ...
 * Returns the text content after the prefix.
 */
function stripChatPrefix(line: string): string {
  // WhatsApp: [02/11/25, 11:39:28 AM] S:
  let cleaned = line.replace(
    /^\[[\d/\-.,:\s]+(?:AM|PM)?\]\s*[^:]*:\s*/i,
    ""
  );
  // Generic: "HH:MM - Name: " or "Name: " at start (only if short name ≤ 20 chars)
  if (cleaned === line) {
    cleaned = line.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*[-–]\s*[^:]{1,20}:\s*/, "");
  }
  return cleaned;
}

// ─── Date extraction ───────────────────────────────────────────────────

function parseDateFromLine(line: string): Date | null {
  const lower = line.toLowerCase();

  // Relative dates
  if (/\byesterday\b/.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (/\btoday\b/.test(lower)) {
    return new Date();
  }

  // WhatsApp timestamp: [DD/MM/YY, ...] — extract the year for short dates
  let hintYear = new Date().getFullYear();
  const whatsappMatch = line.match(/\[(\d{1,2})[/](\d{1,2})[/](\d{2,4})/);
  if (whatsappMatch) {
    let year = parseInt(whatsappMatch[3]);
    if (year < 100) year += 2000;
    hintYear = year;
  }

  // After stripping chat prefix, check for text dates
  const text = stripChatPrefix(line);

  // ISO format: 2024-01-15, 2024/01/15
  const isoMatch = text.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const d = new Date(
      parseInt(isoMatch[1]),
      parseInt(isoMatch[2]) - 1,
      parseInt(isoMatch[3])
    );
    if (!isNaN(d.getTime())) return d;
  }

  // DD/MM/YY or DD/MM/YYYY (non-bracketed, 2 or 4 digit year)
  const dmyMatch = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (dmyMatch) {
    let year = parseInt(dmyMatch[3]);
    if (year < 100) year += 2000;
    // Disambiguate DD/MM vs MM/DD: if first > 12, it's DD/MM
    const a = parseInt(dmyMatch[1]);
    const b = parseInt(dmyMatch[2]);
    let day: number, month: number;
    if (a > 12) {
      day = a;
      month = b;
    } else if (b > 12) {
      day = b;
      month = a;
    } else {
      // Ambiguous — assume DD/MM (international)
      day = a;
      month = b;
    }
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Month name with year: Jan 15, 2024 / January 15 2024
  const writtenMatch = text.match(
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.]+(\d{1,2})[\s,]+(\d{4})/i
  );
  if (writtenMatch) {
    const d = new Date(`${writtenMatch[1]} ${writtenMatch[2]}, ${writtenMatch[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Day month with year: 15 Jan 2024
  const writtenMatch2 = text.match(
    /(\d{1,2})[\s]+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+(\d{4})/i
  );
  if (writtenMatch2) {
    const d = new Date(`${writtenMatch2[2]} ${writtenMatch2[1]}, ${writtenMatch2[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Short date: "Nov 1", "Jan 15", "December 25" (no year — assume current year)
  const shortMonthFirst = text.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.]+(\d{1,2})\b/i
  );
  if (shortMonthFirst) {
    // Make sure this isn't just a number in the middle of exercise data
    const afterMatch = text.substring(
      (shortMonthFirst.index ?? 0) + shortMonthFirst[0].length
    );
    // If what follows is exercise data (has x/* patterns), this is probably not a date
    if (!/\d+\s*[x×*]\s*\d+/.test(afterMatch) || afterMatch.trim().length < 3) {
      const d = new Date(
        `${shortMonthFirst[1]} ${shortMonthFirst[2]}, ${hintYear}`
      );
      if (!isNaN(d.getTime())) return d;
    }
  }

  const shortDayFirst = text.match(
    /\b(\d{1,2})[\s]+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i
  );
  if (shortDayFirst) {
    const afterMatch = text.substring(
      (shortDayFirst.index ?? 0) + shortDayFirst[0].length
    );
    if (!/\d+\s*[x×*]\s*\d+/.test(afterMatch) || afterMatch.trim().length < 3) {
      const d = new Date(
        `${shortDayFirst[2]} ${shortDayFirst[1]}, ${hintYear}`
      );
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// ─── Exercise matching ──────────────────────────────────────────────────

function findExerciseInLine(line: string): string | null {
  const lower = line.toLowerCase();
  // Normalize multiple spaces to single for abbreviation matching
  const normalized = lower.replace(/\s+/g, " ");

  // 1. Check gym abbreviations first (longest wins)
  let bestAbbrev: string | null = null;
  let bestAbbrevLen = 0;
  for (const [abbrev, canonical] of gymAbbreviations) {
    if (normalized.includes(abbrev) && abbrev.length > bestAbbrevLen) {
      bestAbbrev = canonical;
      bestAbbrevLen = abbrev.length;
    }
  }
  if (bestAbbrev) return bestAbbrev;

  // 2. Exact match against exercise database (longest match wins)
  let bestMatch: string | null = null;
  let bestLength = 0;

  for (const [lowerName, canonical] of exerciseIndex) {
    if (lower.includes(lowerName) && lowerName.length > bestLength) {
      bestMatch = canonical;
      bestLength = lowerName.length;
    }
  }
  if (bestMatch) return bestMatch;

  // 3. Alias match (first-word)
  for (const [alias, canonical] of exerciseAliases) {
    const regex = new RegExp(`\\b${alias}\\b`, "i");
    if (regex.test(lower)) {
      return canonical;
    }
  }

  // 4. Fuzzy match on extracted candidate name
  const candidate = extractExerciseCandidate(line);
  if (candidate.length >= 3) {
    // Also check abbreviations with fuzzy on the candidate
    for (const [abbrev, canonical] of gymAbbreviations) {
      if (abbrev.length >= 3) {
        const dist = levenshtein(candidate.toLowerCase(), abbrev);
        if (dist <= Math.min(Math.ceil(abbrev.length * 0.3), 3)) {
          return canonical;
        }
      }
    }

    const fuzzy = fuzzyMatchExercise(candidate);
    if (fuzzy) return fuzzy;

    // Try progressively shorter word substrings
    const words = candidate.split(/\s+/);
    if (words.length > 1) {
      for (let len = words.length; len >= 1; len--) {
        const sub = words.slice(0, len).join(" ");
        const match = fuzzyMatchExercise(sub);
        if (match) return match;
      }
    }
  }

  return null;
}

// ─── Number / set parsing ───────────────────────────────────────────────

function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

function parseExerciseLine(
  exerciseName: string,
  line: string
): ParsedExercise | null {
  const lower = line.toLowerCase();
  const hasKg = /\bkg\b/.test(lower);
  const hasLbs = /\blbs?\b/.test(lower);
  const weightUnit: "kg" | "lbs" = hasLbs ? "lbs" : "kg";

  // Remove the exercise name to get just the numbers part
  const nameLower = exerciseName.toLowerCase();
  let afterNameStart = -1;

  // Try canonical name first
  const canonIdx = lower.indexOf(nameLower);
  if (canonIdx >= 0) {
    afterNameStart = canonIdx + nameLower.length;
  } else {
    // Try abbreviation that matched (normalize spaces for matching)
    const normalized = lower.replace(/\s+/g, " ");
    for (const [abbrev, canonical] of gymAbbreviations) {
      if (canonical === exerciseName) {
        const idx = normalized.indexOf(abbrev);
        if (idx >= 0) {
          // Find the corresponding position in the original string
          // by counting characters (spaces may differ)
          let origPos = 0;
          let normPos = 0;
          while (normPos < idx + abbrev.length && origPos < lower.length) {
            if (normalized[normPos] === lower[origPos]) {
              normPos++;
              origPos++;
            } else {
              // extra space in original
              origPos++;
            }
          }
          afterNameStart = origPos;
          break;
        }
      }
    }
  }

  let afterName =
    afterNameStart >= 0 ? line.substring(afterNameStart) : line;

  // Strip noise words that break number extraction
  afterName = afterName.replace(/\b(?:each|per\s*side|per\s*arm|per\s*leg)\b/gi, " ");

  // Pattern: SetsxReps @ Weight (e.g., "3x10 @ 60kg", "3×10@60", "3*10 @ 60")
  // Require at least a space or @ between the AxB and the weight to prevent
  // backtracking from splitting "12" into "1" and "2"
  const sxrwMatch = afterName.match(
    /(\d+)\s*[x×*]\s*(\d+)(?:\s*@\s*|\s+at\s+|\s+)(\d+(?:\.\d+)?)/i
  );
  if (sxrwMatch) {
    const a = parseInt(sxrwMatch[1]);
    const b = parseInt(sxrwMatch[2]);
    const weight = parseFloat(sxrwMatch[3]);
    const [numSets, reps] =
      a <= b ? [a, b] : a <= 10 ? [a, b] : [b, a];
    return {
      name: exerciseName,
      sets: Array.from({ length: numSets }, (_, i) => ({
        setNumber: i + 1,
        reps,
        weight,
        weightUnit,
      })),
    };
  }

  // Pattern: Weight then AxB (e.g., "16 10*3", "15 3*12")
  // Weight is separated by space from the AxB
  const weightFirstMatch = afterName.match(
    /(\d+(?:\.\d+)?)\s+(\d+)\s*[x×*]\s*(\d+)/i
  );
  if (weightFirstMatch) {
    const weight = parseFloat(weightFirstMatch[1]);
    const a = parseInt(weightFirstMatch[2]);
    const b = parseInt(weightFirstMatch[3]);
    // Disambiguate: smaller value is sets (gym convention)
    const [numSets, reps] = a <= b ? [a, b] : [b, a];
    // Extra check: if both could be sets (both ≤ 10), prefer the second as sets
    // since "10*3" typically means "10 reps × 3 sets"
    const finalSets = numSets <= 10 ? numSets : Math.min(a, b);
    const finalReps = numSets <= 10 ? reps : Math.max(a, b);
    return {
      name: exerciseName,
      sets: Array.from({ length: finalSets }, (_, i) => ({
        setNumber: i + 1,
        reps: finalReps,
        weight,
        weightUnit,
      })),
    };
  }

  // Pattern: SetsxReps without weight (e.g., "3x10", "3*10")
  const sxrMatch = afterName.match(/(\d+)\s*[x×*]\s*(\d+)/i);
  if (sxrMatch) {
    const a = parseInt(sxrMatch[1]);
    const b = parseInt(sxrMatch[2]);
    const [numSets, reps] = a <= b ? [a, b] : [b, a];
    // Look for a weight number after the SxR
    const rest = afterName.substring(
      afterName.indexOf(sxrMatch[0]) + sxrMatch[0].length
    );
    const weightMatch = rest.match(/(\d+(?:\.\d+)?)\s*(?:kg|lbs?)?/i);
    const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;
    return {
      name: exerciseName,
      sets: Array.from({ length: numSets }, (_, i) => ({
        setNumber: i + 1,
        reps,
        weight,
        weightUnit,
      })),
    };
  }

  // Pattern: Weight x Reps (e.g., "80kg x 10", "60 x 8")
  const wxrMatch = afterName.match(
    /(\d+(?:\.\d+)?)\s*(?:kg|lbs?)?\s*[x×*]\s*(\d+)/i
  );
  if (wxrMatch) {
    const weight = parseFloat(wxrMatch[1]);
    const reps = parseInt(wxrMatch[2]);
    return {
      name: exerciseName,
      sets: [{ setNumber: 1, reps, weight, weightUnit }],
    };
  }

  // Pattern: descriptive — "3 sets of 10 reps at 80kg"
  const descriptiveMatch = afterName.match(
    /(\d+)\s*sets?\s*(?:of\s*)?(\d+)\s*reps?\s*(?:@|at|with)?\s*(\d+(?:\.\d+)?)?/i
  );
  if (descriptiveMatch) {
    const numSets = parseInt(descriptiveMatch[1]);
    const reps = parseInt(descriptiveMatch[2]);
    const weight = descriptiveMatch[3] ? parseFloat(descriptiveMatch[3]) : 0;
    return {
      name: exerciseName,
      sets: Array.from({ length: numSets }, (_, i) => ({
        setNumber: i + 1,
        reps,
        weight,
        weightUnit,
      })),
    };
  }

  // Pattern: just "N reps at Wkg" (single set)
  const repsWeightMatch = afterName.match(
    /(\d+)\s*reps?\s*(?:@|at|with)?\s*(\d+(?:\.\d+)?)\s*(?:kg|lbs?)?/i
  );
  if (repsWeightMatch) {
    return {
      name: exerciseName,
      sets: [
        {
          setNumber: 1,
          reps: parseInt(repsWeightMatch[1]),
          weight: parseFloat(repsWeightMatch[2]),
          weightUnit,
        },
      ],
    };
  }

  // Fallback: extract all numbers and apply heuristics
  const numbers = extractNumbers(afterName);
  if (numbers.length === 0) return null;

  if (numbers.length === 1) {
    const n = numbers[0];
    if (hasKg || hasLbs || n >= 20) {
      return {
        name: exerciseName,
        sets: [{ setNumber: 1, reps: 0, weight: n, weightUnit }],
      };
    }
    return {
      name: exerciseName,
      sets: [{ setNumber: 1, reps: n, weight: 0, weightUnit }],
    };
  }

  if (numbers.length === 2) {
    const [a, b] = numbers;
    if (hasKg || hasLbs) {
      return {
        name: exerciseName,
        sets: [
          {
            setNumber: 1,
            reps: Math.min(a, b),
            weight: Math.max(a, b),
            weightUnit,
          },
        ],
      };
    }
    if (a <= 10 && b > a) {
      return {
        name: exerciseName,
        sets: Array.from({ length: a }, (_, i) => ({
          setNumber: i + 1,
          reps: b,
          weight: 0,
          weightUnit,
        })),
      };
    }
    return {
      name: exerciseName,
      sets: [{ setNumber: 1, reps: a, weight: b, weightUnit }],
    };
  }

  if (numbers.length >= 3) {
    const [a, b, c] = numbers;
    const sets = a <= 10 ? a : 1;
    const reps = a <= 10 ? b : a;
    const weight = a <= 10 ? c : b;
    return {
      name: exerciseName,
      sets: Array.from({ length: sets }, (_, i) => ({
        setNumber: i + 1,
        reps,
        weight,
        weightUnit,
      })),
    };
  }

  return null;
}

// ─── Line filtering ─────────────────────────────────────────────────────

/**
 * Check if a line is irrelevant chat noise (group actions, media, etc.)
 */
function isNoiseLine(line: string): boolean {
  const lower = line.toLowerCase();
  // WhatsApp system messages
  if (/changed this group|added you|left the group|created group|changed the subject|changed the description|messages and calls are end-to-end encrypted|you changed|‎/.test(lower)) {
    return true;
  }
  // Media messages
  if (/\b(image|video|audio|document|sticker|gif) omitted\b/.test(lower)) {
    return true;
  }
  // Very short lines with no numbers (likely chat like "ok", "nice", "💪")
  if (line.trim().length < 3 && !/\d/.test(line)) return true;

  return false;
}

// ─── Main parser (multi-day) ────────────────────────────────────────────

export function parseWorkoutText(text: string): ParsedWorkout[] | null {
  if (!text.trim()) return null;

  const rawLines = text.split("\n");

  // Pre-process: strip chat prefixes and filter noise
  const processedLines: Array<{ cleaned: string; original: string }> = [];
  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      processedLines.push({ cleaned: "", original: raw });
      continue;
    }
    if (isNoiseLine(trimmed)) continue;
    const cleaned = stripChatPrefix(trimmed);
    processedLines.push({ cleaned, original: raw });
  }

  // First pass: find date lines from the cleaned text
  const dateBoundaries: Array<{ date: Date; lineIndex: number }> = [];

  for (let i = 0; i < processedLines.length; i++) {
    const { cleaned } = processedLines[i];
    if (!cleaned) continue;
    const date = parseDateFromLine(processedLines[i].original);
    if (date) {
      dateBoundaries.push({ date, lineIndex: i });
    }
  }

  // Extract just the cleaned lines for exercise parsing
  const lines = processedLines.map((p) => p.cleaned);

  if (dateBoundaries.length === 0) {
    const workout = parseLinesIntoWorkout(lines, new Date(), null);
    return workout ? [workout] : null;
  }

  if (dateBoundaries.length === 1) {
    const workout = parseLinesIntoWorkout(lines, dateBoundaries[0].date, null);
    return workout ? [workout] : null;
  }

  // Multiple dates: group lines by date segments
  const workouts: ParsedWorkout[] = [];

  // Lines before the first date
  if (dateBoundaries[0].lineIndex > 0) {
    const preLines = lines.slice(0, dateBoundaries[0].lineIndex);
    const preWorkout = parseLinesIntoWorkout(
      preLines,
      dateBoundaries[0].date,
      null
    );
    if (preWorkout) {
      workouts.push(preWorkout);
    }
  }

  for (let i = 0; i < dateBoundaries.length; i++) {
    const start = dateBoundaries[i].lineIndex;
    const end =
      i + 1 < dateBoundaries.length
        ? dateBoundaries[i + 1].lineIndex
        : lines.length;
    const segmentLines = lines.slice(start, end);
    const workout = parseLinesIntoWorkout(
      segmentLines,
      dateBoundaries[i].date,
      null
    );
    if (workout) {
      // Avoid duplicates if pre-lines workout has the same date
      if (
        workouts.length > 0 &&
        workouts[0].date.getTime() === dateBoundaries[i].date.getTime() &&
        i === 0
      ) {
        const existing = workouts[0];
        for (const ex of workout.exercises) {
          const found = existing.exercises.find((e) => e.name === ex.name);
          if (found) {
            const nextSet =
              found.sets[found.sets.length - 1].setNumber + 1;
            for (let s = 0; s < ex.sets.length; s++) {
              found.sets.push({ ...ex.sets[s], setNumber: nextSet + s });
            }
          } else {
            existing.exercises.push(ex);
          }
        }
      } else {
        workouts.push(workout);
      }
    }
  }

  return workouts.length > 0 ? workouts : null;
}

function parseLinesIntoWorkout(
  lines: string[],
  date: Date,
  explicitName: string | null
): ParsedWorkout | null {
  const exercises: ParsedExercise[] = [];
  let workoutName = explicitName || "Imported Workout";
  const seenExercises = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for explicit workout name
    const nameMatch = trimmed.match(/^(?:workout|name|session):\s*(.+)$/i);
    if (nameMatch) {
      workoutName = nameMatch[1].trim();
      continue;
    }

    // Skip lines that are purely date markers (no exercise data)
    if (parseDateFromLine(trimmed) && !/[x×*]/.test(trimmed) && extractNumbers(trimmed.replace(/\d{4}|\d{1,2}[/\-]\d{1,2}/g, "")).length === 0) {
      continue;
    }

    const exerciseName = findExerciseInLine(trimmed);
    if (!exerciseName) continue;

    const hasNumbers = /\d/.test(trimmed);
    if (!hasNumbers) continue;

    const parsed = parseExerciseLine(exerciseName, trimmed);
    if (parsed) {
      if (seenExercises.has(exerciseName)) {
        const existing = exercises.find((e) => e.name === exerciseName);
        if (existing) {
          const nextSetNum =
            existing.sets[existing.sets.length - 1].setNumber + 1;
          for (let i = 0; i < parsed.sets.length; i++) {
            existing.sets.push({
              ...parsed.sets[i],
              setNumber: nextSetNum + i,
            });
          }
        }
      } else {
        exercises.push(parsed);
        seenExercises.add(exerciseName);
      }
    }
  }

  if (exercises.length === 0) return null;

  if (workoutName === "Imported Workout" && exercises.length > 0) {
    workoutName = `${exercises[0].name} Day`;
  }

  return {
    workoutName,
    date,
    type: "strength",
    exercises,
  };
}

export function formatExampleImport(): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return `${yesterday.toISOString().split("T")[0]}
Bench Press: 3x10 @ 60kg
Incline Dumbbell Press: 3x12 @ 20kg
Tricep Pushdown: 4x15 @ 25kg

${today.toISOString().split("T")[0]}
Squat: 4x8 @ 100kg
Leg Press: 3x12 @ 140kg
Leg Curl: 3x15 @ 40kg`;
}
