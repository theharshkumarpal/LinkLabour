import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ArrowLeft, 
  Check, 
  DollarSign, 
  CheckCircle2, 
  Star, 
  FileText, 
  Info,
  Clock,
  Compass
} from 'lucide-react';
import type { Notification } from '../types';

interface NotificationsPageProps {
  notifications: Notification[];
  markNotificationsAsRead: () => void;
}

type FilterTab = 'all' | 'unread' | 'financial' | 'tasks' | 'proposals';

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  markNotificationsAsRead,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const navigate = useNavigate();

  const getNotifMeta = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('payment') || lower.includes('wallet') || lower.includes('escrow') || lower.includes('payout')) {
      return {
        icon: <DollarSign size={16} color="#10b981" />,
        bg: 'rgba(16, 185, 129, 0.15)',
        label: 'Payments & Balance',
        color: '#10b981',
      };
    }
    if (lower.includes('completed') || lower.includes('done') || lower.includes('finished')) {
      return {
        icon: <CheckCircle2 size={16} color="#3b82f6" />,
        bg: 'rgba(59, 130, 246, 0.15)',
        label: 'Task Progress',
        color: '#3b82f6',
      };
    }
    if (lower.includes('review') || lower.includes('rating') || lower.includes('feedback')) {
      return {
        icon: <Star size={16} color="#f59e0b" />,
        bg: 'rgba(245, 158, 11, 0.15)',
        label: 'Feedback & Reviews',
        color: '#f59e0b',
      };
    }
    if (lower.includes('proposal') || lower.includes('bid') || lower.includes('hired') || lower.includes('applied')) {
      return {
        icon: <FileText size={16} color="#8b5cf6" />,
        bg: 'rgba(139, 92, 246, 0.15)',
        label: 'Bids & Proposals',
        color: '#8b5cf6',
      };
    }
    return {
      icon: <Info size={16} color="#06b6d4" />,
      bg: 'rgba(6, 182, 212, 0.15)',
      label: 'System Notification',
      color: '#06b6d4',
    };
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    
    const lower = n.text.toLowerCase();
    if (activeTab === 'financial') {
      return lower.includes('payment') || lower.includes('wallet') || lower.includes('escrow') || lower.includes('payout');
    }
    if (activeTab === 'tasks') {
      return lower.includes('completed') || lower.includes('done') || lower.includes('finished');
    }
    if (activeTab === 'proposals') {
      return lower.includes('proposal') || lower.includes('bid') || lower.includes('hired') || lower.includes('applied');
    }
    return true; // 'all'
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;
  const paymentCount = notifications.filter(n => {
    const l = n.text.toLowerCase();
    return l.includes('payment') || l.includes('wallet') || l.includes('escrow') || l.includes('payout');
  }).length;
  const taskCount = notifications.filter(n => {
    const l = n.text.toLowerCase();
    return l.includes('completed') || l.includes('done') || l.includes('finished');
  }).length;

  return (
    <div className="notif-page-bg animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
      
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-outline btn-icon" 
            onClick={() => navigate(-1)}
            style={{ width: '38px', height: '38px', borderRadius: '50%' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={24} color="var(--primary)" /> Notification Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Track escrow releases, project handovers, client reviews, and direct updates.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button className="btn btn-primary" onClick={markNotificationsAsRead}>
            <Check size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Grid of Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        {[
          { label: 'Total Notifications', value: totalCount, color: 'var(--primary)', border: 'rgba(99,102,241,0.25)', bg: 'rgba(99,102,241,0.07)' },
          { label: 'Unread Alerts', value: unreadCount, color: unreadCount > 0 ? 'var(--danger)' : 'var(--text-muted)', border: unreadCount > 0 ? 'rgba(239,68,68,0.25)' : 'var(--border-color)', bg: unreadCount > 0 ? 'rgba(239,68,68,0.06)' : 'transparent' },
          { label: 'Payments Activity', value: paymentCount, color: 'var(--accent)', border: 'rgba(16,185,129,0.25)', bg: 'rgba(16,185,129,0.07)' },
          { label: 'Milestone Handbacks', value: taskCount, color: 'var(--info)', border: 'rgba(6,182,212,0.25)', bg: 'rgba(6,182,212,0.07)' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', border: `1px solid ${stat.border}`, background: stat.bg }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>{stat.label}</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: stat.color, marginTop: '2px', display: 'block' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Main Layout Section */}
      <div className="worker-layout">
        {/* Left Sidebar Filter Pills */}
        <div className="notif-sidebar">
          <div className="glass-panel notif-sidebar-card">
            <h3 className="notif-sidebar-title">
              Filter Categories
            </h3>
            {[
              { id: 'all', label: 'All Activities', badge: totalCount },
              { id: 'unread', label: 'Unread Alerts', badge: unreadCount, color: 'var(--danger)' },
              { id: 'financial', label: 'Escrow & Payouts', badge: paymentCount },
              { id: 'tasks', label: 'Task Milestones', badge: taskCount },
              { id: 'proposals', label: 'Proposals & Offers' },
            ].map(tab => (
              <button
                key={tab.id}
                className="btn btn-outline"
                onClick={() => setActiveTab(tab.id as FilterTab)}
                style={{
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.825rem',
                  backgroundColor: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border-color)',
                  fontWeight: activeTab === tab.id ? 700 : 600,
                  width: '100%',
                }}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '999px', 
                    backgroundColor: tab.color || 'var(--bg-app)', 
                    color: tab.color ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 700 
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Notifications Cards Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredNotifs.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <Compass size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>No notifications found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                You have no notifications in the "{activeTab}" filter tag.
              </p>
            </div>
          ) : (
            filteredNotifs.map(n => {
              const meta = getNotifMeta(n.text);
              return (
                <div
                  key={n.id}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${!n.read ? 'var(--primary)' : meta.color}`,
                    backgroundColor: !n.read ? 'var(--primary-light)' : 'var(--bg-surface)',
                    boxShadow: !n.read ? 'var(--shadow-glow-primary-subtle)' : 'none',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = !n.read ? 'var(--shadow-glow-primary-subtle)' : 'none';
                  }}
                >
                  {/* Category icon */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: meta.bg,
                    flexShrink: 0
                  }}>
                    {meta.icon}
                  </div>

                  {/* Text details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: meta.color, letterSpacing: '0.05em' }}>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Clock size={12} /> {n.date}
                      </span>
                    </div>

                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: !n.read ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      lineHeight: '1.4',
                      fontWeight: !n.read ? 600 : 500
                    }}>
                      {n.text}
                    </div>
                  </div>

                  {/* Unread glow dot indicator */}
                  {!n.read && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-glow-primary)'
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
