import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../design/animations';
import GlassPanel from '../components/GlassPanel';
import GlowBadge from '../components/GlowBadge';
import AnimatedCounter from '../components/AnimatedCounter';
import ConfidenceBar from '../components/ConfidenceBar';
import PulseIndicator from '../components/PulseIndicator';
import { Maximize2, Cpu, Gauge, Crosshair } from 'lucide-react';
import '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as blazeface from '@tensorflow-models/blazeface';
import * as mobilenet from '@tensorflow-models/mobilenet';
import axios from 'axios';

const CameraIntelligence: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Real-time state
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [faceModel, setFaceModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [sceneModel, setSceneModel] = useState<mobilenet.MobileNet | null>(null);
  const [detections, setDetections] = useState<cocoSsd.DetectedObject[]>([]);
  const [faceDetections, setFaceDetections] = useState<blazeface.NormalizedFace[]>([]);
  const [scenePredictions, setScenePredictions] = useState<{className: string, probability: number}[]>([]);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const requestRef = useRef<number>();
  const lastReportTime = useRef<number>(0);
  
  // Threat Level Logic
  const hasThreat = detections.some(d => ['person', 'laptop', 'cell phone', 'knife'].includes(d.class) && d.score > 0.5);

  useEffect(() => {
    if (hasThreat) {
      const now = Date.now();
      if (now - lastReportTime.current > 5000) {
        lastReportTime.current = now;
        
        const detectedObjs = Array.from(new Set([
          ...detections.filter(d => ['person', 'laptop', 'cell phone', 'knife'].includes(d.class) && d.score > 0.5).map(d => d.class)
        ]));

        axios.post('http://localhost:8000/incidents', {
          camera_id: 1,
          threat_level: "high",
          summary: `AI vision system detected flagged objects: ${detectedObjs.join(', ')}`,
          detected_objects: detectedObjs
        }).catch(err => console.error("Failed to save incident to DB:", err));
      }
    }
  }, [detections, hasThreat]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(console.error);
  }, []);

  useEffect(() => {
    cocoSsd.load({ base: 'lite_mobilenet_v2' }).then(loadedModel => {
      setModel(loadedModel);
    });
    blazeface.load().then(loadedFaceModel => {
      setFaceModel(loadedFaceModel);
    });
    mobilenet.load({ version: 2, alpha: 1.0 }).then(loadedSceneModel => {
      setSceneModel(loadedSceneModel);
    });
  }, []);

  useEffect(() => {
    if ((!model && !faceModel && !sceneModel) || !videoRef.current) return;
    const video = videoRef.current;

    const detectFrame = async () => {
      if (video.readyState >= 2) {
        const start = performance.now();
        
        let objPredictions: cocoSsd.DetectedObject[] = [];
        let facePredictions: blazeface.NormalizedFace[] = [];
        let scenePreds: {className: string, probability: number}[] = [];

        if (model) objPredictions = await model.detect(video);
        if (faceModel) facePredictions = await faceModel.estimateFaces(video, false);
        if (sceneModel) scenePreds = await sceneModel.classify(video);
        
        const end = performance.now();
        
        setDetections(objPredictions);
        setFaceDetections(facePredictions);
        setScenePredictions(scenePreds);
        setInferenceTime(Math.round(end - start));
        setFrameCount(prev => prev + 1);
      }
      requestRef.current = requestAnimationFrame(detectFrame);
    };

    video.addEventListener('loadeddata', () => {
      detectFrame();
    });

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [model, faceModel, sceneModel]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full grid grid-cols-[1fr_300px] gap-3">
      {/* Main Camera */}
      <motion.div variants={fadeUpItem} className="flex flex-col gap-3">
        <GlassPanel 
          className="flex-1 p-3 relative overflow-hidden transition-all duration-1000"
          style={hasThreat ? {
            boxShadow: `inset 0 0 100px rgba(255, 184, 0, 0.1)`,
            borderColor: 'rgba(255, 184, 0, 0.5)'
          } : {}}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#F0F4F8]">Camera Intelligence</h3>
              <GlowBadge label={hasThreat ? "THREAT DETECTED" : "LIVE"} color={hasThreat ? "amber" : "crimson"} />
            </div>
            <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Maximize2 className="w-4 h-4 text-[#475569]" />
            </button>
          </div>

          <div className="relative w-full h-[calc(100%-36px)] rounded-xl overflow-hidden border border-white/[0.04]">
            <video ref={videoRef} autoPlay playsInline muted width={640} height={480} className="w-full h-full object-cover" />

            {/* Live Detection Overlays */}
            <AnimatePresence>
              {detections.map((det, i) => {
                const [x, y, w, h] = det.bbox;
                const xPct = (x / 640) * 100;
                const yPct = (y / 480) * 100;
                const wPct = (w / 640) * 100;
                const hPct = (h / 480) * 100;
                
                const color = det.class === 'person' ? '#FFB800' : '#00D4FF';

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute border"
                    style={{
                      left: `${xPct}%`, top: `${yPct}%`, width: `${wPct}%`, height: `${hPct}%`,
                      borderColor: `${color}99`,
                      backgroundColor: `${color}1A`,
                    }}
                  >
                    <div className="absolute -top-5 left-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                      style={{ backgroundColor: `${color}CC`, color: '#040712' }}>
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

            {/* Live Face Detection Overlays */}
            <AnimatePresence>
              {faceDetections.map((face, i) => {
                const topLeft = face.topLeft as [number, number];
                const bottomRight = face.bottomRight as [number, number];
                const x = topLeft[0];
                const y = topLeft[1];
                const w = bottomRight[0] - x;
                const h = bottomRight[1] - y;
                const xPct = (x / 640) * 100;
                const yPct = (y / 480) * 100;
                const wPct = (w / 640) * 100;
                const hPct = (h / 480) * 100;
                
                const color = '#FF3B5C';
                
                // Safely extract probability whether it's an array, a number, or undefined
                const rawProb = face.probability as unknown;
                const prob = Array.isArray(rawProb)
                  ? rawProb[0]
                  : typeof rawProb === 'number'
                  ? rawProb
                  : 0;

                return (
                  <motion.div
                    key={`face-${i}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute border"
                    style={{
                      left: `${xPct}%`, top: `${yPct}%`, width: `${wPct}%`, height: `${hPct}%`,
                      borderColor: `${color}99`,
                      backgroundColor: `${color}1A`,
                    }}
                  >
                    <div className="absolute -top-5 left-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                      style={{ backgroundColor: `${color}CC`, color: '#040712' }}>
                      FACE — {Math.round(prob * 100)}%
                    </div>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: color }} />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: color }} />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: color }} />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: color }} />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />

            {/* HUD */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between font-mono text-[9px] bg-gradient-to-t from-black/80 to-transparent p-2 rounded-lg">
              <span className="text-[#00D4FF]/60">FRAME: #{frameCount} | SCENE: {scenePredictions.length > 0 ? scenePredictions[0].className.split(',')[0].toUpperCase() : (sceneModel ? 'ANALYZING...' : 'LOADING...')}</span>
              <span style={{ color: hasThreat ? '#FFB800' : '#00FFA3' }}>OBJECTS: {detections.length}</span>
            </div>
          </div>
        </GlassPanel>

        {/* Inference Stats Bar */}
        <GlassPanel variant="sm" className="p-3 flex items-center gap-6 transition-colors duration-500"
          style={hasThreat ? { borderColor: 'rgba(255, 184, 0, 0.3)', backgroundColor: 'rgba(255, 184, 0, 0.05)' } : {}}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="text-[10px] font-mono text-[#475569]">Inference</span>
            <AnimatedCounter value={inferenceTime} suffix="ms" className="text-[11px] text-[#00FFA3]" />
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-[#7B61FF]" />
            <span className="text-[10px] font-mono text-[#475569]">FPS</span>
            <span className="text-[11px] font-mono text-[#F0F4F8]">{inferenceTime > 0 ? Math.min(30, Math.round(1000 / inferenceTime)) : 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5" style={{ color: hasThreat ? '#FFB800' : '#FF3B5C' }} />
            <span className="text-[10px] font-mono text-[#475569]">Detections</span>
            <span className="text-[11px] text-[#F0F4F8] font-mono font-bold">{detections.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <PulseIndicator status="online" size="sm" />
            <span className="text-[10px] font-mono text-[#00FFA3]">Stream Active</span>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Right: Agent Reasoning Sidebar */}
      <motion.div variants={fadeUpItem} className="flex flex-col gap-3">
        {/* Dynamic Agent Assessment */}
        <GlassPanel variant="sm" className="p-3 transition-colors duration-500"
          style={hasThreat ? { borderColor: 'rgba(255, 184, 0, 0.3)' } : {}}
        >
          <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-3">Agent Assessment</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-1 rounded-full shrink-0 bg-[#00D4FF]" />
              <div>
                <span className="text-[10px] font-mono font-semibold block text-[#00D4FF]">Vision Agent</span>
                <span className="text-[11px] text-[#F0F4F8] block">
                  {detections.length > 0 || faceDetections.length > 0 || scenePredictions.length > 0
                    ? 'Tracking multiple classes' 
                    : 'Monitoring scene...'}
                </span>
                <span className="text-[10px] text-[#475569] font-mono capitalize">
                  {Array.from(new Set([
                    ...detections.map(d => d.class),
                    ...(faceDetections.length > 0 ? ['face'] : []),
                    ...(scenePredictions.length > 0 ? [scenePredictions[0].className.split(',')[0]] : [])
                  ])).join(', ') || 'Awaiting subjects'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: hasThreat ? '#FFB800' : '#00FFA3' }} />
              <div>
                <span className="text-[10px] font-mono font-semibold block" style={{ color: hasThreat ? '#FFB800' : '#00FFA3' }}>Threat Agent</span>
                <span className="text-[11px] text-[#F0F4F8] block">
                  {hasThreat ? 'Threat Detected' : 'Area Secure'}
                </span>
                <span className="text-[10px] text-[#475569] font-mono">
                  {hasThreat 
                    ? `Identified flagged objects in FOV` 
                    : 'No anomalies detected'}
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Detection List */}
        <GlassPanel variant="sm" className="flex-1 p-3 overflow-y-auto">
          <h4 className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-3">Active Detections</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {detections.map((det, i) => (
                <motion.div
                  key={`obj-${i}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: det.class === 'person' ? '#FFB800' : '#00D4FF' }} />
                    <span className="text-[11px] font-medium text-[#F0F4F8] uppercase">{det.class}</span>
                  </div>
                  <ConfidenceBar value={Math.round(det.score * 100)} color={det.class === 'person' ? 'threat' : 'cyan'} className="w-16" />
                </motion.div>
              ))}
              {faceDetections.map((face, i) => {
                const rawProb = face.probability as unknown;
                const prob = Array.isArray(rawProb) ? rawProb[0] : (typeof rawProb === 'number' ? rawProb : 0);
                return (
                  <motion.div
                    key={`face-list-${i}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF3B5C' }} />
                      <span className="text-[11px] font-medium text-[#F0F4F8] uppercase">FACE</span>
                    </div>
                    <ConfidenceBar value={Math.round(prob * 100)} color="threat" className="w-16" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {detections.length === 0 && faceDetections.length === 0 && (
              <div className="text-[10px] font-mono text-[#475569] text-center pt-8">
                No objects in frame
              </div>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
};

export default CameraIntelligence;
