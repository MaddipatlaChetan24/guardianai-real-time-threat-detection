import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import PulseIndicator from '../components/PulseIndicator';
import { HardDrive, Database, Camera, Mail, MapPin, Search, CloudSun, BellRing, Wrench } from 'lucide-react';

interface ToolInfo {
  id: string;
  name: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  status: 'active' | 'idle' | 'error';
  calls: number;
  lastCall: string;
  description: string;
}

const tools: ToolInfo[] = [
  { id: 'filesystem', name: 'Filesystem', icon: HardDrive, color: '#00D4FF', status: 'active', calls: 847, lastCall: '2s ago', description: 'Read/write local storage and logs' },
  { id: 'database', name: 'Database', icon: Database, color: '#7B61FF', status: 'active', calls: 3211, lastCall: '1s ago', description: 'Query and persist event data' },
  { id: 'camera', name: 'Camera', icon: Camera, color: '#00FFA3', status: 'active', calls: 12847, lastCall: '0s ago', description: 'Access webcam stream and capture frames' },
  { id: 'email', name: 'Email', icon: Mail, color: '#5B8DEF', status: 'idle', calls: 23, lastCall: '12m ago', description: 'Send email alerts and notifications' },
  { id: 'maps', name: 'Maps', icon: MapPin, color: '#FFB800', status: 'idle', calls: 5, lastCall: '45m ago', description: 'Geolocation and mapping services' },
  { id: 'search', name: 'Search', icon: Search, color: '#00D4FF', status: 'idle', calls: 156, lastCall: '8m ago', description: 'Web search for context enrichment' },
  { id: 'weather', name: 'Weather', icon: CloudSun, color: '#FFB800', status: 'idle', calls: 12, lastCall: '30m ago', description: 'Weather data for environmental context' },
  { id: 'notifications', name: 'Push Notify', icon: BellRing, color: '#FF3B5C', status: 'idle', calls: 34, lastCall: '5m ago', description: 'Push notifications to mobile devices' },
];

interface ToolCall {
  id: string;
  toolName: string;
  toolColor: string;
  action: string;
  timestamp: Date;
  status: 'success' | 'pending';
}

const MCPToolCenter: React.FC = () => {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  useEffect(() => {
    const callTemplates = [
      { toolName: 'Camera', toolColor: '#00FFA3', action: 'capture_frame() → frame_12848.jpg' },
      { toolName: 'Database', toolColor: '#7B61FF', action: 'insert(events, {type: "detection"})' },
      { toolName: 'Filesystem', toolColor: '#00D4FF', action: 'write_log("inference_complete")' },
      { toolName: 'Database', toolColor: '#7B61FF', action: 'query(threats, {score: {$gt: 50}})' },
      { toolName: 'Camera', toolColor: '#00FFA3', action: 'get_stream_status() → ACTIVE' },
      { toolName: 'Filesystem', toolColor: '#00D4FF', action: 'read_config("agent_params.json")' },
    ];

    const interval = setInterval(() => {
      const template = callTemplates[Math.floor(Math.random() * callTemplates.length)];
      setToolCalls(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        toolName: template.toolName,
        toolColor: template.toolColor,
        action: template.action,
        timestamp: new Date(),
        status: 'success' as const,
      }, ...prev].slice(0, 15));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full flex flex-col">
      <motion.div variants={fadeUpItem} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F0F4F8]">MCP Tool Center</h2>
          <p className="text-[11px] font-mono text-[#475569]">Model Context Protocol — real-time tool invocations</p>
        </div>
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-[#475569]" />
          <span className="text-[10px] font-mono text-[#94A3B8]">{tools.length} tools registered</span>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-[1fr_320px] gap-4 min-h-0">
        {/* Tool Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 content-start">
          {tools.map(tool => (
            <motion.div key={tool.id} variants={fadeUpItem}>
              <GlassPanel variant="sm" className={`p-4 text-center transition-all duration-500 ${tool.status === 'active' ? 'border-animate' : ''}`}>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border transition-all duration-500 ${tool.status === 'active' ? '' : 'opacity-50'}`}
                  style={{
                    backgroundColor: `${tool.color}12`,
                    borderColor: `${tool.color}25`,
                    boxShadow: tool.status === 'active' ? `0 0 20px ${tool.color}20` : 'none',
                  }}
                >
                  <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                </div>
                <h4 className="text-xs font-semibold text-[#F0F4F8] mb-1">{tool.name}</h4>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <PulseIndicator status={tool.status === 'active' ? 'online' : tool.status === 'error' ? 'critical' : 'offline'} size="sm" />
                  <span className="text-[9px] font-mono text-[#475569] uppercase">{tool.status}</span>
                </div>
                <div className="text-[10px] font-mono text-[#475569]">{tool.calls} calls</div>
                <div className="text-[9px] font-mono text-[#475569] mt-0.5">{tool.lastCall}</div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Live Tool Calls */}
        <GlassPanel className="p-3 overflow-y-auto">
          <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-3">Live Tool Calls</h4>
          <div className="space-y-2">
            {toolCalls.map(call => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: call.toolColor }} />
                  <span className="text-[10px] font-mono font-semibold" style={{ color: call.toolColor }}>{call.toolName}</span>
                  <span className="text-[9px] font-mono text-[#475569] ml-auto">
                    {call.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#94A3B8] pl-3.5">{call.action}</p>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </motion.div>
  );
};

export default MCPToolCenter;
