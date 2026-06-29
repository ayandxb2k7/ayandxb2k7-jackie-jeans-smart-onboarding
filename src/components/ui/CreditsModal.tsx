import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, GraduationCap, Mic, Sparkles } from 'lucide-react';

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreditsModal({ open, onClose }: CreditsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 modal-backdrop"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-sm mx-auto"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div
              className="glass rounded-3xl overflow-hidden"
              style={{ border: '1px solid rgba(139,92,246,0.3)' }}
            >
              {/* Header glow */}
              <div
                className="h-1 w-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #818cf8, #38bdf8)' }}
              />

              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <X size={14} style={{ color: 'var(--text-secondary)' }} />
                </button>

                {/* Avatar / Icon */}
                <div className="flex flex-col items-center mb-6">
                  <motion.div
                    className="relative mb-4"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9)',
                        boxShadow: '0 0 30px rgba(124,58,237,0.5)',
                      }}
                    >
                      AK
                    </div>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles size={12} className="text-white" />
                    </motion.div>
                  </motion.div>

                  <h2
                    className="text-xl font-bold tracking-tight mb-0.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Ayan Khan
                  </h2>
                  <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                    Designed & Developed
                  </p>
                </div>

                {/* Info cards */}
                <div className="space-y-3 mb-6">
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
                  >
                    <GraduationCap size={18} style={{ color: 'var(--accent)' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>B.E. Computer Science</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>BITS Pilani Dubai Campus</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}
                  >
                    <Sparkles size={18} style={{ color: '#38bdf8' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Jackie Jeans Smart Fit</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Onboarding Hackathon 2025</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
                  >
                    <Code2 size={18} style={{ color: '#34d399' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Tech Stack</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>React, Vite, Tailwind, Web Speech API</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}
                  >
                    <Mic size={18} style={{ color: '#f97316' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>AI Voice Engine</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Web Speech API + Smart NLP Parsing</p>
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i + 0.3 }}
                      className="text-yellow-400 text-base"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <p className="text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Built with ❤️ for Jackie Jeans
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
