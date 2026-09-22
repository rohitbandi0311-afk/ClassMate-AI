import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameraScannerModal } from './components/CameraScannerModal';
import { HomeScreen } from './components/HomeScreen';
import { UnderstandScreen } from './components/UnderstandScreen';
import { TutorScreen } from './components/TutorScreen';
import { AssessmentScreen } from './components/AssessmentScreen';
import { DiagnosisScreen } from './components/DiagnosisScreen';
import { RecoveryLessonScreen } from './components/RecoveryLessonScreen';
import { ReassessmentScreen } from './components/ReassessmentScreen';
import { DashboardScreen } from './components/DashboardScreen';

import {
  ScreenType,
  MaterialAnalysis,
  DiagnosticResult,
  RecoveryLesson,
  ReassessmentResult,
  AssessmentAnswer,
} from './types';
import { SAMPLE_WHITEBOARD_DATA_URL } from './data/sampleWhiteboard';
import {
  checkServerHealth,
  analyzeMaterial,
  evaluateAssessment,
  generateRecoveryLesson,
  evaluateReassessment,
} from './services/api';
import { LearnerProfileItem } from './components/DashboardScreen';

const INITIAL_LEARNER_PROFILE: LearnerProfileItem[] = [
  { name: 'Binary Search', score: 88, status: 'Mastered', trend: '+14%' },
  { name: 'Arrays', score: 76, status: 'Proficient', trend: '+5%' },
  { name: 'Time Complexity', score: 47, status: 'Needs Intervention', trend: 'Gap Alert', warning: true },
  { name: 'Recursion', score: 42, status: 'Needs Intervention', trend: 'Gap Alert', warning: true },
];

const DEFAULT_ANALYSIS: MaterialAnalysis = {
  topic: 'Binary Search',
  subtitle: 'Logarithmic Divide & Conquer Search in Sorted Data',
  overview:
    'Binary Search efficiently finds an element in a sorted collection by repeatedly dividing the search interval in half.',
  concepts: [
    {
      id: 'c1',
      name: 'Sorted Arrays Requirement',
      description:
        'The data structure must be monotonically ordered (ascending or descending) so each comparison eliminates half the remaining items.',
      category: 'Prerequisite',
      importance: 'Essential',
    },
    {
      id: 'c2',
      name: 'Divide and Conquer',
      description:
        'Breaks the problem into smaller subproblems by comparing target with the middle element (mid = low + (high - low) / 2).',
      category: 'Algorithmic Paradigm',
      importance: 'Core Principle',
    },
    {
      id: 'c3',
      name: 'Search-Space Reduction',
      description:
        'Each step reduces remaining candidates from N to N/2, N/4, N/8 until 1 or empty.',
      category: 'Mechanism',
      importance: 'Fundamental',
    },
    {
      id: 'c4',
      name: 'O(log n) Time Complexity',
      description:
        'The maximum comparisons equal the number of times N can be halved before reaching 1, which mathematically is ⌊log₂ N⌋ + 1.',
      category: 'Complexity Analysis',
      importance: 'Key Assessment Topic',
    },
  ],
  importantDefinitions: [
    {
      term: 'Search Space',
      definition:
        'The active range of indices [low, high] currently capable of containing the target value.',
    },
    {
      term: 'Logarithm (Base 2)',
      definition:
        'The inverse exponent function log₂(N): the power to which 2 must be raised to produce N.',
    },
    {
      term: 'Midpoint Calculation',
      definition:
        'low + ((high - low) >> 1) avoids potential 32-bit integer overflow inherent in (low + high) / 2.',
    },
  ],
  examples: [
    {
      title: 'Search in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]',
      codeOrExplanation:
        'Target 23: mid is 16 (index 4). 23 > 16 -> discard left half! New search space is indices 5..9. Next mid is 56. 23 < 56 -> discard right half! Next mid is 23 (Match in 3 comparisons vs 6 for linear search).',
    },
  ],
  learningObjectives: [
    'Explain the mathematical reason why search-space halving produces O(log n)',
    'Implement the overflow-safe midpoint calculation',
    'Recognize edge cases including empty ranges and duplicates',
  ],
  estimatedDurationMinutes: 8,
};

const DEFAULT_DIAGNOSIS: DiagnosticResult = {
  overall_score: 74,
  concept_scores: [
    { concept: 'Binary Search', score: 88 },
    { concept: 'Sorted Arrays Requirement', score: 91 },
    { concept: 'Divide & Conquer', score: 73 },
    { concept: 'O(log n) Time Complexity', score: 47 },
  ],
  understood: [
    'Understands requirement for ordered data elements',
    'Understands dividing search interval in half at midpoint',
    'Understands discarding irrelevant sub-intervals',
  ],
  misconception:
    'Student understands the binary-search procedure but cannot explain why repeatedly halving the search space produces logarithmic complexity.',
  missing_reasoning:
    'Did not connect repeatedly dividing N by 2 to the inverse power function: N / (2^k) = 1 leads to k = log₂(N).',
  severity: 'high',
  recommended_intervention:
    'Interactive 3-minute lesson bridging powers of 2, repeated halving ladder (16→8→4→2→1), and base-2 logarithm.',
  conceptUnderstanding: {
    'Binary Search': 88,
    'Sorted Arrays': 91,
    'Divide & Conquer': 73,
    'Time Complexity': 47,
  },
  confidence: 'Moderate (High intuition, missing mathematical link)',
  overallMastery: 74,
  misconceptionDetected: true,
  misconceptionTitle: 'Search Space Halving vs. Logarithmic Growth Gap',
  misconceptionHeadline:
    'You understand how binary search works, but your explanation does not show why repeatedly halving the search space produces O(log n).',
  explanationFeedback:
    'You correctly grasped that elements are divided by 2 at each step, but stopped short of connecting inverse exponentiation: since N / (2^k) = 1, solving for k yields k = log₂(N).',
  missingReasoning: [
    'Did not mention that halving N items k times corresponds to N / (2^k)',
    'Did not identify that the logarithm is the inverse of the exponential power 2^k',
  ],
  recommendedAction:
    'Start 3-minute targeted recovery lesson on Logarithmic Space Halving.',
};

const DEFAULT_RECOVERY: RecoveryLesson = {
  title: '3-minute recovery',
  targetGap: 'Connecting repeated halving to O(log n)',
  simpleExplanation:
    'Instead of asking "How many numbers do I test?", ask the inverse: "How many times can I divide N by 2 before only 1 item remains?"',
  intuitiveAnalogy:
    'Imagine repeatedly folding a 16-page newspaper in half. Each fold cuts the area in half. With just 4 folds (2⁴ = 16), you reach a single page.',
  workedExample:
    'Step 0: N = 16 items\nStep 1: 16 / 2 = 8 items (1 halving)\nStep 2: 8 / 2 = 4 items (2 halvings)\nStep 3: 4 / 2 = 2 items (3 halvings)\nStep 4: 2 / 2 = 1 item (4 halvings)\nNotice: 16 = 2⁴. The number of halvings (4) is exactly log₂(16)!',
  simpleIntuition:
    'Instead of asking "How many numbers do I check?", ask: "How many times can I divide N by 2 until only 1 item is left?"',
  halvingLadder: [
    { count: 16, note: 'Initial candidate pool (Step 0)' },
    { count: 8, note: 'After 1st halving: 16 / 2 = 8 (Step 1)' },
    { count: 4, note: 'After 2nd halving: 8 / 2 = 4 (Step 2)' },
    { count: 2, note: 'After 3rd halving: 4 / 2 = 2 (Step 3)' },
    { count: 1, note: 'After 4th halving: Target found! (Step 4)' },
  ],
  mathematicalInsight:
    'Notice: 16 = 2⁴. The number of halvings (4) is exactly log₂(16)! In general, if there are N items, N / (2^k) = 1  ==>  2^k = N  ==>  k = log₂(N). That is why the time complexity is O(log n)!',
  practiceQuestion: {
    prompt:
      'If there are 32 elements, approximately how many times can we halve the search space before reaching one?',
    expectedAnswer: '5',
    explanation:
      'Because 2⁵ = 32, so log₂(32) = 5. Halving sequence: 32 → 16 → 8 → 4 → 2 → 1 (5 halvings).',
  },
};

const DEFAULT_REASSESSMENT: ReassessmentResult = {
  beforeScore: 47,
  afterScore: 86,
  conceptImproved: true,
  conceptName: 'Time Complexity',
  improvementDelta: '+39%',
  feedback:
    'Outstanding! You correctly calculated that 32 halves 5 times (32 → 16 → 8 → 4 → 2 → 1) because 2⁵ = 32. You have mastered the mathematical intuition of O(log n).',
  masterySummary:
    'Gap successfully closed. Binary Search core principles are now well-grounded.',
  nextRecommendedActivity: '5-minute Recursion Fundamentals',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(SAMPLE_WHITEBOARD_DATA_URL);
  const [materialAnalysis, setMaterialAnalysis] = useState<MaterialAnalysis>(DEFAULT_ANALYSIS);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosticResult>(DEFAULT_DIAGNOSIS);
  const [recoveryLesson, setRecoveryLesson] = useState<RecoveryLesson>(DEFAULT_RECOVERY);
  const [reassessmentResult, setReassessmentResult] = useState<ReassessmentResult>(DEFAULT_REASSESSMENT);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfileItem[]>(INITIAL_LEARNER_PROFILE);

  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    checkServerHealth().then((health) => {
      setHasGeminiKey(health.hasGeminiKey);
    });
  }, []);

  const handleStartCapture = () => {
    setIsCameraOpen(true);
  };

  const handleImageCaptured = async (base64: string) => {
    setScannedImage(base64);
    setIsCameraOpen(false);
    setCurrentScreen('understand');
    setIsAnalyzing(true);

    try {
      const result = await analyzeMaterial({ imageBase64: base64 });
      setMaterialAnalysis(result);
    } catch (e) {
      console.warn('Using curated fallback analysis:', e);
      setMaterialAnalysis(DEFAULT_ANALYSIS);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextNotesSubmitted = async (text: string) => {
    setCurrentScreen('understand');
    setIsAnalyzing(true);
    try {
      const result = await analyzeMaterial({ textNotes: text });
      setMaterialAnalysis(result);
    } catch (e) {
      console.warn('Using curated fallback analysis:', e);
      setMaterialAnalysis(DEFAULT_ANALYSIS);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartDemoScenario = () => {
    setScannedImage(SAMPLE_WHITEBOARD_DATA_URL);
    setMaterialAnalysis(DEFAULT_ANALYSIS);
    setCurrentScreen('understand');
  };

  const handleProceedToAssessment = () => {
    setCurrentScreen('assessment');
  };

  const handleSubmitAssessment = async (answers: AssessmentAnswer) => {
    setIsEvaluating(true);
    try {
      const diagnosis = await evaluateAssessment({
        topic: materialAnalysis.topic || 'Binary Search',
        question: 'Explain in your own words why binary search is O(log n).',
        studentAnswer: answers.explanationAnswer,
        mcqAnswers: answers,
      });

      setDiagnosisResult(diagnosis);
      setCurrentScreen('diagnosis');

      // Pre-fetch recovery lesson in parallel
      generateRecoveryLesson({
        topic: materialAnalysis.topic || 'Binary Search',
        misconception: diagnosis.misconception || diagnosis.misconceptionHeadline || 'Student understands procedure but misses logarithmic complexity derivation.',
      }).then((lesson) => {
        setRecoveryLesson(lesson);
      });
    } catch (err) {
      console.warn('Using benchmark diagnostic:', err);
      setDiagnosisResult(DEFAULT_DIAGNOSIS);
      setRecoveryLesson(DEFAULT_RECOVERY);
      setCurrentScreen('diagnosis');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFixGap = () => {
    setCurrentScreen('recovery');
  };

  const handleSubmitReassessment = async (studentAnswer: string) => {
    setIsEvaluating(true);
    try {
      const result = await evaluateReassessment({
        studentAnswer,
        practiceQuestion: {
          prompt:
            recoveryLesson.practiceQuestion?.prompt ||
            'If there are 32 elements, approximately how many times can we halve the search space before reaching one?',
        },
      });
      setReassessmentResult(result);
      // Dynamically update the learner profile in state
      setLearnerProfile((prev) =>
        prev.map((item) => {
          const isTarget =
            item.name.toLowerCase().includes('complexity') ||
            (result.conceptName && item.name.toLowerCase().includes(result.conceptName.toLowerCase()));
          if (isTarget) {
            return {
              ...item,
              score: result.afterScore,
              status: 'Recovered & Mastered',
              trend: result.improvementDelta || `+${result.afterScore - (result.beforeScore || 47)}%`,
              warning: false,
            };
          }
          return item;
        })
      );
      setCurrentScreen('reassessment');
    } catch (err) {
      console.warn('Using benchmark reassessment:', err);
      setReassessmentResult(DEFAULT_REASSESSMENT);
      setLearnerProfile((prev) =>
        prev.map((item) =>
          item.name === 'Time Complexity'
            ? { ...item, score: 86, status: 'Recovered & Mastered', trend: '+39%', warning: false }
            : item
        )
      );
      setCurrentScreen('reassessment');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleProceedToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleResetDemo = () => {
    setScannedImage(SAMPLE_WHITEBOARD_DATA_URL);
    setMaterialAnalysis(DEFAULT_ANALYSIS);
    setDiagnosisResult(DEFAULT_DIAGNOSIS);
    setRecoveryLesson(DEFAULT_RECOVERY);
    setReassessmentResult(DEFAULT_REASSESSMENT);
    setLearnerProfile(INITIAL_LEARNER_PROFILE);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onReset={handleResetDemo}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'home' && (
          <HomeScreen
            onStartCapture={handleStartCapture}
            onImageSelected={handleImageCaptured}
            onTextNotesSubmitted={handleTextNotesSubmitted}
            onStartDemoScenario={handleStartDemoScenario}
          />
        )}

        {currentScreen === 'understand' && (
          <UnderstandScreen
            analysis={materialAnalysis}
            scannedImage={scannedImage}
            onStartLesson={() => setCurrentScreen('tutor')}
            isLoading={isAnalyzing}
          />
        )}

        {currentScreen === 'tutor' && (
          <TutorScreen
            analysis={materialAnalysis}
            onProceedToAssessment={handleProceedToAssessment}
          />
        )}

        {currentScreen === 'assessment' && (
          <AssessmentScreen
            analysis={materialAnalysis}
            onSubmitAssessment={handleSubmitAssessment}
            isEvaluating={isEvaluating}
          />
        )}

        {currentScreen === 'diagnosis' && (
          <DiagnosisScreen
            diagnosis={diagnosisResult}
            onFixGap={handleFixGap}
          />
        )}

        {currentScreen === 'recovery' && (
          <RecoveryLessonScreen
            lesson={recoveryLesson}
            onSubmitReassessment={handleSubmitReassessment}
            isEvaluating={isEvaluating}
          />
        )}

        {currentScreen === 'reassessment' && (
          <ReassessmentScreen
            result={reassessmentResult}
            onProceedToDashboard={handleProceedToDashboard}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            onScanNew={() => setCurrentScreen('home')}
            onNavigate={(screen) => setCurrentScreen(screen)}
            learnerProfile={learnerProfile}
            recommendedActivity={reassessmentResult.nextRecommendedActivity}
          />
        )}
      </main>

      {/* Phone Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleImageCaptured}
      />
    </div>
  );
}
