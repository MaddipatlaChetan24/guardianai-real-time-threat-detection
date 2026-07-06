import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Download, Filter, Search, ChevronRight, Activity } from 'lucide-react';
import axios from 'axios';

interface Incident {
  id: number;
  camera_id: number;
  timestamp: string;
  threat_level: string;
  status: string;
  summary: string;
  detected_objects: Record<string, any>;
  severity_score: number;
}

const IncidentReport: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await axios.get('http://localhost:8000/incidents');
        setIncidents(res.data);
      } catch (error) {
        console.error("Failed to fetch incidents", error);
      }
    };
    fetchIncidents();
  }, []);

  const getThreatColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-amber-400';
      case 'investigating': return 'text-blue-400';
      case 'resolved': return 'text-emerald-400';
      case 'ignored': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.summary?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inc.threat_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Incident Reports</h2>
          <p className="text-slate-400">Historical AI agent detections and actions</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search incidents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5 text-slate-300" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors font-medium text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/5">
                <th className="p-4 text-sm font-semibold text-slate-300">Severity</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Incident Details</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Time</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length > 0 ? filteredIncidents.map((incident, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={incident.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${getThreatColor(incident.threat_level)}`}>
                      {incident.threat_level === 'critical' ? <ShieldAlert className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                      {incident.threat_level}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-200">{incident.summary || 'Unknown Incident'}</p>
                    <div className="flex gap-2 mt-1">
                      {incident.detected_objects && Object.keys(incident.detected_objects).map(obj => (
                        <span key={obj} className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">
                    {new Date(incident.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getStatusColor(incident.status)} capitalize`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No incidents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default IncidentReport;
