import { motion } from 'framer-motion';
import { Mic, PenLine, Ruler, ArrowRight } from 'lucide-react';

interface IntroScreenProps {
  onSelectManual: () => void;
  onSelectVoice: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export function IntroScreen({ onSelectManual, onSelectVoice }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Top badge */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            color: 'var(--accent)',
          }}
        >
          <Ruler size={12} />
          Jackie Jeans Fit Studio
          <Ruler size={12} />
        </div>
      </motion.div>

      {/* Logo mark */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative">
          <motion.div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)',
              boxShadow: '0 0 60px rgba(124,58,237,0.5), 0 20px 40px rgba(0,0,0,0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 60px rgba(124,58,237,0.5), 0 20px 40px rgba(0,0,0,0.3)',
                '0 0 80px rgba(124,58,237,0.7), 0 20px 40px rgba(0,0,0,0.3)',
                '0 0 60px rgba(124,58,237,0.5), 0 20px 40px rgba(0,0,0,0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            JJ
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Ruler size={14} className="text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mb-3"
      >
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight gradient-text">
          Jackie Jeans
        </h1>
        <p className="text-lg font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
          Smart Fit Onboarding
        </p>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center text-sm max-w-xs leading-relaxed mb-12"
        style={{ color: 'var(--text-secondary)' }}
      >
        Your personal denim stylist finds the perfect fit — based on your exact measurements and preferences.
      </motion.p>

      {/* Flow selection cards */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full max-w-sm space-y-3"
      >
        {/* Voice Flow — PRIMARY */}
        <motion.button
          onClick={onSelectVoice}
          className="w-full p-5 rounded-2xl text-left transition-all group"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15))',
            border: '1px solid rgba(124,58,237,0.35)',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 0 20px rgba(124,58,237,0.4)',
              }}
            >
              <Mic size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Voice Onboarding
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                >
                  Recommended
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Speak naturally to find your perfect fit
              </p>
            </div>
            <ArrowRight
              size={18}
              style={{ color: 'var(--accent)' }}
              className="group-hover:translate-x-1 transition-transform flex-shrink-0"
            />
          </div>
        </motion.button>

        {/* Manual Flow */}
        <motion.button
          onClick={onSelectManual}
          className="w-full p-5 rounded-2xl text-left transition-all group glass"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              <PenLine size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold block mb-0.5" style={{ color: 'var(--text-primary)' }}>
                Manual Onboarding
              </span>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Tap through each question at your own pace
              </p>
            </div>
            <ArrowRight
              size={18}
              style={{ color: 'var(--text-secondary)' }}
              className="group-hover:translate-x-1 transition-transform flex-shrink-0"
            />
          </div>
        </motion.button>
      </motion.div>

      {/* Trust line */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-10 flex items-center gap-6"
      >
        {['~1 min', 'Privacy First', 'Personalized Fit'].map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {item}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
