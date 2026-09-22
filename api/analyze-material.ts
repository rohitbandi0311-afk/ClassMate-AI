import {
  getGeminiClient,
  sendError,
  sendSuccess,
  parseImagePayload,
  callGeminiWithFallback,
  safeJsonParse,
  BINARY_SEARCH_DEMO_DATA,
} from './_lib/gemini.ts';

const MATERIAL_ANALYSIS_PROMPT = `You are an expert university professor analyzing classroom whiteboard notes, lecture slides, textbook excerpts, or handwritten study material.

Analyze the provided classroom material with high academic fidelity.
Extract the exact subject, specific topic, and deep concepts shown in the image or notes.

Return a JSON object strictly following this JSON schema:
{
  "subject": string (e.g. "Database Management Systems", "Data Structures & Algorithms", "Computer Science", "Physics", etc.),
  "topic": string (The exact core topic in the material, e.g. "Types of Attributes in DBMS", "Binary Search", "Photosynthesis", etc. NEVER output "Binary Search" if the content is about another topic!),
  "subtitle": string (Concise academic subtitle summarizing the core principle),
  "overview": string (2-3 clear sentences explaining the core concept taught),
  "concepts": [
    {
      "id": string (e.g. "c1", "c2", "c3"),
      "name": string (Concept name, e.g. "Simple vs Composite Attributes", "Single-valued vs Multi-valued Attributes", "Stored vs Derived Attributes"),
      "description": string (Detailed, clear explanation of this concept),
      "category": string (e.g. "Classification", "Schema Design", "Core Principle"),
      "importance": string ("Essential" | "Core Principle" | "Fundamental" | "Key Assessment Topic")
    }
  ],
  "definitions": [
    {
      "term": string,
      "definition": string
    }
  ],
  "examples": [
    {
      "title": string,
      "codeOrExplanation": string
    }
  ],
  "learningObjectives": [
    string (Actionable learning objective, e.g. "Differentiate between stored and derived attributes in entity-relationship models")
  ],
  "estimatedDurationMinutes": number (Realistic study time in minutes, e.g. 5 to 15),
  "assessmentQuestions": [
    {
      "id": "q1",
      "type": "mcq",
      "prompt": string (A multiple-choice question testing a core distinction or definition of THIS specific topic),
      "options": [
        { "id": "a", "label": string },
        { "id": "b", "label": string },
        { "id": "c", "label": string },
        { "id": "d", "label": string }
      ],
      "hint": string,
      "targetConcept": string
    },
    {
      "id": "q2",
      "type": "short_answer",
      "prompt": string (A targeted short-answer question requiring a specific term, example, or calculation from THIS topic),
      "hint": string,
      "targetConcept": string
    },
    {
      "id": "q3",
      "type": "explanation",
      "prompt": string (A conceptual explanation question asking: "Explain in your own words why [core concept of this topic]..."),
      "hint": string,
      "targetConcept": string
    }
  ]
}

CRITICAL ACCURACY MANDATES:
1. Ground the extraction ONLY in the actual material provided in the image or notes.
2. If the user provided an image about "Types of Attributes in DBMS", the topic MUST be "Types of Attributes in DBMS" or related DBMS concepts. Do NOT output "Binary Search" or any unmentioned subject!
3. The assessmentQuestions MUST directly test the specific extracted topic.
4. Output strictly valid JSON. Do not include markdown code block backticks.`;

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

  const { imageBase64, mimeType, textNotes, isDemo } = req.body || {};

  // If the user explicitly requested the preloaded demo, return the curated Binary Search demo data
  if (isDemo === true) {
    return sendSuccess(res, {
      data: BINARY_SEARCH_DEMO_DATA,
      isDemo: true,
      source: 'curated_demo',
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return sendError(
      res,
      503,
      'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your server environment variables or Vercel project settings.'
    );
  }

  // Handle uploaded image
  if (imageBase64) {
    const { cleanBase64, mimeType: detectedMime, error: imgError } = parseImagePayload(
      imageBase64,
      mimeType
    );

    if (imgError) {
      return sendError(res, 400, imgError);
    }

    try {
      const { text, modelUsed } = await callGeminiWithFallback(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: detectedMime,
              },
            },
            {
              text: `${MATERIAL_ANALYSIS_PROMPT}\n\nTask: Analyze the attached image of classroom whiteboard notes or study material. Extract the real topic and content visible.`,
            },
          ],
        },
        responseMimeType: 'application/json',
      });

      const parsedData = safeJsonParse(text);

      // Validate core required fields
      if (!parsedData.topic) {
        throw new Error('Gemini response was missing required topic extraction.');
      }

      return sendSuccess(res, {
        data: parsedData,
        modelUsed,
        source: 'gemini_vision',
      });
    } catch (err: any) {
      console.error('[analyze-material] Gemini Vision error:', err);
      return sendError(
        res,
        500,
        `Gemini image analysis failed: ${err?.message || 'Unable to process classroom material with AI'}`
      );
    }
  }

  // Handle text notes
  if (textNotes && typeof textNotes === 'string' && textNotes.trim().length > 0) {
    try {
      const { text, modelUsed } = await callGeminiWithFallback(ai, {
        contents: `${MATERIAL_ANALYSIS_PROMPT}\n\nStudy Notes/Text Content:\n${textNotes.trim()}`,
        responseMimeType: 'application/json',
      });

      const parsedData = safeJsonParse(text);

      if (!parsedData.topic) {
        throw new Error('Gemini response was missing required topic extraction.');
      }

      return sendSuccess(res, {
        data: parsedData,
        modelUsed,
        source: 'gemini_text',
      });
    } catch (err: any) {
      console.error('[analyze-material] Gemini Text error:', err);
      return sendError(
        res,
        500,
        `Gemini notes analysis failed: ${err?.message || 'Unable to process study notes with AI'}`
      );
    }
  }

  return sendError(
    res,
    400,
    'No classroom material provided. Please upload an image (JPEG, PNG, WebP) or enter text notes.'
  );
}
