import React from 'react';
import { X, Award, CheckCircle } from 'lucide-react';
import type { User, Review } from '../types';

interface ProfileModalProps {
  technician: User;
  reviews: Review[];
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  technician,
  reviews,
  onClose,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
      animation: 'fadeIn 0.2s forwards',
    }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '550px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '2rem',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          animation: 'slideUp 0.3s forwards',
          textAlign: 'left',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        {/* Head Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
          <img
            src={technician.avatar}
            alt={technician.name}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--primary)',
            }}
          />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
              {technician.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--warning)', fontWeight: 700 }}>
                ★ {technician.rating}
              </span>
              <span>•</span>
              <span>{technician.reviewCount} Reviews</span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '0.5rem',
            }}>
              <CheckCircle size={10} /> Certified Specialist
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.15)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
              Completed Projects
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {technician.completedJobs}
            </span>
          </div>

          <div style={{
            backgroundColor: 'rgba(0,0,0,0.15)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
              Job Success Rate
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
              100%
            </span>
          </div>
        </div>

        {/* Certifications & Badges */}
        {technician.certifications.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Credentials & Licenses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {technician.certifications.map((cert, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}>
                  <Award size={16} />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Tag Cloud */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Verified Skills
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {technician.skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.375rem' }}>
            Client Reviews ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No reviews registered yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{
                  padding: '0.875rem',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {rev.reviewerName}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 700 }}>
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    "{rev.comment}"
                  </p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', textAlign: 'right' }}>
                    {rev.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
