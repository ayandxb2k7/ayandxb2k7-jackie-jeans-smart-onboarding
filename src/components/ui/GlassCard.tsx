import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
  hover?: boolean;
}

export function GlassCard({ children, className, onClick, glow, hover }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl transition-all duration-300',
        glow && 'glow-purple',
        hover && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}
