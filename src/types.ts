export type JobCategory = 'Plumbing' | 'Masonry' | 'Electrical' | 'AC/HVAC' | 'Cleaning' | 'Carpentry' | 'Painting' | 'Other';

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  posterId: string;
  posterName: string;
  posterRating: number;
  budget: number;
  location: string;
  date: string; // Target date for work
  status: 'open' | 'in_progress' | 'completed';
  workerId?: string;
  workerName?: string;
  requirements: string[];
  duration: string; // estimated time like "1 Day", "3 Hours"
  createdDate: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Frontend only distance calculation
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerRating: number;
  workerCompletionRate: number; // e.g. 98 for 98%
  bidAmount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'poster' | 'worker';
  rating: number;
  reviewCount: number;
  completedJobs: number;
  skills: string[];
  certifications: string[];
  balance: number; // Simulated waller balance
  latitude?: number;
  longitude?: number;
  distance?: number; // Frontend only distance calculation
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface Review {
  id: string;
  jobId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerRole: 'poster' | 'worker';
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  read: boolean;
  date: string;
}
