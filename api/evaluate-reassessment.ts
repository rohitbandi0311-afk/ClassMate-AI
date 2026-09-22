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

  const { studentAnswer, practiceQuestion, targetConcept = 'Core Principle', beforeScore = 48 } =
    req.body || {};

  if (!studentAnswer || !practiceQuestion) {
    return sendError(res, 400, 'Missing student answer or practice question.');
  }

  const ai = getGeminiClient();
  if (!ai) {
    return sendError(
      res,
      503,
      'Gemini API key is not configured on the server. Please set GEMINI_API_KEY.'
    );
  }

  const prompt = `You are evaluating a student's reassessment answer following a 3-minute conceptual recovery lesson.
Target Concept: "${targetConcept}"
Practice Question: "${practiceQuestion.prompt}"
Expected Idea/Answer: "${practiceQuestion.expectedAnswer || 'Sound conceptual justification'}"
Student's Submitted Answer: "${studentAnswer}"
Previous Baseline Score: ${beforeScore}/100

Evaluate whether the student demonstrated mastery and resolved the earlier gap.
If the student answer is correct or conceptually sound, give an afterScore between 82 and 98.
If they still show confusion, give an afterScore between 55 and 75.

Return a JSON object strictly matching this schema:
{
  "conceptName": "${targetConcept}",
  "beforeScore": ${beforeScore},
  "afterScore": number (0 to 100),
  "conceptImproved": boolean,
  "improvementDelta": string (e.g. "+38%"),
  "feedback": string (2-3 sentences congratulating specific insights or guiding further refinement),
  "masterySummary": string (Crisp summary of current mastery status),
  "nextRecommendedActivity": string (Next study module, e.g. "5-minute Advanced Case Studies")
}

Return strictly valid JSON. Do not wrap in markdown backticks.`;

  try {
    const { text } = await callGeminiWithFallback(ai, {
      contents: prompt,
      responseMimeType: 'application/json',
    });

    const parsedResult = safeJsonParse(text);

    return sendSuccess(res, {
      result: parsedResult,
    });
  } catch (err: any) {
    console.error('[evaluate-reassessment] Gemini error:', err);
    return sendError(
      res,
      500,
      `Reassessment evaluation failed: ${err?.message || 'Unknown error'}`
    );
  }
}
