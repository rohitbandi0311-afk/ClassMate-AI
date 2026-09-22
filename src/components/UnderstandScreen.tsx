import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  ArrowRight,
  Eye,
  Maximize2,
  X,
  Target,
  FileCheck,
  Check,
  AlertCircle,
  RefreshCw,
  Play,
  ArrowLeft,
} from 'lucide-react';
import { MaterialAnalysis } from '../types';

interface UnderstandScreenProps {
  analysis: MaterialAnalysis;
  scannedImage: string | null;
  onStartLesson: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onLoadDemo?: () => void;
  onBackHome?: () => void;
}

export const UnderstandScreen: React.FC<UnderstandScreenProps> = ({
  analysis,
  scannedImage,
  onStartLesson,
  isLoading,
  errorMessage,
  onRetry,
  onLoadDemo,
  onBackHome,
}) => {
  const [showFullImage, setShowFullImage] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-4 animate-spin">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Analyzing Classroom Material...
        </h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Gemini Vision is parsing handwritten board notes, extracting core academic principles, and synthesizing customized learning objectives.
        </p>
      </div>
    );
  }

  // Clear, non-silent error presentation
  if (errorMessage) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-rose-500/40 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Analysis Could Not Complete
          </h2>

          <p className="text-sm text-slate-300 mb-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-mono text-left break-words">
            {errorMessage}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Analysis</span>
              </button>
            )}

            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Load Binary Search Demo</span>
              </button>
            )}

            {onBackHome && (
              <button
                onClick={onBackHome}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const topicName = analysis.topic || 'Extracted Material';
  const conceptsList = analysis.concepts && analysis.concepts.length > 0
    ? analysis.concepts
    : [];

  const learningObjectives = analysis.learningObjectives && analysis.learningObjectives.length > 0
    ? analysis.learningObjectives
    : [
        'Master the foundational definitions and schema properties',
        'Identify real-world distinctions between categories',
        'Apply principles to solve concrete examination problems',
      ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Subject Badge & Scanned Image Pill */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <FileCheck className="w-3.5 h-3.5" />
          {analysis.subject || 'Classroom Content Extracted'}
        </div>

        {scannedImage && (
          <button
            onClick={() => setShowFullImage(true)}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Board Snapshot</span>
          </button>
        )}
      </div>

      {/* Primary Clean Result Screen: "WE FOUND" */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black tracking-widest text-sky-400 uppercase">
            WE FOUND
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Topic: <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">{topicName}</span>
        </h1>

        {analysis.subtitle && (
          <p className="text-base text-slate-300 mb-4 font-medium leading-relaxed">
            {analysis.subtitle}
          </p>
        )}

        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          {analysis.overview}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{analysis.estimatedDurationMinutes || 8} min estimated mastery</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>{conceptsList.length} Core Concepts</span>
          </div>
        </div>
      </div>

      {/* Concepts Grid */}
      {conceptsList.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Key Concepts Extracted</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conceptsList.map((concept, idx) => (
              <div
                key={concept.id || idx}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-white">{concept.name}</h3>
                  {concept.importance && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {concept.importance}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {concept.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
        <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Learning Objectives for Mastery</span>
        </h2>
        <div className="space-y-2">
          {learningObjectives.map((obj, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating / Sticky Bottom Action */}
      <div className="fixed bottom-6 left-0 right-0 max-w-4xl mx-auto px-4 pointer-events-none">
        <div className="p-2 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl pointer-events-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block pl-3 text-xs text-slate-400">
            Ready to interact with your AI tutor on <strong className="text-white">{topicName}</strong>?
          </div>
          <button
            onClick={onStartLesson}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <span>Start 1-on-1 AI Tutor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Board Snapshot Modal */}
      {showFullImage && scannedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm font-bold text-white">Classroom Material Snapshot</span>
              <button
                onClick={() => setShowFullImage(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={scannedImage}
              alt="Classroom board full size"
              className="w-full h-auto rounded-xl object-contain max-h-[75vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
