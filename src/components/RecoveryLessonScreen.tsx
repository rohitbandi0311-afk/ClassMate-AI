import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  ArrowRight,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Mic,
  Calculator,
  Layers,
  Loader2,
  TrendingUp,
  Compass,
  FileQuestion,
} from 'lucide-react';
import { RecoveryLesson } from '../types';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
} from '../utils/speech';

interface RecoveryLessonScreenProps {
  lesson: RecoveryLesson;
  onSubmitReassessment: (studentAnswer: string) => void;
  isEvaluating: boolean;
}

export const RecoveryLessonScreen: React.FC<RecoveryLessonScreenProps> = ({
  lesson,
  onSubmitReassessment,
  isEvaluating,
}) => {
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);

  const speechRecognizerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isListening) {
      speechRecognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        (transcript, isFinal) => {
          setPracticeAnswer(transcript);
          if (isFinal) {
            setIsListening(false);
          }
        },
        () => setIsListening(false)
      );

      if (recognizer) {
        speechRecognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const loadDemoAnswer = () => {
    const demo =
      lesson.practiceQuestion?.expectedAnswer ||
      '5 times, because 32 = 2^5, so halving goes 32 -> 16 -> 8 -> 4 -> 2 -> 1 (5 halvings)';
    setPracticeAnswer(demo);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceAnswer.trim()) {
      alert('Please answer the practice question to check if your gap is resolved.');
      return;
    }
    onSubmitReassessment(practiceAnswer);
  };

  const halvingSteps = lesson.halvingLadder || [
    { count: 16, note: 'Initial candidate pool (Step 0)' },
    { count: 8, note: 'Halved once: 16 / 2 = 8 (Step 1)' },
    { count: 4, note: 'Halved twice: 8 / 2 = 4 (Step 2)' },
    { count: 2, note: 'Halved three times: 4 / 2 = 2 (Step 3)' },
    { count: 1, note: 'Target element isolated! (Step 4)' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Recovery Title & Header */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/40 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/30">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {lesson.title || '3-minute recovery'}
          </span>
          <span className="text-xs text-slate-400">• Targeted Cognitive Intervention</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Bridging the Gap: {lesson.targetGap || 'Logarithmic Halving vs. O(log n)'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Target: Resolving the specific misconception detected in your assessment.
        </p>
      </div>

      {/* Part 1: Simple Explanation */}
      <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            1. Simple Explanation
          </h2>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {lesson.simpleExplanation ||
            lesson.simpleIntuition ||
            'Instead of asking "How many numbers do I test?", ask the inverse: "How many times can I divide N by 2 before only 1 item remains?"'}
        </p>
      </div>

      {/* Part 2: Intuitive Analogy */}
      <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-300">
            2. Intuitive Analogy
          </h2>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed italic">
          "{lesson.intuitiveAnalogy ||
            'Imagine folding a giant newspaper in half over and over. Doubling unfolds it exponentially; folding it in half is logarithmic. With just 4 folds of a 16-page sheet, you reach a single page.'}"
        </p>
      </div>

      {/* Part 3: Worked Example */}
      <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            3. Worked Example
          </h2>
        </div>

        {lesson.workedExample ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-line mb-3">
            {lesson.workedExample}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {halvingSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono"
              >
                <span className="text-sky-300 font-bold">N = {step.count}</span>
                <span className="text-slate-400 text-right">{step.note}</span>
              </div>
            ))}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
          <span className="font-bold text-white block mb-1">The Mathematical Connection:</span>
          <span>
            {lesson.mathematicalInsight ||
              'If we start with N items and divide by 2 for k steps until 1 item remains: N / (2^k) = 1  ==>  2^k = N  ==>  k = log₂(N). That is why the time complexity is O(log n)!'}
          </span>
        </div>
      </div>

      {/* Part 4: Targeted Practice Question */}
      <div className="mb-6 p-5 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Targeted Practice Question
            </span>
          </div>
          <span className="text-xs text-slate-400">Prove Mastery</span>
        </div>

        <h3 className="text-base font-bold text-white mb-2">
          {lesson.practiceQuestion?.prompt ||
            'If there are 32 elements, approximately how many times can we halve the search space before reaching one?'}
        </h3>

        {lesson.practiceQuestion?.hint && (
          <p className="text-xs text-slate-400 mb-3 italic">
            Hint: {lesson.practiceQuestion.hint}
          </p>
        )}

        {/* Demo Helper & Voice Dictation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={loadDemoAnswer}
            className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all font-medium self-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Quick Demo Answer</span>
          </button>

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isListening ? 'Listening...' : 'Voice input'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={practiceAnswer}
            onChange={(e) => setPracticeAnswer(e.target.value)}
            rows={3}
            placeholder="Type your answer connecting the concept to this new problem..."
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-slate-600 mb-4"
          />

          <button
            type="submit"
            id="btn-submit-reassessment"
            disabled={isEvaluating}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Evaluating Reassessment with Gemini...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Submit &amp; Reassess Progress</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
