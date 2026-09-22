import React from 'react';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Award,
  Zap,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { ReassessmentResult } from '../types';

interface ReassessmentScreenProps {
  result: ReassessmentResult;
  onProceedToDashboard: () => void;
}

export const ReassessmentScreen: React.FC<ReassessmentScreenProps> = ({
  result,
  onProceedToDashboard,
}) => {
  const beforeScore = result.beforeScore || 47;
  const afterScore = result.afterScore || 86;
  const delta = afterScore - beforeScore;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5" />
          Mastery Loop Validated
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Concept Improved!
        </h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Your cognitive gap has been verified and bridged through targeted 3-minute intervention.
        </p>
      </div>

      {/* Before / After Visualization Card */}
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Evaluated Concept
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {result.conceptName || 'Time Complexity'}
            </h2>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm sm:text-base flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
            <span>+{delta}% Gain</span>
          </div>
        </div>

        {/* Side by Side Comparison Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* BEFORE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                BEFORE INTERVENTION
              </span>
              <span className="text-xs text-slate-400">Initial Assessment</span>
            </div>
            <div className="my-4">
              <span className="text-3xl sm:text-5xl font-mono font-extrabold text-slate-400">
                {beforeScore}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-slate-600 rounded-full"
                style={{ width: `${beforeScore}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-rose-400 font-semibold mt-2 block">
              ⚠️ Misconception Detected
            </span>
          </div>

          {/* AFTER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border-2 border-emerald-500/60 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                AFTER 3-MIN RECOVERY
              </span>
              <span className="text-xs text-emerald-300 font-medium">Reassessed Mastery</span>
            </div>
            <div className="my-4">
              <span className="text-3xl sm:text-5xl font-mono font-extrabold text-emerald-400">
                {afterScore}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-emerald-500/30">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-1000"
                style={{ width: `${afterScore}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-emerald-300 font-bold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Concept Mastered
            </span>
          </div>
        </div>

        {/* Detailed Feedback & Summary */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p className="font-semibold text-white mb-1">Evaluator Feedback:</p>
          <p className="text-slate-300">
            {result.feedback ||
              'Outstanding! You correctly explained that 32 halves 5 times (32 → 16 → 8 → 4 → 2 → 1) because 2⁵ = 32. Your intuition for why the worst-case number of comparisons is logarithmic is now crystal clear.'}
          </p>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">
            Binary Search Foundations Unlocked
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            You successfully navigated the entire loop: Capture → Teach → Assess → Diagnose → Recover → Reassess.
          </p>
        </div>
      </div>

      {/* Primary CTA: "Continue learning" -> Screen 8 Dashboard */}
      <div className="sticky bottom-4 z-30 pt-2">
        <button
          id="btn-continue-learning"
          onClick={onProceedToDashboard}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-sky-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
        >
          <BarChart3 className="w-5 h-5 text-white" />
          <span>Continue Learning • View Student Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
