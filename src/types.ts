export interface Concept {
  id: string;
  name: string;
  description: string;
  category?: string;
  importance?: 'Essential' | 'Core Principle' | 'Fundamental' | 'Key Assessment Topic' | string;
}

export interface Definition {
  term: string;
  definition: string;
}

export interface ExampleCase {
  title: string;
  codeOrExplanation: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'mcq' | 'short_answer' | 'explanation';
  prompt: string;
  options?: { id: string; label: string }[];
  hint?: string;
  targetConcept?: string;
}

export interface MaterialAnalysis {
  subject?: string;
  topic: string;
  subtitle?: string;
  overview: string;
  concepts: Concept[];
  importantDefinitions?: Definition[];
  definitions?: Definition[];
  examples?: ExampleCase[];
  learningObjectives: string[];
  estimatedDurationMinutes?: number;
  assessmentQuestions?: AssessmentQuestion[];
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  style?: 'simple' | 'example' | 'visual' | 'quiz' | 'normal';
}

export interface AssessmentAnswer {
  mcq1?: string;
  mcq2?: string;
  shortAnswer?: string;
  explanationAnswer: string;
  [key: string]: string | undefined;
}

export interface ConceptScore {
  concept: string;
  score: number;
}

export interface DiagnosticResult {
  overall_score: number;
  concept_scores: ConceptScore[];
  understood: string[];
  misconception: string;
  missing_reasoning: string;
  severity: 'low' | 'medium' | 'high';
  recommended_intervention: string;
  // Compatibility / helper mappings
  overallMastery?: number;
  confidence?: string;
  misconceptionDetected?: boolean;
  misconceptionTitle?: string;
  conceptUnderstanding?: { [conceptName: string]: number };
  misconceptionHeadline?: string;
  explanationFeedback?: string;
  missingReasoning?: string[];
  missingReasoningList?: string[];
  recommendedAction?: string;
}

export interface RecoveryLesson {
  title: string;
  targetGap: string;
  simpleExplanation: string;
  simpleIntuition?: string;
  intuitiveAnalogy: string;
  workedExample: string;
  mathematicalInsight?: string;
  practiceQuestion: {
    prompt: string;
    expectedAnswer?: string;
    hint?: string;
    explanation?: string;
  };
  halvingLadder?: {
    count: number;
    note: string;
  }[];
}

export interface ReassessmentResult {
  beforeScore: number;
  afterScore: number;
  conceptImproved: boolean;
  conceptName: string;
  improvementDelta: string;
  feedback: string;
  masterySummary: string;
  nextRecommendedActivity: string;
}

export interface LearnerProfileConcept {
  name: string;
  score: number;
  trend: string;
  status: string;
  warning?: boolean;
}

export type ScreenType =
  | 'home'
  | 'understand'
  | 'tutor'
  | 'assessment'
  | 'diagnosis'
  | 'recovery'
  | 'reassessment'
  | 'dashboard';
