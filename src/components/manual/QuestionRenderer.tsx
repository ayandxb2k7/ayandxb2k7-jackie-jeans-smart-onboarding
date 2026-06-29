import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Question, COMMON_SIZES } from '../../data/questions';
import { FitProfile } from '../../utils/fitEngine';

interface QuestionRendererProps {
  question: Question;
  currentAnswers: FitProfile;
  onAnswer: (value: unknown) => void;
}

export function QuestionRenderer({ question, currentAnswers, onAnswer }: QuestionRendererProps) {
  const [localVal, setLocalVal] = useState<string>('');

  const saved = currentAnswers[question.id as keyof FitProfile];

  switch (question.type) {
    case 'height':
      return <HeightPicker question={question} savedValue={saved as string} onAnswer={onAnswer} />;
    case 'weight':
      return <WeightInput question={question} savedValue={saved as string} onAnswer={onAnswer} onSkip={() => onAnswer(null)} />;
    case 'number':
      return <NumberSlider question={question} savedValue={saved as number} onAnswer={onAnswer} />;
    case 'single-choice':
      return <SingleChoice question={question} savedValue={saved as string} onAnswer={onAnswer} />;
    case 'multi-choice':
      return <MultiChoice question={question} savedValue={saved as string[]} onAnswer={onAnswer} />;
    case 'brand-sizes':
      return <BrandSizes selectedBrands={currentAnswers.brands ?? []} savedValue={saved as Record<string, string>} onAnswer={onAnswer} />;
    default:
      return (
        <div className="p-4">
          <input
            value={localVal}
            onChange={e => setLocalVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && localVal && onAnswer(localVal)}
            placeholder="Type your answer..."
            className="w-full p-4 rounded-2xl text-base outline-none"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      );
  }
}

// ─── Height Picker ────────────────────────────────────────────────────────────
function HeightPicker({ question, savedValue, onAnswer }: { question: Question; savedValue?: string; onAnswer: (v: unknown) => void }) {
  const heights = question.options ?? [];
  const [selected, setSelected] = useState<string>(savedValue ?? '');

  const handleSelect = (h: string) => {
    setSelected(h);
    onAnswer(h);
  };

  // Group by feet
  const groups: Record<string, string[]> = {};
  for (const h of heights) {
    const feet = h.split("'")[0];
    if (!groups[feet]) groups[feet] = [];
    groups[feet].push(h);
  }

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([feet, items]) => (
        <div key={feet}>
          <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--text-secondary)' }}>
            {feet} feet
          </p>
          <div className="grid grid-cols-4 gap-2">
            {items.map(h => (
              <motion.button
                key={h}
                onClick={() => handleSelect(h)}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                whileTap={{ scale: 0.95 }}
                style={{
                  background: selected === h
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : 'var(--glass-bg)',
                  border: selected === h
                    ? '1px solid rgba(124,58,237,0.5)'
                    : '1px solid var(--glass-border)',
                  color: selected === h ? '#fff' : 'var(--text-primary)',
                  boxShadow: selected === h ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                {h}
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Weight Input ─────────────────────────────────────────────────────────────
function WeightInput({ savedValue, onAnswer, onSkip }: { question: Question; savedValue?: string; onAnswer: (v: unknown) => void; onSkip: () => void }) {
  const [val, setVal] = useState(savedValue ?? '');

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && val && onAnswer(val)}
          placeholder="e.g. 145"
          className="w-full p-4 rounded-2xl text-base outline-none pr-16"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
          }}
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          lbs
        </span>
      </div>
      {val && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onAnswer(val)}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 0 20px rgba(124,58,237,0.35)',
          }}
        >
          Continue
        </motion.button>
      )}
      <button
        onClick={onSkip}
        className="w-full py-2.5 text-sm font-medium text-center rounded-2xl transition-all hover:scale-[1.01]"
        style={{
          color: 'var(--text-secondary)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
        }}
      >
        Skip this question
      </button>
    </div>
  );
}

// ─── Number Slider ────────────────────────────────────────────────────────────
function NumberSlider({ question, savedValue, onAnswer }: { question: Question; savedValue?: number; onAnswer: (v: unknown) => void }) {
  const min = question.min ?? 24;
  const max = question.max ?? 60;
  const mid = Math.floor((min + max) / 2);
  const [val, setVal] = useState<number>(savedValue ?? mid);

  const handleChange = (n: number) => {
    setVal(n);
  };

  const handleConfirm = () => onAnswer(val);

  return (
    <div className="space-y-6">
      {/* Big display */}
      <div className="text-center">
        <motion.div
          key={val}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-end gap-1"
        >
          <span
            className="text-7xl font-black"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {val}
          </span>
          <span className="text-2xl font-bold pb-2" style={{ color: 'var(--text-secondary)' }}>
            {question.unit}
          </span>
        </motion.div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          onChange={e => handleChange(parseInt(e.target.value))}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{min}{question.unit}</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{max}{question.unit}</span>
        </div>
      </div>

      {/* Quick picks */}
      <div>
        <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Common sizes</p>
        <div className="flex flex-wrap gap-2">
          {generateRange(min, max, 8).map(n => (
            <button
              key={n}
              onClick={() => handleChange(n)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: val === n ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'var(--glass-bg)',
                border: val === n ? '1px solid rgba(124,58,237,0.5)' : '1px solid var(--glass-border)',
                color: val === n ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {n}{question.unit}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleConfirm}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          boxShadow: '0 0 20px rgba(124,58,237,0.35)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        Confirm {val}{question.unit}
      </motion.button>
    </div>
  );
}

function generateRange(min: number, max: number, count: number): number[] {
  const step = Math.floor((max - min) / (count - 1));
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(Math.min(min + i * step, max));
  }
  return result;
}

// ─── Single Choice ────────────────────────────────────────────────────────────
function SingleChoice({ question, savedValue, onAnswer }: { question: Question; savedValue?: string; onAnswer: (v: unknown) => void }) {
  const [selected, setSelected] = useState<string>(savedValue ?? '');

  const handleSelect = (opt: string) => {
    setSelected(opt);
    setTimeout(() => onAnswer(opt), 200);
  };

  return (
    <div className="space-y-3">
      {(question.options ?? []).map((opt, i) => (
        <motion.button
          key={opt}
          onClick={() => handleSelect(opt)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="w-full p-4 rounded-2xl text-left transition-all group flex items-center gap-4"
          style={{
            background: selected === opt
              ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.15))'
              : 'var(--glass-bg)',
            border: selected === opt
              ? '1px solid rgba(124,58,237,0.5)'
              : '1px solid var(--glass-border)',
            boxShadow: selected === opt ? '0 0 20px rgba(124,58,237,0.2)' : 'none',
          }}
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
        >
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              borderColor: selected === opt ? '#7c3aed' : 'rgba(139,92,246,0.3)',
              background: selected === opt ? '#7c3aed' : 'transparent',
            }}
          >
            {selected === opt && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <span
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {opt}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Multi Choice ─────────────────────────────────────────────────────────────
function MultiChoice({ question, savedValue, onAnswer }: { question: Question; savedValue?: string[]; onAnswer: (v: unknown) => void }) {
  const [selected, setSelected] = useState<string[]>(savedValue ?? []);

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    setSelected(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(question.options ?? []).map((opt, i) => {
          const isSelected = selected.includes(opt);
          return (
            <motion.button
              key={opt}
              onClick={() => toggle(opt)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              whileTap={{ scale: 0.95 }}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                  : 'var(--glass-bg)',
                border: isSelected
                  ? '1px solid rgba(124,58,237,0.5)'
                  : '1px solid var(--glass-border)',
                color: isSelected ? '#fff' : 'var(--text-primary)',
                boxShadow: isSelected ? '0 0 12px rgba(124,58,237,0.35)' : 'none',
              }}
            >
              {isSelected && <span className="mr-1">✓</span>}
              {opt}
            </motion.button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            {selected.length} brand{selected.length > 1 ? 's' : ''} selected
          </p>
          <button
            onClick={() => onAnswer(selected)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 20px rgba(124,58,237,0.35)',
            }}
          >
            Continue with {selected.length} brand{selected.length > 1 ? 's' : ''}
          </button>
        </motion.div>
      )}

      {question.id === 'brands' && (
        <button
          onClick={() => onAnswer([])}
          className="w-full py-2.5 text-sm text-center rounded-2xl transition-all"
          style={{
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
          }}
        >
          None / Skip
        </button>
      )}
    </div>
  );
}

// ─── Brand Sizes ──────────────────────────────────────────────────────────────
function BrandSizes({ selectedBrands, savedValue, onAnswer }: { selectedBrands: string[]; savedValue?: Record<string, string>; onAnswer: (v: unknown) => void }) {
  const [sizes, setSizes] = useState<Record<string, string>>(savedValue ?? {});
  const [openBrand, setOpenBrand] = useState<string | null>(null);

  const setSize = (brand: string, size: string) => {
    setSizes(prev => ({ ...prev, [brand]: size }));
    setOpenBrand(null);
  };

  const allFilled = selectedBrands.every(b => sizes[b]);

  if (!selectedBrands.length) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--text-secondary)' }}>No brands selected — skipping this step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedBrands.map((brand, i) => (
        <motion.div
          key={brand}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <button
            onClick={() => setOpenBrand(openBrand === brand ? null : brand)}
            className="w-full p-4 rounded-2xl flex items-center justify-between transition-all"
            style={{
              background: sizes[brand] ? 'rgba(52,211,153,0.08)' : 'var(--glass-bg)',
              border: sizes[brand]
                ? '1px solid rgba(52,211,153,0.3)'
                : '1px solid var(--glass-border)',
            }}
          >
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {brand}
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: sizes[brand] ? '#34d399' : 'var(--text-secondary)' }}
            >
              {sizes[brand] ?? 'Tap to select'}
            </span>
          </button>

          {/* Size picker bottom sheet */}
          {openBrand === brand && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="mt-2 p-3 rounded-2xl overflow-hidden"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSize(brand, size)}
                    className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: sizes[brand] === size
                        ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                        : 'rgba(139,92,246,0.08)',
                      border: sizes[brand] === size
                        ? '1px solid rgba(124,58,237,0.5)'
                        : '1px solid rgba(139,92,246,0.15)',
                      color: sizes[brand] === size ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}

      {allFilled && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onAnswer(sizes)}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white mt-2"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 0 20px rgba(124,58,237,0.35)',
          }}
        >
          Continue →
        </motion.button>
      )}

      <button
        onClick={() => onAnswer(sizes)}
        className="w-full py-2.5 text-sm text-center rounded-2xl transition-all"
        style={{
          color: 'var(--text-secondary)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
        }}
      >
        Continue with partial sizes
      </button>
    </div>
  );
}
