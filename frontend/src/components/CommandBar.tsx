import React, { useState, useEffect } from 'react';
import { Shield, Cpu, Activity, MonitorSpeaker, Users, Wifi } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import PulseIndicator from './PulseIndicator';
import GlowBadge from './GlowBadge';

const CommandBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [threatScore, setThreatScore] = useState(12);
  const [cpuUsage, setCpuUsage] = useState(34);
  const [gpuUsage, setGpuUsage] = useState(67);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate fluctuating stats
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatScore(prev => Math.max(0, Math.min(100, prev + Math.floor(Math.random() * 7) - 3)));
      setCpuUsage(prev => Math.max(10, Math.min(90, prev + Math.floor(Math.random() * 11) - 5)));
      setGpuUsage(prev => Math.max(20, Math.min(95, prev + Math.floor(Math.random() * 9) - 4)));
      setFps(prev => Math.max(24, Math.min(60, prev + Math.floor(Math.random() * 5) - 2)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const threatColor = threatScore < 30 ? 'mint' : threatScore < 60 ? 'amber' : 'crimson';
  const threatLabel = threatScore < 30 ? 'LOW' : threatScore < 60 ? 'ELEVATED' : 'HIGH';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-4 bg-[#040712]/80 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center border border-[#00D4FF]/20">
          <Shield className="w-4 h-4 text-[#00D4FF]" />
        </div>
        <span className="text-sm font-bold tracking-wide text-[#F0F4F8]">GUARDIAN<span className="text-[#00D4FF]">AI</span></span>
      </div>

      {/* Center: System Stats */}
      <div className="hidden md:flex items-center gap-6 text-[11px] font-mono text-[#94A3B8]">
        {/* Threat Level */}
        <div className="flex items-center gap-2">
          <span className="text-[#475569] uppercase tracking-widest">Threat</span>
          <GlowBadge label={threatLabel} color={threatColor} />
          <AnimatedCounter value={threatScore} className="text-[#F0F4F8] text-xs" />
        </div>

        <div className="w-px h-5 bg-white/[0.06]" />

        {/* CPU */}
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-[#475569]" />
          <span>CPU</span>
          <AnimatedCounter value={cpuUsage} suffix="%" className="text-[#F0F4F8]" />
        </div>

        {/* GPU */}
        <div className="flex items-center gap-1.5">
          <MonitorSpeaker className="w-3 h-3 text-[#475569]" />
          <span>GPU</span>
          <AnimatedCounter value={gpuUsage} suffix="%" className="text-[#F0F4F8]" />
        </div>

        {/* FPS */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#475569]" />
          <span>FPS</span>
          <AnimatedCounter value={fps} className="text-[#00FFA3]" />
        </div>

        <div className="w-px h-5 bg-white/[0.06]" />

        {/* Agents */}
        <div className="flex items-center gap-1.5">
          <PulseIndicator status="online" size="sm" />
          <span>Agents</span>
          <span className="text-[#00FFA3]">6/6</span>
        </div>

        {/* Cameras */}
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-[#475569]" />
          <span>Cams</span>
          <span className="text-[#F0F4F8]">1</span>
        </div>

        {/* Users */}
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-[#475569]" />
          <span className="text-[#F0F4F8]">1</span>
        </div>
      </div>

      {/* Right: Clock */}
      <div className="flex items-center gap-3">
        <div className="text-right font-mono">
          <div className="text-xs text-[#F0F4F8] tracking-widest">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-[9px] text-[#475569] tracking-wider">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CommandBar;
