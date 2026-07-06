import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

const sourceColors: Record<string, string> = {
  VIDEO: '#00D4FF',
  THREAT: '#FF3B5C',
  DECISION: '#FFB800',
  DB: '#7B61FF',
  CAMERA: '#00FFA3',
  NOTIFY: '#5B8DEF',
  REPORT: '#00FFA3',
  SYSTEM: '#94A3B8',
  YOLO: '#00D4FF',
  GEMINI: '#7B61FF',
};

const logTemplates = [
  { source: 'VIDEO', message: 'Frame processed — object detection complete', level: 'info' as const },
  { source: 'YOLO', message: 'Inference complete — 2 objects detected', level: 'info' as const },
  { source: 'THREAT', message: 'Threat assessment — environment SAFE', level: 'success' as const },
  { source: 'CAMERA', message: 'Webcam stream active — 30 FPS', level: 'info' as const },
  { source: 'DB', message: 'Event persisted → events collection', level: 'info' as const },
  { source: 'GEMINI', message: 'Reasoning cycle complete — no anomalies', level: 'success' as const },
  { source: 'DECISION', message: 'Decision tree evaluated — action: MONITOR', level: 'info' as const },
  { source: 'SYSTEM', message: 'Agent heartbeat — all agents responsive', level: 'success' as const },
  { source: 'NOTIFY', message: 'Notification queue processed', level: 'info' as const },
  { source: 'REPORT', message: 'Periodic summary generated', level: 'info' as const },
  { source: 'VIDEO', message: 'Motion detected in frame sector 3', level: 'warn' as const },
  { source: 'THREAT', message: 'Elevated activity — monitoring closely', level: 'warn' as const },
];

const LiveLogBar: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Seed initial logs
    const initial: LogEntry[] = [];
    for (let i = 0; i < 4; i++) {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      initial.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions),
        source: template.source,
        message: template.message,
        level: template.level,
      });
    }
    setLogs(initial);

    const interval = setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions),
        source: template.source,
        message: template.message,
        level: template.level,
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-16 right-0 z-40 h-8 bg-[#040712]/90 backdrop-blur-xl border-t border-white/[0.04] flex items-center overflow-hidden px-4">
      <span className="text-[9px] font-mono text-[#475569] uppercase tracking-widest mr-4 shrink-0">Live Logs</span>
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {logs.slice(0, 1).map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-[11px] font-mono"
            >
              <span className="text-[#475569]">{log.timestamp}</span>
              <span
                className="uppercase text-[10px] tracking-wider font-semibold"
                style={{ color: sourceColors[log.source] || '#94A3B8' }}
              >
                [{log.source}]
              </span>
              <span className="text-[#94A3B8] truncate">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveLogBar;
