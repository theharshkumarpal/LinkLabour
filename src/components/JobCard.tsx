import React, { useState } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Zap, Droplets, Wind, Hammer, Key, Paintbrush, HelpCircle, ChevronDown, ChevronUp, MessageSquare, CheckCircle } from 'lucide-react';
import type { Job, JobCategory } from '../types';

interface JobCardProps {
  job: Job;
  role: 'poster' | 'worker';
  currentUserId: string;
  hasApplied: boolean;
  applicationCount: number;
  hasReview?: boolean;
  onApplyClick: (job: Job) => void;
  onReviewApplicationsClick: (job: Job) => void;
  onCompleteClick: (job: Job) => void;
  onChatClick: (jobId: string, partnerId: string, partnerName: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  role,
  currentUserId,
  hasApplied,
  applicationCount,
  hasReview = false,
  onApplyClick,
  onReviewApplicationsClick,
  onCompleteClick,
  onChatClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    { label: 'Bidding' },
    { label: 'Escrow Funded' },
    { label: 'Work Completed' },
    { label: 'Released & Rated' }
  ];

  let activeStep = 0;
  if (job.status === 'open') {
    activeStep = 0;
  } else if (job.status === 'in_progress') {
    activeStep = 1;
  } else if (job.status === 'completed') {
    activeStep = hasReview ? 3 : 2;
  }

  const getCategoryIcon = (category: JobCategory) => {
    switch (category) {
      case 'Electrical': return <Zap size={16} color="var(--warning)" />;
      case 'Plumbing': return <Droplets size={16} color="var(--info)" />;
      case 'AC/HVAC': return <Wind size={16} color="#38bdf8" />;
      case 'Masonry': return <Hammer size={16} color="#9ca3af" />;
      case 'Carpentry': return <Key size={16} color="#b45309" />;
      case 'Painting': return <Paintbrush size={16} color="#ec4899" />;
      default: return <HelpCircle size={16} color="var(--text-muted)" />;
    }
  };

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-open">Open Bids</span>;
      case 'in_progress':
        return <span className="badge badge-progress">In Progress</span>;
      case 'completed':
        return <span className="badge badge-completed">Completed</span>;
    }
  };

  return (
    <div className="premium-card animate-slide-up" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '1rem',
      textAlign: 'left',
    }}>
      {/* Header Info */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className="cat-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            {getCategoryIcon(job.category)}
            <span style={{ fontWeight: 700 }}>{job.category}</span>
          </span>
          {getStatusBadge(job.status)}
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          {job.title}
        </h3>

        {/* Poster Rating (if worker browsing) or Worker Hired (if poster browsing) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          <span>Posted by: <strong style={{ color: 'var(--text-secondary)' }}>{job.posterName}</strong></span>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--warning)', fontWeight: 700 }}>
            ★ {job.posterRating}
          </span>
        </div>

        {/* Grid Meta Information */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'rgba(0,0,0,0.15)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color="var(--accent)" />
            <span>Budget: <strong style={{ color: 'var(--text-primary)' }}>${job.budget}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--primary)" />
            <span>Date: <strong>{job.date}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="var(--info)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.location} {job.distance !== undefined && <strong style={{ color: 'var(--accent)' }}>({job.distance} mi)</strong>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="var(--warning)" />
            <span>Est. Time: <strong>{job.duration}</strong></span>
          </div>
        </div>
      </div>

      {/* Expandable detailed specifications */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '0.5rem',
          }}
        >
          {isExpanded ? (
            <>Hide Details <ChevronUp size={14} /></>
          ) : (
            <>View Description & Requirements <ChevronDown size={14} /></>
          )}
        </button>

        {isExpanded && (
          <div style={{
            fontSize: '0.85rem',
            lineHeight: '1.5',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'fadeIn 0.25s forwards',
          }}>
            <p>{job.description}</p>
            {job.requirements.length > 0 && (
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                  Requirements:
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {job.requirements.map((req, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                      }}
                    >
                      ✓ {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Milestone Progress Tracker */}
      <div className="milestone-tracker">
        <div className="milestone-header">
          <span className="milestone-title">Progress Tracker</span>
          <span className="milestone-status">
            {job.status === 'open' && 'Bidding Active'}
            {job.status === 'in_progress' && 'Escrow Active'}
            {job.status === 'completed' && !hasReview && 'Awaiting Escrow Release'}
            {job.status === 'completed' && hasReview && 'Disbursed & Rated'}
          </span>
        </div>
        <div className="milestone-steps-container">
          <div className="milestone-progress-line">
            <div 
              className="milestone-progress-fill" 
              style={{ width: `${(activeStep / 3) * 100}%` }}
            />
          </div>
          {steps.map((step, idx) => {
            let stateClass = 'pending';
            if (idx < activeStep || (job.status === 'completed' && hasReview)) {
              stateClass = 'completed';
            } else if (idx === activeStep) {
              stateClass = 'active';
            }
            return (
              <div key={idx} className={`milestone-step ${stateClass === 'active' ? 'active' : stateClass === 'completed' ? 'completed' : ''}`}>
                <div className={`milestone-circle ${stateClass}`}>
                  {stateClass === 'completed' ? '✓' : idx + 1}
                </div>
                <div className="milestone-label">{step.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1rem',
      }}>
        {role === 'poster' ? (
          // Job Poster Actions
          <>
            {job.status === 'open' && (
              <button
                className="btn btn-primary"
                onClick={() => onReviewApplicationsClick(job)}
                style={{ flex: 1, padding: '0.5rem 0.875rem' }}
              >
                Review Applications ({applicationCount})
              </button>
            )}
            {(job.status === 'in_progress' || (job.status === 'completed' && !hasReview)) && (
              <>
                <button
                  className="btn btn-accent"
                  onClick={() => onCompleteClick(job)}
                  style={{ flex: 1, padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}
                >
                  <CheckCircle size={14} /> Approve & Pay
                </button>
                {job.workerId && (
                  <button
                    className="btn btn-outline"
                    onClick={() => onChatClick(job.id, job.workerId!, job.workerName || 'Technician')}
                    style={{ padding: '0.5rem 0.875rem' }}
                    data-tooltip="Chat with Technician"
                  >
                    <MessageSquare size={16} />
                  </button>
                )}
              </>
            )}
            {job.status === 'completed' && hasReview && (
              <div style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.5rem',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}>
                <CheckCircle size={16} /> Completed & Hired
              </div>
            )}
          </>
        ) : (
          // Worker/Technician Actions
          <>
            {job.status === 'open' && (
              <button
                className={`btn ${hasApplied ? 'btn-outline' : 'btn-accent'}`}
                disabled={hasApplied}
                onClick={() => onApplyClick(job)}
                style={{ flex: 1, padding: '0.5rem 0.875rem' }}
              >
                {hasApplied ? 'Application Submitted' : 'Apply For This Job'}
              </button>
            )}
            {job.status === 'in_progress' && (
              <>
                {job.workerId === currentUserId ? (
                  <>
                    <button
                      className="btn btn-accent"
                      onClick={() => onCompleteClick(job)}
                      style={{ flex: 1, padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}
                    >
                      Mark as Completed
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => onChatClick(job.id, job.posterId, job.posterName)}
                      style={{ padding: '0.5rem 0.875rem' }}
                      data-tooltip="Chat with Poster"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </>
                ) : (
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.5rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    Assigned to Another Worker
                  </div>
                )}
              </>
            )}
            {job.status === 'completed' && (
              <>
                {hasReview ? (
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.5rem',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}>
                    <CheckCircle size={16} /> Job Completed & Paid
                  </div>
                ) : (
                  <>
                    {job.workerId === currentUserId ? (
                      <>
                        <div style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '0.5rem',
                          backgroundColor: 'var(--warning-light)',
                          color: 'var(--warning)',
                          borderRadius: 'var(--radius-lg)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}>
                          <Clock size={16} className="animate-pulse" /> Awaiting Poster Release
                        </div>
                        <button
                          className="btn btn-outline"
                          onClick={() => onChatClick(job.id, job.posterId, job.posterName)}
                          style={{ padding: '0.5rem 0.875rem' }}
                          data-tooltip="Chat with Poster"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </>
                    ) : (
                      <div style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '0.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}>
                        Assigned to Another Worker
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
