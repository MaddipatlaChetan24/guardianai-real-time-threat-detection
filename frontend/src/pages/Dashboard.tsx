import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { AlertTriangle, Activity, Camera as CameraIcon, Shield, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  activeCameras: number;
  totalCameras: number;
  activeAlerts: number;
  totalIncidentsToday: number;
  threatScore: number;
  systemStatus: string;
}

interface ActivityEvent {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  location: string;
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Request webcam access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam", err));
  }, []);

  useEffect(() => {
    // Simulated AI analysis engine
    const eventTypes = [
      { type: 'info', title: 'Person Detected', location: 'Local Camera' },
      { type: 'warning', title: 'Rapid Movement', location: 'Local Camera' },
      { type: 'info', title: 'Area Secure', location: 'Local Camera' },
      { type: 'critical', title: 'Unauthorized Object', location: 'Local Camera' }
    ];

    const interval = setInterval(() => {
      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const newActivity: ActivityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomEvent.type as 'critical' | 'warning' | 'info',
        title: randomEvent.title,
        location: randomEvent.location,
        timestamp: new Date()
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 8));

      // Dynamically impact stats based on event
      if (randomEvent.type === 'critical') {
        setStats(prev => prev ? { 
          ...prev, 
          activeAlerts: prev.activeAlerts + 1, 
          totalIncidentsToday: prev.totalIncidentsToday + 1,
          threatScore: Math.min(100, prev.threatScore + 5) 
        } : prev);
      } else if (randomEvent.type === 'info') {
        setStats(prev => prev ? {
          ...prev,
          threatScore: Math.max(0, prev.threatScore - 1)
        } : prev);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // In production, this would use a real WebSocket or SSE for live updates
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">System Overview</h2>
          <p className="text-slate-400">Real-time monitoring and threat analysis</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-mono">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Threat Score Card */}
        <motion.div variants={item} className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-mono text-slate-400 bg-black/20 px-2 py-1 rounded-full border border-white/5">
              LIVE
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Global Threat Score</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold">{stats?.threatScore || '75'}<span className="text-lg text-slate-500">/100</span></h3>
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[75%]" />
          </div>
        </motion.div>

        {/* Active Cameras */}
        <motion.div variants={item} className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <CameraIcon className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Active Cameras</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold">{stats?.activeCameras || '10'}</h3>
              <span className="text-slate-500">/ {stats?.totalCameras || '12'}</span>
            </div>
          </div>
        </motion.div>

        {/* Active Alerts */}
        <motion.div variants={item} className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl relative">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Critical Alerts</p>
            <h3 className="text-4xl font-bold text-red-400">{stats?.activeAlerts || '3'}</h3>
          </div>
        </motion.div>

        {/* Total Incidents */}
        <motion.div variants={item} className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">Today</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Incidents</p>
            <h3 className="text-4xl font-bold text-amber-400">{stats?.totalIncidentsToday || '8'}</h3>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div variants={item} className="glass-panel p-6 lg:col-span-2 min-h-[400px]">
          <h3 className="text-xl font-bold mb-4">Live Threat Analysis</h3>
          <div className="w-full h-[350px] bg-slate-900/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:opacity-100 transition-opacity duration-700"
            />
            {/* Fake AI Overlay */}
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
              className="absolute border border-blue-500/50 w-48 h-48 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500/5"
            >
              <div className="absolute -top-6 left-0 bg-blue-500/80 backdrop-blur text-white text-[10px] font-mono px-2 py-0.5">
                TRACKING | CONFIDENCE: 98%
              </div>
            </motion.div>
            {/* Crosshairs */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500"></div>
              <div className="absolute top-0 left-1/2 w-px h-full bg-blue-500"></div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Activities</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
              View All <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4 flex-grow overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-10 animate-pulse font-mono">Awaiting video analysis...</p>
            ) : (
              activities.map((activity) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={activity.id} 
                  className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
                >
                  <div className="mt-1">
                    {activity.type === 'critical' ? (
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    ) : activity.type === 'warning' ? (
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {activity.location}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                      {activity.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
