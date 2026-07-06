import React from 'react';

interface GlowBadgeProps {
  label: string;
  color: 'cyan' | 'violet' | 'mint' | 'amber' | 'crimson';
  size?: 'sm' | 'md';
  className?: string;
}

const colorStyles = {
  cyan: 'text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/20 shadow-[0_0_12px_rgba(0,212,255,0.2)]',
  violet: 'text-[#7B61FF] bg-[#7B61FF]/10 border-[#7B61FF]/20 shadow-[0_0_12px_rgba(123,97,255,0.2)]',
  mint: 'text-[#00FFA3] bg-[#00FFA3]/10 border-[#00FFA3]/20 shadow-[0_0_12px_rgba(0,255,163,0.2)]',
  amber: 'text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/20 shadow-[0_0_12px_rgba(255,184,0,0.2)]',
  crimson: 'text-[#FF3B5C] bg-[#FF3B5C]/10 border-[#FF3B5C]/20 shadow-[0_0_12px_rgba(255,59,92,0.2)]',
};

const GlowBadge: React.FC<GlowBadgeProps> = ({ label, color, size = 'sm', className = '' }) => {
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span className={`inline-flex items-center font-mono font-medium uppercase tracking-wider rounded-full border ${colorStyles[color]} ${sizeClass} ${className}`}>
      {label}
    </span>
  );
};

export default GlowBadge;
