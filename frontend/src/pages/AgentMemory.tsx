import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import { Brain, Database, Zap } from 'lucide-react';

interface MemoryEntry {
  id: string;
  type: 'short-term' | 'long-term' | 'knowledge';
  content: string;
  timestamp: string;
  source: string;
  relevance: number;
}

const memoryData: MemoryEntry[] = [
  { id: 'm1', type: 'short-term', content: 'Person detected at frame #12847 with 98% confidence', timestamp: '06:44:12', source: 'Video Agent', relevance: 95 },
  { id: 'm2', type: 'short-term', content: 'Threat score: 12/100 — Environment classified as SAFE', timestamp: '06:44:11', source: 'Threat Agent', relevance: 90 },
  { id: 'm3', type: 'short-term', content: 'Motion vector: 2.3 px/frame NE direction', timestamp: '06:44:10', source: 'Video Agent', relevance: 75 },
  { id: 'm4', type: 'long-term', content: 'Camera feed initialized at 06:10:01 — continuous monitoring active', timestamp: '06:10:01', source: 'System', relevance: 60 },
  { id: 'm5', type: 'long-term', content: 'Historical pattern: Low activity typical for morning hours', timestamp: '06:00:00', source: 'Reasoning Agent', relevance: 85 },
  { id: 'm6', type: 'long-term', content: 'Incident inc-003: Unidentified object resolved as false positive', timestamp: '06:35:00', source: 'Decision Agent', relevance: 70 },
  { id: 'm7', type: 'knowledge', content: 'YOLO v8-nano optimal for real-time inference on webcam streams', timestamp: 'Persistent', source: 'Model Config', relevance: 100 },
  { id: 'm8', type: 'knowledge', content: 'Threat score >70 triggers immediate alert protocol', timestamp: 'Persistent', source: 'Policy Engine', relevance: 100 },
  { id: 'm9', type: 'knowledge', content: 'Camera field of view: 120° — single person typical occupancy', timestamp: 'Persistent', source: 'Calibration', relevance: 80 },
];

const tabs = [
  { key: 'short-term', label: 'Short-Term', icon: Zap, color: '#00D4FF' },
  { key: 'long-term', label: 'Long-Term', icon: Database, color: '#7B61FF' },
  { key: 'knowledge', label: 'Knowledge Graph', icon: Brain, color: '#00FFA3' },
] as const;

const AgentMemory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'short-term' | 'long-term' | 'knowledge'>('short-term');
  const filtered = memoryData.filter(m => m.type === activeTab);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full flex flex-col">
      <motion.div variants={fadeUpItem} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F0F4F8]">Agent Memory</h2>
          <p className="text-[11px] font-mono text-[#475569]">Cognitive state — what the agents remember</p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-[#7B61FF]" />
          <span className="text-[10px] font-mono text-[#94A3B8]">{memoryData.length} entries</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUpItem} className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-mono transition-all duration-300 border ${
              activeTab === tab.key
                ? 'bg-white/[0.06] border-white/[0.1] text-[#F0F4F8]'
                : 'border-transparent text-[#475569] hover:text-[#94A3B8] hover:bg-white/[0.02]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" style={{ color: activeTab === tab.key ? tab.color : undefined }} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <div className="flex-1 grid grid-cols-[1fr_300px] gap-4 min-h-0">
        {/* Memory Entries */}
        <div className="overflow-y-auto pr-1 space-y-2">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassPanel variant="sm" className="p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-semibold" style={{ color: tabs.find(t => t.key === entry.type)?.color }}>
                    {entry.source}
                  </span>
                  <span className="text-[9px] font-mono text-[#475569]">{entry.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#F0F4F8] leading-relaxed">{entry.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[#475569]">Relevance</span>
                  <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] rounded-full" style={{ width: `${entry.relevance}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-[#94A3B8]">{entry.relevance}%</span>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Knowledge Graph Visualization */}
        <GlassPanel className="p-4 overflow-hidden relative">
          <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-3">Knowledge Graph</h4>
          <div className="relative h-[calc(100%-24px)]">
            {/* Simplified node graph */}
            <svg className="w-full h-full" viewBox="0 0 200 300">
              {/* Connections */}
              <line x1="100" y1="40" x2="50" y2="120" stroke="#00D4FF" strokeWidth="0.5" opacity="0.2" />
              <line x1="100" y1="40" x2="150" y2="120" stroke="#7B61FF" strokeWidth="0.5" opacity="0.2" />
              <line x1="50" y1="120" x2="80" y2="200" stroke="#00FFA3" strokeWidth="0.5" opacity="0.2" />
              <line x1="150" y1="120" x2="120" y2="200" stroke="#FFB800" strokeWidth="0.5" opacity="0.2" />
              <line x1="80" y1="200" x2="100" y2="270" stroke="#FF3B5C" strokeWidth="0.5" opacity="0.2" />
              <line x1="120" y1="200" x2="100" y2="270" stroke="#5B8DEF" strokeWidth="0.5" opacity="0.2" />

              {/* Nodes */}
              {[
                { cx: 100, cy: 40, label: 'Camera', color: '#00D4FF' },
                { cx: 50, cy: 120, label: 'Detection', color: '#00FFA3' },
                { cx: 150, cy: 120, label: 'Threat', color: '#FF3B5C' },
                { cx: 80, cy: 200, label: 'Context', color: '#7B61FF' },
                { cx: 120, cy: 200, label: 'Decision', color: '#FFB800' },
                { cx: 100, cy: 270, label: 'Action', color: '#5B8DEF' },
              ].map((node, i) => (
                <g key={i}>
                  <circle cx={node.cx} cy={node.cy} r="14" fill={`${node.color}15`} stroke={node.color} strokeWidth="1" opacity="0.6" />
                  <circle cx={node.cx} cy={node.cy} r="4" fill={node.color} opacity="0.8">
                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={node.cx} y={node.cy + 26} textAnchor="middle" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace">{node.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </GlassPanel>
      </div>
    </motion.div>
  );
};

export default AgentMemory;
