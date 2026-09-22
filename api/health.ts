import { getGeminiClient, SUPPORTED_MODELS } from './_lib/gemini.ts';

export default async function handler(req: any, res: any) {
  // CORS & method handling
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const hasGeminiKey = Boolean(apiKey && apiKey.length > 0);

  return res.status(200).json({
    status: 'ok',
    hasGeminiKey,
    model: SUPPORTED_MODELS[0] || 'gemini-3.8-flash',
    supportedModels: SUPPORTED_MODELS,
    timestamp: new Date().toISOString(),
  });
}
