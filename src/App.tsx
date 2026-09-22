import React, { useState, useEffect } from 'react';
import {
  ScreenType,
  MaterialAnalysis,
  DiagnosticResult,
  RecoveryLesson,
  ReassessmentResult,
  LearnerProfileItem,
  AssessmentAnswer,
} from './types';
import {
  checkServerHealth,
  analyzeMaterial,
  evaluateAssessment,
  generateRecoveryLesson,
  evaluateReassessment,
} from './services/api';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { UnderstandScreen } from './components/UnderstandScreen';
import { TutorScreen } from './components/TutorScreen';
import { AssessmentScreen } from './components/AssessmentScreen';
import { DiagnosisScreen } from './components/DiagnosisScreen';
import { RecoveryLessonScreen } from './components/RecoveryLessonScreen';
import { ReassessmentScreen } from './components/ReassessmentScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { CameraScannerModal } from './components/CameraScannerModal';
import { SAMPLE_WHITEBOARD_DATA_URL } from './data/sampleWhiteboard';

const DEFAULT_ANALYSIS: MaterialAnalysis = {
  subject: 'Computer Science & Algorithms',
  topic: 'Binary Search',
  subtitle: 'Logarithmic Divide & Conquer in Sorted Sequences',
  overview:
    'Binary Search efficiently finds an element in a sorted collection by repeatedly dividing the search space in half, eliminating 50% of candidates at each step.',
  concepts: [
    {
      id: 'c1',
      name: 'Sorted Arrays Requirement',
      description:
        'The data must be ordered so comparing target with mid eliminates half the remaining elements.',
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
        'Solving N / (2^k) = 1 yields k = log2(N) maximum comparisons, exponentially faster than linear scans.',
      category: 'Analysis',
      importance: 'Key Assessment Topic',
    },
  ],
  definitions: [
    {
      term: 'Sorted Array',
      definition:
        'An array where every element is in ascending (or descending) order, allowing directional pruning.',
    },
    {
      term: 'Search Space',
      definition:
        'The contiguous subset of indices [low, high] that could still contain the target value.',
    },
  ],
  examples: [
    {
      title: 'Searching for 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]',
      codeOrExplanation:
        'Step 1: mid = 16. 23 > 16, discard left half.\nStep 2: mid = 56. 23 < 56, discard right half.\nStep 3: mid = 23. Target found in 3 comparisons!',
    },
  ],
  learningObjectives: [
    'Verify that the data satisfies the monotonic sorting invariant before searching',
    'Calculate the integer midpoint without arithmetic overflow',
    'Explain why repeatedly halving candidate elements leads to O(log n) performance',
  ],
  estimatedDurationMinutes: 8,
  assessmentQuestions: [
    {
      id: 'q1',
      type: 'mcq',
      prompt: 'What condition MUST hold for Binary Search to guarantee correctness?',
      options: [
        { id: 'a', label: 'All elements must be distinct' },
        { id: 'b', label: 'Elements must be arranged in sorted order' },
        { id: 'c', label: 'Array length must be an even integer' },
        { id: 'd', label: 'Data must be stored in a linked list' },
      ],
      hint: 'Think about how the comparison at midpoint decides which entire half to discard.',
      targetConcept: 'Sorted Arrays Requirement',
    },
    {
      id: 'q2',
      type: 'short_answer',
      prompt:
        'If an array contains 1,024 elements, how many comparisons does Binary Search take in the worst case?',
      hint: 'Calculate k where 2^k = 1,024.',
      targetConcept: 'O(log n) Time Complexity',
    },
    {
      id: 'q3',
      type: 'explanation',
      prompt:
        'Explain in your own words why repeatedly halving the search space yields O(log n) time complexity rather than O(n).',
      hint: 'Connect the halving mechanism to the mathematical definition of logarithms base 2.',
      targetConcept: 'Search-Space Reduction',
    },
  ],
};

const DEFAULT_DIAGNOSIS: DiagnosticResult = {
  overall_score: 74,
  concept_scores: [
    { concept: 'Sorted arrays requirement', score: 95 },
    { concept: 'Divide & conquer intuition', score: 88 },
    { concept: 'Search space reduction', score: 65 },
    { concept: 'Time complexity log2(N)', score: 47 },
  ],
  understood: [
    'Understands the basic procedure and halving mechanism',
    'Correctly identifies the prerequisite of sorted elements',
    'Recognizes that mid divides the array into two subsets',
  ],
  misconception:
    'Confusing "halving the search space" with "halving the total time taken" (O(n/2) instead of O(log n))',
  missing_reasoning:
    'The student understands that the search space is divided by 2 at each step, but treats the complexity as dividing the work in half once (like n/2), missing that repeated halving corresponds to the inverse of exponentiation (2^k = n, so k = log2 n steps).',
  severity: 'medium',
  recommended_intervention:
    '3-minute visual recovery on exponential growth vs logarithmic reduction ladder.',
};

const DEFAULT_RECOVERY: RecoveryLesson = {
  title: '3-minute recovery: From Halving to O(log n)',
  targetGap: 'Connecting repeated halving to logarithmic complexity',
  simpleExplanation:
    'Every comparison cuts the remaining candidates by 50%. After 1 step: N/2. After 2 steps: N/4. After k steps: N / (2^k). When only 1 candidate remains, N / (2^k) = 1, meaning 2^k = N. Taking log2 of both sides gives k = log2(N).',
  intuitiveAnalogy:
    'Imagine folding a long strip of paper in half over and over. You don\'t need N folds to make it tiny—even a strip of 1,000,000 centimeters only takes 20 folds to reduce to less than 1 centimeter!',
  workedExample:
    'Start with N = 16 elements:\n• Step 1: 16 / 2 = 8 candidates remain\n• Step 2: 8 / 2 = 4 candidates remain\n• Step 3: 4 / 2 = 2 candidates remain\n• Step 4: 2 / 2 = 1 candidate left!\nTotal steps = 4. Notice that 2^4 = 16, so log2(16) = 4 comparisons.',
  practiceQuestion: {
    prompt:
      'If there are 32 elements in a sorted array, approximately how many times can we halve the search space before reaching 1 element?',
    expectedAnswer: '5 times, because 2^5 = 32',
    hint: 'Think about powers of 2: 2, 4, 8, 16, 32...',
  },
  halvingLadder: [
    { count: 32, note: 'Initial array length' },
    { count: 16, note: 'After 1 comparison (halved)' },
    { count: 8, note: 'After 2 comparisons (halved)' },
    { count: 4, note: 'After 3 comparisons (halved)' },
    { count: 2, note: 'After 4 comparisons (halved)' },
    { count: 1, note: 'After 5 comparisons: target isolated! k = 5 = log2(32)' },
  ],
};

const INITIAL_LEARNER_PROFILE: LearnerProfileItem[] = [
  { id: '1', name: 'Sorted Preconditions', score: 95, status: 'Mastered', trend: '+12%', warning: false },
  { id: '2', name: 'Divide & Conquer', score: 88, status: 'Mastered', trend: '+8%', warning: false },
  { id: '3', name: 'Search-Space Halving', score: 72, status: 'Review Needed', trend: '+4%', warning: false },
  { id: '4', name: 'Time Complexity', score: 47, status: 'Misconception Detected', trend: '-18%', warning: true },
];

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
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Keep track of the last submitted input so retry works seamlessly
  const [lastSubmittedImage, setLastSubmittedImage] = useState<string | null>(null);
  const [lastSubmittedNotes, setLastSubmittedNotes] = useState<string | null>(null);

  useEffect(() => {
    checkServerHealth().then((health) => {
      setHasGeminiKey(health.hasGeminiKey);
    });
  }, []);

  const handleStartCapture = () => {
    setIsCameraOpen(true);
  };

  const handleImageCaptured = async (base64: string) => {
    setAnalysisError(null);
    setLastSubmittedImage(base64);
    setLastSubmittedNotes(null);
    setScannedImage(base64);
    setIsCameraOpen(false);
    setCurrentScreen('understand');
    setIsAnalyzing(true);

    try {
      const result = await analyzeMaterial({ imageBase64: base64 });
      setMaterialAnalysis(result);
      if (result.concepts && result.concepts.length > 0) {
        setLearnerProfile(
          result.concepts.map((c, i) => ({
            id: c.id || `c-${i}`,
            name: c.name,
            score: 75 + ((i * 7) % 20),
            status: 'In Progress',
            trend: '+5%',
            warning: false,
          }))
        );
      }
    } catch (e: any) {
      console.error('Gemini image analysis failed:', e);
      setAnalysisError(e?.message || 'Failed to analyze classroom material with Gemini Vision.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextNotesSubmitted = async (text: string) => {
    setAnalysisError(null);
    setLastSubmittedImage(null);
    setLastSubmittedNotes(text);
    setScannedImage(null);
    setCurrentScreen('understand');
    setIsAnalyzing(true);

    try {
      const result = await analyzeMaterial({ textNotes: text });
      setMaterialAnalysis(result);
      if (result.concepts && result.concepts.length > 0) {
        setLearnerProfile(
          result.concepts.map((c, i) => ({
            id: c.id || `c-${i}`,
            name: c.name,
            score: 75 + ((i * 7) % 20),
            status: 'In Progress',
            trend: '+5%',
            warning: false,
          }))
        );
      }
    } catch (e: any) {
      console.error('Gemini notes analysis failed:', e);
      setAnalysisError(e?.message || 'Failed to analyze study notes with Gemini.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryAnalysis = () => {
    if (lastSubmittedImage) {
      handleImageCaptured(lastSubmittedImage);
    } else if (lastSubmittedNotes) {
      handleTextNotesSubmitted(lastSubmittedNotes);
    } else {
      setCurrentScreen('home');
    }
  };

  const handleStartDemoScenario = () => {
    setAnalysisError(null);
    setScannedImage(SAMPLE_WHITEBOARD_DATA_URL);
    setMaterialAnalysis(DEFAULT_ANALYSIS);
    setDiagnosisResult(DEFAULT_DIAGNOSIS);
    setRecoveryLesson(DEFAULT_RECOVERY);
    setReassessmentResult(DEFAULT_REASSESSMENT);
    setCurrentScreen('understand');
  };

  const handleProceedToAssessment = () => {
    setCurrentScreen('assessment');
  };

  const handleSubmitAssessment = async (answers: AssessmentAnswer) => {
    setIsEvaluating(true);
    try {
      const explanationPrompt =
        materialAnalysis.assessmentQuestions?.find((q) => q.type === 'explanation')?.prompt ||
        `Explain in your own words why ${materialAnalysis.topic} works the way it does.`;

      const diagnosis = await evaluateAssessment({
        material: materialAnalysis,
        topic: materialAnalysis.topic || 'Classroom Material',
        question: explanationPrompt,
        studentAnswer: answers.explanationAnswer,
        mcqAnswers: answers,
      });

      setDiagnosisResult(diagnosis);
      if (diagnosis.concept_scores && diagnosis.concept_scores.length > 0) {
        setLearnerProfile(
          diagnosis.concept_scores.map((cs, i) => ({
            id: `diag-${i}`,
            name: cs.concept,
            score: cs.score,
            status: cs.score >= 80 ? 'Mastered' : cs.score >= 60 ? 'Review Needed' : 'Misconception Detected',
            trend: cs.score >= 80 ? '+10%' : cs.score >= 60 ? '+2%' : '-15%',
            warning: cs.score < 60,
          }))
        );
      }
      setCurrentScreen('diagnosis');

      // Pre-fetch recovery lesson in parallel
      generateRecoveryLesson({
        topic: materialAnalysis.topic || 'Classroom Material',
        misconception:
          diagnosis.misconception ||
          diagnosis.misconceptionHeadline ||
          'Connecting core intuition to foundational principles',
        missingReasoning: diagnosis.missing_reasoning,
      })
        .then((lesson) => {
          setRecoveryLesson(lesson);
        })
        .catch((err) => {
          console.warn('Background recovery lesson generation warning:', err);
        });
    } catch (err: any) {
      console.error('Assessment evaluation error:', err);
      // Only if this was the preloaded demo scenario, fall back to default
      if (materialAnalysis.topic === 'Binary Search') {
        setDiagnosisResult(DEFAULT_DIAGNOSIS);
        setRecoveryLesson(DEFAULT_RECOVERY);
        setCurrentScreen('diagnosis');
      } else {
        alert(`Evaluation error: ${err?.message || 'Could not evaluate answers with AI'}`);
      }
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
            'How would you apply this newly repaired concept in a fresh scenario?',
        },
        targetConcept: recoveryLesson.targetGap || materialAnalysis.topic,
        beforeScore: diagnosisResult.overall_score || 47,
      });

      setReassessmentResult(result);

      // Dynamically update the learner profile in state for the repaired concept
      const targetTerm = (result.conceptName || recoveryLesson.targetGap || materialAnalysis.topic || '').toLowerCase();
      setLearnerProfile((prev) => {
        let matched = false;
        const updated = prev.map((item) => {
          const itemLower = item.name.toLowerCase();
          const isTarget =
            (targetTerm && (itemLower.includes(targetTerm) || targetTerm.includes(itemLower))) ||
            item.warning;
          if (isTarget && !matched) {
            matched = true;
            return {
              ...item,
              score: result.afterScore,
              status: 'Recovered & Mastered',
              trend: result.improvementDelta || `+${result.afterScore - (result.beforeScore || 47)}%`,
              warning: false,
            };
          }
          return item;
        });

        if (!matched && prev.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            score: result.afterScore,
            status: 'Recovered & Mastered',
            trend: result.improvementDelta || '+35%',
            warning: false,
          };
        }
        return updated;
      });
      setCurrentScreen('reassessment');
    } catch (err: any) {
      console.error('Reassessment evaluation failed:', err);
      if (materialAnalysis.topic === 'Binary Search') {
        setReassessmentResult(DEFAULT_REASSESSMENT);
        setLearnerProfile((prev) =>
          prev.map((item) =>
            item.name === 'Time Complexity'
              ? { ...item, score: 86, status: 'Recovered & Mastered', trend: '+39%', warning: false }
              : item
          )
        );
        setCurrentScreen('reassessment');
      } else {
        alert(`Reassessment evaluation error: ${err?.message || 'Could not evaluate reassessment'}`);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleProceedToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleResetDemo = () => {
    setAnalysisError(null);
    setLastSubmittedImage(null);
    setLastSubmittedNotes(null);
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
            errorMessage={analysisError}
            onRetry={handleRetryAnalysis}
            onLoadDemo={handleStartDemoScenario}
            onBackHome={() => setCurrentScreen('home')}
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
            topic={materialAnalysis.topic}
            onProceedToDashboard={handleProceedToDashboard}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            topic={materialAnalysis.topic}
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
