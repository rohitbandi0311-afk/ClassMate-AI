import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Layers,
  ArrowRight,
  Bot,
  User,
  GraduationCap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { MaterialAnalysis, TutorMessage } from '../types';
import { askAITutor } from '../services/api';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
  speakText,
  stopSpeaking,
} from '../utils/speech';

interface TutorScreenProps {
  analysis: MaterialAnalysis;
  onProceedToAssessment: () => void;
}

export const TutorScreen: React.FC<TutorScreenProps> = ({
  analysis,
  onProceedToAssessment,
}) => {
  const [level, setLevel] = useState<'beginner' | 'intermediate'>('beginner');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [visualStep, setVisualStep] = useState(0);

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `Hello! I'm your ClassMate AI tutor. I've reviewed your classroom board on "${analysis.topic || 'Binary Search'}". How would you like to start? You can pick one of the quick pedagogical styles below or ask me any question!`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognizerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string, style: 'simple' | 'example' | 'visual' | 'quiz' | 'normal' = 'normal') => {
    const query = (textToSend || inputQuery).trim();
    if (!query && style === 'normal') return;

    const userMsg: TutorMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query || (style === 'simple' ? 'Explain simply' : style === 'example' ? 'Give an example' : style === 'visual' ? 'Explain visually' : 'Ask me questions'),
      timestamp: 'Now',
      style,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const responseText = await askAITutor({
        topic: analysis.topic || 'Binary Search',
        context: analysis,
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        style,
        level,
      });

      const assistantMsg: TutorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: 'Just now',
        style,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Binary Search cuts the search space in half each comparison. For 16 items: 16 → 8 → 4 → 2 → 1, which takes 4 steps (log₂(16) = 4).',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
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
          setInputQuery(transcript);
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

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text);
      setIsSpeaking(true);
    }
  };

  // Interactive visual array halving simulation data
  const VISUAL_STAGES = [
    {
      title: 'Full Array (N = 16 elements)',
      elements: [2, 5, 8, 12, 16, 23, 38, 45, 56, 62, 71, 79, 84, 91, 95, 99],
      activeRange: [0, 15],
      midIdx: 7,
      midVal: 45,
      note: 'Step 0: Searching for target 23. Mid is 45 (index 7). Since 23 < 45, discard right half!',
    },
    {
      title: 'Halved Once (N/2 = 8 elements remaining)',
      elements: [2, 5, 8, 12, 16, 23, 38, 45, '···', '···', '···', '···', '···', '···', '···', '···'],
      activeRange: [0, 6],
      midIdx: 3,
      midVal: 12,
      note: 'Step 1: Search space [0..6]. Mid is 12 (index 3). Since 23 > 12, discard left half!',
    },
    {
      title: 'Halved Twice (N/4 = 4 elements remaining)',
      elements: ['···', '···', '···', '···', 16, 23, 38, 45, '···', '···', '···', '···', '···', '···', '···', '···'],
      activeRange: [4, 6],
      midIdx: 5,
      midVal: 23,
      note: 'Step 2: Search space [4..6]. Mid is 23 (index 5). Target 23 MATCHED! (Found in just 3 steps).',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Tutor Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Let's learn {analysis.topic || 'Binary Search'}
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-semibold">
                AI Tutor
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Grounded in your classroom board notes
            </p>
          </div>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-400 font-medium">Level:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setLevel('beginner')}
              className={`px-3 py-1 rounded-md transition-colors ${
                level === 'beginner'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setLevel('intermediate')}
              className={`px-3 py-1 rounded-md transition-colors ${
                level === 'intermediate'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intermediate
            </button>
          </div>
        </div>
      </div>

      {/* 5 Pedagogical Style Action Chips */}
      <div className="mb-4 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 min-w-[500px] sm:min-w-0">
          <button
            onClick={() => handleSendMessage('Explain binary search simply with an everyday analogy.', 'simple')}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-500/40 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>💡 Explain simply</span>
          </button>
          <button
            onClick={() => handleSendMessage('Give me a step-by-step trace example on numbers.', 'example')}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-slate-700 hover:border-indigo-500/40 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>🔢 Give an example</span>
          </button>
          <button
            onClick={() => {
              setVisualStep(0);
              handleSendMessage('Show me visual space halving: 16 -> 8 -> 4 -> 2 -> 1.', 'visual');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>📊 Explain visually</span>
          </button>
          <button
            onClick={() => handleSendMessage('Ask me questions to test my intuition.', 'quiz')}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>❓ Ask me questions</span>
          </button>
          <button
            onClick={toggleSpeechRecognition}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isListening ? 'Listening...' : 'Ask by voice'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Halving Stage (When active or selected) */}
      <div className="mb-4 p-4 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Interactive Space-Halving Stepper
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Step {visualStep + 1} of {VISUAL_STAGES.length}
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg mb-3">
          <p className="text-xs font-semibold text-sky-300 mb-2">
            {VISUAL_STAGES[visualStep].title}
          </p>

          {/* Array visualization */}
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 mb-2 text-center font-mono text-xs">
            {VISUAL_STAGES[visualStep].elements.map((el, i) => {
              const isMid = i === VISUAL_STAGES[visualStep].midIdx;
              const isDiscarded = el === '···';
              return (
                <div
                  key={i}
                  className={`p-1.5 rounded border transition-all ${
                    isMid
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md scale-105'
                      : isDiscarded
                      ? 'bg-slate-900/40 text-slate-700 border-slate-900'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <span className="block text-[11px]">{el}</span>
                  {isMid && (
                    <span className="block text-[9px] uppercase font-sans font-bold -mt-0.5">
                      mid
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-300 font-sans">
            {VISUAL_STAGES[visualStep].note}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setVisualStep((prev) => (prev > 0 ? prev - 1 : 0))}
            disabled={visualStep === 0}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300"
          >
            Previous Step
          </button>
          <div className="flex gap-1.5">
            {VISUAL_STAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setVisualStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === visualStep ? 'bg-sky-400 w-6' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() =>
              setVisualStep((prev) =>
                prev < VISUAL_STAGES.length - 1 ? prev + 1 : prev
              )
            }
            disabled={visualStep === VISUAL_STAGES.length - 1}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs text-white font-medium"
          >
            Next Halving Step
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-3 mb-4 min-h-[260px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => handleSpeak(msg.content)}
                    className="p-1 hover:text-sky-400 transition-colors flex items-center gap-1"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-xs text-slate-400 ml-1">ClassMate Tutor thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Proceed CTA */}
      <div className="sticky bottom-4 z-20 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl"
        >
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Speech to text"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? 'Listening to voice...' : 'Ask your tutor anything about Binary Search...'}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none px-2"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Transition to Screen 4 Assessment */}
        <button
          id="btn-goto-assessment"
          onClick={onProceedToAssessment}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Ready? Start Assessment &amp; Misconception Diagnosis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
