// frontend/src/pages/Reports.tsx
import React, { useState } from 'react';

interface Report {
  id: number;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'incident';
  date: string;
  status: 'generated' | 'pending' | 'failed';
  size: string;
  incidents: number;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generated' | 'schedule'>('generated');

  const reports: Report[] = [
    { id: 1, title: 'Daily Security Report', type: 'daily', date: '2026-07-05', status: 'generated', size: '2.4 MB', incidents: 8 },
    { id: 2, title: 'Weekly Summary Report', type: 'weekly', date: '2026-07-01', status: 'generated', size: '8.1 MB', incidents: 34 },
    { id: 3, title: 'Monthly Analytics Report', type: 'monthly', date: '2026-07-01', status: 'generated', size: '18.6 MB', incidents: 147 },
    { id: 4, title: 'Critical Incident Report - Fire', type: 'incident', date: '2026-07-04', status: 'generated', size: '3.2 MB', incidents: 1 },
    { id: 5, title: 'Daily Security Report', type: 'daily', date: '2026-07-04', status: 'generated', size: '2.1 MB', incidents: 5 },
    { id: 6, title: 'Daily Security Report', type: 'daily', date: '2026-07-03', status: 'pending', size: '-', incidents: 0 },
  ];

  const typeColors: Record<string, string> = {
    daily: '#3b82f6',
    weekly: '#8b5cf6',
    monthly: '#06b6d4',
    incident: '#f97316',
  };

  const stats = [
    { label: 'Reports Generated', value: '248', icon: '📊', color: '#3b82f6' },
    { label: 'This Month', value: '31', icon: '📅', color: '#8b5cf6' },
    { label: 'Incidents Logged', value: '147', icon: '⚠️', color: '#f97316' },
    { label: 'Avg. Response Time', value: '4.2m', icon: '⚡', color: '#10b981' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>Reports & Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Generated security reports and system analytics
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', background: 'var(--bg-card)', borderRadius: '10px', padding: '4px', width: 'fit-content', border: '1px solid var(--border)' }}>
        {(['generated', 'schedule'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              transition: 'all 0.2s',
              background: activeTab === tab ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: activeTab === tab ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            {tab === 'generated' ? '📄 Generated Reports' : '⏰ Schedule Reports'}
          </button>
        ))}
      </div>

      {activeTab === 'generated' ? (
        <>
          {/* Generate New Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              border: 'none', borderRadius: '8px', color: 'white',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate New Report
            </button>
          </div>

          {/* Reports Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Report', 'Type', 'Date', 'Incidents', 'Size', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '1rem 1.25rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, i) => (
                  <tr key={report.id} style={{
                    borderBottom: i < reports.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.875rem' }}>{report.title}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: `${typeColors[report.type]}20`,
                        color: typeColors[report.type],
                        border: `1px solid ${typeColors[report.type]}40`,
                      }}>
                        {report.type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{report.date}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{report.incidents}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{report.size}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: report.status === 'generated' ? 'rgba(16,185,129,0.1)' : report.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: report.status === 'generated' ? '#34d399' : report.status === 'pending' ? '#fbbf24' : '#f87171',
                        border: `1px solid ${report.status === 'generated' ? 'rgba(16,185,129,0.3)' : report.status === 'pending' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          disabled={report.status !== 'generated'}
                          style={{
                            padding: '5px 12px',
                            background: report.status === 'generated' ? 'rgba(59,130,246,0.15)' : 'transparent',
                            border: '1px solid',
                            borderColor: report.status === 'generated' ? 'rgba(59,130,246,0.3)' : 'var(--border)',
                            borderRadius: '6px',
                            color: report.status === 'generated' ? '#60a5fa' : 'var(--text-muted)',
                            fontSize: '0.75rem',
                            cursor: report.status === 'generated' ? 'pointer' : 'not-allowed',
                            fontWeight: 600,
                          }}
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Report Schedule Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { label: 'Daily Reports', desc: 'Automated daily security summary', enabled: true, time: '00:00 UTC' },
              { label: 'Weekly Reports', desc: 'Week-over-week incident analysis', enabled: true, time: 'Every Monday' },
              { label: 'Monthly Reports', desc: 'Full month analytics & trends', enabled: false, time: '1st of month' },
              { label: 'Incident Reports', desc: 'Auto-generated on critical events', enabled: true, time: 'Real-time' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{item.label}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.desc}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>⏰ {item.time}</p>
                </div>
                <div style={{
                  width: '44px', height: '24px',
                  background: item.enabled ? 'rgba(59,130,246,0.4)' : 'var(--border)',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: item.enabled ? '22px' : '2px',
                    width: '20px', height: '20px',
                    background: item.enabled ? '#3b82f6' : 'var(--text-muted)',
                    borderRadius: '50%',
                    transition: 'all 0.3s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
