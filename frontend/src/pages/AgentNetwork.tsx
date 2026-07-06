import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import { Network as NetworkIcon } from 'lucide-react';

const agents = [
  { id: 'video', name: 'Video Agent', color: '#00D4FF', x: 300, y: 80 },
  { id: 'threat', name: 'Threat Agent', color: '#FF3B5C', x: 500, y: 160 },
  { id: 'reasoning', name: 'Reasoning Agent', color: '#7B61FF', x: 300, y: 240 },
  { id: 'decision', name: 'Decision Agent', color: '#FFB800', x: 500, y: 320 },
  { id: 'notification', name: 'Notification Agent', color: '#5B8DEF', x: 300, y: 400 },
  { id: 'report', name: 'Report Agent', color: '#00FFA3', x: 500, y: 480 },
];

const connections = [
  { from: 'video', to: 'threat', label: 'Detection Data' },
  { from: 'threat', to: 'reasoning', label: 'Threat Score' },
  { from: 'reasoning', to: 'decision', label: 'Analysis' },
  { from: 'decision', to: 'notification', label: 'Alert Trigger' },
  { from: 'decision', to: 'report', label: 'Report Request' },
  { from: 'video', to: 'reasoning', label: 'Frame Context' },
];

const AgentNetwork: React.FC = () => {
  const packetRef = useRef<number>(0);

  useEffect(() => {
    // Animate data packets via CSS
    packetRef.current = window.setInterval(() => {}, 2000);
    return () => clearInterval(packetRef.current);
  }, []);

  const getAgent = (id: string) => agents.find(a => a.id === id)!;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full flex flex-col">
      <motion.div variants={fadeUpItem} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F0F4F8]">Agent Communication</h2>
          <p className="text-[11px] font-mono text-[#475569]">Inter-agent message flow and data routing</p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkIcon className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span className="text-[10px] font-mono text-[#94A3B8]">{connections.length} active channels</span>
        </div>
      </motion.div>

      <motion.div variants={fadeUpItem} className="flex-1">
        <GlassPanel className="p-4 h-full overflow-hidden relative">
          <svg className="w-full h-full" viewBox="0 0 800 560">
            <defs>
              {/* Animated gradient for data flow */}
              {connections.map((conn, i) => (
                <linearGradient key={`grad-${i}`} id={`flow-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={getAgent(conn.from).color} stopOpacity="0.1">
                    <animate attributeName="stopOpacity" values="0.1;0.6;0.1" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  </stop>
                  <stop offset="50%" stopColor={getAgent(conn.to).color} stopOpacity="0.8">
                    <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  </stop>
                  <stop offset="100%" stopColor={getAgent(conn.to).color} stopOpacity="0.1">
                    <animate attributeName="stopOpacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  </stop>
                </linearGradient>
              ))}
            </defs>

            {/* Connection Lines */}
            {connections.map((conn, i) => {
              const from = getAgent(conn.from);
              const to = getAgent(conn.to);
              return (
                <g key={`conn-${i}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={`url(#flow-${i})`} strokeWidth="2" />
                  {/* Data packet */}
                  <circle r="3" fill={from.color}>
                    <animateMotion dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" begin={`${i * 0.4}s`}>
                      <mpath href={`#path-${i}`} />
                    </animateMotion>
                  </circle>
                  <path id={`path-${i}`} d={`M${from.x},${from.y} L${to.x},${to.y}`} fill="none" />
                  {/* Label */}
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 8}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {conn.label}
                  </text>
                </g>
              );
            })}

            {/* Agent Nodes */}
            {agents.map(agent => (
              <g key={agent.id}>
                {/* Outer glow ring */}
                <circle cx={agent.x} cy={agent.y} r="30" fill="none" stroke={agent.color} strokeWidth="0.5" opacity="0.15">
                  <animate attributeName="r" values="28;34;28" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Node */}
                <circle cx={agent.x} cy={agent.y} r="20" fill={`${agent.color}15`} stroke={agent.color} strokeWidth="1.5" />
                {/* Inner dot */}
                <circle cx={agent.x} cy={agent.y} r="6" fill={agent.color} opacity="0.8">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                </circle>
                {/* Label */}
                <text
                  x={agent.x}
                  y={agent.y + 38}
                  textAnchor="middle"
                  fill="#F0F4F8"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                >
                  {agent.name}
                </text>
                {/* Status */}
                <circle cx={agent.x + 18} cy={agent.y - 18} r="4" fill="#00FFA3">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </svg>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
};

export default AgentNetwork;
