import React from 'react';
import { Hammer, Droplets, Zap, Wind, Key, Paintbrush, ShieldCheck, Star, Users, ArrowRight, ClipboardCheck, Briefcase } from 'lucide-react';
import type { Job, JobCategory } from '../types';

interface LandingHeroProps {
  jobs: Job[];
  role: 'poster' | 'worker';
  setView: (view: 'landing' | 'dashboard') => void;
  onSelectCategory: (cat: JobCategory | 'All') => void;
  onOpenPostModal: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  jobs,
  setView,
  onSelectCategory,
  onOpenPostModal
}) => {
  const getCategoryCount = (category: JobCategory) => {
    return jobs.filter(j => j.category === category && j.status === 'open').length;
  };

  const categories: { name: JobCategory; icon: React.ReactNode; color: string; desc: string }[] = [
    { name: 'Electrical', icon: <Zap size={24} />, color: 'var(--warning)', desc: 'Smart switches, wiring, panel service' },
    { name: 'Plumbing', icon: <Droplets size={24} />, color: 'var(--info)', desc: 'Leaking pipes, drain cleaning, fixtures' },
    { name: 'AC/HVAC', icon: <Wind size={24} />, color: '#38bdf8', desc: 'Gas refill, split AC repair, servicing' },
    { name: 'Masonry', icon: <Hammer size={24} />, color: '#a1a1aa', desc: 'Brickwork, concrete, tile layout' },
    { name: 'Carpentry', icon: <Key size={24} />, color: '#b45309', desc: 'Door repair, furniture assembly, cabinets' },
    { name: 'Painting', icon: <Paintbrush size={24} />, color: '#ec4899', desc: 'Interior walls, accents, weatherproofing' },
  ];

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Hero Header Section */}
      <div className="hero-section">
        {/* Decorative background blurs */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--info)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="hero-title animate-slide-up">
            The Premier Network for<br className="hide-on-mobile" />
            <span className="hero-gradient-text">Blue-Collar Professionals</span>
          </h1>
          <p className="hero-description animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            Connect with verified local specialists. Secure escrow payments, transparent reviews, and zero hidden fees.
          </p>

          <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <button className="btn btn-primary btn-lg" onClick={() => setView('dashboard')}>
              <Briefcase size={20} /> Browse Opportunities
            </button>
            <button className="btn btn-outline btn-lg" onClick={onOpenPostModal} style={{ backgroundColor: 'var(--bg-surface-solid)' }}>
              <Users size={20} /> Hire a Professional
            </button>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="stats-grid">
        {[
          { label: 'Verified Technicians', val: '1,240+', icon: <Users size={18} color="var(--primary)" /> },
          { label: 'Completed Services', val: '4,890+', icon: <ClipboardCheck size={18} color="var(--accent)" /> },
          { label: 'Average Client Rating', val: '4.92 / 5', icon: <Star size={18} color="var(--warning)" /> },
          { label: 'Secure Payouts Released', val: '$324.5K', icon: <ShieldCheck size={18} color="var(--info)" /> }
        ].map((stat, i) => (
          <div key={i} className="glass-panel stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.val}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Grid */}
      <div style={{ marginBottom: '4rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Browse Professional Categories
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Select a domain below to filter open jobs or find dedicated contractors in that sector.
        </p>

        <div className="category-grid">
          {categories.map((cat, i) => {
            const count = getCategoryCount(cat.name);
            return (
              <div
                key={i}
                className="premium-card category-card"
                onClick={() => { onSelectCategory(cat.name); setView('dashboard'); }}
              >
                <div>
                  <div className="flex-between">
                    <div className="category-icon-wrap" style={{ color: cat.color }}>
                      {cat.icon}
                    </div>
                    {count > 0 && (
                      <span className="badge badge-open" style={{ fontSize: '0.65rem' }}>
                        {count} Active {count === 1 ? 'Job' : 'Jobs'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {cat.desc}
                  </p>
                </div>
                <div className="category-explore">
                  Explore Listings <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Explanation Banners */}
      <div id="how-it-works-section" className="role-banners">
        <div className="premium-card role-banner animate-pulse-glow" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div>
            <span className="role-banner-label" style={{ color: 'var(--primary)' }}>
              For Contractors & Homeowners
            </span>
            <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>
              Hire verified blue-collar specialists in minutes
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Publish your project specs, set your budget ceiling, and compare competitive custom bids from local certified electricians, plumbers, and technicians. Pay only after work is done.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setView('dashboard'); onOpenPostModal(); }}
            style={{ alignSelf: 'flex-start', marginTop: '1.5rem' }}
          >
            Post Your First Job
          </button>
        </div>

        <div className="premium-card role-banner" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div>
            <span className="role-banner-label" style={{ color: 'var(--accent)' }}>
              For Technicians & Labourers
            </span>
            <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>
              Get local gigs with fair and guaranteed payouts
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Browse listings matching your skillset, pitch your custom bid, talk details via chat, get hired, and withdraw earnings directly to your wallet upon task approval.
            </p>
          </div>
          <button
            className="btn btn-accent"
            onClick={() => { onSelectCategory('All'); setView('dashboard'); }}
            style={{ alignSelf: 'flex-start', marginTop: '1.5rem' }}
          >
            Find Blue-Collar Work
          </button>
        </div>
      </div>
    </div>
  );
};
