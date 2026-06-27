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
    <div className="modal-overlay">
      <div className="glass-panel modal-panel modal-panel-md" role="dialog" aria-modal="true" aria-label={`${technician.name}'s profile`}>
        <button
          onClick={onClose}
          className="btn-ghost modal-close"
          aria-label="Close profile"
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="profile-header">
          <img
            src={technician.avatar}
            alt={technician.name}
            className="profile-avatar"
          />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
              {technician.name}
            </h2>
            <div className="flex-center" style={{ gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', justifyContent: 'flex-start' }}>
              <span className="job-card-rating">★ {technician.rating}</span>
              <span>•</span>
              <span>{technician.reviewCount} Reviews</span>
            </div>
            <div className="certified-badge">
              <CheckCircle size={10} /> Certified Specialist
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat-box">
            <span className="profile-stat-label">Completed Projects</span>
            <span className="profile-stat-value">{technician.completedJobs}</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-label">Job Success Rate</span>
            <span className="profile-stat-value" style={{ color: 'var(--accent)' }}>100%</span>
          </div>
        </div>

        {/* Credentials */}
        {technician.certifications.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 className="section-label">Credentials & Licenses</h3>
            <div className="flex-col" style={{ gap: '0.5rem' }}>
              {technician.certifications.map((cert, idx) => (
                <div key={idx} className="credential-item">
                  <Award size={16} />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 className="section-label">Verified Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {technician.skills.map((skill, idx) => (
              <span key={idx} className="skill-chip">{skill}</span>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="section-label" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.375rem' }}>
            Client Reviews ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <div className="empty-state">No reviews registered yet.</div>
          ) : (
            <div className="flex-col" style={{ gap: '0.875rem' }}>
              {reviews.map((rev) => (
                <div key={rev.id} className="review-card">
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{rev.reviewerName}</span>
                    <span className="job-card-rating" style={{ fontSize: '0.75rem' }}>
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
