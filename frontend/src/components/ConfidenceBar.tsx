import React from 'react';

interface ConfidenceBarProps {
  value: number; // 0-100
  color?: 'cyan' | 'gradient' | 'threat';
  height?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  value,
  color = 'gradient',
  height = 'sm',
  showLabel = false,
  className = '',
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const heightClass = height === 'sm' ? 'h-1.5' : 'h-2.5';

  const gradientMap = {
    cyan: 'bg-gradient-to-r from-[#00D4FF] to-[#5B8DEF]',
    gradient: 'bg-gradient-to-r from-[#00D4FF] via-[#7B61FF] to-[#FF3B5C]',
    threat: clampedValue < 30
      ? 'bg-gradient-to-r from-[#00FFA3] to-[#00D4FF]'
      : clampedValue < 60
        ? 'bg-gradient-to-r from-[#FFB800] to-[#FF8C00]'
        : 'bg-gradient-to-r from-[#FF3B5C] to-[#FF1744]',
  };

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">Confidence</span>
          <span className="text-[10px] font-mono text-[#F0F4F8]">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full ${heightClass} bg-white/5 rounded-full overflow-hidden`}>
        <div
          className={`${heightClass} ${gradientMap[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;
