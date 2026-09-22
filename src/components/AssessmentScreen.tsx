import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  ArrowRight,
  HelpCircle,
  Send,
  Loader2,
  FileQuestion,
  Lightbulb,
} from 'lucide-react';
import { AssessmentAnswer, MaterialAnalysis, AssessmentQuestion } from '../types';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
} from '../utils/speech';

interface AssessmentScreenProps {
  analysis: MaterialAnalysis;
  onSubmitAssessment: (answers: AssessmentAnswer) => void;
  isEvaluating: boolean;
}

export const AssessmentScreen: React.FC<AssessmentScreenProps> = ({
  analysis,
  onSubmitAssessment,
  isEvaluating,
}) => {
  const isBinarySearch = !analysis.topic || analysis.topic.toLowerCase().includes('binary search');
  const dynamicQuestions: AssessmentQuestion[] = analysis.assessmentQuestions && analysis.assessmentQuestions.length >= 3
    ? analysis.assessmentQuestions
    : isBinarySearch
    ? [
        {
          id: 'q1',
          type: 'mcq',
          prompt: 'What is the absolute mandatory requirement for Binary Search to guarantee correctness?',
          options: [
            { id: 'sorted', label: 'The array elements must be ordered (monotonically sorted)' },
            { id: 'linked', label: 'The data must be stored in a Doubly Linked List' },
            { id: 'fixed', label: 'The collection must have an even number of elements' },
            { id: 'hash', label: 'A secondary hash index must be precomputed' },
          ],
          targetConcept: 'Sorted Arrays Requirement',
        },
        {
          id: 'q2',
          type: 'short_answer',
          prompt: 'In a sorted array with 64 elements, what is the maximum number of comparisons binary search will make in the worst case?',
          hint: 'How many times can 64 be divided by 2? (2^k = 64)',
          targetConcept: 'Search-Space Reduction',
        },
        {
          id: 'q3',
          type: 'explanation',
          prompt: 'Explain in your own words why binary search is O(log n).',
          hint: 'Connect the halving of the list to inverse powers of 2.',
          targetConcept: 'O(log n) Time Complexity',
        },
      ]
    : [
        {
          id: 'q1',
          type: 'mcq',
          prompt: `What is the foundational prerequisite or structural rule for ${analysis.topic}?`,
          options: [
            { id: 'opt_a', label: 'Satisfying the structural definitions and invariants of the domain' },
            { id: 'opt_b', label: 'Allowing arbitrary inconsistent data representation' },
            { id: 'opt_c', label: 'Ignoring entity relationships and constraints' },
            { id: 'opt_d', label: 'Restricting access exclusively to single-record memory caches' },
          ],
          targetConcept: `${analysis.topic} Foundations`,
        },
        {
          id: 'q2',
          type: 'short_answer',
          prompt: `What primary distinguishing property characterizes the core concepts in ${analysis.topic}?`,
          hint: 'Think about definitions, cardinalities, or operational rules.',
          targetConcept: `${analysis.topic} Core Principles`,
        },
        {
          id: 'q3',
          type: 'explanation',
          prompt: `Explain in your own words the significance of ${analysis.topic} and how its core concepts relate to one another.`,
          hint: 'Describe clear real-world examples and why the distinction matters.',
          targetConcept: `${analysis.topic} Application`,
        },
      ];

  const q1 = dynamicQuestions[0];
  const q2 = dynamicQuestions[1];
  const q3 = dynamicQuestions[2];

  const [mcq1, setMcq1] = useState<string>(q1.options?.[0]?.id || 'sorted');
  const [shortAnswer, setShortAnswer] = useState<string>('6 checks (2^6 = 64)');
  const [explanationAnswer, setExplanationAnswer] = useState<string>('');
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
      alert('Speech recognition is not supported in this browser. Please type your explanation.');
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
          setExplanationAnswer((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
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

  // Sample student answer that demonstrates understanding of procedure but misses the logarithmic derivation
  const loadTypicalStudentAnswer = () => {
    if (analysis.topic.toLowerCase().includes('binary search')) {
      setExplanationAnswer(
        'Binary search is very fast because every time you compare the target with the middle element, you cut the entire list in half and discard the wrong half. You keep repeating this division until you find the exact number.'
      );
    } else {
      setExplanationAnswer(
        `It works step by step because each part is separated and tested quickly, making the whole process much faster than checking every item one by one.`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanationAnswer.trim()) {
      alert('Please provide an explanation for the core question to enable misconception diagnosis.');
      return;
    }

    onSubmitAssessment({
      mcq1,
      shortAnswer,
      explanationAnswer,
      coreQuestionPrompt: q3.prompt,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Assessment Header */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[11px] font-semibold flex items-center gap-1">
            <FileQuestion className="w-3.5 h-3.5" />
            Knowledge Check &amp; Cognitive Diagnosis
          </span>
          <span className="text-xs text-slate-400">• Dynamic Questions</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Assess Your Understanding: {analysis.topic || 'Binary Search'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          We evaluate the depth of your conceptual reasoning, not just multiple-choice memory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question 1: MCQ */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              Question 1 • Multiple Choice
            </span>
            <span className="text-[11px] text-slate-500">{q1.targetConcept || 'Prerequisite'}</span>
          </div>
          <h3 className="text-sm font-semibold text-white mb-3">
            {q1.prompt}
          </h3>

          <div className="space-y-2">
            {q1.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                  mcq1 === option.id
                    ? 'bg-sky-500/15 border-sky-500 text-white font-medium'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="mcq1"
                  value={option.id}
                  checked={mcq1 === option.id}
                  onChange={() => setMcq1(option.id)}
                  className="accent-sky-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 2: Short Answer */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Question 2 • Application / Calculation
            </span>
            <span className="text-[11px] text-slate-500">{q2.targetConcept || 'Reasoning'}</span>
          </div>
          <h3 className="text-sm font-semibold text-white mb-2">
            {q2.prompt}
          </h3>
          {q2.hint && (
            <p className="text-xs text-slate-400 mb-3 italic">
              Hint: {q2.hint}
            </p>
          )}
          <input
            type="text"
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            placeholder="Type your short answer or calculation..."
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-white focus:outline-none"
          />
        </div>

        {/* Question 3: Core Open-Ended Explanation Question */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-500/40 shadow-xl relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                CORE QUESTION
              </span>
              <span className="text-xs text-sky-300 font-bold">Key Differentiator</span>
            </div>
            <span className="text-[11px] text-slate-400">Diagnosis Source</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            "{q3.prompt}"
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Type or speak your answer in your own words. Gemini evaluates the depth of your causal reasoning.
          </p>

          {/* Quick Demo Pre-fill Pill & Mic */}
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <button
              type="button"
              onClick={loadTypicalStudentAnswer}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all font-medium self-start"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate typical student answer (for quick demo)</span>
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
              <span>{isListening ? 'Recording voice...' : 'Answer by voice'}</span>
            </button>
          </div>

          <textarea
            id="input-explanation"
            value={explanationAnswer}
            onChange={(e) => setExplanationAnswer(e.target.value)}
            rows={4}
            placeholder="Explain in your own words how and why this works..."
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-sky-400 focus:outline-none text-white text-sm leading-relaxed placeholder-slate-600 transition-colors"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{explanationAnswer.length} characters</span>
            <span>Gemini evaluates conceptual depth &amp; misconceptions</span>
          </div>
        </div>

        {/* Submit Assessment Button */}
        <div className="sticky bottom-4 z-30 pt-2">
          <button
            type="submit"
            id="btn-submit-assessment"
            disabled={isEvaluating}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Diagnosing Misconceptions with Gemini...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Submit for Misconception Diagnosis</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
