import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Video, ShieldAlert, Maximize2, Settings, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface Camera {
  id: number;
  name: string;
  location: string;
  status: string;
  threatLevel: string;
  fps: number;
  resolution: string;
}

const LiveCameras: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeCamera, setActiveCamera] = useState<Camera | null>(null);

  useEffect(() => {
    // In production, this would use real WebSocket or SSE for live updates
    const fetchCameras = async () => {
      try {
        const res = await axios.get('http://localhost:8000/cameras');
        setCameras(res.data);
        if (res.data.length > 0 && !activeCamera) {
          setActiveCamera(res.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch cameras", error);
      }
    };
    
    fetchCameras();
    const interval = setInterval(fetchCameras, 5000);
    return () => clearInterval(interval);
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Live Feeds</h2>
          <p className="text-slate-400">Monitoring all active camera streams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Camera View */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-2 overflow-hidden relative rounded-2xl group">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="bg-red-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              {activeCamera?.threatLevel === 'critical' && (
                <span className="bg-orange-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <AlertTriangle className="w-3 h-3" /> THREAT DETECTED
                </span>
              )}
            </div>
            <div className="absolute top-4 right-4 z-10">
              <button className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-xl transition-all">
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Camera Feed Placeholder */}
            <div className="w-full aspect-video bg-slate-900 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2060&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
              
              {/* Fake AI Bounding Box */}
              {activeCamera?.threatLevel === 'critical' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                  className="absolute border-2 border-red-500 w-32 h-64 left-1/3 top-1/4 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-mono px-2 py-0.5">
                    Person 89% | Weapon 92%
                  </div>
                </motion.div>
              )}
              
              <div className="absolute bottom-4 left-4 font-mono text-xs text-white/70 tracking-widest">
                {activeCamera?.name || 'Loading...'} | {activeCamera?.resolution} | {activeCamera?.fps} FPS
              </div>
            </div>
          </div>
          
          {/* Active Camera Details */}
          <div className="glass-panel p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{activeCamera?.name}</h3>
                <p className="text-sm text-slate-400">{activeCamera?.location}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" /> Configure Agent
              </button>
            </div>
          </div>
        </motion.div>

        {/* Camera Grid list */}
        <motion.div variants={item} className="space-y-4">
          <div className="glass-panel p-4 h-[calc(100vh-12rem)] overflow-y-auto">
            <h3 className="font-bold mb-4 px-2">All Cameras ({cameras.length})</h3>
            <div className="space-y-3">
              {cameras.map((cam) => (
                <div 
                  key={cam.id} 
                  onClick={() => setActiveCamera(cam)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${activeCamera?.id === cam.id ? 'bg-blue-600/20 border-blue-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${cam.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      <span className="font-semibold text-sm">{cam.name}</span>
                    </div>
                    {cam.threatLevel === 'critical' ? (
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                    ) : (
                      <Video className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden relative mt-2 border border-white/5">
                    {/* Tiny thumbnail */}
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center opacity-50">
                      <Video className="w-6 h-6 text-slate-600" />
                    </div>
                    {cam.threatLevel === 'critical' && (
                       <div className="absolute inset-0 border border-red-500 bg-red-500/10 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LiveCameras;
