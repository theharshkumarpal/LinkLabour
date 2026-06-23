import type { Job, Application, User, Message, Review } from '../types';

const API_BASE = 'http://localhost:5050/api';

const fetchJson = async (endpoint: string, options?: RequestInit) => {
  let token = '';
  try {
    const saved = localStorage.getItem('ll_current_user');
    if (saved) {
      token = JSON.parse(saved).id || '';
    }
  } catch (err) {
    console.error('Failed to parse user token from localStorage:', err);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API error: ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Auth
  async login(email: string): Promise<{ success: boolean; user: User }> {
    return fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async register(userData: Omit<User, 'id' | 'rating' | 'reviewCount' | 'completedJobs' | 'balance' | 'distance'>): Promise<{ success: boolean; user: User }> {
    return fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async googleLogin(payload: { credential?: string; email?: string; name?: string; avatar?: string; isMock?: boolean }): Promise<{ success: boolean; isGoogleSignUp?: boolean; email?: string; name?: string; avatar?: string; user?: User }> {
    return fetchJson('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Users
  async getUser(id: string): Promise<User> {
    return fetchJson(`/users/${id}`);
  },

  async getWorkers(): Promise<User[]> {
    return fetchJson('/users/workers');
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    return fetchJson('/jobs');
  },

  async postJob(jobData: Omit<Job, 'id' | 'posterId' | 'posterName' | 'posterRating' | 'status' | 'createdDate' | 'distance'> & { posterId: string; posterName: string; posterRating: number }): Promise<{ success: boolean; job: Job }> {
    return fetchJson('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async completeJob(jobId: string): Promise<{ success: boolean; job: Job }> {
    return fetchJson(`/jobs/${jobId}/complete`, {
      method: 'PUT',
    });
  },

  async releaseEscrow(jobId: string, rating: number, comment: string, reviewerName: string): Promise<{ success: boolean; job: Job }> {
    return fetchJson(`/jobs/${jobId}/release-escrow`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment, reviewerName }),
    });
  },

  // Proposals
  async getApplications(): Promise<Application[]> {
    return fetchJson('/applications');
  },

  async submitProposal(appData: Omit<Application, 'id' | 'workerCompletionRate' | 'status' | 'date'>): Promise<{ success: boolean; application: Application }> {
    return fetchJson('/applications', {
      method: 'POST',
      body: JSON.stringify(appData),
    });
  },

  async acceptProposal(appId: string): Promise<{ success: boolean; application: Application }> {
    return fetchJson(`/applications/${appId}/accept`, {
      method: 'POST',
    });
  },

  // Messages
  async getMessages(jobId: string): Promise<Message[]> {
    return fetchJson(`/messages/${jobId}`);
  },

  async sendMessage(msgData: Omit<Message, 'id' | 'timestamp'>): Promise<{ success: boolean; message: Message }> {
    return fetchJson('/messages', {
      method: 'POST',
      body: JSON.stringify(msgData),
    });
  },

  // Reviews
  async getReviews(workerId?: string): Promise<Review[]> {
    if (workerId) {
      return fetchJson(`/reviews/${workerId}`);
    }
    return fetchJson('/reviews');
  },

  // Notifications
  async getNotifications(userId: string): Promise<Array<{ id: string; userId: string; text: string; read: boolean; date: string }>> {
    return fetchJson(`/notifications/${userId}`);
  },

  async markNotificationsRead(userId: string): Promise<{ success: boolean }> {
    return fetchJson('/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
};
