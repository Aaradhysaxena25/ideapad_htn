import { useRef, useState, useCallback } from 'react';
import { scanObject, analyzeObject, supabase } from '@/lib/supabase';
import { ACTION_META } from '@/lib/constants';
import type { AnalysisResult, ActionType } from '@/types';
import {
  Upload,
  Camera,
  Scan,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';

type Step = 'idle' | 'uploading' | 'detecting' | 'analyzing' | 'complete' | 'error';

interface ScannerPageProps {
  onAddedToInventory: () => void;
}

export function ScannerPage({ onAddedToInventory }: ScannerPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detection, setDetection] = useState<{ object: string; confidence: number } | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  async function handleFile(file: File) {
    setError('');
    setAdded(false);
    setAnalysis(null);
    setDetection(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP)');
      setStep('error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      setStep('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      runPipeline(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function runPipeline(imageData: string) {
    setStep('detecting');
    setError('');
    try {
      const det = await scanObject(imageData);
      setDetection(det);

      setStep('analyzing');
      const result = await analyzeObject(det.object, det.confidence, imageData);
      setAnalysis(result);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis pipeline failed');
      setStep('error');
    }
  }

  async function startCamera() {
    setError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not available in this browser. This usually happens when the page is not served over HTTPS. Please use the Upload Image option instead, or access the app over a secure connection.');
      setStep('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      let msg = 'Camera access failed.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
        else if (err.name === 'NotFoundError') msg = 'No camera found on this device. Please use the Upload Image option instead.';
        else if (err.name === 'NotReadableError') msg = 'Camera is already in use by another application. Close it and try again.';
        else msg = `Camera error: ${err.message}`;
      }
      setError(msg);
      setStep('error');
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setImagePreview(dataUrl);
    stopCamera();
    runPipeline(dataUrl);
  }

  async function addToInventory() {
    if (!analysis) return;
    setAdding(true);
    try {
      const { error: insertError } = await supabase.from('inventory').insert({
        object_name: analysis.object,
        category: analysis.category,
        material: analysis.material,
        condition: analysis.condition,
        damage_level: analysis.damage_level,
        quantity: 1,
        location: 'Mars Habitat A',
        recommended_action: analysis.recommended_action,
        reason: analysis.reason,
        status: 'Available',
        reusable: analysis.reusable,
        repairable: analysis.repairable,
        recyclable: analysis.recyclable,
        three_d_print_potential: analysis.three_d_print_potential,
        image_url: imagePreview,
      });
      if (insertError) throw insertError;
      setAdded(true);
      onAddedToInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to inventory');
    } finally {
      setAdding(false);
    }
  }

  function reset() {
    setStep('idle');
    setError('');
    setImagePreview(null);
    setDetection(null);
    setAnalysis(null);
    setAdded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const meta = analysis ? ACTION_META[analysis.recommended_action as ActionType] : null;
  const Icon = meta?.icon;

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto">
      {/* Pipeline visualization */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-cyan-400" />
          <h3 className="font-display text-sm font-semibold text-slate-200">AI Analysis Pipeline</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {['Upload', 'Detection', 'Gemini Analysis', 'Decision Engine', 'Result'].map((label, i) => {
            const isActive = step !== 'idle' && step !== 'error';
            const stepActive = (step === 'detecting' && i === 1) || (step === 'analyzing' && i === 2) || (step === 'complete' && i >= 3);
            const stepDone =
              (step === 'analyzing' && i === 1) ||
              (step === 'complete' && i < 4);
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    stepActive
                      ? 'bg-cyan-500/20 text-cyan-300 pulse-glow'
                      : stepDone && isActive
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-800/50 text-slate-500'
                  }`}
                >
                  {stepDone && isActive && !stepActive && <CheckCircle2 size={12} className="inline mr-1" />}
                  {label}
                </div>
                {i < 4 && <div className="text-slate-600">→</div>}
              </div>
            );
          })}
        </div>
      </div>

      {step === 'idle' && !cameraActive && (
        <div className="glass-panel p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' }}>
              <Scan size={36} className="text-cyan-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-100 mb-2">Scan an Object</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Upload an image or use your camera to identify and analyze a resource.
              The AI will detect the object and recommend the best circular action.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-cyan-500/10 flex items-center justify-center transition-colors">
                <Upload size={24} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Upload Image</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP</p>
              </div>
            </button>

            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-cyan-500/10 flex items-center justify-center transition-colors">
                <Camera size={24} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Open Camera</p>
                <p className="text-xs text-slate-500 mt-1">Capture live</p>
              </div>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {/* Camera view */}
      {cameraActive && (
        <div className="glass-panel p-6">
          <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '16/9' }}>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-cyan-400/50 rounded-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-cyan-400/60 scan-line" style={{ borderRadius: '2px' }} />
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={capturePhoto} className="btn-primary flex items-center gap-2">
              <Camera size={18} /> Capture & Scan
            </button>
            <button onClick={() => { stopCamera(); setStep('idle'); }} className="btn-secondary flex items-center gap-2">
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Processing view */}
      {(step === 'detecting' || step === 'analyzing') && imagePreview && (
        <div className="glass-panel p-6">
          <div className="relative rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            <img src={imagePreview} alt="Scanning" className="w-full h-full object-contain bg-black" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-cyan-400/60 rounded-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-cyan-400 scan-line" style={{ borderRadius: '2px' }} />
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-lg">
              <Loader2 size={16} className="text-cyan-400 animate-spin" />
              <span className="text-sm text-cyan-300">
                {step === 'detecting' ? 'Running object detection model...' : 'Gemini AI analyzing material and condition...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error view */}
      {step === 'error' && (
        <div className="glass-panel p-8 text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button onClick={reset} className="btn-secondary flex items-center gap-2 mx-auto">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      )}

      {/* Result view */}
      {step === 'complete' && analysis && imagePreview && (
        <div className="space-y-4 slide-in">
          {/* Image + detection */}
          <div className="glass-panel p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img src={imagePreview} alt={analysis.object} className="w-full h-full object-contain bg-black" />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Detected: {analysis.confidence * 100}% confidence
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Detected Object</p>
                  <h3 className="font-display text-xl font-bold text-slate-100">{analysis.object}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoTile label="Material" value={analysis.material} />
                  <InfoTile label="Category" value={analysis.category} />
                  <InfoTile label="Condition" value={analysis.condition} />
                  <InfoTile label="Damage Level" value={analysis.damage_level} />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <CapabilityTag active={analysis.reusable} label="Reusable" />
                  <CapabilityTag active={analysis.repairable} label="Repairable" />
                  <CapabilityTag active={analysis.recyclable} label="Recyclable" />
                  <CapabilityTag active={analysis.three_d_print_potential} label="3D Printable" />
                </div>
              </div>
            </div>
          </div>

          {/* Decision engine result */}
          {meta && Icon && (
            <div className="glass-panel p-5" style={{ borderColor: meta.color + '40' }}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`} style={{ border: `1px solid ${meta.color}40` }}>
                  <Icon size={28} className={meta.text} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Decision Engine — Recommended Action</p>
                  <h3 className="font-display text-2xl font-bold mb-2" style={{ color: meta.color }}>
                    {meta.label.toUpperCase()}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{analysis.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {!added ? (
              <button onClick={addToInventory} disabled={adding} className="btn-primary flex items-center gap-2">
                {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {adding ? 'Adding...' : 'Add to Inventory'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 size={20} /> Added to inventory!
              </div>
            )}
            <button onClick={reset} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={16} /> Scan Another
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

function CapabilityTag({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`badge ${active ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'}`}
    >
      {active && <CheckCircle2 size={10} />} {label}
    </span>
  );
}
