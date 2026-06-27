import React from 'react';
import {
  Hammer, Droplets, Zap, Wind, Key, Paintbrush,
  ShieldCheck, Star, Users, ArrowRight, ClipboardCheck, Briefcase,
  TrendingUp, Award, MapPin,
} from 'lucide-react';
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
  onOpenPostModal,
}) => {
  const getCategoryCount = (category: JobCategory) =>
    jobs.filter(j => j.category === category && j.status === 'open').length;

  const categories: { name: JobCategory; icon: React.ReactNode; color: string; bg: string; desc: string }[] = [
    { name: 'Electrical', icon: <Zap size={22} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', desc: 'Smart switches, wiring, panel service' },
    { name: 'Plumbing',   icon: <Droplets size={22} />, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', desc: 'Leaking pipes, drain cleaning, fixtures' },
    { name: 'AC/HVAC',   icon: <Wind size={22} />,     color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', desc: 'Gas refill, split AC repair, servicing' },
    { name: 'Masonry',   icon: <Hammer size={22} />,   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', desc: 'Brickwork, concrete, tile layout' },
    { name: 'Carpentry', icon: <Key size={22} />,      color: '#fb923c', bg: 'rgba(251,146,60,0.12)', desc: 'Door repair, furniture assembly, cabinets' },
    { name: 'Painting',  icon: <Paintbrush size={22} />, color: '#f472b6', bg: 'rgba(244,114,182,0.12)', desc: 'Interior walls, accents, weatherproofing' },
  ];

  const tickerItems = [
    { dot: '#6366f1', text: '1,240+ Verified Specialists' },
    { dot: '#10b981', text: '4,890+ Jobs Completed' },
    { dot: '#f59e0b', text: 'Average Rating 4.92★' },
    { dot: '#06b6d4', text: '$324.5K+ Escrow Released' },
    { dot: '#d946ef', text: 'Zero Hidden Fees' },
    { dot: '#f43f5e', text: 'Instant Payout on Approval' },
    { dot: '#6366f1', text: '1,240+ Verified Specialists' },
    { dot: '#10b981', text: '4,890+ Jobs Completed' },
    { dot: '#f59e0b', text: 'Average Rating 4.92★' },
    { dot: '#06b6d4', text: '$324.5K+ Escrow Released' },
    { dot: '#d946ef', text: 'Zero Hidden Fees' },
    { dot: '#f43f5e', text: 'Instant Payout on Approval' },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{ paddingTop: '3rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}
    >
      {/* ── Hero ── */}
      <div className="hero-section">
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Trust badge */}
          <div className="hero-shield-badge animate-pop-in">
            <ShieldCheck size={14} />
            Verified · Escrow-Protected · Zero Fees
          </div>

          <h1 className="hero-title animate-slide-up">
            The Premier Network for
            <br className="hide-on-mobile" />
            <span className="hero-gradient-text"> Blue-Collar Professionals</span>
          </h1>

          <p
            className="hero-description animate-slide-up"
            style={{ animationDelay: '0.12s', opacity: 0, animationFillMode: 'forwards' }}
          >
            Connect with verified local specialists. Secure escrow payments,
            transparent reviews, and zero hidden fees — right in your neighbourhood.
          </p>

          <div
            className="hero-actions animate-slide-up"
            style={{ animationDelay: '0.24s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <button className="btn btn-primary btn-lg animate-float" onClick={() => setView('dashboard')}>
              <Briefcase size={20} /> Browse Opportunities
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={onOpenPostModal}
              style={{ backgroundColor: 'var(--bg-surface-solid)' }}
            >
              <Users size={20} /> Hire a Professional
            </button>
          </div>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {tickerItems.map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" style={{ backgroundColor: item.dot }} />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          { label: 'Verified Technicians', val: '1,240+', icon: <Users size={20} color="#6366f1" />, color: '#6366f1' },
          { label: 'Completed Services',   val: '4,890+', icon: <ClipboardCheck size={20} color="#10b981" />, color: '#10b981' },
          { label: 'Average Client Rating',val: '4.92 / 5', icon: <Star size={20} color="#f59e0b" />, color: '#f59e0b' },
          { label: 'Secure Payouts Released', val: '$324.5K', icon: <ShieldCheck size={20} color="#06b6d4" />, color: '#06b6d4' },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-panel stat-card animate-slide-up"
            style={{ animationDelay: `${0.08 * i}s`, cursor: 'default' }}
          >
            <div
              className="stat-icon"
              style={{ backgroundColor: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
            >
              {stat.icon}
            </div>
            <div>
              <div className="stat-value" style={{ color: stat.color }}>{stat.val}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Categories ── */}
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Browse Professional Categories
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Select a domain to filter open jobs or find dedicated contractors in that sector.
        </p>

        <div className="category-grid">
          {categories.map((cat, i) => {
            const count = getCategoryCount(cat.name);
            return (
              <div
                key={i}
                className="premium-card category-card animate-slide-up"
                style={{ animationDelay: `${0.08 * i}s` }}
                onClick={() => { onSelectCategory(cat.name); setView('dashboard'); }}
              >
                <div>
                  <div className="flex-between">
                    <div
                      className="category-icon-wrap"
                      style={{ color: cat.color, backgroundColor: cat.bg, width: 48, height: 48 }}
                    >
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
                <div className="category-explore" style={{ color: cat.color }}>
                  Explore Listings <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Feature highlights ── */}
      <div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Why LaborLink?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Built for trust, speed, and fair pay.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: <ShieldCheck size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', title: 'Escrow Protection', desc: 'Funds are held securely. Workers get paid only after you approve the completed task.' },
            { icon: <Star size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', title: 'Verified Reviews', desc: 'Every rating is tied to a real completed job. No fake reviews, ever.' },
            { icon: <MapPin size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)', title: 'Hyper-Local Matching', desc: 'GPS-powered search finds the nearest specialist. Less travel, faster response.' },
            { icon: <TrendingUp size={22} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', title: 'Competitive Bids', desc: 'Multiple workers bid on your job. You choose the best price and profile.' },
            { icon: <Award size={22} />, color: '#d946ef', bg: 'rgba(217,70,239,0.12)', title: 'Certified Specialists', desc: 'Workers upload licenses and certifications. Hire with confidence.' },
            { icon: <Briefcase size={22} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', title: 'Instant Payout', desc: 'Once approved, earnings hit the worker\'s wallet immediately. No delays.' },
          ].map((f, i) => (
            <div
              key={i}
              className="glass-panel animate-slide-up"
              style={{
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                animationDelay: `${0.07 * i}s`,
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.borderColor = f.color + '50';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${f.color}20`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.borderColor = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div
                style={{
                  width: 44, height: 44,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: f.bg,
                  border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem' }}>{f.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Role banners ── */}
      <div id="how-it-works-section" className="role-banners">
        <div className="premium-card role-banner" style={{ borderLeft: '4px solid #6366f1' }}>
          <div>
            <span className="role-banner-label" style={{ color: '#6366f1' }}>
              For Contractors & Homeowners
            </span>
            <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>
              Hire verified blue-collar specialists in minutes
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Publish your project specs, set your budget ceiling, and compare competitive custom bids
              from local certified electricians, plumbers, and technicians. Pay only after work is done.
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

        <div className="premium-card role-banner" style={{ borderLeft: '4px solid #10b981' }}>
          <div>
            <span className="role-banner-label" style={{ color: '#10b981' }}>
              For Technicians & Labourers
            </span>
            <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>
              Get local gigs with fair and guaranteed payouts
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Browse listings matching your skillset, pitch your custom bid, talk details via chat,
              get hired, and withdraw earnings directly to your wallet upon task approval.
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
