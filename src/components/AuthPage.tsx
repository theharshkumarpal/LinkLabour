import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Award, Wrench, ArrowLeft } from 'lucide-react';
import type { User, JobCategory } from '../types';
import { api } from '../services/api';

interface AuthPageProps {
  onLogin: (email: string) => Promise<boolean>;
  onRegister: (userData: Omit<User, 'id' | 'rating' | 'reviewCount' | 'completedJobs' | 'balance'>) => void;
  mockUsers: { poster: User; worker: User };
  initialMode?: 'login' | 'register';
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onLogin, 
  onRegister, 
  mockUsers, 
  initialMode = 'login', 
  onClose 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'poster' | 'worker'>('poster');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSkills, setRegSkills] = useState<JobCategory[]>([]);
  const [regCertifications, setRegCertifications] = useState('');
  const [regError, setRegError] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [locationStatus, setLocationStatus] = useState<string>('');

  // Google Login / Simulation State
  const [googleSignUpData, setGoogleSignUpData] = useState<{ email: string; name: string; avatar: string } | null>(null);
  const [showSimulatedGoogleModal, setShowSimulatedGoogleModal] = useState(false);
  const [simEmail, setSimEmail] = useState('');
  const [simName, setSimName] = useState('');
  const [showCustomSimForm, setShowCustomSimForm] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Load Google Identity Services script
  useEffect(() => {
    if (!document.getElementById('google-jssdk')) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Initialize and Render Real Google Button if Client ID exists
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const handleGoogleCredentialResponse = async (response: any) => {
      try {
        setLoginError('');
        setRegError('');
        const res = await api.googleLogin({ credential: response.credential });
        if (res.success && res.user) {
          await onLogin(res.user.email);
        } else if (res.isGoogleSignUp) {
          setGoogleSignUpData({
            email: res.email || '',
            name: res.name || '',
            avatar: res.avatar || '',
          });
          setRegName(res.name || '');
          setRole('poster');
        }
      } catch (err) {
        console.error('Google Sign-In failed:', err);
        setLoginError('Google Login failed. Please try again.');
      }
    };

    const initGoogleOAuth = () => {
      const gWindow = window as any;
      if (gWindow.google?.accounts?.id) {
        gWindow.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        // Try to render buttons in both forms if containers exist
        const containers = ['google-signin-btn-real-login', 'google-signin-btn-real-register'];
        containers.forEach(id => {
          const container = document.getElementById(id);
          if (container) {
            gWindow.google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              width: 320,
            });
          }
        });
      }
    };

    const pollInterval = setInterval(() => {
      const gWindow = window as any;
      if (gWindow.google?.accounts?.id) {
        initGoogleOAuth();
        clearInterval(pollInterval);
      }
    }, 500);

    return () => clearInterval(pollInterval);
  }, [GOOGLE_CLIENT_ID, mode, googleSignUpData]);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail) {
      setLoginError('Please enter an email address.');
      return;
    }
    const success = await onLogin(loginEmail.trim().toLowerCase());
    if (!success) {
      setLoginError('No registered user found with this email address.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter your email.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (role === 'worker' && regSkills.length === 0) {
      setRegError('Please select at least one skill domain.');
      return;
    }

    const certsArray = regCertifications
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    onRegister({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      role,
      avatar: role === 'poster' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      skills: role === 'worker' ? regSkills : [],
      certifications: role === 'worker' ? certsArray : [],
      latitude,
      longitude,
    });
  };

  const handleGoogleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!googleSignUpData) return;
    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (role === 'worker' && regSkills.length === 0) {
      setRegError('Please select at least one skill domain.');
      return;
    }

    const certsArray = regCertifications
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    onRegister({
      name: regName.trim(),
      email: googleSignUpData.email,
      role,
      avatar: googleSignUpData.avatar || (role === 'poster' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
      skills: role === 'worker' ? regSkills : [],
      certifications: role === 'worker' ? certsArray : [],
      latitude,
      longitude,
    });
  };

  const toggleSkill = (skill: JobCategory) => {
    setRegSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const handleSimulatedGoogleSelect = async (mockProfile: { email: string; name: string; avatar: string }) => {
    setShowSimulatedGoogleModal(false);
    try {
      setLoginError('');
      setRegError('');
      const res = await api.googleLogin({ ...mockProfile, isMock: true });
      if (res.success && res.user) {
        await onLogin(res.user.email);
      } else if (res.isGoogleSignUp) {
        setGoogleSignUpData({
          email: res.email || '',
          name: res.name || '',
          avatar: res.avatar || '',
        });
        setRegName(res.name || '');
        setRole('poster');
      }
    } catch (err) {
      console.error('Simulated Google Login failed:', err);
      setLoginError('Simulated Google login failed.');
    }
  };

  const categories: JobCategory[] = ['Plumbing', 'Masonry', 'Electrical', 'AC/HVAC', 'Cleaning', 'Carpentry', 'Painting', 'Other'];

  const renderGoogleButton = (containerId: string) => {
    if (GOOGLE_CLIENT_ID) {
      return <div id={containerId} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>;
    }

    return (
      <button
        type="button"
        onClick={() => {
          setShowCustomSimForm(false);
          setShowSimulatedGoogleModal(true);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-app)',
      position: 'relative',
    }}>
      {/* Back to Home Page Button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.5rem 1rem',
            fontSize: '0.825rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 100,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      )}

      {/* Visual responsive wrapper */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: '500px',
        margin: 'auto',
        padding: '2rem 1.5rem',
      }}>
        {/* Auth Form Box */}
        <div className="glass-panel animate-slide-up" style={{
          padding: '2.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
        }}>
          {/* Header tabs switcher */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            paddingBottom: '2px',
          }}>
            <button
              onClick={() => { setMode('login'); setLoginError(''); setRegError(''); setGoogleSignUpData(null); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: mode === 'login' && !googleSignUpData ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.75rem',
                cursor: 'pointer',
                borderBottom: mode === 'login' && !googleSignUpData ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <LogIn size={16} /> Log In
            </button>
            <button
              onClick={() => { setMode('register'); setLoginError(''); setRegError(''); setGoogleSignUpData(null); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: mode === 'register' && !googleSignUpData ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.75rem',
                cursor: 'pointer',
                borderBottom: mode === 'register' && !googleSignUpData ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={16} /> Create Account
            </button>
          </div>

          {googleSignUpData ? (
            /* ================= GOOGLE COMPLETE PROFILE FORM ================= */
            <form onSubmit={handleGoogleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <img 
                  src={googleSignUpData.avatar} 
                  alt={googleSignUpData.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Complete Your Profile</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Signed in as <strong>{googleSignUpData.email}</strong>
                  </p>
                </div>
              </div>

              {regError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {regError}
                </div>
              )}

              {/* Role Select */}
              <div className="form-group">
                <label className="form-label">Registration Role</label>
                <div className="switcher" style={{ width: '100%', display: 'flex' }}>
                  <button
                    type="button"
                    className={`switcher-btn ${role === 'poster' ? 'active' : ''}`}
                    onClick={() => setRole('poster')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    💼 Employer
                  </button>
                  <button
                    type="button"
                    className={`switcher-btn ${role === 'worker' ? 'active' : ''}`}
                    onClick={() => setRole('worker')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    🛠️ Specialist
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aditi Rao"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Google verified)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    value={googleSignUpData.email}
                    disabled
                    style={{ paddingLeft: '2.5rem', opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              {/* Location Input */}
              <div className="form-group">
                <label className="form-label">Location (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleGetLocation}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    📍 Use Current Location
                  </button>
                  {locationStatus && (
                    <span style={{ fontSize: '0.75rem', color: locationStatus.includes('✓') ? 'var(--accent)' : 'var(--danger)' }}>
                      {locationStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Specialist Specific Fields */}
              {role === 'worker' && (
                <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="form-group">
                    <label className="form-label">Skill Domains (Select all that apply)</label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      maxHeight: '130px',
                      overflowY: 'auto',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {categories.map((c) => {
                        const active = regSkills.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleSkill(c)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.7rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid',
                              borderColor: active ? 'var(--primary)' : 'var(--border-color)',
                              backgroundColor: active ? 'var(--primary-light)' : 'rgba(0, 0, 0, 0.2)',
                              color: active ? 'var(--primary)' : 'var(--text-primary)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              transition: 'all 0.15s'
                            }}
                          >
                            {active && <Wrench size={10} />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Certifications (Comma-separated)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Govt Certified Plumber, OSHA Safety"
                        value={regCertifications}
                        onChange={(e) => setRegCertifications(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Award size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setGoogleSignUpData(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
                  Create Profile
                </button>
              </div>
            </form>
          ) : mode === 'login' ? (
            /* ================= LOG IN FORM ================= */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome Back</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Log in to manage active bids, hire specialists, or view your earnings.
              </p>

              {loginError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {loginError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                Log In Account
              </button>

              {/* GOOGLE SIGN IN BUTTON */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                </div>

                {renderGoogleButton('google-signin-btn-real-login')}
              </div>

              {/* DEMO ACCOUNTS LINK */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
                  Quick Demo Logins
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={async () => {
                      setLoginEmail(mockUsers.poster.email);
                      setLoginPassword('demo1234');
                      await onLogin(mockUsers.poster.email);
                    }}
                    style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    💼 <strong style={{ color: 'var(--primary)' }}>Vikas Sharma</strong> (Employer / Poster)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={async () => {
                      setLoginEmail(mockUsers.worker.email);
                      setLoginPassword('demo1234');
                      await onLogin(mockUsers.worker.email);
                    }}
                    style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    🛠️ <strong style={{ color: 'var(--accent)' }}>Rajesh Kumar</strong> (Electrician / Technician)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ================= CREATE ACCOUNT FORM ================= */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Register Account</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Join LaborLink to hire experts or offer your technical expertise.
              </p>

              {regError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {regError}
                </div>
              )}

              {/* Role Select in Register */}
              <div className="form-group">
                <label className="form-label">Registration Role</label>
                <div className="switcher" style={{ width: '100%', display: 'flex' }}>
                  <button
                    type="button"
                    className={`switcher-btn ${role === 'poster' ? 'active' : ''}`}
                    onClick={() => setRole('poster')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    💼 Employer
                  </button>
                  <button
                    type="button"
                    className={`switcher-btn ${role === 'worker' ? 'active' : ''}`}
                    onClick={() => setRole('worker')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    🛠️ Specialist
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aditi Rao"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              {/* Location Input */}
              <div className="form-group">
                <label className="form-label">Location (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleGetLocation}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    📍 Use Current Location
                  </button>
                  {locationStatus && (
                    <span style={{ fontSize: '0.75rem', color: locationStatus.includes('✓') ? 'var(--accent)' : 'var(--danger)' }}>
                      {locationStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Specialist Specific Fields */}
              {role === 'worker' && (
                <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="form-group">
                    <label className="form-label">Skill Domains (Select all that apply)</label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      maxHeight: '130px',
                      overflowY: 'auto',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {categories.map((c) => {
                        const active = regSkills.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleSkill(c)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.7rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid',
                              borderColor: active ? 'var(--primary)' : 'var(--border-color)',
                              backgroundColor: active ? 'var(--primary-light)' : 'rgba(0, 0, 0, 0.2)',
                              color: active ? 'var(--primary)' : 'var(--text-primary)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              transition: 'all 0.15s'
                            }}
                          >
                            {active && <Wrench size={10} />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Certifications (Comma-separated)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Govt Certified Plumber, OSHA Safety"
                        value={regCertifications}
                        onChange={(e) => setRegCertifications(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Award size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                Register Profile
              </button>

              {/* GOOGLE SIGN IN BUTTON FOR REGISTER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                </div>

                {renderGoogleButton('google-signin-btn-real-register')}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ================= SIMULATED GOOGLE ACCOUNT CHOOSER MODAL ================= */}
      {showSimulatedGoogleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}>
          <div className="glass-panel animate-scale-in" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '2.5rem',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-2xl)',
            borderRadius: 'var(--radius-2xl)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <svg viewBox="0 0 24 24" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>

            {!showCustomSimForm ? (
              <>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Choose an account</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.75rem 0' }}>
                  to continue to <strong style={{ color: 'var(--primary)' }}>LaborLink</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                  {/* Account List item 1: Vikas */}
                  <button
                    type="button"
                    onClick={() => handleSimulatedGoogleSelect({
                      email: 'vikas@sharmaconstruction.com',
                      name: 'Vikas Sharma',
                      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
                      alt="Vikas"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Vikas Sharma</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vikas@sharmaconstruction.com</div>
                    </div>
                  </button>

                  {/* Account List item 2: Rajesh */}
                  <button
                    type="button"
                    onClick={() => handleSimulatedGoogleSelect({
                      email: 'rajesh.electrician@gmail.com',
                      name: 'Rajesh Kumar',
                      avatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150',
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150"
                      alt="Rajesh"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Rajesh Kumar</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>rajesh.electrician@gmail.com</div>
                    </div>
                  </button>

                  {/* Account List item 3: Create Custom Mock Account */}
                  <button
                    type="button"
                    onClick={() => setShowCustomSimForm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}>
                      +
                    </div>
                    <div style={{ color: 'var(--text-primary)' }}>Use another Google Account</div>
                  </button>
                </div>
              </>
            ) : (
              /* Custom Simulated Form */
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!simEmail || !simName) return;
                await handleSimulatedGoogleSelect({
                  email: simEmail.trim().toLowerCase(),
                  name: simName.trim(),
                  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(simName.trim())}`,
                });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, textAlign: 'center', color: 'var(--text-primary)' }}>Google Account Simulation</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                  Enter details to simulate Google Account authorization.
                </p>

                <div className="form-group">
                  <label className="form-label">Google Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@gmail.com"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Jane Doe"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowCustomSimForm(false)}
                    style={{ flex: 1 }}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Simulate Sign-in
                  </button>
                </div>
              </form>
            )}

            {/* Footer Cancel */}
            {!showCustomSimForm && (
              <button
                type="button"
                onClick={() => setShowSimulatedGoogleModal(false)}
                className="btn btn-outline"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
