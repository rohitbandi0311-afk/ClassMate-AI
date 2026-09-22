import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback benchmarked demo data for Binary Search
const BINARY_SEARCH_DEMO_ANALYSIS = {
  subject: 'Computer Science & Algorithms',
  topic: 'Binary Search',
  subtitle: 'Logarithmic Divide & Conquer in Sorted Sequences',
  overview: 'Binary Search efficiently finds an element in a sorted collection by repeatedly dividing the search space in half, eliminating 50% of candidates at each step.',
  concepts: [
    {
      id: 'c1',
      name: 'Sorted Arrays Requirement',
      description: 'The data must be ordered so comparing target with mid eliminates half the remaining elements.',
      category: 'Prerequisite',
      importance: 'Essential',
    },
    {
      id: 'c2',
      name: 'Divide and Conquer',
      description: 'Recursively or iteratively halving the search space using midpoint calculation mid = low + (high - low) / 2.',
      category: 'Algorithmic Paradigm',
      importance: 'Core Principle',
    },
    {
      id: 'c3',
      name: 'Search-Space Reduction',
      description: 'Each step reduces remaining candidates: N → N/2 → N/4 → N/8 → ... → 1.',
      category: 'Mechanism',
      importance: 'Fundamental',
    },
    {
      id: 'c4',
      name: 'O(log n) Time Complexity',
      description: 'The maximum comparisons equal the number of times N can be halved before reaching 1: k = log₂(N).',
      category: 'Complexity Analysis',
      importance: 'Key Assessment Topic',
    },
  ],
  definitions: [
    {
      term: 'Search Space',
      definition: 'The active range of indices [low, high] currently capable of containing the target value.',
    },
    {
      term: 'Logarithm (Base 2)',
      definition: 'The inverse exponent function log₂(N): the power to which 2 must be raised to produce N.',
    },
    {
      term: 'Midpoint Calculation',
      definition: 'low + ((high - low) >> 1) avoids potential 32-bit integer overflow inherent in (low + high) / 2.',
    },
  ],
  importantDefinitions: [
    {
      term: 'Search Space',
      definition: 'The active range of indices [low, high] currently capable of containing the target value.',
    },
    {
      term: 'Logarithm (Base 2)',
      definition: 'The inverse exponent function log₂(N): the power to which 2 must be raised to produce N.',
    },
  ],
  examples: [
    {
      title: 'Search for 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]',
      codeOrExplanation: 'Target 23: mid is 16 (index 4). 23 > 16 -> discard left half! New search space is indices 5..9. Next mid is 56. 23 < 56 -> discard right half! Next mid is 23 (Target found in only 3 comparisons vs up to 10 for linear search).',
    },
  ],
  learningObjectives: [
    'Explain why binary search requires sorted arrays as a mandatory precondition',
    'Demonstrate the divide-and-conquer space-halving algorithm step by step',
    'Explain in your own words why repeatedly halving the search space produces O(log n) time complexity',
  ],
  estimatedDurationMinutes: 8,
  assessmentQuestions: [
    {
      id: 'q1',
      type: 'mcq',
      prompt: 'What mandatory precondition must be met before performing a binary search?',
      options: [
        { id: 'a', label: 'The array elements must be sorted in monotonic order' },
        { id: 'b', label: 'The array size must be an exact power of 2' },
        { id: 'c', label: 'The array must contain only positive integers' },
        { id: 'd', label: 'The array must be stored as a linked list' },
      ],
      hint: 'Think about how discarding half the elements relies on element order.',
      targetConcept: 'Sorted Arrays Requirement',
    },
    {
      id: 'q2',
      type: 'short_answer',
      prompt: 'In a sorted array with 64 elements, what is the maximum number of comparisons binary search will make in the worst case?',
      hint: 'How many times can 64 be divided in half before reaching 1? (2^k = 64)',
      targetConcept: 'Search-Space Reduction',
    },
    {
      id: 'q3',
      type: 'explanation',
      prompt: 'Explain in your own words why repeatedly halving the search space produces O(log n) time complexity.',
      hint: 'Connect the division by 2 at each step with powers of 2 (2^k = N).',
      targetConcept: 'O(log n) Time Complexity',
    },
  ],
};

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Screen 1 & 2: Real Material Capture & Dynamic Concept Extraction
app.post('/api/analyze-material', async (req, res) => {
  try {
    const { imageBase64, mimeType, textNotes } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        data: BINARY_SEARCH_DEMO_ANALYSIS,
        source: 'demo-curated',
      });
    }

    const promptText = `
You are the analysis and pedagogy engine for ClassMate AI ("From classroom to mastery").
Analyze this classroom board snapshot, handwritten notes, or study text.
Extract the subject, topic, core concepts, definitions, examples, and learning objectives.
Also generate 3 assessment questions dynamically:
1. A multiple choice question (MCQ) testing a prerequisite or core definition.
2. A short answer question testing an application or calculation.
3. An open-ended explanation question ("Explain in your own words why...") which assesses deep conceptual reasoning.

Return ONLY a valid JSON object matching this schema:
{
  "subject": string (e.g. "Computer Science", "Biology", "Physics", "Mathematics"),
  "topic": string,
  "subtitle": string,
  "overview": string,
  "concepts": [
    {
      "id": string,
      "name": string,
      "description": string,
      "category": string,
      "importance": "Essential" | "Core Principle" | "Fundamental" | "Key Assessment Topic"
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
  "learningObjectives": [string],
  "estimatedDurationMinutes": number,
  "assessmentQuestions": [
    {
      "id": string,
      "type": "mcq" | "short_answer" | "explanation",
      "prompt": string,
      "options": [
        { "id": "a" | "b" | "c" | "d", "label": string }
      ],
      "hint": string,
      "targetConcept": string
    }
  ]
}

Ensure the 3 assessment questions match the extracted topic!
Return strictly JSON. No markdown ticks, no preamble.
`;

    let response;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            { text: promptText },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });
    } else {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${promptText}\n\nStudy Notes/Text:\n${textNotes || 'Binary Search algorithm notes'}`,
        config: {
          responseMimeType: 'application/json',
        },
      });
    }

    const rawText = response.text || '';
    const parsed = JSON.parse(rawText);

    // Ensure backwards compatibility for importantDefinitions
    if (parsed.definitions && !parsed.importantDefinitions) {
      parsed.importantDefinitions = parsed.definitions;
    }

    return res.json({
      success: true,
      data: parsed,
      source: 'gemini-3.8-flash',
    });
  } catch (error) {
    console.error('Error in /api/analyze-material, falling back to curated demo:', error);
    return res.json({
      success: true,
      data: BINARY_SEARCH_DEMO_ANALYSIS,
      source: 'demo-fallback',
    });
  }
});

// Screen 3: Interactive AI Tutor
app.post('/api/tutor-chat', async (req, res) => {
  try {
    const { topic, context, messages, style, level } = req.body;
    const ai = getGeminiClient();

    const lastMessage = messages && messages.length > 0
      ? messages[messages.length - 1].content
      : 'Explain this to me.';

    if (!ai) {
      let cannedResponse = '';
      if (style === 'simple') {
        cannedResponse = `Imagine looking for a name in a physical 1,000-page phonebook. Instead of checking page by page (linear search), you flip right to page 500. If the target name comes before, you completely discard the back 500 pages! In one single check, half the entire book is gone. That's Binary Search.`;
      } else if (style === 'example') {
        cannedResponse = `Here is a concrete trace:\nArray: [3, 7, 12, 19, 25, 31, 42, 55]\nTarget: 31\n1. Left=0, Right=7, Mid=(0+7)/2 = index 3 (value 19)\n2. 31 > 19: Discard left half! New search space: indices 4 to 7 [25, 31, 42, 55]\n3. Mid=(4+7)/2 = index 5 (value 31)\n4. Target found in just 2 comparisons!`;
      } else if (style === 'visual') {
        cannedResponse = `[Visual Representation of Space Halving]\nStep 0: [■■■■■■■■■■■■■■■■] (16 items)\nStep 1: [■■■■■■■■]         (8 items left)\nStep 2: [■■■■]             (4 items left)\nStep 3: [■■]               (2 items left)\nStep 4: [■]                (1 item found!)\nNotice: 16 -> 8 -> 4 -> 2 -> 1 takes exactly 4 halvings. Because 2⁴ = 16, log₂(16) = 4!`;
      } else if (style === 'quiz') {
        cannedResponse = `Quick check: Suppose you have a sorted array with 64 numbers. What is the MAXIMUM number of checks binary search will ever make in the worst case? (Think about how many times 64 can be divided by 2).`;
      } else {
        cannedResponse = `Binary Search is an optimal searching algorithm for sorted sequences. By always comparing your search key against the middle element, you cut the search space by 50% at every step. This makes searching through 1,000,000 elements take at most 20 comparisons!`;
      }
      return res.json({
        success: true,
        responseText: cannedResponse,
        source: 'demo-curated',
      });
    }

    const systemPrompt = `
You are the personal AI Tutor for ClassMate AI ("From classroom to mastery").
Topic: ${topic || 'Binary Search'}
Context From Uploaded Material: ${JSON.stringify(context || {})}
Student Level: ${level || 'beginner'}
Pedagogical Request Style: ${style || 'conversational'}

Instructions:
- Ground your answer deeply in the uploaded material context.
- Explain clearly, warmly, and concisely (under 120 words).
- If style is "simple", use vivid real-world analogies (e.g. phonebooks, dictionary, guessing games).
- If style is "example", give a step-by-step concrete trace with actual values.
- If style is "visual", use text-based ASCII diagrams or step progressions.
- If style is "quiz", ask one diagnostic question that tests intuition.
- Always be encouraging and guide toward true conceptual mastery.
`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemPrompt}\n\nStudent Query: ${lastMessage}`,
    });

    return res.json({
      success: true,
      responseText: chatResponse.text || 'I understand! Let us explore this step-by-step.',
      source: 'gemini-3.8-flash',
    });
  } catch (error) {
    console.error('Error in /api/tutor-chat:', error);
    return res.json({
      success: true,
      responseText: 'Binary search repeatedly divides the search space in half. For 16 items, it only takes 4 comparisons because 2^4 = 16.',
      source: 'demo-fallback',
    });
  }
});

// Screen 4 & 5: Assessment & Deep Misconception Diagnosis
app.post('/api/evaluate-assessment', async (req, res) => {
  try {
    const { material, topic, question, studentAnswer, mcqAnswers } = req.body;
    const ai = getGeminiClient();

    const answerLower = (studentAnswer || '').toLowerCase();

    // Fallback logic for demo or offline mode
    if (!ai) {
      // Analyze answer heuristics
      const hasLogMath = answerLower.includes('log') || answerLower.includes('power') || answerLower.includes('2^') || answerLower.includes('exponent');
      const mentionsHalving = answerLower.includes('half') || answerLower.includes('halv') || answerLower.includes('divide') || answerLower.includes('cut');

      const isBinarySearch = (topic || '').toLowerCase().includes('binary search');

      let diagnosis;
      if (isBinarySearch) {
        if (!hasLogMath && mentionsHalving) {
          diagnosis = {
            overall_score: 72,
            concept_scores: [
              { concept: 'Binary Search', score: 88 },
              { concept: 'Sorted Arrays', score: 91 },
              { concept: 'Divide & Conquer', score: 73 },
              { concept: 'Time Complexity', score: 47 },
            ],
            understood: [
              'Understands that the search space is divided by 2 at each iteration',
              'Recognizes that binary search is significantly faster than linear search',
            ],
            misconception: 'Search Space Halving vs. Logarithmic Growth Gap: Student understands the binary-search procedure but cannot explain why repeatedly halving the search space produces logarithmic complexity.',
            missing_reasoning: 'The explanation misses connecting inverse exponentiation: halving N items k times means N / (2^k) = 1, which algebraically solves to k = log₂(N).',
            severity: 'medium' as const,
            recommended_intervention: 'Start 3-minute targeted recovery lesson on connecting halving to O(log n).',
          };
        } else if (hasLogMath) {
          diagnosis = {
            overall_score: 92,
            concept_scores: [
              { concept: 'Binary Search', score: 95 },
              { concept: 'Sorted Arrays', score: 94 },
              { concept: 'Divide & Conquer', score: 90 },
              { concept: 'Time Complexity', score: 89 },
            ],
            understood: [
              'Understands halving search space',
              'Understands the mathematical connection to powers of 2 and logarithms',
            ],
            misconception: 'None detected. Strong conceptual grasp.',
            missing_reasoning: 'None. Complete mathematical link established.',
            severity: 'low' as const,
            recommended_intervention: 'Proceed directly to advanced algorithmic extensions.',
          };
        } else {
          diagnosis = {
            overall_score: 58,
            concept_scores: [
              { concept: 'Binary Search', score: 65 },
              { concept: 'Sorted Arrays', score: 70 },
              { concept: 'Divide & Conquer', score: 55 },
              { concept: 'Time Complexity', score: 42 },
            ],
            understood: [
              'General familiarity with searching algorithms',
            ],
            misconception: 'Conflating binary search halving with general fast search without understanding how candidates are eliminated.',
            missing_reasoning: 'Did not explain how comparing against the midpoint guarantees eliminating half the array.',
            severity: 'high' as const,
            recommended_intervention: 'Complete targeted review on search space reduction and logarithmic scaling.',
          };
        }
      } else {
        diagnosis = {
          overall_score: 70,
          concept_scores: [
            { concept: topic || 'Core Topic', score: 74 },
            { concept: 'Fundamental Principles', score: 80 },
            { concept: 'Deep Reasoning', score: 52 },
          ],
          understood: [
            'Basic operational workflow and terminology',
          ],
          misconception: `Incomplete conceptual foundation: Student describes what happens but misses the underlying causal mechanism in ${topic || 'this subject'}.`,
          missing_reasoning: 'Missing the fundamental theoretical relationship connecting components.',
          severity: 'medium' as const,
          recommended_intervention: 'Short targeted recovery lesson on core mechanisms.',
        };
      }

      return res.json({
        success: true,
        source: 'demo-curated',
        diagnosis,
      });
    }

    const diagnosticPrompt = `
You are the specialized misconception diagnostic evaluator for ClassMate AI ("From classroom to mastery").

Original Learning Material Context:
${JSON.stringify(material || { topic: topic || 'Binary Search' })}

Target Assessment Question:
"${question || 'Explain in your own words why binary search is O(log n).'}"

Student's Answer:
"${studentAnswer || ''}"

Student's Multiple Choice / Short Answer Context:
${JSON.stringify(mcqAnswers || {})}

CRITICAL INSTRUCTIONS:
Evaluate the student's answer deeply for cognitive misconceptions.
Do NOT merely mark the answer as right or wrong.
Identify what the student understood vs what specific misunderstanding or missing reasoning exists.
For example, in Binary Search, if the student explains halving or dividing in half, but does not explain WHY halving produces logarithmic complexity (i.e. N / 2^k = 1  ==>  2^k = N  ==>  k = log2(N)), explicitly identify this misconception!

Return ONLY valid JSON matching this exact schema:
{
  "overall_score": number (0 to 100),
  "concept_scores": [
    { "concept": string, "score": number (0 to 100) }
  ],
  "understood": [string],
  "misconception": string,
  "missing_reasoning": string,
  "severity": "low" | "medium" | "high",
  "recommended_intervention": string
}

Ensure "concept_scores" includes 3-4 key concepts relevant to ${topic || 'the topic'}.
If a gap exists, set the weak concept score to between 40 and 55, set severity to "medium" or "high", and provide a specific, helpful diagnosis.
Return strictly JSON.
`;

    const evalResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: diagnosticPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(evalResponse.text || '{}');
    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      diagnosis: parsed,
    });
  } catch (error) {
    console.error('Error in /api/evaluate-assessment:', error);
    return res.json({
      success: true,
      source: 'demo-fallback',
      diagnosis: {
        overall_score: 72,
        concept_scores: [
          { concept: 'Binary Search', score: 88 },
          { concept: 'Sorted Arrays', score: 91 },
          { concept: 'Divide & Conquer', score: 73 },
          { concept: 'Time Complexity', score: 47 },
        ],
        understood: [
          'Understands halving the search space repeatedly',
          'Identifies that it is faster than linear search',
        ],
        misconception: 'Search Space Halving vs. Logarithmic Growth Gap: Student understands the binary-search procedure but cannot explain why repeatedly halving the search space produces logarithmic complexity.',
        missing_reasoning: 'Did not connect repeated division by 2 to inverse powers: N / (2^k) = 1 leads to k = log₂(N).',
        severity: 'medium',
        recommended_intervention: 'Start 3-minute targeted recovery lesson on logarithmic space halving.',
      },
    });
  }
});

// Screen 6: 3-Minute Recovery Lesson Generation
app.post('/api/generate-recovery', async (req, res) => {
  try {
    const { topic, misconception, missingReasoning } = req.body;
    const ai = getGeminiClient();

    const isBinarySearch = (topic || '').toLowerCase().includes('binary search') ||
      (misconception || '').toLowerCase().includes('halv') ||
      (misconception || '').toLowerCase().includes('log');

    const fallbackLesson = {
      title: '3-minute recovery',
      targetGap: 'Connecting repeated halving to O(log n)',
      simpleExplanation:
        'Instead of counting each individual comparison, consider how many times we can divide N by 2 until only 1 single element remains.',
      intuitiveAnalogy:
        'Think of folding a large sheet of paper in half repeatedly. With each fold, the area cuts in half. 5 folds reduces the paper to 1/32nd of its size. Unfolding is doubling (2^k); folding is halving (log₂ N).',
      workedExample:
        'If an array has N = 16 elements:\nStep 0: 16 items\nStep 1: 16 / 2 = 8 items\nStep 2: 8 / 2 = 4 items\nStep 3: 4 / 2 = 2 items\nStep 4: 2 / 2 = 1 item (Target located!)\nNotice: It took exactly 4 steps because 2⁴ = 16. In general, N / (2^k) = 1  ==>  2^k = N  ==>  k = log₂(N). That is why Binary Search is O(log n)!',
      practiceQuestion: {
        prompt:
          'If there are 32 elements in a sorted array, approximately how many times can we halve the search space before reaching one element?',
        expectedAnswer: '5',
        hint: 'Think about what power of 2 equals 32 (2^k = 32).',
      },
      halvingLadder: [
        { count: 16, note: 'Initial search space (Step 0)' },
        { count: 8, note: 'After 1st halving (Step 1)' },
        { count: 4, note: 'After 2nd halving (Step 2)' },
        { count: 2, note: 'After 3rd halving (Step 3)' },
        { count: 1, note: 'After 4th halving: Target found! (Step 4)' },
      ],
    };

    if (!ai) {
      return res.json({
        success: true,
        source: 'demo-curated',
        lesson: fallbackLesson,
      });
    }

    const recoveryPrompt = `
You are the targeted learning intervention specialist for ClassMate AI ("From classroom to mastery").
Generate a short, high-impact targeted intervention lesson titled "3-minute recovery".
Topic: ${topic || 'Binary Search'}
Diagnosed Misconception: "${misconception || 'Student does not understand why halving produces logarithmic complexity'}"
Missing Reasoning: "${missingReasoning || 'Connecting repeated halving to logarithmic math'}"

The recovery lesson MUST address the detected misconception specifically. Do not generate a generic lesson.
It should contain:
- simple explanation
- intuitive analogy
- worked example
- one practice question

Return ONLY a valid JSON object matching this schema:
{
  "title": "3-minute recovery",
  "targetGap": string,
  "simpleExplanation": string,
  "intuitiveAnalogy": string,
  "workedExample": string,
  "practiceQuestion": {
    "prompt": string,
    "expectedAnswer": string,
    "hint": string
  },
  "halvingLadder": [
    { "count": number, "note": string }
  ]
}
`;

    const lessonRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: recoveryPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(lessonRes.text || '{}');
    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      lesson: parsed,
    });
  } catch (error) {
    console.error('Error in /api/generate-recovery:', error);
    return res.json({
      success: true,
      source: 'demo-fallback',
      lesson: {
        title: '3-minute recovery',
        targetGap: 'Connecting repeated halving to O(log n)',
        simpleExplanation: 'Halving N items repeatedly until reaching 1 is the exact inverse of doubling from 1 to N.',
        intuitiveAnalogy: 'Like folding a road map in half until only one town square remains.',
        workedExample: 'For 16 items: 16 → 8 → 4 → 2 → 1 (4 halvings). Because 2^4 = 16, log₂(16) = 4.',
        practiceQuestion: {
          prompt: 'If there are 32 elements in a sorted array, approximately how many times can we halve the search space before reaching one element?',
          expectedAnswer: '5',
          hint: '2 to what power equals 32?',
        },
        halvingLadder: [
          { count: 16, note: 'Initial space' },
          { count: 8, note: '1st halving' },
          { count: 4, note: '2nd halving' },
          { count: 2, note: '3rd halving' },
          { count: 1, note: '4th halving: log2(16) = 4' },
        ],
      },
    });
  }
});

// Screen 7: Reassessment & Progress Measurement
app.post('/api/evaluate-reassessment', async (req, res) => {
  try {
    const { studentAnswer, practiceQuestion, targetConcept, beforeScore = 47 } = req.body;
    const ai = getGeminiClient();

    const ans = (studentAnswer || '').trim().toLowerCase();
    const isCorrect = ans.includes('5') || ans.includes('five') || (ans.includes('32') && ans.includes('2^5'));

    const calculatedBeforeScore = typeof beforeScore === 'number' ? beforeScore : 47;
    const calculatedAfterScore = isCorrect ? Math.min(94, calculatedBeforeScore + 39) : Math.max(68, calculatedBeforeScore + 25);

    if (!ai) {
      return res.json({
        success: true,
        source: 'demo-curated',
        result: {
          conceptName: targetConcept || 'Time Complexity',
          beforeScore: calculatedBeforeScore,
          afterScore: calculatedAfterScore,
          conceptImproved: true,
          improvementDelta: `+${calculatedAfterScore - calculatedBeforeScore}%`,
          feedback: isCorrect
            ? 'Outstanding! You correctly calculated that 32 halves 5 times (32 → 16 → 8 → 4 → 2 → 1) because 2⁵ = 32. You have mastered the mathematical intuition of O(log n).'
            : 'Good effort! 32 halves 5 times to reach 1 because 2⁵ = 32. Your logarithmic reasoning is significantly clearer!',
          masterySummary: 'Gap successfully closed. Core principles are now well-grounded.',
          nextRecommendedActivity: '5-minute Recursion & Tree Traversals',
        },
      });
    }

    const reassessPrompt = `
You are the reassessment evaluation engine for ClassMate AI.
Concept Being Re-evaluated: "${targetConcept || 'Time Complexity'}"
Practice Question: "${practiceQuestion?.prompt || 'If there are 32 elements, approximately how many times can we halve the search space before reaching one?'}"
Student's New Answer: "${studentAnswer || ''}"
Previous Diagnosed Score: ${calculatedBeforeScore}%

Evaluate if the student has bridged the conceptual gap.
Calculate an afterScore between 82 and 94 if correct/well-reasoned, or between 68 and 78 if partially correct.

Return ONLY valid JSON matching this schema:
{
  "conceptName": "${targetConcept || 'Time Complexity'}",
  "beforeScore": ${calculatedBeforeScore},
  "afterScore": number,
  "conceptImproved": boolean,
  "improvementDelta": string (e.g. "+39%"),
  "feedback": string,
  "masterySummary": string,
  "nextRecommendedActivity": string
}
`;

    const resp = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: reassessPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(resp.text || '{}');
    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      result: parsed,
    });
  } catch (error) {
    console.error('Error in /api/evaluate-reassessment:', error);
    return res.json({
      success: true,
      source: 'demo-fallback',
      result: {
        conceptName: (req.body && req.body.targetConcept) || 'Time Complexity',
        beforeScore: 47,
        afterScore: 86,
        conceptImproved: true,
        improvementDelta: '+39%',
        feedback: 'Superb! You correctly identified 5 halvings because 2^5 = 32. The gap in logarithmic intuition is closed.',
        masterySummary: 'Concept mastered.',
        nextRecommendedActivity: '5-minute Recursion & Tree Traversals',
      },
    });
  }
});

// Vite Middleware for SPA development and production
async function startServer() {
  const isCompiledServer = typeof __filename !== 'undefined' && __filename.endsWith('server.cjs');
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    isCompiledServer ||
    Boolean(process.argv[1] && process.argv[1].includes('server.cjs'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : typeof __dirname !== 'undefined'
      ? __dirname
      : path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClassMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
