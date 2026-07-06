import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import CommandBar from './components/CommandBar';
import SideNav from './components/SideNav';
import LiveLogBar from './components/LiveLogBar';
import NeuralBackground from './components/NeuralBackground';

import BootSequence from './pages/BootSequence';
import CommandCenter from './pages/CommandCenter';
import CameraIntelligence from './pages/CameraIntelligence';
import IncidentTimeline from './pages/IncidentTimeline';
import AgentWorkspace from './pages/AgentWorkspace';
import MCPToolCenter from './pages/MCPToolCenter';
import AgentMemory from './pages/AgentMemory';
import AgentNetwork from './pages/AgentNetwork';
import ReportViewer from './pages/ReportViewer';

import './index.css';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#040712] text-[#F0F4F8] font-sans">
      {/* Ambient Background */}
      <NeuralBackground opacity={0.15} />

      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Background glow orbs */}
      <div className="fixed top-[-15%] left-[-10%] w-[35%] h-[35%] rounded-full bg-[#00D4FF]/[0.03] blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full bg-[#7B61FF]/[0.03] blur-[150px] pointer-events-none" />

      {/* Command Bar (top) */}
      <CommandBar />

      {/* Side Navigation */}
      <SideNav />

      {/* Main Content Area */}
      <main className="ml-16 mt-12 mb-8 p-4 relative z-10 h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Live Log Bar (bottom) */}
      <LiveLogBar />
    </div>
  );
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<BootSequence />} />
        <Route path="/command" element={<AppLayout><CommandCenter /></AppLayout>} />
        <Route path="/cameras" element={<AppLayout><CameraIntelligence /></AppLayout>} />
        <Route path="/incidents" element={<AppLayout><IncidentTimeline /></AppLayout>} />
        <Route path="/agents" element={<AppLayout><AgentWorkspace /></AppLayout>} />
        <Route path="/tools" element={<AppLayout><MCPToolCenter /></AppLayout>} />
        <Route path="/memory" element={<AppLayout><AgentMemory /></AppLayout>} />
        <Route path="/network" element={<AppLayout><AgentNetwork /></AppLayout>} />
        <Route path="/reports" element={<AppLayout><ReportViewer /></AppLayout>} />
        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/command" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
