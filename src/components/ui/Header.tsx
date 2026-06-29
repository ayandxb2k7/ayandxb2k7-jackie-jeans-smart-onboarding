import { useState } from 'react';
import { Sun, Moon, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { CreditsModal } from './CreditsModal';

export function Header() {
  const { theme, toggle } = useTheme();
  const [creditsOpen, setCreditsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 16px rgba(124,58,237,0.4)',
            }}
          >
            JJ
          </div>
          <span
            className="text-sm font-semibold tracking-tight hidden sm:block"
            style={{ color: 'var(--text-primary)' }}
          >
            Jackie Jeans
          </span>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Credits button */}
          <button
            onClick={() => setCreditsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.2)',
              color: 'var(--accent)',
            }}
          >
            <Award size={13} />
            <span>Credits</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
            }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </motion.div>
      </header>

      <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
}
