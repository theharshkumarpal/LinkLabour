import React from 'react';
import { ShieldCheck, Mail, ArrowLeft, User, MessageSquare } from 'lucide-react';
import type { Job, Application } from '../types';

interface ApplicationsListProps {
  job: Job;
  applications: Application[];
  onBack: () => void;
  onHire: (application: Application) => void;
  onChat: (jobId: string, workerId: string, workerName: string) => void;
  onViewProfile: (workerId: string) => void;
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({
  job,
  applications,
  onBack,
  onHire,
  onChat,
  onViewProfile,
}) => {
  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'left' }}>
      {/* Header back-link */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--primary)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Job Context Summary */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.25rem',
        marginBottom: '2rem',
      }}>
        <span className="badge badge-open" style={{ marginBottom: '0.5rem' }}>Reviewing Proposals</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
          Proposals for "{job.title}"
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <span>Category: <strong style={{ color: 'var(--text-primary)' }}>{job.category}</strong></span>
          <span>•</span>
          <span>Target Budget: <strong style={{ color: 'var(--accent)' }}>${job.budget}</strong></span>
          <span>•</span>
          <span>Date: <strong>{job.date}</strong></span>
        </div>
      </div>

      {/* Applications Listing */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          Active Bids ({applications.length})
        </h3>

        {applications.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-xl)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}>
            No applications received for this job yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1.5rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'border-color 0.25s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {/* Header card: User capsule info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                  {/* Left profile info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <img
                      src={app.workerAvatar}
                      alt={app.workerName}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary)',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                          {app.workerName}
                        </h4>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: 'var(--info)',
                        }} data-tooltip="Identity Verified Specialist">
                          <ShieldCheck size={16} />
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--warning)', fontWeight: 700 }}>
                          ★ {app.workerRating}
                        </span>
                        <span>•</span>
                        <span>Job Completion: <strong style={{ color: 'var(--accent)' }}>{app.workerCompletionRate}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Bid price */}
                  <div style={{
                    textAlign: 'right',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                      Worker Bid Quote
                    </span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                      ${app.bidAmount}
                    </span>
                  </div>
                </div>

                {/* Pitch Message */}
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}>
                    <Mail size={12} color="var(--primary)" /> Proposal Pitch
                  </div>
                  {app.message}
                </div>

                {/* Proposal actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.75rem',
                }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => onViewProfile(app.workerId)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <User size={14} /> Profile & Reviews
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onChat(job.id, app.workerId, app.workerName)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <MessageSquare size={14} /> Chat & Negotiate
                  </button>
                  <button
                    className="btn btn-accent"
                    onClick={() => onHire(app)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
                  >
                    Accept Bid & Hire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
