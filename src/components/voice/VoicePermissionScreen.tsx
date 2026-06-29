import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Shield, ChevronRight, PenLine } from 'lucide-react';

interface VoicePermissionScreenProps {
  onAllow: () => void;
  onSwitchToManual: () => void;
}

export function VoicePermissionScreen({ onAllow, onSwitchToManual }: VoicePermissionScreenProps) {
  const [requesting, setRequesting] = useState(false);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      onAllow();
    } catch {
      // Even if denied, proceed — the voice engine handles it
      onAllow();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Animated mic icon */}
      <motion.div
        className="mb-10 relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        {/* Rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '1.5px solid rgba(124,58,237,0.3)' }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '1.5px solid rgba(79,70,229,0.25)' }}
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div
          className="w-32 h-32 rounded-3xl flex items-center justify-center relative z-10"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9)',
            boxShadow: '0 0 60px rgba(124,58,237,0.5)',
          }}
        >
          <Mic size={52} className="text-white" />
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-black gradient-text mb-3">
          Meet Your AI Stylist
        </h2>
        <p className="text-base leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
          I'll ask you a few questions by voice. Just speak naturally — like you're talking to a friend.
        </p>
      </motion.div>

      {/* Feature list */}
      <motion.div
        className="w-full max-w-xs mb-8 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { icon: '🎤', text: 'Speak your answers naturally' },
          { icon: '⚡', text: 'Takes less than 60 seconds' },
          { icon: '✨', text: 'AI finds your perfect denim fit' },
        ].map(({ icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-3 p-3.5 rounded-2xl"
            style={{
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.12)',
            }}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {text}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Privacy note */}
      <motion.div
        className="flex items-center gap-2 mb-8 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Shield size={14} style={{ color: '#34d399' }} />
        <p className="text-xs" style={{ color: '#34d399' }}>
          Microphone used locally. Nothing is stored on servers.
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="w-full max-w-xs space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          onClick={handleAllow}
          disabled={requesting}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 text-base"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)',
            boxShadow: '0 0 30px rgba(124,58,237,0.5)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {requesting ? (
            <>
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Allowing...
            </>
          ) : (
            <>
              <Mic size={20} />
              Allow Microphone & Start
              <ChevronRight size={18} />
            </>
          )}
        </motion.button>

        <button
          onClick={onSwitchToManual}
          className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 glass transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <PenLine size={14} />
          Switch to Manual instead
        </button>
      </motion.div>
    </div>
  );
}
