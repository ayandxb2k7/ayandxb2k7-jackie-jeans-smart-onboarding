import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RotateCcw, Star, Sparkles } from 'lucide-react';
import { FitProfile, FitRecommendation, generateFitRecommendation, encodeFitProfile } from '../utils/fitEngine';

interface CompletionScreenProps {
  profile: FitProfile;
  onRestart: () => void;
}

export function CompletionScreen({ profile, onRestart }: CompletionScreenProps) {
  const [rec, setRec] = useState<FitRecommendation | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRec(generateFitRecommendation(profile));
    }, 600);
  }, [profile]);

  const handleRedirect = () => {
    const encoded = encodeFitProfile(profile);
    const url = `https://jackie-jeans.vercel.app/${encoded ? `?fitProfile=${encoded}` : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pb-12 pt-20">
      {/* Celebration header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="mb-6 relative"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9)',
            boxShadow: '0 0 60px rgba(124,58,237,0.6)',
          }}
        >
          <span className="text-4xl">🎉</span>
        </div>
        {/* Floating stars */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 text-lg"
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.cos((i / 6) * Math.PI * 2) * 50,
              y: Math.sin((i / 6) * Math.PI * 2) * 50,
            }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
          >
            ★
          </motion.div>
        ))}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black text-center gradient-text mb-2"
      >
        Your Fit Profile is Ready!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-center mb-8"
        style={{ color: 'var(--text-secondary)' }}
      >
        We've analyzed your measurements and preferences
      </motion.p>

      {/* Recommendation card */}
      {rec && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', damping: 20 }}
          className="w-full max-w-sm mb-4"
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))',
                borderBottom: '1px solid rgba(124,58,237,0.15)',
              }}
            >
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--accent)' }}>
                  Recommended Size
                </p>
                <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {rec.recommendedSize}
                </p>
              </div>
              {/* Confidence ring */}
              <div className="relative w-16 h-16">
                <svg width="64" height="64" viewBox="0 0 64 64" className="rotate-[-90deg]">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="6" />
                  <motion.circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke={rec.fitColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="163.36"
                    initial={{ strokeDashoffset: 163.36 }}
                    animate={{ strokeDashoffset: 163.36 * (1 - rec.confidenceScore / 100) }}
                    transition={{ duration: 1.5, delay: 0.7, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-black" style={{ color: rec.fitColor }}>
                    {rec.confidenceScore}
                  </span>
                  <span className="text-[9px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    score
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="p-4 grid grid-cols-3 gap-3 mb-2">
              {[
                { label: 'Inseam', value: rec.inseam },
                { label: 'Rise', value: rec.riseType.replace(' Rise', '') },
                { label: 'Style', value: rec.fitStyle.split(' ')[0] },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center p-3 rounded-xl"
                  style={{ background: 'rgba(139,92,246,0.08)' }}
                >
                  <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Fit label */}
            <div className="px-4 pb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: rec.fitColor }} />
              <span className="text-sm font-semibold" style={{ color: rec.fitColor }}>
                {rec.fitLabel}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                based on your profile
              </span>
            </div>

            {/* Tips */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowAll(prev => !prev)}
                className="text-xs font-semibold mb-2"
                style={{ color: 'var(--accent)' }}
              >
                <Sparkles size={11} className="inline mr-1" />
                {showAll ? 'Hide' : 'Show'} stylist tips
              </button>
              {showAll && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  {rec.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex gap-2 p-2.5 rounded-xl text-xs"
                      style={{
                        background: 'rgba(139,92,246,0.06)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Star size={12} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                      {tip}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}


      {/* Premium AI fit intelligence */}
      {rec && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="w-full max-w-sm mb-4"
        >
          <div className="premium-denim-card rounded-3xl p-4" style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.10), rgba(139,92,246,0.08), rgba(52,211,153,0.06))',
            border: '1px solid rgba(14,165,233,0.24)'
          }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                    AI Fit Intelligence
                  </p>
                  <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                    Confidence breakdown
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-black" style={{
                  color: rec.fitColor,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)'
                }}>
                  {rec.fitLabel}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  ['Waist', profile.waist ? 'High' : 'Est.'],
                  ['Hip', profile.hips ? 'High' : 'Est.'],
                  ['Length', profile.height ? 'High' : 'Est.'],
                ].map(([label, value]) => (
                  <div key={label} className="fit-metric-card p-3 text-center">
                    <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Jackie compares your measurements, rise preference, thigh fit and brand history to create a focused recommendation before handoff.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Profile summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm mb-6"
      >
        <div
          className="glass rounded-2xl p-4"
        >
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--accent)' }}>
            YOUR PROFILE SUMMARY
          </p>
          <div className="grid grid-cols-2 gap-2">
            {profile.height && <SummaryItem label="Height" value={profile.height} />}
            {profile.weight && <SummaryItem label="Weight" value={`${profile.weight} lbs`} />}
            {profile.waist && <SummaryItem label="Waist" value={`${profile.waist}"`} />}
            {profile.hips && <SummaryItem label="Hips" value={`${profile.hips}"`} />}
            {profile.rise && <SummaryItem label="Rise" value={profile.rise} />}
            {profile.waist_fit && <SummaryItem label="Waist Fit" value={profile.waist_fit} />}
            {profile.thigh_fit && <SummaryItem label="Thigh Fit" value={profile.thigh_fit} />}
            {profile.brands?.length && (
              <SummaryItem label="Brands" value={`${profile.brands.length} brands`} />
            )}
          </div>
        </div>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-sm space-y-3"
      >
        {/* Main CTA */}
        <motion.button
          onClick={handleRedirect}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 text-base"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)',
            boxShadow: '0 0 30px rgba(124,58,237,0.5), 0 8px 32px rgba(0,0,0,0.3)',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(124,58,237,0.7)' }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Shop Jackie Jeans</span>
          <ExternalLink size={18} />
        </motion.button>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 glass transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <RotateCcw size={14} />
          Start over
        </button>
      </motion.div>

      {/* Flow badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6"
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.15)',
            color: 'var(--text-secondary)',
          }}
        >
          Completed via {profile.flow === 'voice' ? '🎤 AI Voice' : '✍️ Manual'} onboarding
        </div>
      </motion.div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="px-3 py-2 rounded-xl"
      style={{ background: 'rgba(139,92,246,0.06)' }}
    >
      <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}
