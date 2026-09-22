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
} from 'lucide-react';
import { MaterialAnalysis } from '../types';

interface UnderstandScreenProps {
  analysis: MaterialAnalysis;
  scannedImage: string | null;
  onStartLesson: () => void;
  isLoading?: boolean;
}

export const UnderstandScreen: React.FC<UnderstandScreenProps> = ({
  analysis,
  scannedImage,
  onStartLesson,
  isLoading,
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
          Gemini Vision is parsing handwritten board notes, extracting core mathematical principles, and synthesizing learning objectives.
        </p>
      </div>
    );
  }

  const topicName = analysis.topic || 'Binary Search';
  const conceptsList = analysis.concepts && analysis.concepts.length > 0
    ? analysis.concepts
    : [
        { id: '1', name: 'Sorted arrays', description: 'Monotonic order required to eliminate 50% candidates.' },
        { id: '2', name: 'Divide and conquer', description: 'Recursive or iterative halving around midpoint.' },
        { id: '3', name: 'Search-space reduction', description: 'Candidates reduce by half at each comparison step.' },
        { id: '4', name: 'O(log n) Time Complexity', description: 'Inverse of exponential growth: k = log2(N).' },
      ];

  const learningObjectives = analysis.learningObjectives && analysis.learningObjectives.length > 0
    ? analysis.learningObjectives
    : [
        'Understand why sorted data is a mandatory precondition',
        'Demonstrate the space-halving algorithm step by step',
        'Explain in your own words why repeatedly halving the search space produces O(log n)',
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
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 transition-colors"
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

        {analysis.overview && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            {analysis.overview}
          </p>
        )}

        {/* Concepts List */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            Concepts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conceptsList.map((concept, idx) => (
              <div
                key={concept.id || idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/30">
                  •
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {concept.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {concept.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Objectives List */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            Learning Objectives
          </h2>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            {learningObjectives.map((obj, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Definitions and Worked Examples if present */}
      {(analysis.definitions || analysis.importantDefinitions) && (
        <div className="mb-8 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Key Definitions Extracted
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(analysis.definitions || analysis.importantDefinitions)?.map((def, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/60">
                <span className="font-bold text-slate-200 text-xs block mb-1">
                  • {def.term}
                </span>
                <span className="text-xs text-slate-400 block leading-relaxed">{def.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Button: "Start Learning" */}
      <div className="sticky bottom-4 z-30 p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl">
        <button
          id="btn-start-learning"
          onClick={onStartLesson}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-5 h-5 text-sky-200 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Scanned Image Preview Modal */}
      {showFullImage && scannedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-950 p-3 rounded-2xl border border-slate-700 shadow-2xl overflow-auto">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm font-bold text-white">Classroom Material Snapshot</span>
              <button
                onClick={() => setShowFullImage(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
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
