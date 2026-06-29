import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  type = 'button',
  fullWidth,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-95 select-none';

  const variants = {
    primary: 'text-white',
    secondary: 'glass text-[var(--text-primary)] border border-[var(--glass-border)]',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3.5 text-base min-h-[52px]',
    lg: 'px-8 py-4 text-lg min-h-[60px]',
  };

  const primaryStyle = variant === 'primary' ? {
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)',
    boxShadow: disabled ? 'none' : '0 0 24px rgba(124,58,237,0.4), 0 4px 24px rgba(0,0,0,0.3)',
  } : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={primaryStyle}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        variant !== 'primary' && 'hover:scale-[1.02]',
        variant === 'primary' && !disabled && 'hover:scale-[1.02] hover:shadow-purple-500/40',
        className
      )}
    >
      {children}
    </button>
  );
}
