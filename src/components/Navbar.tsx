import React from 'react';
import {
  Sparkles,
  Camera,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BarChart3,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { ScreenType } from '../types';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onReset: () => void;
  hasGeminiKey: boolean;
}

const STEPS: { id: ScreenType; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Capture', icon: Camera },
  { id: 'understand', label: 'Understand', icon: BookOpen },
  { id: 'tutor', label: 'Tutor', icon: MessageSquare },
  { id: 'assessment', label: 'Assess', icon: CheckCircle2 },
  { id: 'diagnosis', label: 'Diagnose', icon: AlertTriangle },
  { id: 'recovery', label: 'Recover', icon: Flame },
  { id: 'reassessment', label: 'Reassess', icon: Sparkles },
  { id: 'dashboard', label: 'Mastery', icon: BarChart3 },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onReset,
  hasGeminiKey,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentScreen);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div
            id="nav-logo"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  ClassMate AI
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden xs:block">
                From classroom to mastery
              </p>
            </div>
          </div>

          {/* Quick status & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">
                {hasGeminiKey ? 'Gemini 3.8 Flash' : 'Smart Demo Mode'}
              </span>
              <span className="text-slate-400 text-[11px] sm:hidden">
                Live
              </span>
            </div>

            <button
              id="btn-restart-demo"
              onClick={onReset}
              title="Reset Demo"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Reset</span>
            </button>
          </div>
        </div>

        {/* Step Flow Ribbon */}
        <div className="mt-2 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[560px] sm:min-w-0 text-xs">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.id === currentScreen;
              const isPast = idx < currentIndex;

              return (
                <button
                  key={step.id}
                  id={`nav-step-${step.id}`}
                  onClick={() => onNavigate(step.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30'
                      : isPast
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="whitespace-nowrap text-[11px]">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
