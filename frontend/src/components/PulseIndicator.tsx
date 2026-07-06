import React from 'react';

interface PulseIndicatorProps {
  status: 'online' | 'offline' | 'critical' | 'warning' | 'processing';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap = {
  online: { bg: 'bg-[#00FFA3]', ring: 'bg-[#00FFA3]' },
  offline: { bg: 'bg-[#475569]', ring: 'bg-[#475569]' },
  critical: { bg: 'bg-[#FF3B5C]', ring: 'bg-[#FF3B5C]' },
  warning: { bg: 'bg-[#FFB800]', ring: 'bg-[#FFB800]' },
  processing: { bg: 'bg-[#00D4FF]', ring: 'bg-[#00D4FF]' },
};

const sizeMap = {
  sm: { dot: 'w-1.5 h-1.5', ring: 'w-1.5 h-1.5' },
  md: { dot: 'w-2.5 h-2.5', ring: 'w-2.5 h-2.5' },
  lg: { dot: 'w-3.5 h-3.5', ring: 'w-3.5 h-3.5' },
};

const PulseIndicator: React.FC<PulseIndicatorProps> = ({ status, size = 'md', className = '' }) => {
  const colors = colorMap[status];
  const sizes = sizeMap[size];
  const shouldPulse = status !== 'offline';

  return (
    <span className={`relative flex ${sizes.dot} ${className}`} aria-label={`Status: ${status}`}>
      {shouldPulse && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.ring} opacity-50`} />
      )}
      <span className={`relative inline-flex rounded-full ${sizes.dot} ${colors.bg}`} />
    </span>
  );
};

export default PulseIndicator;
