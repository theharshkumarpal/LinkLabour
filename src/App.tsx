import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { JobCard } from './components/JobCard';
import { PostJobModal } from './components/PostJobModal';
import { ApplicationsList } from './components/ApplicationsList';
import { ProfileModal } from './components/ProfileModal';
import { ChatDrawer } from './components/ChatDrawer';
import type { Job, Application, User, Message, Review, JobCategory, Notification } from './types';
import { MOCK_USERS } from './mockData';
import { Plus, Search, Filter, Compass, MessageSquare, List, Map } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { api } from './services/api';
import { connectSocket, disconnectSocket, joinChat, leaveChat } from './services/socket';
import { calculateDistance } from './utils/distance';
import { useToast } from './components/ToastProvider';
import { EmptyState } from './components/EmptyState';
import { SkeletonJobCard } from './components/SkeletonJobCard';
import { NotificationsPage } from './components/NotificationsPage';

function App() {
  // --- LocalStorage State Initialization ---
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ll_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const { addToast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ll_logged_in') === 'true';
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ll_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const role = currentUser ? currentUser.role : 'worker';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const navigate = useNavigate();

  // --- UI Layout & Modal States ---
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeApplicationsJob, setActiveApplicationsJob] = useState<Job | null>(null);
  const [activeTechnicianProfile, setActiveTechnicianProfile] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<{ jobId: string; partnerId: string; partnerName: string } | null>(null);

  // --- Worker Search Filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetSlider, setBudgetSlider] = useState<number>(1000); // Default to max budget to show all opportunities
  const [distanceSlider, setDistanceSlider] = useState<number>(200); // Default to max distance
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'budget' | 'newest'>('nearest');
  const [minRating, setMinRating] = useState<number>(0);
  const [durationFilter, setDurationFilter] = useState<'all' | 'quick' | 'singleday' | 'multiday'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // --- Poster Search Filters ---
  const [posterWorkerSearch, setPosterWorkerSearch] = useState('');
  const [posterMaxDistance, setPosterMaxDistance] = useState<number>(50);

  // --- Hiring review popup state ---
  const [reviewPopup, setReviewPopup] = useState<{ job: Job; rating: number; comment: string } | null>(null);

  // --- Worker Apply modal state ---
  const [applyPopup, setApplyPopup] = useState<{ job: Job; bid: number; pitch: string } | null>(null);

  // --- Sync State to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('ll_theme', theme);
    document.documentElement.classList.remove('dark-mode', 'light-mode');
    document.documentElement.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');
  }, [theme]);

  // --- Backend Sync Functions ---
  const refreshPublicData = async () => {
    try {
      const [jobsRes, usersRes] = await Promise.all([
        api.getJobs(),
        api.getWorkers()
      ]);
      setJobs(jobsRes);
      setRegisteredUsers(usersRes);
      setIsInitialLoading(false);

      const reviewsData = await api.getReviews();
      setReviews(reviewsData);

      if (localStorage.getItem('ll_logged_in') === 'true') {
        const appsData = await api.getApplications();
        setApplications(appsData);
      }
    } catch (err) {
      console.error("Error synchronizing public data:", err);
      setIsInitialLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!currentUser) return;
    try {
      const profile = await api.getUser(currentUser.id);
      setCurrentUser(profile);
      localStorage.setItem('ll_current_user', JSON.stringify(profile));

      const notifs = await api.getNotifications(currentUser.id);
      setNotifications(notifs);
    } catch (err) {
      console.error("Error synchronizing user data:", err);
    }
  };

  const refreshData = async () => {
    await refreshPublicData();
    await refreshUserData();
  };

  useEffect(() => {
    refreshPublicData();
    const interval = setInterval(refreshPublicData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      refreshUserData();
      const interval = setInterval(refreshUserData, 15000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser?.id]);

  // --- Socket.io Setup ---
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const socketInstance = connectSocket(currentUser.id);

      socketInstance.on('message', (newMsg: Message) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });

      socketInstance.on('notification', (newNotif: Notification) => {
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        
        // Push visual toast alert
        addToast(newNotif.text, 'success');

        // Automatically trigger data refresh to synchronize tables/dashboards
        refreshData();
      });

      return () => {
        disconnectSocket();
      };
    } else {
      disconnectSocket();
    }
  }, [isLoggedIn, currentUser?.id]);

  // Join/leave socket chat room when activeChat changes
  useEffect(() => {
    if (activeChat) {
      joinChat(activeChat.jobId);
      return () => {
        leaveChat(activeChat.jobId);
      };
    }
  }, [activeChat?.jobId]);

  // Chat message fetch
  useEffect(() => {
    if (activeChat) {
      const loadChatMessages = async () => {
        try {
          const msgs = await api.getMessages(activeChat.jobId);
          setMessages(msgs);
        } catch (err) {
          console.error("Failed to load chat messages:", err);
        }
      };
      loadChatMessages();
      const interval = setInterval(loadChatMessages, 15000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  // --- Auth Handlers ---
  const handleLogin = async (email: string): Promise<boolean> => {
    try {
      const res = await api.login(email);
      if (res.success) {
        setCurrentUser(res.user);
        setIsLoggedIn(true);
        localStorage.setItem('ll_logged_in', 'true');
        localStorage.setItem('ll_current_user', JSON.stringify(res.user));
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        setTimeout(refreshData, 100);
        return true;
      } else {
        addToast('Invalid login credentials', 'error');
      }
    } catch (err) {
      addToast('Login request failed. Please try again later.', 'error');
      console.error("Login request failed:", err);
    }
    return false;
  };

  const handleRegister = async (userData: Omit<User, 'id' | 'rating' | 'reviewCount' | 'completedJobs' | 'balance'>) => {
    try {
      const res = await api.register(userData);
      if (res.success) {
        setCurrentUser(res.user);
        setIsLoggedIn(true);
        localStorage.setItem('ll_logged_in', 'true');
        localStorage.setItem('ll_current_user', JSON.stringify(res.user));
        addToast(`Account created! Welcome, ${res.user.name}`, 'success');
        setTimeout(refreshData, 100);
      } else {
        addToast('Registration failed', 'error');
      }
    } catch (err) {
      addToast('Registration failed due to a server error', 'error');
      console.error("Registration failed:", err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('ll_logged_in');
    localStorage.removeItem('ll_current_user');
    addToast('Successfully logged out', 'success');
    window.location.href = '/';
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');


  const markNotificationsAsRead = async () => {
    if (!currentUser) return;
    try {
      await api.markNotificationsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  // --- Poster Job Handlers ---
  const handlePostJobSubmit = async (jobData: Omit<Job, 'id' | 'posterId' | 'posterName' | 'posterRating' | 'status' | 'createdDate'>) => {
    if (!currentUser) return;
    try {
      const res = await api.postJob({
        ...jobData,
        posterId: currentUser.id,
        posterName: currentUser.name,
        posterRating: currentUser.rating,
      });
      if (res.success) {
        addToast('Your job has been posted successfully!', 'success');
        refreshData();
        setShowPostModal(false);
      } else {
        addToast('Failed to post job. Please check the details.', 'error');
      }
    } catch (err) {
      addToast('An error occurred while posting your job.', 'error');
      console.error("Failed to post job:", err);
    }
  };

  const handleAcceptBid = async (app: Application) => {
    if (!currentUser) return;
    if (currentUser.balance < app.bidAmount) {
      addToast('Insufficient wallet balance to secure this project.', 'error');
      return;
    }
    try {
      const res = await api.acceptProposal(app.id);
      if (res.success) {
        setActiveApplicationsJob(null);
        refreshData();
        addToast('Proposal accepted!', 'success');
      }
    } catch (err) {
      console.error("Failed to accept proposal:", err);
      addToast('Failed to accept proposal.', 'error');
    }
  };

  // --- Worker Job Handlers ---
  const handleApplyClick = (job: Job) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setApplyPopup({ job, bid: job.budget, pitch: '' });
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyPopup || !currentUser) return;
    try {
      const res = await api.submitProposal({
        jobId: applyPopup.job.id,
        jobTitle: applyPopup.job.title,
        workerId: currentUser.id,
        workerName: currentUser.name,
        workerAvatar: currentUser.avatar,
        workerRating: currentUser.rating,
        bidAmount: applyPopup.bid,
        message: applyPopup.pitch.trim(),
      });
      if (res.success) {
        setApplyPopup(null);
        refreshData();
        addToast('Proposal submitted successfully!', 'success');
      } else {
        addToast('Failed to submit proposal.', 'error');
      }
    } catch (err) {
      addToast('An error occurred while submitting your proposal.', 'error');
      console.error("Failed to submit proposal:", err);
    }
  };

  // --- Worker Complete Task & Poster Escrow Release ---
  const handleWorkerCompleteTask = async (job: Job) => {
    try {
      const res = await api.completeJob(job.id);
      if (res.success) {
        addToast('Task marked as complete!', 'success');
        refreshData();
      }
    } catch (err) {
      addToast('Failed to complete task.', 'error');
      console.error("Failed to complete task:", err);
    }
  };

  const handlePosterReleasePayment = (job: Job) => {
    setReviewPopup({ job, rating: 5, comment: '' });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewPopup || !currentUser) return;
    try {
      const { job, rating, comment } = reviewPopup;
      const res = await api.releaseEscrow(
        job.id,
        rating,
        comment,
        currentUser.name
      );
      if (res.success) {
        addToast('Review submitted and Escrow payment released successfully!', 'success');
        setReviewPopup(null);
        refreshData();
      } else {
        addToast('Failed to release escrow payment.', 'error');
      }
    } catch (err) {
      addToast('An error occurred releasing the escrow.', 'error');
      console.error(err);
    }
  };

  // --- Dynamic Chat Drawer & Auto-Response AI Simulation ---
  const handleSendMessage = async (jobId: string, content: string, receiverId: string) => {
    if (!currentUser) return;
    try {
      const res = await api.sendMessage({
        jobId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId,
        content,
      });
      if (res.success) {
        setMessages(prev => {
          if (prev.some(m => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };


  // --- Filtering & Queries ---
  const handleSelectCategory = (cat: JobCategory | 'All') => {
    setSelectedCategory(cat);
  };

  // Filter open jobs for Worker Find Work listing
  const filteredOpenJobs = jobs
    .map(job => {
      const distance = calculateDistance(
        currentUser?.latitude, currentUser?.longitude,
        job.latitude, job.longitude
      );
      return { ...job, distance };
    })
    .filter(job => {
      const isCategoryMatch = selectedCategory === 'All' || job.category === selectedCategory;
      const isSearchMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const isBudgetMatch = job.budget <= budgetSlider;
      const isDistanceMatch = job.distance === undefined || job.distance <= distanceSlider;
      const isRatingMatch = job.posterRating >= minRating;
      const isDurationMatch = (() => {
        if (durationFilter === 'all') return true;
        const durLower = (job.duration || '').toLowerCase();
        if (durationFilter === 'quick') {
          return durLower.includes('hour') || durLower.includes('mins');
        }
        if (durationFilter === 'singleday') {
          return durLower.includes('1 day') || durLower.includes('one day') || durLower.includes('1-day') || (durLower.includes('day') && !durLower.includes('days'));
        }
        if (durationFilter === 'multiday') {
          return durLower.includes('days') || durLower.includes('week') || durLower.includes('month');
        }
        return true;
      })();
      const isOpen = job.status === 'open';
      return isCategoryMatch && isSearchMatch && isBudgetMatch && isDistanceMatch && isRatingMatch && isDurationMatch && isOpen;
    })
    .sort((a, b) => {
      if (sortBy === 'budget') {
        return b.budget - a.budget;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime();
      }
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  // Filter posted jobs for Poster Dashboard view
  const posterJobs = jobs.filter(job => currentUser && job.posterId === currentUser.id);
  const workerHiredJobs = jobs.filter(job => currentUser && job.workerId === currentUser.id);
  const workerAppliedJobs = applications.filter(app => currentUser && app.workerId === currentUser.id);

  // --- Nearby Map View initialization ---
  useEffect(() => {
    if (viewMode !== 'map') return;

    // Leaflet must be loaded from global window object
    const L = (window as any).L;
    if (!L) {
      console.error("Leaflet is not loaded on window.");
      return;
    }

    const mapContainer = document.getElementById('jobs-map');
    if (!mapContainer) return;

    // Find the center coords: either current user location, or default Delhi NCR
    const centerLat = currentUser?.latitude || 28.5355;
    const centerLng = currentUser?.longitude || 77.3910;

    // Create map
    const map = L.map('jobs-map').setView([centerLat, centerLng], 11);

    // Add premium tiles
    const isDark = document.documentElement.classList.contains('dark-mode') || theme === 'dark';
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Custom pins
    const customMarkerHtml = (budget: number) => `
      <div class="custom-map-pin" style="
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: white;
        padding: 5px 9px;
        border-radius: 12px;
        font-size: 0.725rem;
        font-weight: 800;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>$${budget}</span>
      </div>
    `;

    // Center marker
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 14px;
          height: 14px;
          background: var(--warning);
          border: 2.5px solid white;
          border-radius: 50%;
          box-shadow: 0 0 12px var(--warning);
        "></div>
      `,
      className: 'user-pin',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    L.marker([centerLat, centerLng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong style="color: #111827;">Your Location</strong>')
      .openPopup();

    const markerGroup: any[] = [];

    // Filtered jobs markers
    filteredOpenJobs.forEach(job => {
      if (job.latitude === undefined || job.longitude === undefined || job.latitude === null || job.longitude === null) return;

      const icon = L.divIcon({
        html: customMarkerHtml(job.budget),
        className: 'job-pin',
        iconAnchor: [18, 18]
      });

      const marker = L.marker([job.latitude, job.longitude], { icon })
        .addTo(map);

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'var(--font-sans)';
      popupContent.style.fontSize = '0.85rem';
      popupContent.style.color = '#1f2937';
      popupContent.style.padding = '4px';
      popupContent.style.width = '240px';
      popupContent.innerHTML = `
        <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px; color: var(--primary);">${job.title}</div>
        <div style="font-size: 0.75rem; color: #6b7280; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Category: ${job.category}</div>
        <p style="margin: 0 0 8px 0; font-size: 0.8rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">${job.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e7eb; padding-top: 8px;">
          <span style="font-weight: 800; color: var(--accent);">$${job.budget}</span>
          <button class="popup-apply-btn" style="
            background: var(--primary);
            color: white;
            border: none;
            padding: 5px 10px;
            font-weight: 700;
            font-size: 0.75rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: opacity var(--transition-fast);
          ">Apply Now</button>
        </div>
      `;

      popupContent.querySelector('.popup-apply-btn')?.addEventListener('click', () => {
        handleApplyClick(job);
      });

      marker.bindPopup(popupContent);
      markerGroup.push([job.latitude, job.longitude]);
    });

    if (markerGroup.length > 0) {
      map.fitBounds(markerGroup, { padding: [40, 40] });
    }

    return () => {
      map.remove();
    };
  }, [viewMode, filteredOpenJobs, theme, currentUser?.latitude, currentUser?.longitude]);

  // Filter local specialists for Poster
  const localSpecialists = registeredUsers
    .filter(u => u.role === 'worker')
    .map(worker => {
      const distance = calculateDistance(
        currentUser?.latitude, currentUser?.longitude,
        worker.latitude, worker.longitude
      );
      return { ...worker, distance };
    })
    .filter(worker => {
      const isSearchMatch = worker.name.toLowerCase().includes(posterWorkerSearch.toLowerCase()) ||
                            worker.skills.some(s => s.toLowerCase().includes(posterWorkerSearch.toLowerCase()));
      const isDistanceMatch = worker.distance === undefined || worker.distance <= posterMaxDistance;
      // Also ensure we don't show the poster themselves if they somehow ended up in workers
      return isSearchMatch && isDistanceMatch && worker.id !== currentUser?.id;
    })
    .sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  const renderMainLayout = (children: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar
        currentRole={currentUser ? role : 'worker'}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        notifications={currentUser ? notifications : []}
        markNotificationsAsRead={markNotificationsAsRead}
        setView={(v) => navigate(v === 'landing' ? '/' : '/dashboard')}
        onLogout={currentUser ? handleLogout : undefined}
        onLoginClick={() => navigate('/login')}
        onRegisterClick={() => navigate('/register')}
      />

      <main className="container animate-fade-in" style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        <div>&copy; {new Date().getFullYear()} LaborLink Marketplace Inc. Simulated Escrow Ledger active.</div>
        <div style={{ marginTop: '4px' }}>Designed for blue-collar contractors and certified technicians.</div>
      </footer>
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/login" element={
          <AuthPage 
            onLogin={async (email) => {
              const success = await handleLogin(email);
              if (success) {
                navigate('/dashboard');
              }
              return success;
            }} 
            onRegister={(userData) => {
              handleRegister(userData);
              navigate('/dashboard');
            }} 
            mockUsers={MOCK_USERS} 
            initialMode="login"
            onClose={() => navigate('/')}
          />
        } />
        <Route path="/register" element={
          <AuthPage 
            onLogin={async (email) => {
              const success = await handleLogin(email);
              if (success) {
                navigate('/dashboard');
              }
              return success;
            }} 
            onRegister={(userData) => {
              handleRegister(userData);
              navigate('/dashboard');
            }} 
            mockUsers={MOCK_USERS} 
            initialMode="register"
            onClose={() => navigate('/')}
          />
        } />
        
        <Route path="/" element={
          renderMainLayout(
            <LandingHero
              jobs={jobs}
              role={role}
              setView={(v) => navigate(v === 'landing' ? '/' : '/dashboard')}
              onSelectCategory={handleSelectCategory}
              onOpenPostModal={currentUser ? () => setShowPostModal(true) : () => navigate('/login')}
            />
          )
        } />
        
        <Route path="/dashboard" element={
          currentUser ? (
          renderMainLayout(
            <div>
            {/* Dashboard Sub Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
            }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>
                  {role === 'poster' ? 'Contractor Dashboard' : 'Specialist Workspace'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Manage bids, coordinate jobs, release escrow milestones.
                </p>
              </div>

              {role === 'poster' && (
                <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
                  <Plus size={16} /> Post A New Job
                </button>
              )}
            </div>

            {/* If Poster is actively reviewing applications */}
            {activeApplicationsJob ? (
              <ApplicationsList
                job={activeApplicationsJob}
                applications={applications.filter(a => a.jobId === activeApplicationsJob.id)}
                onBack={() => setActiveApplicationsJob(null)}
                onHire={handleAcceptBid}
                onChat={(jobId, workerId, workerName) => {
                  setActiveChat({ jobId, partnerId: workerId, partnerName: workerName });
                }}
                onViewProfile={(workerId) => {
                  const techUser = registeredUsers.find(t => t.id === workerId) || currentUser;
                  setActiveTechnicianProfile(techUser);
                }}
              />
            ) : role === 'poster' ? (
              /* ================== POSTER DASHBOARD ================== */
              <div>
                {/* Statistics panel */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2.5rem',
                }}>
                  {[
                    { label: 'Total Job Requests', value: posterJobs.length, color: 'var(--primary)' },
                    { label: 'Pending Proposals', value: applications.filter(a => posterJobs.some(j => j.id === a.jobId) && a.status === 'pending').length, color: 'var(--warning)' },
                    { label: 'Projects in Progress', value: posterJobs.filter(j => j.status === 'in_progress').length, color: 'var(--info)' },
                    { label: 'Completed Services', value: posterJobs.filter(j => j.status === 'completed').length, color: 'var(--accent)' }
                  ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>{s.label}</span>
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: s.color, marginTop: '2px', display: 'block' }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Job Lists segmented by status */}
                {['open', 'in_progress', 'completed'].map((status) => {
                  const statusJobs = posterJobs.filter(j => j.status === status);
                  const statusTitles = {
                    open: 'Open for Bidding / Reviewing Bids',
                    in_progress: 'Active Projects in Progress',
                    completed: 'Successfully Finalized Services'
                  };
                  return (
                    <div key={status} style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        {statusTitles[status as 'open' | 'in_progress' | 'completed']} ({statusJobs.length})
                      </h3>
                      
                      {isInitialLoading ? (
                        <div className="grid-cards">
                          <SkeletonJobCard />
                          <SkeletonJobCard />
                          <SkeletonJobCard />
                        </div>
                      ) : statusJobs.length === 0 ? (
                        <EmptyState 
                          title="No Jobs Found" 
                          message={`You don't have any jobs in the '${statusTitles[status as 'open' | 'in_progress' | 'completed']}' category.`}
                          iconType="inbox"
                        />
                      ) : (
                        <div className="grid-cards">
                          {statusJobs.map(job => (
                            <JobCard
                              key={job.id}
                              job={job}
                              role="poster"
                              currentUserId={currentUser ? currentUser.id : ''}
                              hasApplied={false}
                              applicationCount={applications.filter(a => a.jobId === job.id).length}
                              hasReview={reviews.some(r => r.jobId === job.id)}
                              onApplyClick={() => {}}
                              onReviewApplicationsClick={(j) => setActiveApplicationsJob(j)}
                              onCompleteClick={handlePosterReleasePayment}
                              onChatClick={(jobId, partnerId, partnerName) => {
                                setActiveChat({ jobId, partnerId, partnerName });
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ================== POSTER: DISCOVER LOCAL SPECIALISTS ================== */}
                <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                        Discover Local Specialists
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Find verified technicians near your location</p>
                    </div>

                    {/* Filters for Poster */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', width: '200px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Search skills or name..."
                          value={posterWorkerSearch}
                          onChange={(e) => setPosterWorkerSearch(e.target.value)}
                          style={{ paddingLeft: '2.25rem', fontSize: '0.8rem', padding: '0.5rem 0.5rem 0.5rem 2.25rem' }}
                        />
                        <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Distance:</span>
                        <input
                          type="range"
                          min={5}
                          max={200}
                          step={5}
                          value={posterMaxDistance}
                          onChange={(e) => setPosterMaxDistance(Number(e.target.value))}
                          style={{ width: '100px', accentColor: 'var(--primary)' }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', minWidth: '40px' }}>
                          {posterMaxDistance} mi
                        </span>
                      </div>
                    </div>
                  </div>

                  {isInitialLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      <SkeletonJobCard />
                      <SkeletonJobCard />
                      <SkeletonJobCard />
                    </div>
                  ) : localSpecialists.length === 0 ? (
                    <EmptyState 
                      title="No Specialists Nearby" 
                      message={`We couldn't find any technicians within ${posterMaxDistance} miles matching your search.`}
                      iconType="search"
                    />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      {localSpecialists.map(worker => (
                        <div key={worker.id} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={worker.avatar} alt={worker.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{worker.name}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700 }}>
                                ★ {worker.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({worker.reviewCount} jobs)</span>
                              </div>
                            </div>
                          </div>
                          
                          {worker.distance !== undefined && (
                            <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                              <Compass size={14} color="var(--info)" />
                              <strong>{worker.distance} mi</strong> away
                            </div>
                          )}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {worker.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '999px', fontWeight: 600 }}>
                                {skill}
                              </span>
                            ))}
                            {worker.skills.length > 3 && (
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', color: 'var(--text-muted)' }}>+{worker.skills.length - 3}</span>
                            )}
                          </div>

                          <button 
                            className="btn btn-outline" 
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', marginTop: 'auto' }}
                            onClick={() => setActiveTechnicianProfile(worker)}
                          >
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ================== WORKER DASHBOARD ================== */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                {/* Top Search & Filter dropdown Bar */}
                <div>
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search open jobs (e.g. leak, Gurgaon, switch)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem', height: '45px' }}
                      />
                      <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                    </div>
                    
                    <button 
                      type="button"
                      className={`btn ${showFilterDropdown ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '45px', padding: '0 1.25rem' }}
                    >
                      <Filter size={16} /> Advanced Filters {showFilterDropdown ? '▲' : '▼'}
                    </button>

                    {/* View mode toggle: List vs Map */}
                    <div style={{
                      display: 'flex',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      height: '45px',
                      backgroundColor: 'rgba(0,0,0,0.15)'
                    }}>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        style={{
                          background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                          color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                          border: 'none',
                          padding: '0 1.25rem',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all var(--transition-normal)'
                        }}
                      >
                        <List size={16} /> List
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('map')}
                        style={{
                          background: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                          color: viewMode === 'map' ? 'white' : 'var(--text-secondary)',
                          border: 'none',
                          padding: '0 1.25rem',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all var(--transition-normal)'
                        }}
                      >
                        <Map size={16} /> Map
                      </button>
                    </div>

                    {currentUser && (
                      <div className="glass-panel" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        padding: '0 1rem', 
                        height: '45px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)'
                      }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wallet: <strong style={{ color: 'var(--accent)' }}>${currentUser.balance}</strong></span>
                        <button 
                          type="button"
                          className="btn btn-outline" 
                          onClick={() => addToast('Earnings withdrawal request submitted to administrator.', 'success')}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                        >
                          Withdraw
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Filters Panel */}
                  {showFilterDropdown && (
                    <div className="glass-panel animate-slide-up" style={{ 
                      padding: '1.5rem', 
                      border: '1px solid var(--border-color)', 
                      marginBottom: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1.5rem',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      {/* Category Selector Buttons */}
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Job Domain / Skillsets</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <button
                            type="button" 
                            className={`btn ${selectedCategory === 'All' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSelectedCategory('All')}
                            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                          >
                            All Skillsets
                          </button>
                          {['Electrical', 'Plumbing', 'AC/HVAC', 'Masonry', 'Cleaning', 'Carpentry', 'Painting', 'Other'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              className={`btn ${selectedCategory === c ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => setSelectedCategory(c as JobCategory)}
                              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Budget Slider */}
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="form-label">Max Budget</label>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)' }}>${budgetSlider}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setBudgetSlider(prev => Math.max(50, prev - 25))}
                            style={{ padding: '0.2rem 0.5rem', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min={50}
                            max={1000}
                            step={25}
                            value={budgetSlider}
                            onChange={(e) => setBudgetSlider(Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setBudgetSlider(prev => Math.min(1000, prev + 25))}
                            style={{ padding: '0.2rem 0.5rem', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          <span>$50</span>
                          <span>$1000</span>
                        </div>
                      </div>

                      {/* Distance Slider */}
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="form-label">Max Distance</label>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--info)' }}>{distanceSlider} mi</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setDistanceSlider(prev => Math.max(5, prev - 5))}
                            style={{ padding: '0.2rem 0.5rem', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min={5}
                            max={200}
                            step={5}
                            value={distanceSlider}
                            onChange={(e) => setDistanceSlider(Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--info)', cursor: 'pointer' }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setDistanceSlider(prev => Math.min(200, prev + 5))}
                            style={{ padding: '0.2rem 0.5rem', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          <span>5 mi</span>
                          <span>200 mi</span>
                        </div>
                      </div>

                      {/* Sort Order Selector */}
                      <div className="form-group">
                        <label className="form-label">Sort Feed By</label>
                        <select
                          className="form-select"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                        >
                          <option value="nearest">📍 Nearest First</option>
                          <option value="budget">💰 Highest Pay / Budget</option>
                          <option value="newest">📅 Newest Posted Gigs</option>
                        </select>
                      </div>

                      {/* Job Duration Filter */}
                      <div className="form-group">
                        <label className="form-label">Gig Duration</label>
                        <select
                          className="form-select"
                          value={durationFilter}
                          onChange={(e) => setDurationFilter(e.target.value as any)}
                        >
                          <option value="all">🕒 All Durations</option>
                          <option value="quick">⚡ Quick Gigs (Hours)</option>
                          <option value="singleday">📅 Single Day Gigs (1 Day)</option>
                          <option value="multiday">🗓️ Multi-day Projects</option>
                        </select>
                      </div>

                      {/* Min Contractor Rating Slider */}
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="form-label">Min Contractor Rating</label>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--warning)' }}>★ {minRating > 0 ? minRating.toFixed(1) : 'Any'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setMinRating(prev => Math.max(0, prev - 0.5))}
                            style={{ padding: '0.2rem 0.5rem', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={5}
                            step={0.5}
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--warning)', cursor: 'pointer' }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setMinRating(prev => Math.min(5, prev + 0.5))}
                            style={{ padding: '0.2rem 0.5rem', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          <span>Any (0.0)</span>
                          <span>5.0 Stars</span>
                        </div>
                      </div>

                      {/* Apply & Reset Buttons */}
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        borderTop: '1px solid var(--border-color)', 
                        paddingTop: '1rem' 
                      }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('All');
                            setBudgetSlider(1000);
                            setDistanceSlider(200);
                            setSortBy('nearest');
                            setMinRating(0);
                            setDurationFilter('all');
                          }}
                          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          Reset Defaults
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowFilterDropdown(false)}
                          style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                        >
                          Apply & Close Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main listings feed */}
                <div style={{ width: '100%' }}>
                  {/* Active / Hired Tasks section */}
                  {workerHiredJobs.length > 0 && (
                    <div style={{ marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        ⚡ Assigned Tasks In Progress ({workerHiredJobs.length})
                      </h3>
                      <div className="grid-cards">
                        {workerHiredJobs.map(job => (
                          <JobCard
                            key={job.id}
                            job={job}
                            role="worker"
                            currentUserId={currentUser ? currentUser.id : ''}
                            hasApplied={true}
                            applicationCount={0}
                            hasReview={reviews.some(r => r.jobId === job.id)}
                            onApplyClick={() => {}}
                            onReviewApplicationsClick={() => {}}
                            onCompleteClick={handleWorkerCompleteTask}
                            onChatClick={(jobId, partnerId, partnerName) => {
                              setActiveChat({ jobId, partnerId, partnerName });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Open Feed / Map View */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      {viewMode === 'map' ? '🗺️ Nearby Jobs Map' : '💼 Open Jobs Matching Filters'} ({filteredOpenJobs.length})
                    </h3>
                    
                    {viewMode === 'map' ? (
                      <div id="jobs-map" style={{ 
                        height: "450px", 
                        borderRadius: "var(--radius-xl)", 
                        border: "1px solid var(--border-color)", 
                        zIndex: 10, 
                        width: '100%', 
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-lg)'
                      }}></div>
                    ) : isInitialLoading ? (
                      <div className="grid-cards">
                        <SkeletonJobCard />
                        <SkeletonJobCard />
                        <SkeletonJobCard />
                      </div>
                    ) : filteredOpenJobs.length === 0 ? (
                      <EmptyState 
                        title="No Matching Jobs" 
                        message="Try expanding your search criteria or increasing your maximum distance to find more opportunities."
                        iconType="search"
                      />
                    ) : (
                      <div className="grid-cards">
                        {filteredOpenJobs.map(job => (
                          <JobCard
                            key={job.id}
                            job={job}
                            role="worker"
                            currentUserId={currentUser ? currentUser.id : ''}
                            hasApplied={workerAppliedJobs.some(a => a.jobId === job.id)}
                            applicationCount={0}
                            hasReview={reviews.some(r => r.jobId === job.id)}
                            onApplyClick={handleApplyClick}
                            onReviewApplicationsClick={() => {}}
                            onCompleteClick={() => {}}
                            onChatClick={() => {}}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Applied Listings Track */}
                  {workerAppliedJobs.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        📋 My Submitted Proposals ({workerAppliedJobs.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {workerAppliedJobs.map(app => {
                          const appJob = jobs.find(j => j.id === app.jobId);
                          return (
                            <div
                              key={app.id}
                              style={{
                                display: 'flex',
                                justifySelf: 'stretch',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem 1.25rem',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-lg)',
                                flexWrap: 'wrap',
                                gap: '1rem',
                              }}
                            >
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                  Bid Quote: ${app.bidAmount}
                                </span>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0' }}>
                                  {app.jobTitle}
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Applied on: {app.date}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {app.status === 'pending' && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700, backgroundColor: 'var(--warning-light)', padding: '4px 10px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                                    Awaiting Response
                                  </span>
                                )}
                                {app.status === 'accepted' && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, backgroundColor: 'var(--accent-light)', padding: '4px 10px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                                    Proposal Accepted
                                  </span>
                                )}
                                {app.status === 'rejected' && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, backgroundColor: 'var(--danger-light)', padding: '4px 10px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                                    Closed / Declined
                                  </span>
                                )}
                                
                                {appJob && (
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                      setActiveChat({
                                        jobId: app.jobId,
                                        partnerId: appJob.posterId,
                                        partnerName: appJob.posterName,
                                      });
                                    }}
                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                  >
                                    <MessageSquare size={12} /> Chat
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/notifications" element={
          currentUser ? (
            renderMainLayout(
              <NotificationsPage 
                notifications={notifications}
                markNotificationsAsRead={markNotificationsAsRead}
              />
            )
          ) : <Navigate to="/login" replace />
        } />
      </Routes>

      {/* ================== DYNAMIC FLOATING POPUPS & DRAWER INTERFACES ================== */}

      {/* Post Job Modal Form */}
      {showPostModal && (
        <PostJobModal
          onClose={() => setShowPostModal(false)}
          onSubmit={handlePostJobSubmit}
        />
      )}

      {/* Worker Apply Bid Modal Popup */}
      {applyPopup && (
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
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'left',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              Submit Proposal for Task
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Submit your bid quote. The client set their maximum budget ceiling at <strong>${applyPopup.job.budget}</strong>.
            </p>

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Your Bid Price ($)</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>Recommended: ${applyPopup.job.budget}</span>
                </div>
                <input
                  type="number"
                  className="form-input"
                  min={10}
                  value={applyPopup.bid}
                  onChange={(e) => setApplyPopup({ ...applyPopup, bid: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proposal Cover Pitch</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Introduce yourself. Highlight your experience doing similar work and list tools you'll bring..."
                  value={applyPopup.pitch}
                  onChange={(e) => setApplyPopup({ ...applyPopup, pitch: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setApplyPopup(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Submit Proposal Bidding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Poster Escrow Release & Review Technician popup */}
      {reviewPopup && (
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
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'left',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              Approve Project & Release Payout
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Releasing approval will deposit the locked Escrow funds of <strong>${reviewPopup.job.budget}</strong> directly to {reviewPopup.job.workerName}'s wallet balance.
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Star Rating Select */}
              <div className="form-group">
                <label className="form-label">Rate Specialist (1 - 5 Stars)</label>
                <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewPopup({ ...reviewPopup, rating: star })}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: star <= reviewPopup.rating ? 'var(--warning)' : 'var(--text-muted)',
                        padding: 0,
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="form-group">
                <label className="form-label">Review Comment</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Share details of your experience with this specialist. Their work quality, punctuality, and tools..."
                  value={reviewPopup.comment}
                  onChange={(e) => setReviewPopup({ ...reviewPopup, comment: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setReviewPopup(null)}>
                  Close
                </button>
                <button type="submit" className="btn btn-accent">
                  Approve Task & Deposit Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technician Profile Details Modal */}
      {activeTechnicianProfile && (
        <ProfileModal
          technician={activeTechnicianProfile}
          reviews={reviews.filter(r => {
            const j = jobs.find(job => job.id === r.jobId);
            return j?.workerId === activeTechnicianProfile.id;
          })}
          onClose={() => setActiveTechnicianProfile(null)}
        />
      )}

      {/* Slide-out Interactive Chat Drawer */}
      {activeChat && (
        <ChatDrawer
          jobId={activeChat.jobId}
          partnerId={activeChat.partnerId}
          partnerName={activeChat.partnerName}
          currentUserId={currentUser ? currentUser.id : ''}
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={() => setActiveChat(null)}
        />
      )}
    </>
  );
}

export default App;
