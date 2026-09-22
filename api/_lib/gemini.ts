import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Allowed image MIME types
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Max base64 payload length (~12MB raw string ~ 9MB binary)
export const MAX_BASE64_LENGTH = 14 * 1024 * 1024;

// Models to try in sequence of availability
export const SUPPORTED_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
].filter(Boolean) as string[];

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'classmate-ai-backend',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Universal error response helper for serverless and Express handlers
 */
export function sendError(
  res: any,
  status: number,
  errorMessage: string,
  extraDetails?: Record<string, any>
) {
  if (res.headersSent) return;
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json({
    success: false,
    error: errorMessage,
    ...(extraDetails || {}),
  });
}

/**
 * Universal success response helper
 */
export function sendSuccess(res: any, data: Record<string, any>, status = 200) {
  if (res.headersSent) return;
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json({
    success: true,
    ...data,
  });
}

/**
 * Safe base64 image unpacker and MIME type validator
 */
export function parseImagePayload(
  imageBase64?: string,
  providedMime?: string
): { cleanBase64: string; mimeType: string; error?: string } {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { cleanBase64: '', mimeType: '', error: 'No image data provided.' };
  }

  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return {
      cleanBase64: '',
      mimeType: '',
      error: 'Image file size exceeds the 10MB limit. Please upload a smaller image.',
    };
  }

  let mimeType = providedMime || 'image/jpeg';
  let cleanBase64 = imageBase64;

  const dataUriMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1].toLowerCase();
    cleanBase64 = dataUriMatch[2];
  } else {
    cleanBase64 = imageBase64.trim();
  }

  // Normalize image/jpg to image/jpeg
  if (mimeType === 'image/jpg') {
    mimeType = 'image/jpeg';
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      cleanBase64: '',
      mimeType: '',
      error: `Unsupported image format (${mimeType}). Please use JPEG, PNG, or WebP.`,
    };
  }

  return { cleanBase64, mimeType };
}

/**
 * Executes a Gemini request with automatic fallback between supported flash models
 */
export async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    responseMimeType?: string;
    temperature?: number;
  }
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of SUPPORTED_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }
        if (params.responseMimeType) {
          config.responseMimeType = params.responseMimeType;
        }
        if (typeof params.temperature === 'number') {
          config.temperature = params.temperature;
        }

        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          ...(Object.keys(config).length > 0 ? { config } : {}),
        });

        const text = response.text || '';
        return { text, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isDemandSpike = errMsg.includes('503') || errMsg.includes('demand') || errMsg.includes('UNAVAILABLE');

        if (isDemandSpike && attempt === 0) {
          console.warn(`[Gemini retry] Model ${model} experienced temporary demand spike. Retrying in 600ms...`);
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }

        console.warn(`[Gemini fallback] Model ${model} encountered: ${errMsg.slice(0, 100)}. Trying next model...`);
        break; // break inner attempt loop and advance to next model
      }
    }
  }

  throw lastError || new Error('All supported Gemini Flash models failed to respond.');
}

/**
 * Cleanly strips markdown code fences and parses JSON
 */
export function safeJsonParse(rawText: string, fallbackTopic = 'Extracted Material'): any {
  let cleaned = (rawText || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Benchmark Binary Search demo dataset (ONLY activated when frontend explicitly requests demo)
 */
export const BINARY_SEARCH_DEMO_DATA = {
  subject: 'Computer Science & Algorithms',
  topic: 'Binary Search',
  subtitle: 'Logarithmic Divide & Conquer in Sorted Sequences',
  overview:
    'Binary Search efficiently locates an element in a sorted collection by repeatedly dividing the search space in half, eliminating 50% of candidate positions at each step.',
  concepts: [
    {
      id: 'c1',
      name: 'Sorted Arrays Requirement',
      description:
        'The input data must be ordered monotonically so comparing target with mid eliminates half the remaining elements.',
      category: 'Prerequisite',
      importance: 'Essential',
    },
    {
      id: 'c2',
      name: 'Divide and Conquer',
      description:
        'Recursively or iteratively halving the search space using midpoint calculation mid = low + (high - low) / 2.',
      category: 'Algorithmic Paradigm',
      importance: 'Core Principle',
    },
    {
      id: 'c3',
      name: 'Search-Space Reduction',
      description:
        'Each step reduces remaining candidates: N → N/2 → N/4 → N/8 → ... → 1.',
      category: 'Mechanism',
      importance: 'Fundamental',
    },
    {
      id: 'c4',
      name: 'O(log n) Time Complexity',
      description:
        'Solving N / (2^k) = 1 yields k = log2(N) maximum comparisons, which is exponentially faster than linear scanning.',
      category: 'Analysis',
      importance: 'Key Assessment Topic',
    },
  ],
  definitions: [
    {
      term: 'Monotonic Array',
      definition:
        'A sequence where every successive element is greater than or equal to (or less than or equal to) the previous one.',
    },
    {
      term: 'Logarithm (Base 2)',
      definition:
        'The inverse of exponentiation: log2(N) gives the number of times N must be halved to reach 1.',
    },
  ],
  examples: [
    {
      title: 'Searching 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]',
      codeOrExplanation:
        'Step 1: mid = 16. Target 23 > 16, search right half [23, 38, 56, 72, 91].\nStep 2: mid = 56. Target 23 < 56, search left half [23, 38].\nStep 3: mid = 23. Target found in 3 comparisons!',
    },
  ],
  learningObjectives: [
    'Verify that the collection is sorted prior to initiating binary search.',
    'Formulate the midpoint calculation avoiding integer overflow.',
    'Explain why repeatedly halving the search space results in logarithmic time complexity.',
  ],
  estimatedDurationMinutes: 8,
  assessmentQuestions: [
    {
      id: 'bs_q1',
      type: 'mcq',
      prompt: 'What mandatory prerequisite must be satisfied before Binary Search can be applied?',
      options: [
        { id: 'a', label: 'Elements must be unique with no duplicates' },
        { id: 'b', label: 'Elements must be arranged in sorted monotonic order' },
        { id: 'c', label: 'The array length must be a power of 2' },
        { id: 'd', label: 'The data must be stored in a linked list' },
      ],
      hint: 'Recall why comparing against the midpoint allows discarding half the search space.',
      targetConcept: 'Sorted Arrays Requirement',
    },
    {
      id: 'bs_q2',
      type: 'short_answer',
      prompt: 'For an array of 1,024 sorted elements, what is the maximum number of comparisons Binary Search requires?',
      hint: 'Think about how many times 1,024 can be halved until 1 element remains: 2^k = 1,024.',
      targetConcept: 'O(log n) Time Complexity',
    },
    {
      id: 'bs_q3',
      type: 'explanation',
      prompt: 'Explain in your own words why repeatedly halving the search space results in O(log n) time complexity rather than O(n).',
      hint: 'Connect the number of halvings k to the inverse of the exponential power: N / (2^k) = 1.',
      targetConcept: 'Search-Space Reduction',
    },
  ],
};
