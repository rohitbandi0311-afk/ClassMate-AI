import {
  MaterialAnalysis,
  DiagnosticResult,
  RecoveryLesson,
  ReassessmentResult,
  AssessmentAnswer,
} from '../types';

export async function checkServerHealth(): Promise<{ hasGeminiKey: boolean; model?: string; status?: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { hasGeminiKey: false };
    return await res.json();
  } catch (e) {
    return { hasGeminiKey: false };
  }
}

export async function analyzeMaterial(params: {
  imageBase64?: string;
  mimeType?: string;
  textNotes?: string;
  isDemo?: boolean;
}): Promise<MaterialAnalysis> {
  const res = await fetch('/api/analyze-material', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || (json && json.success === false)) {
    const errMsg = json?.error || `Failed to analyze material (HTTP ${res.status}): ${res.statusText}`;
    throw new Error(errMsg);
  }

  if (!json?.data) {
    throw new Error('No structured analysis returned from server.');
  }

  return json.data;
}

export async function askAITutor(params: {
  topic: string;
  context?: any;
  messages: { role: string; content: string }[];
  style?: 'simple' | 'example' | 'visual' | 'quiz' | 'normal';
  level?: 'beginner' | 'intermediate';
}): Promise<string> {
  const res = await fetch('/api/tutor-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || (json && json.success === false)) {
    const errMsg = json?.error || `Tutor error (HTTP ${res.status}): ${res.statusText}`;
    throw new Error(errMsg);
  }

  return json.responseText;
}

export async function evaluateAssessment(params: {
  material?: MaterialAnalysis;
  topic: string;
  question: string;
  studentAnswer: string;
  mcqAnswers?: Partial<AssessmentAnswer>;
}): Promise<DiagnosticResult> {
  const res = await fetch('/api/evaluate-assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || (json && json.success === false)) {
    const errMsg = json?.error || `Evaluation error (HTTP ${res.status}): ${res.statusText}`;
    throw new Error(errMsg);
  }

  const raw: any = json.diagnosis || {};

  // Normalize structure ensuring both concept_scores array and conceptUnderstanding dictionary exist
  const conceptScores = raw.concept_scores || [];
  const conceptDict: { [key: string]: number } = raw.conceptUnderstanding || {};
  if (conceptScores.length > 0 && Object.keys(conceptDict).length === 0) {
    conceptScores.forEach((cs: { concept: string; score: number }) => {
      conceptDict[cs.concept] = cs.score;
    });
  } else if (conceptScores.length === 0 && Object.keys(conceptDict).length > 0) {
    Object.entries(conceptDict).forEach(([concept, score]) => {
      conceptScores.push({ concept, score: Number(score) });
    });
  }

  const normalized: DiagnosticResult = {
    overall_score: typeof raw.overall_score === 'number' ? raw.overall_score : (raw.overallMastery || 74),
    concept_scores: conceptScores,
    understood: Array.isArray(raw.understood) ? raw.understood : [
      'Understands the basic premise and foundational definitions',
    ],
    misconception: raw.misconception || raw.misconceptionHeadline || raw.misconceptionTitle || 'Conceptual reasoning gap detected.',
    missing_reasoning: raw.missing_reasoning || (Array.isArray(raw.missingReasoning) ? raw.missingReasoning.join('. ') : 'Missing core mathematical or logical justification.'),
    severity: raw.severity || 'medium',
    recommended_intervention: raw.recommended_intervention || raw.recommendedAction || 'Start 3-minute targeted recovery lesson.',
    // Backwards compatibility mappings
    conceptUnderstanding: conceptDict,
    misconceptionHeadline: raw.misconceptionHeadline || raw.misconception,
    explanationFeedback: raw.explanationFeedback || raw.missing_reasoning,
    missingReasoningList: Array.isArray(raw.missingReasoning) ? raw.missingReasoning : (raw.missing_reasoning ? [raw.missing_reasoning] : []),
  };

  return normalized;
}

export async function generateRecoveryLesson(params: {
  topic: string;
  misconception: string;
  missingReasoning?: string;
}): Promise<RecoveryLesson> {
  const res = await fetch('/api/generate-recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || (json && json.success === false)) {
    const errMsg = json?.error || `Recovery error (HTTP ${res.status}): ${res.statusText}`;
    throw new Error(errMsg);
  }

  const raw = json.lesson || {};

  return {
    title: raw.title || '3-minute recovery',
    targetGap: raw.targetGap || 'Connecting core intuition to first principles',
    simpleExplanation: raw.simpleExplanation || raw.simpleIntuition || 'Let us simplify the underlying concept step-by-step.',
    intuitiveAnalogy: raw.intuitiveAnalogy || 'Like searching for a word in a dictionary or organizing a library.',
    workedExample: raw.workedExample || (raw.mathematicalInsight || 'Step-by-step walkthrough of the mechanism.'),
    practiceQuestion: raw.practiceQuestion || {
      prompt: 'How would you apply this newly clarified concept to a fresh scenario?',
      expectedAnswer: 'Apply the foundational principle directly.',
      hint: 'Recall the core definition covered above.',
    },
    halvingLadder: raw.halvingLadder,
  };
}

export async function evaluateReassessment(params: {
  studentAnswer: string;
  practiceQuestion: { prompt: string; expectedAnswer?: string };
  targetConcept?: string;
  beforeScore?: number;
}): Promise<ReassessmentResult> {
  const res = await fetch('/api/evaluate-reassessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || (json && json.success === false)) {
    const errMsg = json?.error || `Reassessment error (HTTP ${res.status}): ${res.statusText}`;
    throw new Error(errMsg);
  }

  return json.result;
}
