import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { Background } from './components/ui/Background';
import { Header } from './components/ui/Header';
import { IntroScreen } from './components/IntroScreen';
import { ManualOnboarding } from './components/manual/ManualOnboarding';
import { VoicePermissionScreen } from './components/voice/VoicePermissionScreen';
import { VoiceOnboarding } from './components/voice/VoiceOnboarding';
import { CompletionScreen } from './components/CompletionScreen';
import { FitProfile } from './utils/fitEngine';

type AppScreen = 'intro' | 'voice-permission' | 'manual' | 'voice' | 'complete';

const PAGE_STORAGE_KEY = 'jj-current-screen';
const PROFILE_STORAGE_KEY = 'jj-fit-profile';

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('intro');
  const [fitProfile, setFitProfile] = useState<FitProfile | null>(null);

  // Restore state on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const prof = JSON.parse(savedProfile) as FitProfile;
        setFitProfile(prof);
        if (prof.completedAt) {
          setScreen('complete');
        }
      }
    } catch {}
  }, []);

  const handleComplete = (profile: FitProfile) => {
    setFitProfile(profile);
    setScreen('complete');
    try {
      localStorage.setItem(PAGE_STORAGE_KEY, 'complete');
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  };

  const handleRestart = () => {
    setFitProfile(null);
    setScreen('intro');
    try {
      localStorage.removeItem(PAGE_STORAGE_KEY);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem('jj-manual-progress');
      localStorage.removeItem('jj-voice-progress');
    } catch {}
  };

  return (
    <div className="relative min-h-screen" style={{ color: 'var(--text-primary)' }}>
      {/* Ambient background */}
      <Background />

      {/* Fixed header */}
      <Header />

      {/* Main content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <IntroScreen
                onSelectManual={() => setScreen('manual')}
                onSelectVoice={() => setScreen('voice-permission')}
              />
            </motion.div>
          )}

          {screen === 'voice-permission' && (
            <motion.div
              key="voice-perm"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <VoicePermissionScreen
                onAllow={() => setScreen('voice')}
                onSwitchToManual={() => setScreen('manual')}
              />
            </motion.div>
          )}

          {screen === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ManualOnboarding
                initialProfile={fitProfile ?? undefined}
                onComplete={handleComplete}
                onBack={() => setScreen('intro')}
              />
            </motion.div>
          )}

          {screen === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <VoiceOnboarding
                initialProfile={fitProfile ?? undefined}
                onComplete={handleComplete}
                onBack={() => setScreen('intro')}
              />
            </motion.div>
          )}

          {screen === 'complete' && fitProfile && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <CompletionScreen
                profile={fitProfile}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
