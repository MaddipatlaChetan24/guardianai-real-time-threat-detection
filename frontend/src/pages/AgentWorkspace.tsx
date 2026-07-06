import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import PulseIndicator from '../components/PulseIndicator';
import ConfidenceBar from '../components/ConfidenceBar';
import AnimatedCounter from '../components/AnimatedCounter';
import { Eye, ShieldAlert, Brain, Zap, Bell, FileText, Clock, Cpu, Database, Activity } from 'lucide-react';

interface AgentDetail {
  id: string;
  name: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  status: 'online' | 'processing';
  description: string;
  currentTask: string;
  tool: string;
  latency: number;
  confidence: number;
  memory: string;
  tasksCompleted: number;
  uptime: string;
  executionHistory: { time: string; action: string }[];
}

const agentsList: AgentDetail[] = [
  { id: 'video', name: 'Video Agent', icon: Eye, color: '#00D4FF', status: 'processing', description: 'Processes video frames using YOLO for real-time object detection', currentTask: 'Analyzing frame #12847', tool: 'YOLOv8-nano', latency: 94, confidence: 98, memory: '2.4 MB', tasksCompleted: 12847, uptime: '2h 14m', executionHistory: [
    { time: '06:44:12', action: 'Frame #12847 — 2 objects detected' },
    { time: '06:44:09', action: 'Frame #12846 — 1 object detected' },
    { time: '06:44:06', action: 'Frame #12845 — 3 objects detected' },
    { time: '06:44:03', action: 'Frame #12844 — 1 object detected' },
  ]},
  { id: 'threat', name: 'Threat Agent', icon: ShieldAlert, color: '#FF3B5C', status: 'online', description: 'Evaluates threat levels from detections using Gemini reasoning', currentTask: 'Threat assessment cycle', tool: 'Gemini 2.5 Pro', latency: 12, confidence: 96, memory: '1.1 MB', tasksCompleted: 3211, uptime: '2h 14m', executionHistory: [
    { time: '06:44:11', action: 'Threat score: 12 — SAFE' },
    { time: '06:44:08', action: 'Anomaly scan: negative' },
    { time: '06:44:05', action: 'Threat score: 8 — SAFE' },
  ]},
  { id: 'reasoning', name: 'Reasoning Agent', icon: Brain, color: '#7B61FF', status: 'processing', description: 'Performs chain-of-thought reasoning for complex scene understanding', currentTask: 'Context enrichment', tool: 'Gemini 2.5 Pro', latency: 230, confidence: 92, memory: '4.2 MB', tasksCompleted: 1605, uptime: '2h 14m', executionHistory: [
    { time: '06:44:10', action: 'CoT: Normal activity pattern detected' },
    { time: '06:44:07', action: 'Historical pattern match: 94%' },
  ]},
  { id: 'decision', name: 'Decision Agent', icon: Zap, color: '#FFB800', status: 'online', description: 'Makes autonomous decisions based on threat and reasoning outputs', currentTask: 'Action tree evaluation', tool: 'Decision Engine', latency: 45, confidence: 89, memory: '0.8 MB', tasksCompleted: 1605, uptime: '2h 14m', executionHistory: [
    { time: '06:44:10', action: 'Decision: CONTINUE MONITORING' },
    { time: '06:44:07', action: 'Decision: NO ESCALATION' },
  ]},
  { id: 'notification', name: 'Notification Agent', icon: Bell, color: '#5B8DEF', status: 'online', description: 'Sends alerts via email, SMS, and push notifications', currentTask: 'Queue idle', tool: 'Email/SMS MCP', latency: 8, confidence: 100, memory: '0.3 MB', tasksCompleted: 23, uptime: '2h 14m', executionHistory: [
    { time: '06:31:22', action: 'Alert dispatched: Unidentified Object' },
    { time: '06:10:01', action: 'Boot notification sent' },
  ]},
  { id: 'report', name: 'Report Agent', icon: FileText, color: '#00FFA3', status: 'online', description: 'Generates PDF reports and periodic summaries', currentTask: 'Periodic summary', tool: 'PDF Generator', latency: 1200, confidence: 95, memory: '3.1 MB', tasksCompleted: 8, uptime: '2h 14m', executionHistory: [
    { time: '06:40:00', action: 'Periodic summary generated' },
    { time: '06:20:00', action: 'Periodic summary generated' },
  ]},
];

const AgentWorkspace: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full flex flex-col">
      <motion.div variants={fadeUpItem} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F0F4F8]">Agent Workspace</h2>
          <p className="text-[11px] font-mono text-[#475569]">Deep introspection into each autonomous agent</p>
        </div>
        <div className="flex items-center gap-2">
          <PulseIndicator status="online" size="sm" />
          <span className="text-[10px] font-mono text-[#00FFA3]">All agents operational</span>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-[1fr_340px] gap-4 min-h-0">
        {/* Agent Grid */}
        <div className="grid grid-cols-2 gap-3 content-start overflow-y-auto pr-1">
          {agentsList.map(agent => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <motion.div key={agent.id} variants={fadeUpItem}>
                <GlassPanel
                  variant="interactive"
                  glowColor="none"
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 transition-all duration-300 ${isSelected ? 'border-white/10' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${agent.color}12`, borderColor: `${agent.color}25` }}>
                      <agent.icon className="w-4 h-4" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#F0F4F8]">{agent.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <PulseIndicator status={agent.status} size="sm" />
                        <span className="text-[9px] font-mono text-[#475569] uppercase">{agent.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div><span className="text-[#475569]">Latency</span><br/><span className="text-[#F0F4F8]">{agent.latency}ms</span></div>
                    <div><span className="text-[#475569]">Tasks</span><br/><AnimatedCounter value={agent.tasksCompleted} className="text-[#F0F4F8]" /></div>
                  </div>
                  <ConfidenceBar value={agent.confidence} color="cyan" className="mt-3" />
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full heartbeat" style={{ backgroundColor: agent.color }} />
                    <span className="text-[8px] font-mono text-[#475569]">HEARTBEAT</span>
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>

        {/* Agent Detail */}
        {selectedAgent ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={selectedAgent.id}>
            <GlassPanel className="p-4 h-full overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${selectedAgent.color}15`, borderColor: `${selectedAgent.color}30` }}>
                  <selectedAgent.icon className="w-5 h-5" style={{ color: selectedAgent.color }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F0F4F8]">{selectedAgent.name}</h3>
                  <p className="text-[10px] text-[#475569]">{selectedAgent.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Current Task', value: selectedAgent.currentTask, icon: Activity },
                  { label: 'Active Tool', value: selectedAgent.tool, icon: Cpu },
                  { label: 'Memory Usage', value: selectedAgent.memory, icon: Database },
                  { label: 'Uptime', value: selectedAgent.uptime, icon: Clock },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-3 h-3 text-[#475569]" />
                      <span className="text-[10px] font-mono text-[#475569]">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#F0F4F8]">{item.value}</span>
                  </div>
                ))}

                <ConfidenceBar value={selectedAgent.confidence} color="cyan" showLabel height="md" />

                <div>
                  <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2 mt-4">Execution History</h4>
                  <div className="space-y-1.5">
                    {selectedAgent.executionHistory.map((entry, i) => (
                      <div key={i} className="flex gap-2 text-[10px] font-mono">
                        <span className="text-[#475569] shrink-0">{entry.time}</span>
                        <span className="text-[#94A3B8]">{entry.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-8 h-8 text-[#475569]/50 mx-auto mb-3" />
              <p className="text-[11px] font-mono text-[#475569]">Select an agent to inspect</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AgentWorkspace;
