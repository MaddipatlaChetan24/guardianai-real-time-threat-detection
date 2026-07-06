import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Loader2 } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';

const agents = [
  { name: 'Video Agent', color: '#00D4FF' },
  { name: 'Threat Agent', color: '#FF3B5C' },
  { name: 'Reasoning Agent', color: '#7B61FF' },
  { name: 'Decision Agent', color: '#FFB800' },
  { name: 'Notification Agent', color: '#5B8DEF' },
  { name: 'Report Agent', color: '#00FFA3' },
];

const bootMessages = [
  'Initializing Neural Core...',
  'Loading YOLO v8 weights...',
  'Connecting Gemini reasoning...',
  'Establishing camera link...',
  'Calibrating threat models...',
  'Syncing agent memory...',
  'Building knowledge graph...',
  'System online.',
];

const BootSequence: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [agentsLoaded, setAgentsLoaded] = useState<number[]>([]);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Title appears at 0.8s
    const titleTimer = setTimeout(() => setShowTitle(true), 800);
    // Subtitle at 1.5s
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 1500);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 4 + 1;
      });
    }, 100);

    // Boot messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        if (prev >= bootMessages.length - 1) {
          clearInterval(messageInterval);
          return bootMessages.length - 1;
        }
        return prev + 1;
      });
    }, 500);

    // Agent loading stagger
    agents.forEach((_, i) => {
      setTimeout(() => {
        setAgentsLoaded(prev => [...prev, i]);
      }, 2000 + i * 300);
    });

    // Transition to command center
    const transitionTimer = setTimeout(() => {
      setBooting(false);
      setTimeout(() => navigate('/command', { replace: true }), 600);
    }, 5000);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(subtitleTimer);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(transitionTimer);
    };
  }, [navigate]);

  return (
    <AnimatePresence>
      {booting && (
        <motion.div
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] bg-[#040712] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Neural Background */}
          <NeuralBackground opacity={0.4} />

          {/* Radial glow behind logo */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#00D4FF]/5 blur-[120px] pointer-events-none" />

          {/* Scan line */}
          <div className="scan-line" />

          {/* Shield Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10 mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center border border-[#00D4FF]/20 shadow-[0_0_40px_rgba(0,212,255,0.2)]">
              <Shield className="w-10 h-10 text-[#00D4FF]" />
            </div>
            {/* Rotating ring */}
            <div className="absolute inset-[-8px] border border-[#00D4FF]/10 rounded-2xl radar-sweep opacity-50" />
          </motion.div>

          {/* Title */}
          <AnimatePresence>
            {showTitle && (
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-4xl md:text-5xl font-bold tracking-[0.25em] text-[#F0F4F8] mb-2"
              >
                GUARDIAN<span className="text-[#00D4FF] text-glow-cyan">AI</span>
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSubtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 text-xs font-mono text-[#475569] tracking-[0.3em] uppercase mb-12"
              >
                Autonomous Intelligence Platform
              </motion.p>
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="relative z-10 w-80 mb-6">
            <div className="h-[3px] w-full bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-mono text-[#94A3B8]">
                {bootMessages[currentMessage]}
              </span>
              <span className="text-[10px] font-mono text-[#475569]">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
          </div>

          {/* Agent Checklist */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg">
            {agents.map((agent, index) => {
              const isLoaded = agentsLoaded.includes(index);
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  {isLoaded ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Check className="w-3.5 h-3.5" style={{ color: agent.color }} />
                    </motion.div>
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-[#475569] animate-spin" />
                  )}
                  <span className={`text-[11px] font-mono ${isLoaded ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                    {agent.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootSequence;
