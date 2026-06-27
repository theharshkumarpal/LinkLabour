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
    <div className="glass-panel animate-fade-in applications-container">
      {/* Back link */}
      <button onClick={onBack} className="back-link">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Job Summary */}
      <div className="applications-header">
        <span className="badge badge-open" style={{ marginBottom: '0.5rem' }}>Reviewing Proposals</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
          Proposals for "{job.title}"
        </h2>
        <div className="applications-meta">
          <span>Category: <strong style={{ color: 'var(--text-primary)' }}>{job.category}</strong></span>
          <span>•</span>
          <span>Target Budget: <strong style={{ color: 'var(--accent)' }}>${job.budget}</strong></span>
          <span>•</span>
          <span>Date: <strong>{job.date}</strong></span>
        </div>
      </div>

      {/* Applications */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          Active Bids ({applications.length})
        </h3>

        {applications.length === 0 ? (
          <div className="empty-state empty-state-lg">
            No applications received for this job yet. Check back soon!
          </div>
        ) : (
          <div className="flex-col" style={{ gap: '1.25rem' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                className="application-card"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                {/* Applicant info row */}
                <div className="applicant-info">
                  <div className="applicant-profile">
                    <img
                      src={app.workerAvatar}
                      alt={app.workerName}
                      className="applicant-avatar"
                    />
                    <div>
                      <div className="flex-center" style={{ gap: '6px', justifyContent: 'flex-start' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                          {app.workerName}
                        </h4>
                        <span style={{ color: 'var(--info)' }} data-tooltip="Identity Verified Specialist">
                          <ShieldCheck size={16} />
                        </span>
                      </div>
                      <div className="applicant-rating">
                        <span className="job-card-rating">★ {app.workerRating}</span>
                        <span>•</span>
                        <span>Completion: <strong style={{ color: 'var(--accent)' }}>{app.workerCompletionRate}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Bid price */}
                  <div className="bid-price-box">
                    <span className="bid-price-label">Worker Bid Quote</span>
                    <span className="bid-price-value">${app.bidAmount}</span>
                  </div>
                </div>

                {/* Proposal pitch */}
                <div className="pitch-box">
                  <div className="pitch-label">
                    <Mail size={12} color="var(--primary)" /> Proposal Pitch
                  </div>
                  {app.message}
                </div>

                {/* Actions */}
                <div className="application-actions">
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
