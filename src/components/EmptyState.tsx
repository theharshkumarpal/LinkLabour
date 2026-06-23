import React from 'react';
import { SearchX, Inbox, Compass } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  iconType?: 'search' | 'inbox' | 'compass';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, iconType = 'search' }) => {
  const Icon = iconType === 'search' ? SearchX : iconType === 'inbox' ? Inbox : Compass;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: 'var(--radius-2xl)',
      border: '1px dashed var(--border-color)',
      textAlign: 'center',
      animation: 'fadeIn 0.5s ease',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <Icon size={32} color="var(--primary)" />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '300px' }}>
        {message}
      </p>
    </div>
  );
};
