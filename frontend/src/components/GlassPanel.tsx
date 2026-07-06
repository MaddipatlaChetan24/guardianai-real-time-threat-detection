import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'sm' | 'interactive';
  glowColor?: 'cyan' | 'violet' | 'mint' | 'amber' | 'crimson' | 'none';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const glowMap = {
  cyan: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]',
  violet: 'hover:shadow-[0_0_30px_rgba(123,97,255,0.15)]',
  mint: 'hover:shadow-[0_0_30px_rgba(0,255,163,0.15)]',
  amber: 'hover:shadow-[0_0_30px_rgba(255,184,0,0.15)]',
  crimson: 'hover:shadow-[0_0_30px_rgba(255,59,92,0.15)]',
  none: '',
};

const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  variant = 'default',
  glowColor = 'cyan',
  onClick,
  style,
}) => {
  const base = variant === 'sm' ? 'glass-panel-sm' : 'glass-panel';
  const interactive = variant === 'interactive' || onClick
    ? 'cursor-pointer transition-all duration-300 hover:border-white/10 hover:translate-y-[-1px]'
    : '';
  const glow = glowMap[glowColor];

  return (
    <div
      className={`${base} ${interactive} ${glow} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
