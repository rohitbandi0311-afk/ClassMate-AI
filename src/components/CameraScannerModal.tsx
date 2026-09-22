import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Zap,
  Check,
  AlertCircle,
  Upload,
} from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in browser settings or use file upload.'
          : 'Unable to start camera stream. You can still upload photos from your device.'
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(dataUrl);

      // Mobile haptic feedback
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch (_) {}
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-white text-sm font-semibold tracking-wide">
            {capturedPhoto ? 'Review Board Photo' : 'Scan Classroom Board'}
          </span>
        </div>

        <button
          onClick={onClose}
          id="btn-close-camera"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {capturedPhoto ? (
          <div className="relative max-h-full max-w-full p-4 flex items-center justify-center">
            <img
              src={capturedPhoto}
              alt="Captured classroom board"
              className="max-h-[70vh] w-auto rounded-xl object-contain shadow-2xl border border-slate-700"
            />
          </div>
        ) : cameraError ? (
          <div className="p-6 max-w-md text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Camera Unavailable</h3>
            <p className="text-sm text-slate-400 mb-6">{cameraError}</p>

            <label
              htmlFor="camera-fallback-file"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm cursor-pointer shadow-lg shadow-sky-500/25 transition-all"
            >
              <Upload className="w-4 h-4" />
              Choose Photo from Device
              <input
                id="camera-fallback-file"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanning Guide Overlay */}
            <div className="absolute inset-8 sm:inset-16 pointer-events-none flex flex-col justify-between border-2 border-sky-400/40 rounded-2xl">
              {/* Corner Accents */}
              <div className="flex justify-between -mt-1 -mx-1">
                <div className="w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg"></div>
                <div className="w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg"></div>
              </div>

              {/* Laser scan line animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_3s_infinite]"></div>

              <div className="flex justify-between -mb-1 -mx-1">
                <div className="w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg"></div>
                <div className="w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg"></div>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/60 text-xs text-slate-300 pointer-events-none">
              Fit whiteboard or notebook within the frame
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls */}
      <div className="p-6 bg-slate-950/80 backdrop-blur-lg flex items-center justify-around z-10 border-t border-slate-800/80">
        {capturedPhoto ? (
          <div className="flex items-center gap-4 w-full max-w-sm justify-between">
            <button
              id="btn-retake-photo"
              onClick={() => setCapturedPhoto(null)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retake
            </button>
            <button
              id="btn-confirm-photo"
              onClick={confirmPhoto}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Use This Photo
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-around w-full max-w-md">
            {/* Gallery Upload button */}
            <label
              htmlFor="camera-gallery-input"
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Upload file"
            >
              <Upload className="w-5 h-5" />
              <input
                id="camera-gallery-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Shutter Button */}
            <button
              id="btn-shutter"
              onClick={takeSnapshot}
              disabled={Boolean(cameraError) || isInitializing}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 active:scale-95 transition-transform disabled:opacity-50"
            >
              <div className="w-full h-full bg-white hover:bg-slate-200 rounded-full shadow-lg"></div>
            </button>

            {/* Flip camera */}
            <button
              id="btn-flip-camera"
              onClick={flipCamera}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Flip Camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
