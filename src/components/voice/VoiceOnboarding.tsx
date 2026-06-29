import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Keyboard, ChevronRight } from 'lucide-react';
import { QUESTIONS } from '../../data/questions';
import { FitProfile } from '../../utils/fitEngine';
import {
  SpeechRecognitionEngine,
  speak,
  stopSpeaking,
  getBestVoice,
  buildConfirmPhrase,
} from '../../utils/voiceEngine';
import {
  parseSpeechHeight,
  parseSpeechNumber,
  parseSpeechBrands,
  parseSpeechBrandSizes,
  parseSpeechChoice,
  parseSpeechFrustrations,
} from '../../utils/fitEngine';
import { ProgressBar } from '../ui/ProgressBar';
import { VoiceOrb } from './VoiceOrb';
import { DENIM_BRANDS } from '../../data/questions';

type VoiceStatus = 'idle' | 'speaking' | 'listening' | 'processing';

interface VoiceOnboardingProps {
  initialProfile?: FitProfile;
  onComplete: (profile: FitProfile) => void;
  onBack: () => void;
}

const STORAGE_KEY = 'jj-voice-progress';
const INTRO_PHRASES = [
  "Hi! I'm your Jackie Jeans fit stylist.",
  "I'll ask you a few quick questions to find your perfect denim fit.",
  "This usually takes less than a minute.",
  "Let's get started!",
];

export function VoiceOnboarding({ initialProfile, onComplete, onBack }: VoiceOnboardingProps) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<FitProfile>(initialProfile ?? {});
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [conversationLog, setConversationLog] = useState<Array<{ role: 'ai' | 'user'; text: string; ts: number }>>([]);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [voiceReady, setVoiceReady] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);


  const recognizerRef = useRef<SpeechRecognitionEngine | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);
  const currentStepRef = useRef(currentStep);

  // Sync step ref
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  // Load progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step, prof } = JSON.parse(saved);
        if (step && prof && step > 0) {
          setCurrentStep(step);
          setProfile(prof);
        }
      }
    } catch {}
  }, []);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: currentStep, prof: profile }));
    } catch {}
  }, [currentStep, profile]);

  // Init voice
  useEffect(() => {
    getBestVoice().then(({ name }) => {
      setVoiceName(name);
      setVoiceReady(true);
    });

    if (!SpeechRecognitionEngine.isSupported()) {
      setMicError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      setShowFallback(true);
    }

    return () => {
      recognizerRef.current?.destroy();
      stopSpeaking();
    };
  }, []);

  // Scroll conversation to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [conversationLog]);

  const addToLog = useCallback((role: 'ai' | 'user', text: string) => {
    setConversationLog(prev => [...prev, { role, text, ts: Date.now() }]);
  }, []);

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    setStatus('idle');
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(() => {
    if (isSpeakingRef.current) return;

    const engine = new SpeechRecognitionEngine();
    recognizerRef.current?.destroy();
    recognizerRef.current = engine;

    const inited = engine.init({
      onStart: () => {
        setStatus('listening');
        setTranscript('');
        setInterimTranscript('');
      },
      onResult: (text, isFinal, conf) => {
        if (isFinal) {
          setTranscript(text);
          setInterimTranscript('');
          setConfidence(conf);
          setStatus('processing');
          engine.stop();
          handleVoiceAnswer(text, conf);
        } else {
          setInterimTranscript(text);
        }
      },
      onError: (err) => {
        if (err === 'not-allowed' || err === 'permission-denied') {
          setMicError('Microphone access was denied. Please allow mic access and try again.');
          setShowFallback(true);
        }
        setStatus('idle');
      },
      onEnd: () => {
        if (status !== 'processing') setStatus('idle');
      },
    });

    if (!inited) {
      setMicError('Could not start speech recognition. Using text input instead.');
      setShowFallback(true);
      return;
    }

    engine.start(false);
  }, [status]);

  const speakAI = useCallback((text: string, onDone?: () => void) => {
    isSpeakingRef.current = true;
    setStatus('speaking');
    addToLog('ai', text);

    speak(
      text,
      () => { setStatus('speaking'); },
      () => {
        isSpeakingRef.current = false;
        setStatus('idle');
        onDone?.();
      },
      () => {
        isSpeakingRef.current = false;
        setStatus('idle');
        onDone?.();
      }
    );
  }, [addToLog]);

  const askCurrentQuestion = useCallback((step: number) => {
    const visibleQuestions = getVisibleQuestions(profile);
    const q = visibleQuestions[step];
    if (!q) return;

    speakAI(q.voicePrompt, () => {
      setTimeout(() => startListening(), 400);
    });
  }, [profile, speakAI, startListening]);

  // Play intro then start questions
  useEffect(() => {
    if (!voiceReady || introPlayed) return;
    setIntroPlayed(true);

    const introText = INTRO_PHRASES.join(' ');
    const startFrom = currentStep;

    speakAI(introText, () => {
      setTimeout(() => askCurrentQuestion(startFrom), 500);
    });
  }, [voiceReady]);

  const handleVoiceAnswer = useCallback((text: string, conf: number) => {
    const visibleQuestions = getVisibleQuestions(profile);
    const q = visibleQuestions[currentStepRef.current];
    if (!q) return;

    const low = conf < 0.6 && conf > 0;

    // Parse the answer
    let parsed: unknown = null;
    let valid = false;

    switch (q.type) {
      case 'height': {
        const h = parseSpeechHeight(text);
        if (h) { parsed = h; valid = true; }
        break;
      }
      case 'weight': {
        const skip = /skip|pass|no|don'?t|prefer not/i.test(text);
        if (skip) { parsed = null; valid = true; }
        else {
          const n = parseSpeechNumber(text);
          if (n && n > 50 && n < 500) { parsed = String(n); valid = true; }
        }
        break;
      }
      case 'number': {
        const n = parseSpeechNumber(text);
        const min = q.min ?? 0, max = q.max ?? 999;
        if (n && n >= min && n <= max) { parsed = n; valid = true; }
        break;
      }
      case 'single-choice': {
        const c = parseSpeechChoice(text, q.options ?? []);
        if (c) { parsed = c; valid = true; }
        break;
      }
      case 'multi-choice': {
        if (q.id === 'brands') {
          const brands = parseSpeechBrands(text, DENIM_BRANDS);
          const skip = /skip|none|no brand|haven'?t|never/i.test(text.toLowerCase());
          if (skip) { parsed = []; valid = true; }
          else if (brands.length > 0) { parsed = brands; valid = true; }
        } else if (q.id === 'frustration') {
          const frstr = parseSpeechFrustrations(text, q.options ?? []);
          if (frstr.length > 0) { parsed = frstr; valid = true; }
          else if (/none|nothing|fine|okay|ok/i.test(text)) { parsed = ['Other']; valid = true; }
        }
        break;
      }
      case 'brand-sizes': {
        const brands = profile.brands ?? [];
        const sizes = parseSpeechBrandSizes(text, brands);
        parsed = sizes; valid = true;
        break;
      }
    }

    if (!valid || low) {
      addToLog('user', text);
      const retryMsg = low
        ? "Sorry, I didn't quite catch that clearly. Could you say that again?"
        : "Hmm, I didn't quite get that. Could you repeat it for me?";
      speakAI(retryMsg, () => setTimeout(() => startListening(), 400));
      return;
    }

    addToLog('user', text);
    setStatus('processing');

    // Build confirm phrase
    const confirmMsg = buildConfirmPhrase(q.id, parsed);
    
    // Move to next
    const newProfile = { ...profile, [q.id]: parsed };
    setProfile(newProfile);

    const nextStep = currentStepRef.current + 1;
    const nextVisible = getVisibleQuestions(newProfile);

    if (nextStep >= nextVisible.length) {
      // Complete!
      speakAI(confirmMsg + " That's everything I need. Let me pull together your perfect fit profile!", () => {
        setTimeout(() => {
          const final = { ...newProfile, completedAt: new Date().toISOString(), flow: 'voice' as const };
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
          onComplete(final);
        }, 1000);
      });
    } else {
      setCurrentStep(nextStep);
      const nextQ = nextVisible[nextStep];
      speakAI(confirmMsg + ' ' + nextQ.voicePrompt, () => {
        setTimeout(() => startListening(), 400);
      });
    }
  }, [profile, addToLog, speakAI, startListening, onComplete]);

  const handleFallbackSubmit = () => {
    if (!fallbackText.trim()) return;
    handleVoiceAnswer(fallbackText.trim(), 0.9);
    setFallbackText('');
  };

  const handleSkip = () => {
    handleVoiceAnswer('skip', 0.9);
  };

  const visibleQuestions = getVisibleQuestions(profile);
  const question = visibleQuestions[currentStep];
  const totalSteps = visibleQuestions.length;

  const quickChips = getQuickChips(question);

  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-20 pb-4">
        <button
          onClick={() => { stopSpeaking(); recognizerRef.current?.destroy(); onBack(); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <ProgressBar current={currentStep + 1} total={totalSteps} />
        </div>
      </div>

      {/* Mic error banner */}
      {micError && (
        <div
          className="mx-4 mb-3 p-3 rounded-xl text-xs font-medium"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
          }}
        >
          {micError}
        </div>
      )}

      {/* Voice name indicator */}
      {voiceName && !micError && (
        <div className="mx-4 mb-2">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            style={{
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.2)',
              color: '#34d399',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {voiceName}
          </div>
        </div>
      )}

      {/* Current question */}
      <div className="px-4 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                Question {currentStep + 1}
              </p>
              <p className="text-base font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {question.title}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Orb — center stage */}
      <div className="flex flex-col items-center flex-1 px-4">
        {/* The orb */}
        <div className="mb-12">
          <VoiceOrb
            status={status}
            onClick={() => {
              if (status === 'listening') { stopListening(); }
              else if (status === 'idle') { startListening(); }
            }}
          />
        </div>

        {/* Live transcript */}
        <AnimatePresence>
          {(transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 w-full max-w-xs"
            >
              <div
                className="p-3 rounded-xl text-center text-sm"
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <p
                  className="font-medium"
                  style={{ color: transcript ? 'var(--text-primary)' : 'rgba(255,255,255,0.4)' }}
                >
                  {transcript || interimTranscript}
                </p>
                {confidence > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
                    {Math.round(confidence * 100)}% confidence
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BRANDS special multi-select panel */}
        {question.id === 'brands' && status !== 'speaking' && (
          <VoiceBrandsPanel
            selectedBrands={profile.brands ?? []}
            onConfirm={(brands) => handleVoiceAnswer(brands.join(', ') || 'skip', 0.95)}
            onUpdate={(brands) => setProfile(prev => ({ ...prev, brands }))}
          />
        )}

        {/* Quick chips — for non-brands questions */}
        {quickChips.length > 0 && status !== 'speaking' && question.id !== 'brands' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-xs mb-4"
          >
            <p className="text-xs text-center mb-2" style={{ color: 'var(--text-secondary)' }}>
              Quick options:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleVoiceAnswer(chip, 0.95)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  style={{
                    background: 'rgba(139,92,246,0.12)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    color: 'var(--accent)',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skip button */}
        {question.optional && status !== 'speaking' && (
          <button
            onClick={handleSkip}
            className="mb-3 text-xs font-medium px-4 py-2 rounded-xl transition-all"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}
          >
            Skip this question
          </button>
        )}

        {/* Typed fallback toggle */}
        <button
          onClick={() => setShowFallback(prev => !prev)}
          className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Keyboard size={12} />
          {showFallback ? 'Hide' : 'Type instead'}
        </button>

        {/* Fallback text input */}
        <AnimatePresence>
          {showFallback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-xs mt-3"
            >
              <div className="flex gap-2">
                <input
                  value={fallbackText}
                  onChange={e => setFallbackText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFallbackSubmit()}
                  placeholder="Type your answer..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={handleFallbackSubmit}
                  disabled={!fallbackText.trim()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversation log */}
      <div
        ref={logRef}
        className="mx-4 mb-4 mt-4 rounded-2xl overflow-y-auto"
        style={{
          maxHeight: 180,
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div className="p-3 space-y-2">
          {conversationLog.slice(-10).map((entry) => (
            <motion.div
              key={entry.ts}
              initial={{ opacity: 0, x: entry.role === 'ai' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-2 ${entry.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black"
                style={{
                  background: entry.role === 'ai'
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : 'rgba(52,211,153,0.3)',
                  color: '#fff',
                }}
              >
                {entry.role === 'ai' ? 'JJ' : 'U'}
              </div>
              <div
                className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: entry.role === 'ai'
                    ? 'rgba(139,92,246,0.08)'
                    : 'rgba(52,211,153,0.08)',
                  color: 'var(--text-secondary)',
                  maxWidth: '85%',
                }}
              >
                {entry.text}
              </div>
            </motion.div>
          ))}
          {conversationLog.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              Conversation will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Voice Brands Panel ────────────────────────────────────────────────────────
function VoiceBrandsPanel({
  selectedBrands,
  onUpdate,
  onConfirm,
}: {
  selectedBrands: string[];
  onUpdate: (brands: string[]) => void;
  onConfirm: (brands: string[]) => void;
}) {
  const toggle = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    onUpdate(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xs mb-4"
    >
      <p className="text-xs text-center mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
        Tap or speak brands:
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center mb-3 max-h-40 overflow-y-auto">
        {DENIM_BRANDS.map(brand => {
          const isSel = selectedBrands.includes(brand);
          return (
            <button
              key={brand}
              onClick={() => toggle(brand)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
              style={{
                background: isSel ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(139,92,246,0.08)',
                border: isSel ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(139,92,246,0.15)',
                color: isSel ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {isSel ? '✓ ' : ''}{brand}
            </button>
          );
        })}
      </div>
      {selectedBrands.length > 0 && (
        <button
          onClick={() => onConfirm(selectedBrands)}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 0 16px rgba(124,58,237,0.4)',
          }}
        >
          Continue with {selectedBrands.length} brand{selectedBrands.length > 1 ? 's' : ''}
        </button>
      )}
      <button
        onClick={() => onConfirm([])}
        className="w-full py-2 rounded-xl text-xs text-center mt-1.5 transition-all"
        style={{ color: 'var(--text-secondary)' }}
      >
        None / Skip
      </button>
    </motion.div>
  );
}

function getVisibleQuestions(profile: FitProfile) {
  return QUESTIONS.filter(q => {
    if (q.id === 'brand_sizes') {
      return (profile.brands?.length ?? 0) > 0;
    }
    return true;
  });
}

function getQuickChips(question: { type: string; options?: string[]; id?: string; optional?: boolean } | undefined): string[] {
  if (!question) return [];

  switch (question.type) {
    case 'single-choice':
      return question.options ?? [];
    case 'height':
      return ["5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\""];
    case 'number':
      if (question.id === 'waist') return ['28"', '30"', '32"', '34"', '36"'];
      if (question.id === 'hips') return ['36"', '38"', '40"', '42"', '44"'];
      return [];
    case 'multi-choice':
      if (question.id === 'frustration') return question.options?.slice(0, 4) ?? [];
      return [];
    default:
      return question.optional ? ['Skip'] : [];
  }
}
