import {
  getGeminiClient,
  sendError,
  sendSuccess,
  callGeminiWithFallback,
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

  const { topic, context, messages, style = 'normal', level = 'intermediate' } = req.body || {};

  if (!topic || !Array.isArray(messages) || messages.length === 0) {
    return sendError(res, 400, 'Missing topic or messages in tutor request.');
  }

  const ai = getGeminiClient();
  if (!ai) {
    return sendError(
      res,
      503,
      'Gemini API key is not configured on the server. Please configure GEMINI_API_KEY.'
    );
  }

  const systemInstruction = `You are the ClassMate AI 1-on-1 Academic Tutor.
You are helping a student master: "${topic}".
Context on topic: ${JSON.stringify(context || {})}
Teaching Style: ${style} (simple = layman terms & intuition, example = concrete code or worked problem, visual = ASCII or spatial diagrams, quiz = diagnostic question).
Target Student Level: ${level}.

Pedagogical Principles:
1. Ground your answers strictly in the topic "${topic}".
2. Be encouraging, concise, and intellectually stimulating.
3. Keep responses structured with clear spacing. Avoid overwhelming walls of text.
4. When explaining algorithms or database concepts, emphasize WHY it works rather than just how.`;

  const conversationFormatted = messages
    .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
    .join('\n\n');

  const prompt = `${conversationFormatted}\n\nTutor:`;

  try {
    const { text } = await callGeminiWithFallback(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 0.7,
    });

    return sendSuccess(res, {
      responseText: text.trim(),
    });
  } catch (err: any) {
    console.error('[tutor-chat] Gemini error:', err);
    return sendError(
      res,
      500,
      `AI Tutor generation failed: ${err?.message || 'Unknown error'}`
    );
  }
}
