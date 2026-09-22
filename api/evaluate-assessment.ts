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

  const { material, topic, question, studentAnswer, mcqAnswers } = req.body || {};

  if (!topic || (!studentAnswer && !mcqAnswers)) {
    return sendError(res, 400, 'Missing topic or student assessment answers.');
  }

  const ai = getGeminiClient();
  if (!ai) {
    return sendError(
      res,
      503,
      'Gemini API key is not configured on the server. Please set GEMINI_API_KEY.'
    );
  }

  const conceptsList = material?.concepts?.map((c: any) => c.name) || [
    'Core Mechanism',
    'Preconditions & Constraints',
    'Mathematical Justification',
  ];

  const prompt = `You are an expert academic evaluator and cognitive diagnostician.
Topic: "${topic}"
Assessment Prompt: "${question || 'Explain this concept in your own words'}"
Student's Conceptual Answer: "${studentAnswer || 'N/A'}"
Student's MCQ/Short Answers: ${JSON.stringify(mcqAnswers || {})}
Core Concepts list: ${JSON.stringify(conceptsList)}

Perform a precise cognitive diagnosis of the student's submission.
Find what the student understands well, and isolate any exact misconception or missing reasoning step.

Return a JSON object strictly matching this schema:
{
  "overall_score": number (0 to 100),
  "concept_scores": [
    { "concept": string (name from the concept list), "score": number (0 to 100) }
  ],
  "understood": [
    string (specific praise for concepts or mechanisms the student got right)
  ],
  "misconception": string (A crisp 1-sentence headline pinpointing the conceptual gap),
  "missing_reasoning": string (Detailed explanation of what mathematical or logical link was missed),
  "severity": "low" | "medium" | "high",
  "recommended_intervention": string (Concise next step, e.g. "Complete a 3-minute targeted recovery module on [Concept]")
}

CRITICAL: Return strictly valid JSON. Do not wrap in markdown quotes.`;

  try {
    const { text } = await callGeminiWithFallback(ai, {
      contents: prompt,
      responseMimeType: 'application/json',
    });

    const parsedDiagnosis = safeJsonParse(text);

    return sendSuccess(res, {
      diagnosis: parsedDiagnosis,
    });
  } catch (err: any) {
    console.error('[evaluate-assessment] Gemini error:', err);
    return sendError(
      res,
      500,
      `Assessment evaluation failed: ${err?.message || 'Unknown error'}`
    );
  }
}
