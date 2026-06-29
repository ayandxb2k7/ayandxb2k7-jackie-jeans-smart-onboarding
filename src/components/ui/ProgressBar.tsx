

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Step {current} of {total}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          {pct}%
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(139,92,246,0.12)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #7c3aed, #818cf8, #38bdf8)',
            boxShadow: '0 0 12px rgba(139,92,246,0.5)',
          }}
        />
      </div>
      {/* Step dots */}
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full transition-all duration-500"
            style={{
              background: i < current
                ? 'linear-gradient(90deg, #7c3aed, #818cf8)'
                : 'rgba(139,92,246,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
