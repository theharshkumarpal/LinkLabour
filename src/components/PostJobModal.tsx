import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Job, JobCategory } from '../types';
import { useToast } from './ToastProvider';

interface PostJobModalProps {
  onClose: () => void;
  onSubmit: (jobData: Omit<Job, 'id' | 'posterId' | 'posterName' | 'posterRating' | 'status' | 'createdDate'>) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobCategory>('Electrical');
  const [budget, setBudget] = useState<number>(100);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('3 Hours');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [locationStatus, setLocationStatus] = useState<string>('');
  
  const { addToast } = useToast();

  const handleGetLocation = () => {
    setLocationStatus('Fetching...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationStatus('Location acquired ✓');
        },
        (error) => {
          setLocationStatus('Failed to get location');
          console.error(error);
        }
      );
    } else {
      setLocationStatus('Geolocation not supported');
    }
  };
  
  // Custom requirements list creation state
  const [newRequirement, setNewRequirement] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !date || !description.trim()) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }
    onSubmit({
      title,
      category,
      budget,
      location,
      date,
      duration,
      description,
      requirements,
      latitude,
      longitude,
    });
  };

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
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          animation: 'slideUp 0.3s forwards',
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

        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 800,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Post a Blue-Collar Service Request
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Repair leak in bathroom wall pipes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="AC/HVAC">AC/HVAC</option>
                <option value="Masonry">Masonry</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Budget */}
            <div className="form-group">
              <label className="form-label">Max Budget ($) *</label>
              <input
                type="number"
                className="form-input"
                min={10}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Target Date */}
            <div className="form-group">
              <label className="form-label">Execution Date *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Est Duration */}
            <div className="form-group">
              <label className="form-label">Estimated Time Required *</label>
              <select
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="1 Hour">1 Hour</option>
                <option value="2-3 Hours">2-3 Hours</option>
                <option value="4-5 Hours">4-5 Hours</option>
                <option value="1 Day">1 Day</option>
                <option value="2 Days">2 Days</option>
                <option value="3-5 Days">3-5 Days</option>
                <option value="1 Week">1 Week</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Work Location Address *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sector 15, Dwarka, New Delhi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleGetLocation}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  📍 Pin Current Location
                </button>
                {locationStatus && (
                  <span style={{ fontSize: '0.75rem', color: locationStatus.includes('✓') ? 'var(--accent)' : 'var(--danger)' }}>
                    {locationStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Job Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Provide a detailed explanation of the issue, what materials are on-site, what tools are required, and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Requirements addition */}
          <div className="form-group">
            <label className="form-label">Add Required Skills/Certifications</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bring PVC pipe adhesive, certified electrician license"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddRequirement}
                style={{ padding: '0 1rem' }}
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Render tags */}
            {requirements.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.375rem',
                marginTop: '0.5rem',
                backgroundColor: 'rgba(0,0,0,0.1)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
              }}>
                {requirements.map((req, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                    }}
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
          }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Service Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
