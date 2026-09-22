import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  FileText,
  Mic,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Compass,
  X,
  Eye,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { SAMPLE_WHITEBOARD_DATA_URL } from '../data/sampleWhiteboard';

interface HomeScreenProps {
  onStartCapture: () => void;
  onImageSelected: (base64Image: string) => void;
  onTextNotesSubmitted: (text: string) => void;
  onStartDemoScenario: () => void;
  onStartAlternateTopic?: (preset: 'biology' | 'calculus') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartCapture,
  onImageSelected,
  onTextNotesSubmitted,
  onStartDemoScenario,
  onStartAlternateTopic,
}) => {
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirmPreview = () => {
    if (previewImage) {
      onImageSelected(previewImage);
      setPreviewImage(null);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onTextNotesSubmitted(textInput);
      setShowTextModal(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[calc(100vh-105px)] pb-16 flex flex-col justify-between transition-colors ${
        isDragging ? 'bg-sky-950/30' : ''
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 w-full">
        {/* Drag Overlay Hint */}
        {isDragging && (
          <div className="fixed inset-0 z-40 bg-sky-950/80 backdrop-blur-sm border-4 border-dashed border-sky-400 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <Upload className="w-16 h-16 text-sky-400 animate-bounce mb-3" />
            <h3 className="text-2xl font-extrabold text-white mb-1">Drop Classroom Photo Here</h3>
            <p className="text-sm text-sky-200">Release to preview and analyze with Gemini Vision</p>
          </div>
        )}

        {/* Hero Branding */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            ClassMate AI • Mobile-First MVP
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            ClassMate <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-lg sm:text-2xl font-medium text-slate-300 tracking-tight mb-2">
            "From classroom to mastery."
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Turn blackboard snapshots and class notes into an interactive learning, misconception diagnosis, and 3-minute recovery loop.
          </p>
        </div>

        {/* Primary CTA Button: Scan what you learned */}
        <div className="max-w-md mx-auto mb-8 sm:mb-10">
          <button
            id="btn-scan-primary"
            onClick={onStartCapture}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-sky-400/30 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span>Scan what you learned</span>
            <ArrowRight className="w-5 h-5 text-sky-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Desktop Drag & Drop Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-8 p-6 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-sky-500/50 cursor-pointer transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
            Drag &amp; drop classroom image here, or browse files
          </h3>
          <p className="text-xs text-slate-400">
            Supports whiteboard photos, handwritten notes, textbook pages, or lecture slides
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Primary Demo Scenario Card */}
        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Primary Demo Scenario
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    1-Click Instant Test
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Student Just Learned: <span className="text-sky-400">Binary Search</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Pre-loads an authentic university CS lecture whiteboard and runs through the complete 8-stage mastery loop.
                </p>
              </div>
            </div>

            <button
              id="btn-quick-demo-scenario"
              onClick={onStartDemoScenario}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 border border-indigo-400/30"
            >
              <span>Load Binary Search Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Capture Action Channels */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Capture Input Channels
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Scan Classroom Board */}
            <button
              id="btn-scan-board"
              onClick={onStartCapture}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-left transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  Scan Board
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Device camera</p>
              </div>
            </button>

            {/* 2. Upload Notes Photo */}
            <button
              id="btn-upload-notes"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Upload Notes
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Photo or scan</p>
              </div>
            </button>

            {/* 3. Upload Study Material / Text */}
            <button
              id="btn-upload-material"
              onClick={() => setShowTextModal(true)}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Study Material
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Paste lecture text</p>
              </div>
            </button>

            {/* 4. Ask by Voice */}
            <button
              id="btn-ask-by-voice"
              onClick={onStartDemoScenario}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Ask by Voice
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Spoken query</p>
              </div>
            </button>
          </div>
        </div>

        {/* The Core Loop Blueprint */}
        <div className="mb-10 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              The Mastery Loop Architecture
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="block text-[10px] text-slate-400 font-mono">01</span>
              <span className="font-semibold text-slate-200">Capture</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="block text-[10px] text-slate-400 font-mono">02</span>
              <span className="font-semibold text-slate-200">Understand</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="block text-[10px] text-slate-400 font-mono">03</span>
              <span className="font-semibold text-slate-200">Teach</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="block text-[10px] text-slate-400 font-mono">04</span>
              <span className="font-semibold text-slate-200">Assess</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="block text-[10px] text-amber-400 font-mono">05</span>
              <span className="font-bold text-amber-300">Diagnose</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="block text-[10px] text-slate-400 font-mono">06</span>
              <span className="font-semibold text-slate-200">Recover</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <span className="block text-[10px] text-emerald-400 font-mono">07</span>
              <span className="font-bold text-emerald-300">Reassess</span>
            </div>
          </div>
        </div>

        {/* About the Innovation */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/20 text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">About the Innovation</h4>
              <blockquote className="text-sm italic text-sky-200/90 font-medium">
                "ClassMate AI doesn't just answer questions. It identifies what the learner misunderstood and creates the next learning intervention."
              </blockquote>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Standard chatbots act like encyclopedias, leaving the student unaware of their cognitive blindspots. ClassMate AI diagnoses the root misconception from your own words and serves an instant 3-minute recovery module to verify gap closure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal (After selection) */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">Preview Captured Material</h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mb-4 max-h-72 flex items-center justify-center">
              <img
                src={previewImage}
                alt="Selected material preview"
                className="w-full h-full object-contain max-h-72"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium"
              >
                Choose Different
              </button>
              <button
                id="btn-confirm-analyze"
                onClick={handleConfirmPreview}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze with Gemini Vision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Text Modal */}
      {showTextModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Paste Classroom Notes</h3>
              <button
                onClick={() => setShowTextModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter notes, syllabus points, or board transcript for Gemini to extract concepts and create your lesson.
            </p>
            <form onSubmit={handleTextSubmit}>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                placeholder="e.g. Binary Search Lecture Notes: Requires sorted array. Compare target with mid = low + (high-low)/2. Halves search space each step. Worst case time complexity O(log n)."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTextModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm"
                >
                  Analyze Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
