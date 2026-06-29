import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { QUESTIONS } from '../../data/questions';
import { FitProfile } from '../../utils/fitEngine';
import { ProgressBar } from '../ui/ProgressBar';
import { QuestionRenderer } from './QuestionRenderer';

interface ManualOnboardingProps {
  initialProfile?: FitProfile;
  onComplete: (profile: FitProfile) => void;
  onBack: () => void;
}

const STORAGE_KEY = 'jj-manual-progress';

export function ManualOnboarding({ initialProfile, onComplete, onBack }: ManualOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<FitProfile>(initialProfile ?? {});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step, prof } = JSON.parse(saved);
        if (step && prof) {
          setCurrentStep(step);
          setProfile(prof);
        }
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: currentStep, prof: profile }));
    } catch {}
  }, [currentStep, profile]);

  // Get visible questions (conditional)
  const visibleQuestions = QUESTIONS.filter(q => {
    if (q.id === 'brand_sizes') {
      return (profile.brands?.length ?? 0) > 0;
    }
    return true;
  });

  const question = visibleQuestions[currentStep];
  const totalSteps = visibleQuestions.length;

  const handleAnswer = (value: unknown) => {
    const newProfile = { ...profile, [question.id]: value };
    setProfile(newProfile);

    if (currentStep < totalSteps - 1) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    } else {
      const final = { ...newProfile, completedAt: new Date().toISOString(), flow: 'manual' as const };
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      onComplete(final);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-20 pb-6">
        <button
          onClick={handleBack}
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

      {/* Question area */}
      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: direction === 'forward' ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'forward' ? -60 : 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Question header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(139,92,246,0.12)',
                    color: 'var(--accent)',
                  }}
                >
                  Q{currentStep + 1}
                </span>
                {question.optional && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(52,211,153,0.1)',
                      color: '#34d399',
                    }}
                  >
                    Optional
                  </span>
                )}
              </div>
              <h2
                className="text-2xl font-black tracking-tight leading-tight mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {question.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {question.subtitle}
              </p>
            </div>

            {/* Question input */}
            <QuestionRenderer
              question={question}
              currentAnswers={profile}
              onAnswer={handleAnswer}
            />

            {/* Skip button for optional */}
            {question.optional && question.type !== 'weight' && (
              <button
                onClick={() => handleAnswer(null)}
                className="w-full mt-4 py-2.5 text-sm text-center rounded-2xl transition-all"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                Skip
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
