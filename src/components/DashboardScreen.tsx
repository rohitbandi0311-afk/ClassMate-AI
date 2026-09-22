import React from 'react';
import {
  BarChart3,
  Sparkles,
  Camera,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Play,
  CheckCircle2,
  BookOpen,
  Award,
  Zap,
  Lightbulb,
  Calendar,
  Check,
} from 'lucide-react';
import { ScreenType } from '../types';

export interface LearnerProfileItem {
  name: string;
  score: number;
  status: string;
  trend: string;
  warning?: boolean;
}

interface DashboardScreenProps {
  onScanNew: () => void;
  onNavigate: (screen: ScreenType) => void;
  learnerProfile?: LearnerProfileItem[];
  recommendedActivity?: string;
  topic?: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onScanNew,
  onNavigate,
  learnerProfile,
  recommendedActivity,
  topic,
}) => {
  const isBinarySearchTopic = !topic || topic.toLowerCase().includes('binary search');
  const masteryItems: LearnerProfileItem[] = learnerProfile && learnerProfile.length > 0
    ? learnerProfile
    : isBinarySearchTopic
    ? [
        { name: 'Binary Search', score: 88, status: 'Mastered', trend: '+14%' },
        { name: 'Arrays', score: 76, status: 'Proficient', trend: '+5%' },
        { name: 'Time Complexity', score: 86, status: 'Recovered & Mastered', trend: '+39%' },
        { name: 'Recursion', score: 42, status: 'Needs Intervention', trend: 'Gap Alert', warning: true },
      ]
    : [
        { name: topic, score: 92, status: 'Mastered', trend: '+20%' },
        { name: `${topic} Definitions`, score: 85, status: 'Proficient', trend: '+12%' },
        { name: `${topic} Structure & Invariants`, score: 88, status: 'Recovered & Mastered', trend: '+35%' },
        { name: `${topic} Advanced Modeling`, score: 58, status: 'Needs Intervention', trend: 'Gap Alert', warning: true },
      ];

  const nextActivity =
    recommendedActivity ||
    (topic
      ? `5-minute Advanced Case Studies on ${topic}`
      : '5-minute Recursion Fundamentals (Strengthen call stack intuition to elevate Divide & Conquer above 90%)');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Student Profile & Overview Header */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[11px] font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Student Learning Profile
            </span>
            <span className="text-xs text-slate-400">ClassMate ID: CM-2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learning Mastery Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time mastery index for <strong className="text-sky-400 font-semibold">{topic || 'Classroom Topics'}</strong> generated from board scans &amp; diagnostic loops.
          </p>
        </div>

        <button
          id="btn-scan-new-board"
          onClick={onScanNew}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Scan New Board</span>
        </button>
      </div>

      {/* Recommended Next Learning Activity Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-rose-950/40 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Recommended Next Activity
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                  Priority 1
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {nextActivity}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                Diagnosed from your assessment loop: strengthening this foundational concept will elevate your mastery across the entire topic.
              </p>
            </div>
          </div>

          <button
            onClick={() => onScanNew()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Activity</span>
          </button>
        </div>
      </div>

      {/* Concept Mastery Breakdown Section */}
      <div className="mb-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {topic ? `${topic} Mastery Index` : 'Subject Mastery Index'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">Cognitive Competency Tracking</span>
        </div>

        {/* Highlight weak concepts table */}
        <div className="space-y-4">
          {masteryItems.map((item) => (
            <div
              key={item.name}
              className={`p-4 rounded-xl border transition-all ${
                item.warning
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-950/70 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm sm:text-base">
                    {item.name}
                  </span>
                  {item.warning ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      42% ⚠️ Needs Attention
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {item.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-mono font-medium">
                    {item.trend}
                  </span>
                  <span
                    className={`font-mono font-extrabold text-base ${
                      item.warning
                        ? 'text-rose-400'
                        : item.score >= 85
                        ? 'text-emerald-400'
                        : 'text-sky-400'
                    }`}
                  >
                    {item.score}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.warning
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                      : item.score >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Innovation Summary Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/20 text-slate-300">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              ClassMate AI: Continuous Cognitive Loop
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every blackboard scan you take builds this real-time mastery tree. When you leave the classroom, ClassMate AI ensures you don't just remember facts, but master the underlying causal links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
