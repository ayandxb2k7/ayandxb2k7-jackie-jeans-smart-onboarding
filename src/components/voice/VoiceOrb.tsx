import { motion } from 'framer-motion';

interface VoiceOrbProps {
  status: 'idle' | 'speaking' | 'listening' | 'processing';
  onClick?: () => void;
}

export function VoiceOrb({ status, onClick }: VoiceOrbProps) {
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isProcessing = status === 'processing';

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer"
      onClick={onClick}
      style={{ width: 200, height: 200 }}
    >
      {/* Ripple rings — only when listening */}
      {isListening && (
        <>
          <div
            className="absolute rounded-full ripple-ring"
            style={{
              width: 160, height: 160,
              border: '1.5px solid rgba(124,58,237,0.5)',
            }}
          />
          <div
            className="absolute rounded-full ripple-ring-2"
            style={{
              width: 160, height: 160,
              border: '1.5px solid rgba(79,70,229,0.4)',
            }}
          />
          <div
            className="absolute rounded-full ripple-ring-3"
            style={{
              width: 160, height: 160,
              border: '1.5px solid rgba(14,165,233,0.3)',
            }}
          />
        </>
      )}

      {/* Speaking ring */}
      {isSpeaking && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 150, height: 150,
            border: '2px solid rgba(52,211,153,0.4)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Processing ring */}
      {isProcessing && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 150, height: 150,
            border: '2px solid rgba(251,191,36,0.4)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Main orb */}
      <motion.div
        className="relative z-10 rounded-full flex items-center justify-center"
        style={{
          width: 120, height: 120,
          background: isListening
            ? 'linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9)'
            : isSpeaking
            ? 'linear-gradient(135deg, #059669, #34d399, #0ea5e9)'
            : isProcessing
            ? 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)'
            : 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)',
        }}
        animate={
          isListening
            ? { scale: [1, 1.06, 1], boxShadow: ['0 0 40px rgba(124,58,237,0.6)', '0 0 70px rgba(124,58,237,0.8)', '0 0 40px rgba(124,58,237,0.6)'] }
            : isSpeaking
            ? { scale: [1, 1.04, 1], boxShadow: ['0 0 40px rgba(52,211,153,0.5)', '0 0 60px rgba(52,211,153,0.7)', '0 0 40px rgba(52,211,153,0.5)'] }
            : { scale: 1, boxShadow: '0 0 30px rgba(124,58,237,0.25)' }
        }
        transition={
          isListening || isSpeaking
            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
      >
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2), transparent 65%)',
          }}
        />

        {/* Icon / waveform */}
        {isListening ? (
          <WaveformIcon color="white" active />
        ) : isSpeaking ? (
          <WaveformIcon color="white" active speaking />
        ) : isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </motion.div>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </motion.div>

      {/* Status label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <p className="text-xs font-semibold text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {isListening ? '● Listening...' : isSpeaking ? '● Speaking...' : isProcessing ? '● Processing...' : 'Tap to speak'}
        </p>
      </div>
    </div>
  );
}

function WaveformIcon({ color, active, speaking }: { color: string; active?: boolean; speaking?: boolean }) {
  const bars = speaking ? [3, 7, 12, 7, 3, 7, 12, 7, 3] : [3, 9, 14, 9, 3, 9, 14, 9, 3];
  const delays = [0, 0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.15];

  return (
    <div className="flex items-center gap-0.5">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          style={{
            width: 3,
            height: h,
            background: color,
            borderRadius: 4,
          }}
          animate={active ? { height: [h * 0.4, h, h * 0.6, h, h * 0.4] } : { height: h }}
          transition={{
            duration: speaking ? 0.8 : 0.6,
            delay: delays[i],
            repeat: active ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
