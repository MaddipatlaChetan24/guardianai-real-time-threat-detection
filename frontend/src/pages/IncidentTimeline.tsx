import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import GlowBadge from '../components/GlowBadge';
import ConfidenceBar from '../components/ConfidenceBar';
import { Clock, Camera, Brain, AlertTriangle, ShieldCheck, ChevronRight, X } from 'lucide-react';

interface Incident {
  id: string;
  time: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  camera: string;
  objects: string[];
  confidence: number;
  agentReasoning: string;
  suggestedAction: string;
}

const mockIncidents: Incident[] = [
  { id: 'inc-001', time: '06:42:13', title: 'Rapid Movement Detected', severity: 'warning', camera: 'Local Camera', objects: ['Person', 'Fast Motion'], confidence: 87, agentReasoning: 'Video Agent detected sudden velocity change → Threat Agent assessed as elevated → Decision Agent: Monitor closely', suggestedAction: 'Continue enhanced monitoring for 60 seconds' },
  { id: 'inc-002', time: '06:38:45', title: 'Multiple Persons Detected', severity: 'info', camera: 'Local Camera', objects: ['Person ×3'], confidence: 94, agentReasoning: 'Video Agent detected 3 persons → Normal crowd level → No anomaly', suggestedAction: 'No action required' },
  { id: 'inc-003', time: '06:31:22', title: 'Unidentified Object', severity: 'critical', camera: 'Local Camera', objects: ['Unknown Object'], confidence: 72, agentReasoning: 'Video Agent flagged unknown object → Threat Agent: Potential abandoned item → Decision Agent: Alert security', suggestedAction: 'Dispatch security personnel to verify' },
  { id: 'inc-004', time: '06:25:08', title: 'Area Secure', severity: 'info', camera: 'Local Camera', objects: ['None'], confidence: 99, agentReasoning: 'Periodic scan — no anomalies detected across all zones', suggestedAction: 'Standard monitoring' },
  { id: 'inc-005', time: '06:18:33', title: 'Lighting Anomaly', severity: 'warning', camera: 'Local Camera', objects: ['Glare', 'Reflection'], confidence: 65, agentReasoning: 'Video Agent detected sudden brightness change → Environmental factor → Non-threat', suggestedAction: 'Adjust camera exposure settings' },
  { id: 'inc-006', time: '06:10:01', title: 'System Boot Complete', severity: 'info', camera: 'System', objects: [], confidence: 100, agentReasoning: 'All agents initialized successfully — system operational', suggestedAction: 'Begin standard monitoring' },
];

const severityConfig = {
  critical: { color: 'crimson' as const, icon: AlertTriangle, borderColor: '#FF3B5C' },
  warning: { color: 'amber' as const, icon: AlertTriangle, borderColor: '#FFB800' },
  info: { color: 'cyan' as const, icon: ShieldCheck, borderColor: '#00D4FF' },
};

const IncidentTimeline: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full flex flex-col">
      <motion.div variants={fadeUpItem} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F0F4F8]">Incident Timeline</h2>
          <p className="text-[11px] font-mono text-[#475569]">Interactive event history — select to expand</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#475569]">
          <span>{mockIncidents.length} events</span>
          <Clock className="w-3.5 h-3.5" />
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-[1fr_380px] gap-4 min-h-0">
        {/* Timeline */}
        <motion.div variants={fadeUpItem} className="overflow-y-auto pr-2">
          <div className="relative pl-6">
            {/* Vertical timeline line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/[0.06]" />

            {mockIncidents.map((incident) => {
              const config = severityConfig[incident.severity];
              const isSelected = selectedIncident?.id === incident.id;
              return (
                <motion.div
                  key={incident.id}
                  variants={fadeUpItem}
                  onClick={() => setSelectedIncident(isSelected ? null : incident)}
                  className={`relative mb-4 cursor-pointer group`}
                >
                  {/* Timeline node */}
                  <div
                    className="absolute left-[-19px] top-3 w-[14px] h-[14px] rounded-full border-2 transition-all duration-300"
                    style={{
                      borderColor: config.borderColor,
                      backgroundColor: isSelected ? `${config.borderColor}30` : `${config.borderColor}10`,
                      boxShadow: isSelected ? `0 0 12px ${config.borderColor}40` : 'none',
                    }}
                  />

                  <GlassPanel
                    variant="sm"
                    glowColor="none"
                    className={`p-3 transition-all duration-300 ${isSelected ? 'border-white/10' : 'group-hover:border-white/[0.06]'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GlowBadge label={incident.severity} color={config.color} />
                        <span className="text-[11px] font-mono text-[#475569]">{incident.time}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-[#475569] transition-transform duration-300 ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                    <h4 className="text-sm font-semibold text-[#F0F4F8] mt-2">{incident.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Camera className="w-3 h-3 text-[#475569]" />
                      <span className="text-[10px] font-mono text-[#475569]">{incident.camera}</span>
                    </div>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedIncident ? (
            <motion.div
              key={selectedIncident.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <GlassPanel className="p-4 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <GlowBadge label={selectedIncident.severity} color={severityConfig[selectedIncident.severity].color} size="md" />
                  <button onClick={() => setSelectedIncident(null)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4 text-[#475569]" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-[#F0F4F8] mb-1">{selectedIncident.title}</h3>
                <p className="text-[11px] font-mono text-[#475569] mb-4">{selectedIncident.time} — {selectedIncident.camera}</p>

                {/* Confidence */}
                <div className="mb-4">
                  <ConfidenceBar value={selectedIncident.confidence} color="threat" showLabel height="md" />
                </div>

                {/* Detected Objects */}
                <div className="mb-4">
                  <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2">Detected Objects</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIncident.objects.map((obj, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[#94A3B8]">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agent Reasoning */}
                <div className="mb-4">
                  <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Brain className="w-3 h-3" /> Agent Reasoning
                  </h4>
                  <div className="p-3 rounded-lg bg-[#7B61FF]/5 border border-[#7B61FF]/10">
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">{selectedIncident.agentReasoning}</p>
                  </div>
                </div>

                {/* Suggested Action */}
                <div>
                  <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2">Suggested Action</h4>
                  <div className="p-3 rounded-lg bg-[#00D4FF]/5 border border-[#00D4FF]/10">
                    <p className="text-[11px] text-[#94A3B8]">{selectedIncident.suggestedAction}</p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-full">
              <div className="text-center">
                <Clock className="w-8 h-8 text-[#475569]/50 mx-auto mb-3" />
                <p className="text-[11px] font-mono text-[#475569]">Select an incident to view details</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default IncidentTimeline;
