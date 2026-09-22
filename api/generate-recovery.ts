import {
  getGeminiClient,
  sendError,
  sendSuccess,
  callGeminiWithFallback,
  safeJsonParse,
} from './_lib/gemini.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed. Use POST.');
  }

  const { topic, misconception, missingReasoning } = req.body || {};

  if (!topic || !misconception) {
    return sendError(res, 400, 'Missing topic or misconception for recovery lesson.');
  }

  const ai = getGeminiClient();
  if (!ai) {
    return sendError(
      res,
      503,
      'Gemini API key is not configured on the server. Please set GEMINI_API_KEY.'
    );
  }

  const prompt = `You are an expert tutor creating a high-impact 3-minute recovery lesson.
Topic: "${topic}"
Diagnosed Misconception: "${misconception}"
Missing Conceptual Reasoning: "${missingReasoning || 'Connecting core intuition to first principles'}"

Design a targeted 4-part micro-lesson to permanently repair this conceptual gap.
Return a JSON object strictly matching this schema:
{
  "title": string (e.g. "3-Minute Recovery: [Core Gap Repair]"),
  "targetGap": string (Clear summary of what we are fixing),
  "simpleExplanation": string (2-3 sentences providing instant clarity without jargon),
  "intuitiveAnalogy": string (A real-world vivid analogy that makes the concept click instantly),
  "workedExample": string (Step-by-step concrete breakdown or mathematical deduction),
  "practiceQuestion": {
    "prompt": string (A single, focused check question testing if the student grasped the repair),
    "expectedAnswer": string,
    "hint": string,
    "explanation": string
  }
}

Return strictly valid JSON. Do not wrap in markdown backticks.`;

  try {
    const { text } = await callGeminiWithFallback(ai, {
      contents: prompt,
      responseMimeType: 'application/json',
    });

    const parsedLesson = safeJsonParse(text);

    return sendSuccess(res, {
      lesson: parsedLesson,
    });
  } catch (err: any) {
    console.error('[generate-recovery] Gemini error:', err);
    return sendError(
      res,
      500,
      `Recovery generation failed: ${err?.message || 'Unknown error'}`
    );
  }
}
