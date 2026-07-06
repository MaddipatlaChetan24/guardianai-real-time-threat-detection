import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem, slideInLeft, slideInRight } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import PulseIndicator from '../components/PulseIndicator';
import GlowBadge from '../components/GlowBadge';
import ConfidenceBar from '../components/ConfidenceBar';
import { Eye, Brain, ShieldAlert, Zap, Bell, FileText, ChevronDown } from 'lucide-react';
import '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// ─── Agent Data ───
interface AgentInfo {
  id: string;
  name: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  status: 'online' | 'processing' | 'warning';
  task: string;
  tool: string;
  latency: number;
  confidence: number;
  memory: string;
}

const initialAgentsData: AgentInfo[] = [
  { id: 'video', name: 'Video Agent', icon: Eye, color: '#00D4FF', status: 'online', task: 'Monitoring stream', tool: 'COCO-SSD', latency: 45, confidence: 98, memory: '15.4 MB' },
  { id: 'threat', name: 'Threat Agent', icon: ShieldAlert, color: '#FF3B5C', status: 'online', task: 'Evaluating threat score', tool: 'Gemini Pro', latency: 12, confidence: 96, memory: '1.1 MB' },
  { id: 'reasoning', name: 'Reasoning Agent', icon: Brain, color: '#7B61FF', status: 'online', task: 'Awaiting context', tool: 'Gemini Pro', latency: 230, confidence: 92, memory: '4.2 MB' },
  { id: 'decision', name: 'Decision Agent', icon: Zap, color: '#FFB800', status: 'online', task: 'Evaluating action tree', tool: 'Decision Engine', latency: 45, confidence: 89, memory: '0.8 MB' },
  { id: 'notification', name: 'Notification Agent', icon: Bell, color: '#5B8DEF', status: 'online', task: 'Queue idle', tool: 'Email/SMS MCP', latency: 8, confidence: 100, memory: '0.3 MB' },
  { id: 'report', name: 'Report Agent', icon: FileText, color: '#00FFA3', status: 'online', task: 'Periodic summary', tool: 'PDF Generator', latency: 1200, confidence: 95, memory: '3.1 MB' },
];

// ─── Reasoning Steps ───
interface ReasoningStep {
  id: string;
  agent: string;
  color: string;
  message: string;
  detail: string;
  timestamp: Date;
}

const CommandCenter: React.FC = () => {
  const [agents, setAgents] = useState(initialAgentsData);
  const [reasoningFeed, setReasoningFeed] = useState<ReasoningStep[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Real-time inference state
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [detections, setDetections] = useState<cocoSsd.DetectedObject[]>([]);
  const [threatLevel, setThreatLevel] = useState<'LOW' | 'WARNING' | 'CRITICAL'>('LOW');
  const [isInferencing, setIsInferencing] = useState(false);
  const requestRef = useRef<number>();

  // 1. Load Webcam
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(console.error);
  }, []);

  // 2. Load Model
  useEffect(() => {
    cocoSsd.load({ base: 'lite_mobilenet_v2' }).then(loadedModel => {
      setModel(loadedModel);
    });
  }, []);

  // 3. Inference Loop
  useEffect(() => {
    if (!model || !videoRef.current) return;
    const video = videoRef.current;

    const detectFrame = async () => {
      if (video.readyState === 4) { // HAVE_ENOUGH_DATA
        setIsInferencing(true);
        const predictions = await model.detect(video);
        setDetections(predictions);
        
        // Analyze threats based purely on camera results
        const personDetected = predictions.find(p => p.class === 'person' && p.score > 0.5);
        const cellPhoneDetected = predictions.find(p => p.class === 'cell phone' || p.class === 'laptop' || p.class === 'knife');
        
        if (personDetected) {
          setThreatLevel(cellPhoneDetected ? 'CRITICAL' : 'WARNING');
        } else {
          setThreatLevel('LOW');
        }
      }
      requestRef.current = requestAnimationFrame(detectFrame);
    };

    video.addEventListener('loadeddata', () => {
      detectFrame();
    });

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [model]);

  // Update Reasoning Feed when Threat Level changes
  useEffect(() => {
    if (!isInferencing) return;
    
    let step: ReasoningStep | null = null;
    if (threatLevel === 'CRITICAL') {
      step = {
        id: Math.random().toString(36).substr(2, 9),
        agent: 'Decision Agent',
        color: '#FFB800',
        message: 'Multiple objects detected',
        detail: 'Escalating to critical protocol — Alert dispatched',
        timestamp: new Date(),
      };
    } else if (threatLevel === 'WARNING') {
      step = {
        id: Math.random().toString(36).substr(2, 9),
        agent: 'Video Agent',
        color: '#00D4FF',
        message: 'Person detected in frame',
        detail: 'Tracking movement vectors. Threat score elevated.',
        timestamp: new Date(),
      };
    } else if (threatLevel === 'LOW' && Math.random() > 0.95) {
       step = {
        id: Math.random().toString(36).substr(2, 9),
        agent: 'Threat Agent',
        color: '#FF3B5C',
        message: 'Anomaly scan negative',
        detail: 'All zones clear — Ambient risk: minimal',
        timestamp: new Date(),
      };
    }

    if (step) {
      setReasoningFeed(prev => {
        // Prevent duplicate spam
        if (prev[0] && prev[0].message === step!.message) return prev;
        return [step!, ...prev].slice(0, 12);
      });
    }
  }, [threatLevel, isInferencing]);

  // Update Agent Statuses based on threat level
  useEffect(() => {
    setAgents(prev => prev.map(a => {
      if (a.id === 'video') return { ...a, status: isInferencing ? 'processing' : 'online', task: isInferencing ? `Analyzing ${detections.length} objects` : 'Monitoring stream' };
      if (a.id === 'threat') return { ...a, status: threatLevel === 'CRITICAL' ? 'warning' : 'online', task: `Threat assessment: ${threatLevel}` };
      return a;
    }));
  }, [threatLevel, isInferencing, detections.length]);


  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="h-full grid grid-cols-[240px_1fr_280px] grid-rows-[1fr] gap-3"
    >
      {/* ─── LEFT PANEL: Agent Status ─── */}
      <motion.div variants={slideInLeft} className="flex flex-col gap-2 overflow-y-auto pr-1">
        <h3 className="text-[10px] font-mono text-[#475569] uppercase tracking-[0.2em] mb-1 px-1">Live Agents</h3>
        {agents.map((agent) => (
          <GlassPanel key={agent.id} variant="sm" glowColor="none" className="p-3 group transition-colors duration-500"
            style={agent.status === 'warning' ? { borderColor: `${agent.color}50`, backgroundColor: `${agent.color}10` } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: `${agent.color}15`,
                  borderColor: `${agent.color}30`,
                }}
              >
                <agent.icon className="w-3.5 h-3.5" style={{ color: agent.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#F0F4F8] truncate">{agent.name}</span>
                  <PulseIndicator status={agent.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-[#475569]">Task</span>
                <span className="text-[#94A3B8] truncate max-w-[120px]">{agent.task}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Tool</span>
                <span className="text-[#94A3B8]">{agent.tool}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Memory</span>
                <span className="text-[#94A3B8]">{agent.memory}</span>
              </div>
              <ConfidenceBar value={agent.confidence} color={agent.status === 'warning' ? 'threat' : 'cyan'} showLabel />
            </div>
          </GlassPanel>
        ))}
      </motion.div>

      {/* ─── CENTER: 3D Security Map / Webcam ─── */}
      <motion.div variants={fadeUpItem} className="flex flex-col gap-3">
        <GlassPanel 
          className="flex-1 p-4 relative overflow-hidden transition-all duration-1000"
          style={threatLevel === 'WARNING' || threatLevel === 'CRITICAL' ? {
            boxShadow: `inset 0 0 100px ${threatLevel === 'CRITICAL' ? 'rgba(255, 59, 92, 0.2)' : 'rgba(255, 184, 0, 0.1)'}`,
            borderColor: threatLevel === 'CRITICAL' ? 'rgba(255, 59, 92, 0.5)' : 'rgba(255, 184, 0, 0.5)'
          } : {}}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#F0F4F8]">Live Threat Analysis</h3>
            <GlowBadge 
              label={threatLevel === 'LOW' ? 'SECURE' : threatLevel === 'WARNING' ? 'WARNING' : 'CRITICAL'} 
              color={threatLevel === 'LOW' ? 'cyan' : threatLevel === 'WARNING' ? 'amber' : 'crimson'} 
            />
          </div>

          <div className="relative w-full h-[calc(100%-40px)] rounded-xl overflow-hidden border border-white/[0.04]">
            {/* Webcam Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* AI Overlay — Scanning grid */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />

              {/* Crosshairs */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-[#00D4FF]/10" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-[#00D4FF]/10" />

              {/* Live Bounding Boxes from TensorFlow.js */}
              <AnimatePresence>
                {detections.map((det, i) => {
                  // Normalize coordinates to percentage based on default webcam resolution (640x480)
                  const [x, y, w, h] = det.bbox;
                  const xPct = (x / 640) * 100;
                  const yPct = (y / 480) * 100;
                  const wPct = (w / 640) * 100;
                  const hPct = (h / 480) * 100;

                  const color = det.class === 'person' ? '#FFB800' : (['laptop', 'cell phone'].includes(det.class) ? '#FF3B5C' : '#00D4FF');

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute border border-opacity-60"
                      style={{
                        left: `${xPct}%`, top: `${yPct}%`, width: `${wPct}%`, height: `${hPct}%`,
                        borderColor: color,
                        backgroundColor: `${color}1A`,
                      }}
                    >
                      <div className="absolute -top-5 left-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                        style={{ backgroundColor: `${color}E6`, color: '#040712' }}>
                        {det.class.toUpperCase()} — {Math.round(det.score * 100)}%
                      </div>
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: color }} />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: color }} />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: color }} />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: color }} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Bottom HUD */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-xl">
                <div className="font-mono text-[10px] text-[#00D4FF]/70 space-y-0.5">
                  <div>MODEL: {model ? 'COCO-SSD LITE' : 'LOADING...'}</div>
                  <div>FPS: 30 | RES: 640×480</div>
                </div>
                <div className="font-mono text-[10px]" style={{
                  color: threatLevel === 'LOW' ? '#00FFA3' : threatLevel === 'WARNING' ? '#FFB800' : '#FF3B5C'
                }}>
                  THREAT: {threatLevel}
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      {/* ─── RIGHT PANEL: Live AI Reasoning ─── */}
      <motion.div variants={slideInRight} className="flex flex-col overflow-hidden">
        <h3 className="text-[10px] font-mono text-[#475569] uppercase tracking-[0.2em] mb-2 px-1">
          AI Reasoning Chain
        </h3>

        <GlassPanel variant="sm" className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-0">
            <AnimatePresence>
              {reasoningFeed.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative pl-4 pb-4"
                >
                  {/* Connector line */}
                  {index < reasoningFeed.length - 1 && (
                    <div
                      className="absolute left-[5px] top-4 bottom-0 w-px"
                      style={{ backgroundColor: `${step.color}20` }}
                    />
                  )}

                  {/* Node dot */}
                  <div
                    className="absolute left-0 top-1 w-[10px] h-[10px] rounded-full border-2"
                    style={{
                      borderColor: step.color,
                      backgroundColor: `${step.color}20`,
                      boxShadow: `0 0 8px ${step.color}40`,
                    }}
                  />

                  <div className="py-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-semibold" style={{ color: step.color }}>
                        {step.agent}
                      </span>
                      <span className="text-[9px] font-mono text-[#475569]">
                        {step.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#F0F4F8] font-medium">{step.message}</p>
                    <p className="text-[10px] text-[#475569] font-mono mt-0.5">{step.detail}</p>
                  </div>

                  {/* Arrow to next */}
                  {index < reasoningFeed.length - 1 && (
                    <ChevronDown className="w-3 h-3 text-[#475569] absolute left-[2px] bottom-0" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {reasoningFeed.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-[#475569]">
                <Brain className="w-6 h-6 mb-2 animate-pulse" />
                <span className="text-[10px] font-mono">Awaiting threat detection...</span>
              </div>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
};

export default CommandCenter;
