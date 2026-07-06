// frontend/src/pages/Notifications.tsx
import React, { useState } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  location: string;
  read: boolean;
  type: 'motion' | 'fire' | 'intrusion' | 'crowd' | 'system';
}

const Notifications: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Critical Threat Detected',
      message: 'Potential weapon detected near Main Entrance. Immediate action required.',
      severity: 'critical',
      timestamp: '2026-07-05 22:45:10',
      location: 'Main Entrance',
      read: false,
      type: 'intrusion'
    },
    {
      id: 2,
      title: 'Fire Alarm Triggered',
      message: 'Smoke sensors activated in Parking Lot B. Emergency services notified.',
      severity: 'critical',
      timestamp: '2026-07-05 21:30:22',
      location: 'Parking Lot B',
      read: false,
      type: 'fire'
    },
    {
      id: 3,
      title: 'Unauthorized Access Attempt',
      message: 'Multiple failed access attempts at Server Room door.',
      severity: 'high',
      timestamp: '2026-07-05 20:15:05',
      location: 'Server Room',
      read: false,
      type: 'intrusion'
    },
    {
      id: 4,
      title: 'Crowd Density Alert',
      message: 'Crowd density exceeds safe threshold in Lobby area.',
      severity: 'medium',
      timestamp: '2026-07-05 19:50:33',
      location: 'Main Lobby',
      read: true,
      type: 'crowd'
    },
    {
      id: 5,
      title: 'Motion Detected After Hours',
      message: 'Unexpected motion detected in storage area after closing time.',
      severity: 'high',
      timestamp: '2026-07-05 18:22:45',
      location: 'Storage Room B',
      read: true,
      type: 'motion'
    },
    {
      id: 6,
      title: 'Camera Offline',
      message: 'Camera 7 has lost connection. Check power and network cable.',
      severity: 'low',
      timestamp: '2026-07-05 17:10:00',
      location: 'Corridor C',
      read: true,
      type: 'system'
    },
  ]);

  const severityColors: Record<string, { bg: string; color: string; border: string }> = {
    critical: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    high: { bg: 'rgba(249,115,22,0.1)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
    medium: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    low: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  };

  const typeIcons: Record<string, string> = {
    motion: '👁️',
    fire: '🔥',
    intrusion: '🚨',
    crowd: '👥',
    system: '⚙️',
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'critical') return n.severity === 'critical';
    return true;
  });

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            Alert Center
            {unreadCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px',
                background: '#ef4444', color: 'white',
                borderRadius: '50%', fontSize: '0.7rem', fontWeight: 700,
                marginLeft: '10px', verticalAlign: 'middle'
              }}>{unreadCount}</span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time security alerts and notifications
          </p>
        </div>
        <button
          onClick={markAllRead}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
          }}
        >
          Mark all read
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {(['all', 'unread', 'critical'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              transition: 'all 0.2s',
              background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: filter === f ? '#60a5fa' : 'var(--text-muted)',
              borderColor: filter === f ? 'rgba(59,130,246,0.4)' : 'var(--border)',
            }}
          >
            {f === 'all' ? `All (${notifications.length})` : 
             f === 'unread' ? `Unread (${unreadCount})` : 
             `Critical (${notifications.filter(n => n.severity === 'critical').length})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((notif) => {
          const col = severityColors[notif.severity];
          return (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              style={{
                background: notif.read ? 'var(--bg-card)' : 'rgba(59,130,246,0.05)',
                border: `1px solid ${notif.read ? 'var(--border)' : 'rgba(59,130,246,0.2)'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {/* Type Icon */}
              <div style={{
                width: '44px', height: '44px',
                background: col.bg,
                border: `1px solid ${col.border}`,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}>
                {typeIcons[notif.type]}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{notif.title}</h3>
                    {!notif.read && (
                      <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }}></span>
                    )}
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                    background: col.bg, color: col.color, border: `1px solid ${col.border}`,
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {notif.severity}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                  {notif.message}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>📍 {notif.location}</span>
                  <span>🕐 {notif.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No alerts to show</p>
          <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>All clear for this filter</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
