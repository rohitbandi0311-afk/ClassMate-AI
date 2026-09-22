import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  TrendingDown,
  Brain,
  Wrench,
  ShieldAlert,
  Flame,
  Check,
} from 'lucide-react';
import { DiagnosticResult } from '../types';

interface DiagnosisScreenProps {
  diagnosis: DiagnosticResult;
  onFixGap: () => void;
}

export const DiagnosisScreen: React.FC<DiagnosisScreenProps> = ({
  diagnosis,
  onFixGap,
}) => {
  // Normalize concept scores whether coming from concept_scores array or conceptUnderstanding map
  const conceptItems: { name: string; score: number }[] =
    diagnosis.concept_scores && diagnosis.concept_scores.length > 0
      ? diagnosis.concept_scores.map((cs) => ({ name: cs.concept, score: cs.score }))
      : diagnosis.conceptUnderstanding
      ? Object.entries(diagnosis.conceptUnderstanding).map(([name, score]) => ({
          name,
          score,
        }))
      : [
          { name: 'Sorted Arrays Requirement', score: 91 },
          { name: 'Divide & Conquer', score: 73 },
          { name: 'Search Space Reduction', score: 85 },
          { name: 'O(log n) Time Complexity', score: 47 },
        ];

  const overallScore = diagnosis.overall_score ?? diagnosis.overallMastery ?? 74;
  const severity = diagnosis.severity || 'high';

  const severityBadgeClass =
    severity === 'low'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : severity === 'medium'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

  const headline =
    diagnosis.misconception ||
    diagnosis.misconceptionHeadline ||
    'Student understands the binary-search procedure but cannot explain why repeatedly halving the search space produces logarithmic complexity.';

  const missingReasoningText =
    diagnosis.missing_reasoning ||
    (diagnosis.missingReasoning && diagnosis.missingReasoning.join(' • ')) ||
    'Did not connect repeatedly dividing N by 2 to the inverse power function: N / 2^k = 1 leads to k = log2(N).';

  const understoodList =
    diagnosis.understood && diagnosis.understood.length > 0
      ? diagnosis.understood
      : [
          'Understands requirement for ordered data elements',
          'Understands dividing the search list in half at midpoint',
          'Understands discarding irrelevant sub-intervals',
        ];

  const recommendedIntervention =
    diagnosis.recommended_intervention ||
    diagnosis.recommendedAction ||
    'Interactive 3-minute lesson bridging powers of 2, repeated halving ladder (16→8→4→2→1), and base-2 logarithm.';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Header */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold flex items-center gap-1 border border-rose-500/30">
            <Brain className="w-3.5 h-3.5" />
            ClassMate Cognitive Diagnostic
          </span>
          <span className="text-xs text-slate-400">• Misconception Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Misconception Diagnosis
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Beyond right or wrong: We identified your exact intuitive breakdown and generated a targeted 3-minute fix.
        </p>
      </div>

      {/* Understanding Scores Breakdown */}
      <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            Concept Understanding Breakdown
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Overall Score:{' '}
              <span className="font-mono font-bold text-sky-400">{overallScore}%</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {conceptItems.map((item) => {
            const isWeakest = item.score < 60;
            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-white flex items-center gap-2">
                    {item.name}
                    {isWeakest && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Gap Detected
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      isWeakest ? 'text-rose-400' : item.score >= 85 ? 'text-emerald-400' : 'text-sky-400'
                    }`}
                  >
                    {item.score}%
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isWeakest
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                        : item.score >= 85
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visually Prominent Warning Card: MISCONCEPTION DETECTED */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-amber-950/60 border-2 border-rose-500/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                Misconception Detected
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${severityBadgeClass}`}>
                Severity: {severity}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug mb-3">
              "{headline}"
            </h3>

            {/* What you correctly understood */}
            <div className="mb-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                <Check className="w-3.5 h-3.5" />
                What You Understood Correctly:
              </span>
              <div className="space-y-1">
                {understoodList.map((item, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 text-xs">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Reasoning Points */}
            <div className="mb-4 bg-slate-950/70 p-3.5 rounded-xl border border-rose-500/30">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 mb-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                Missing Cognitive Reasoning:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {missingReasoningText}
              </p>
            </div>

            {/* Recommended Intervention */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              <span className="font-bold text-amber-300 block mb-0.5">Recommended Intervention:</span>
              <span>{recommendedIntervention}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Recovery CTA */}
      <div className="sticky bottom-4 z-30 pt-2">
        <button
          id="btn-start-recovery"
          onClick={onFixGap}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold text-base shadow-xl shadow-rose-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-amber-400/40 group"
        >
          <Flame className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
          <span>Fix this gap (Start 3-minute recovery)</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
