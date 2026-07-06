import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import GlowBadge from '../components/GlowBadge';
import ConfidenceBar from '../components/ConfidenceBar';
import { FileText, Download, Share2, Clock, Brain, Shield, BarChart3 } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  generatedAt: string;
  type: 'periodic' | 'incident' | 'system';
  summary: string;
  threatScore: number;
  eventsCount: number;
  incidentsCount: number;
}

const reports: Report[] = [
  { id: 'rpt-001', title: 'Hourly Surveillance Summary', generatedAt: '06:40:00', type: 'periodic', summary: 'System operated normally during the past hour. 12,847 frames processed with no critical incidents. One elevated threat was detected and resolved as a false positive. All 6 agents maintained full operational status with average latency of 65ms.', threatScore: 12, eventsCount: 12847, incidentsCount: 1 },
  { id: 'rpt-002', title: 'Incident Report: Unidentified Object', generatedAt: '06:35:22', type: 'incident', summary: 'At 06:31:22, the Video Agent detected an unidentified object in the camera field of view. The Threat Agent assessed the object with 72% confidence as a potential abandoned item. Decision Agent escalated to alert level. Upon further analysis by the Reasoning Agent, the object was reclassified as a personal belonging placed temporarily. Threat was downgraded.', threatScore: 72, eventsCount: 45, incidentsCount: 1 },
  { id: 'rpt-003', title: 'System Boot Report', generatedAt: '06:10:01', type: 'system', summary: 'GuardianAI system initialized successfully. All 6 agents came online within 4.2 seconds. Camera feed established at 30 FPS. YOLO v8-nano model loaded. Gemini Pro reasoning engine connected. Database connection verified. All MCP tools registered and operational.', threatScore: 0, eventsCount: 6, incidentsCount: 0 },
];

const typeConfig = {
  periodic: { color: 'cyan' as const, label: 'Periodic' },
  incident: { color: 'crimson' as const, label: 'Incident' },
  system: { color: 'mint' as const, label: 'System' },
};

const ReportViewer: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<Report>(reports[0]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full flex flex-col">
      <motion.div variants={fadeUpItem} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F0F4F8]">Reports</h2>
          <p className="text-[11px] font-mono text-[#475569]">AI-generated intelligence reports</p>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-[260px_1fr] gap-4 min-h-0">
        {/* Report List */}
        <div className="overflow-y-auto pr-1 space-y-2">
          {reports.map(report => (
            <motion.div key={report.id} variants={fadeUpItem}>
              <GlassPanel
                variant="interactive"
                glowColor="none"
                onClick={() => setSelectedReport(report)}
                className={`p-3 transition-all ${selectedReport.id === report.id ? 'border-white/10' : ''}`}
              >
                <GlowBadge label={typeConfig[report.type].label} color={typeConfig[report.type].color} />
                <h4 className="text-xs font-semibold text-[#F0F4F8] mt-2 leading-tight">{report.title}</h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-3 h-3 text-[#475569]" />
                  <span className="text-[9px] font-mono text-[#475569]">{report.generatedAt}</span>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Report Viewer */}
        <motion.div key={selectedReport.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassPanel className="p-6 h-full overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <GlowBadge label={typeConfig[selectedReport.type].label} color={typeConfig[selectedReport.type].color} size="md" />
                <h3 className="text-xl font-bold text-[#F0F4F8] mt-3">{selectedReport.title}</h3>
                <p className="text-[11px] font-mono text-[#475569] mt-1">Generated at {selectedReport.generatedAt} by Report Agent</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors" title="Download PDF">
                  <Download className="w-4 h-4 text-[#94A3B8]" />
                </button>
                <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors" title="Share">
                  <Share2 className="w-4 h-4 text-[#94A3B8]" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Threat Score', value: selectedReport.threatScore, icon: Shield, color: selectedReport.threatScore > 50 ? '#FF3B5C' : '#00FFA3' },
                { label: 'Events Processed', value: selectedReport.eventsCount, icon: BarChart3, color: '#00D4FF' },
                { label: 'Incidents', value: selectedReport.incidentsCount, icon: FileText, color: '#FFB800' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                    <span className="text-[9px] font-mono text-[#475569] uppercase">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Threat Level */}
            <div className="mb-6">
              <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2">Threat Assessment</h4>
              <ConfidenceBar value={selectedReport.threatScore} color="threat" showLabel height="md" />
            </div>

            {/* AI Summary */}
            <div className="mb-6">
              <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Brain className="w-3 h-3" /> AI Summary
              </h4>
              <div className="p-4 rounded-xl bg-[#7B61FF]/5 border border-[#7B61FF]/10">
                <p className="text-[13px] text-[#94A3B8] leading-relaxed">{selectedReport.summary}</p>
              </div>
            </div>

            {/* Generated by */}
            <div className="text-[10px] font-mono text-[#475569] text-center pt-4 border-t border-white/[0.04]">
              Generated by GuardianAI Report Agent — Powered by Gemini 2.5 Pro
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReportViewer;
