import React from 'react';

export const SkeletonJobCard: React.FC = () => {
  return (
    <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="animate-shimmer" style={{ width: '100px', height: '24px', borderRadius: 'var(--radius-md)' }} />
        <div className="animate-shimmer" style={{ width: '80px', height: '24px', borderRadius: 'var(--radius-full)' }} />
      </div>
      
      <div className="animate-shimmer" style={{ width: '80%', height: '28px', borderRadius: 'var(--radius-sm)' }} />
      
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div className="animate-shimmer" style={{ width: '120px', height: '16px', borderRadius: 'var(--radius-sm)' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        padding: '0.75rem',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div className="animate-shimmer" style={{ width: '90%', height: '16px', borderRadius: 'var(--radius-sm)' }} />
        <div className="animate-shimmer" style={{ width: '80%', height: '16px', borderRadius: 'var(--radius-sm)' }} />
        <div className="animate-shimmer" style={{ width: '95%', height: '16px', borderRadius: 'var(--radius-sm)' }} />
        <div className="animate-shimmer" style={{ width: '70%', height: '16px', borderRadius: 'var(--radius-sm)' }} />
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <div className="animate-shimmer" style={{ flex: 1, height: '36px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  );
};
