import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Sun, Moon, Bell, Wallet, User as UserIcon, Check, LogOut, LogIn, UserPlus, DollarSign, CheckCircle2, Star, FileText, Info } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  currentRole?: 'poster' | 'worker';
  currentUser?: User | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  notifications?: Array<{ id: string; text: string; read: boolean; date: string }>;
  markNotificationsAsRead?: () => void;
  setView: (view: 'landing' | 'dashboard') => void;
  onLogout?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole = 'worker',
  currentUser = null,
  theme,
  toggleTheme,
  notifications = [],
  markNotificationsAsRead = () => {},
  setView,
  onLogout,
  onLoginClick = () => {},
  onRegisterClick = () => {},
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="glass-panel navbar">
      {/* Brand logo */}
      <div className="navbar-brand" onClick={() => setView('landing')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="navbar-brand-icon" style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.45rem',
          borderRadius: '10px'
        }}>
          <LinkIcon size={20} color="#ffffff" style={{ transform: 'rotate(-45deg)' }} />
        </div>
        <div>
          <span className="navbar-brand-text" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.3rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Labor<span style={{ color: 'var(--accent)', WebkitTextFillColor: 'initial' }}>Link</span>
          </span>
          <div className="navbar-brand-sub" style={{
            fontSize: '0.625rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            marginTop: '-1px'
          }}>
            Verified Specialist Grid
          </div>
        </div>
      </div>

      {/* Guest Navigation Links or Active Mode Badge */}
      {currentUser ? (
        <div className="flex-center" style={{ gap: '1.5rem' }}>
          <span
            className={`badge navbar-role-badge hide-on-mobile ${currentRole === 'poster' ? 'badge-open' : 'badge-completed'}`}
          >
            {currentRole === 'poster' ? '💼 Employer Mode' : '🛠️ Specialist Workspace'}
          </span>
        </div>
      ) : (
        <div className="navbar-links">
          <button className="navbar-link" onClick={() => setView('landing')}>Home</button>
          <button className="navbar-link" onClick={() => setView('dashboard')}>Browse Jobs</button>
          <button
            className="navbar-link"
            onClick={() => {
              const el = document.getElementById('how-it-works-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setView('landing');
                setTimeout(() => {
                  document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            How It Works
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="navbar-actions">
        {/* Theme Toggle */}
        <button
          className="btn btn-outline btn-icon"
          onClick={toggleTheme}
          data-tooltip={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          data-tooltip-position="bottom"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {currentUser ? (
          <>
            {/* Wallet Balance */}
            <div className="wallet-chip">
              <Wallet size={16} color="var(--primary)" />
              <span className="hide-on-mobile" style={{ color: 'var(--text-secondary)' }}>Balance:</span>
              <span style={{ color: 'var(--accent)' }}>${currentUser.balance}</span>
            </div>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                className={`btn btn-outline btn-icon ${unreadCount > 0 ? 'animate-pulse-glow' : ''}`}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="glass-panel notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-title">
                      <Bell size={16} color="var(--primary)" /> Activity Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="notif-mark-read" onClick={markNotificationsAsRead}>
                        <Check size={12} /> Mark read
                      </span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No new updates yet.</div>
                  ) : (
                    <div className="flex-col" style={{ gap: '0.25rem' }}>
                      {notifications.map(n => {
                        const getNotifMeta = (text: string) => {
                          const lower = text.toLowerCase();
                          if (lower.includes('payment') || lower.includes('wallet') || lower.includes('escrow') || lower.includes('payout')) {
                            return {
                              icon: <DollarSign size={14} color="#10b981" />,
                              bg: 'rgba(16, 185, 129, 0.15)'
                            };
                          }
                          if (lower.includes('completed') || lower.includes('done') || lower.includes('finished')) {
                            return {
                              icon: <CheckCircle2 size={14} color="#3b82f6" />,
                              bg: 'rgba(59, 130, 246, 0.15)'
                            };
                          }
                          if (lower.includes('review') || lower.includes('rating') || lower.includes('feedback')) {
                            return {
                              icon: <Star size={14} color="#f59e0b" />,
                              bg: 'rgba(245, 158, 11, 0.15)'
                            };
                          }
                          if (lower.includes('proposal') || lower.includes('bid') || lower.includes('hired') || lower.includes('applied')) {
                            return {
                              icon: <FileText size={14} color="#8b5cf6" />,
                              bg: 'rgba(139, 92, 246, 0.15)'
                            };
                          }
                          return {
                            icon: <Info size={14} color="#06b6d4" />,
                            bg: 'rgba(6, 182, 212, 0.15)'
                          };
                        };

                        const meta = getNotifMeta(n.text);

                        return (
                          <div key={n.id} className={`notif-item ${!n.read ? 'unread' : 'read'}`}>
                            <div className="notif-icon-wrapper" style={{ backgroundColor: meta.bg }}>
                              {meta.icon}
                            </div>
                            <div className="notif-content-wrapper">
                              <div className="notif-text">{n.text}</div>
                              <div className="notif-date">{n.date}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {notifications.length > 0 && (
                    <div 
                      className="notif-footer" 
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/notifications');
                      }}
                    >
                      View All Alerts →
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button className="btn btn-outline btn-icon" onClick={onLogout} data-tooltip="Log Out" data-tooltip-position="bottom">
                <LogOut size={18} color="var(--danger)" />
              </button>
            )}

            {/* User profile capsule */}
            <div className="user-capsule" onClick={() => setView('dashboard')}>
              <img className="user-capsule-avatar" src={currentUser.avatar} alt={currentUser.name} />
              <div className="user-capsule-info hide-on-mobile">
                <span className="user-capsule-name">{currentUser.name.split(' ')[0]}</span>
                <span className="user-capsule-role">{currentRole}</span>
              </div>
              <UserIcon size={12} color="var(--text-muted)" className="hide-on-mobile" />
            </div>
          </>
        ) : (
          /* Guest Actions */
          <div className="flex-center guest-nav-btns" style={{ gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={onLoginClick}>
              <LogIn size={14} /> Log In
            </button>
            <button className="btn btn-primary animate-pulse-glow" onClick={onRegisterClick}>
              <UserPlus size={14} /> Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
