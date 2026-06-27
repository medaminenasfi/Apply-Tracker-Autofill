export type ApplicationStatus = 'applied' | 'interview' | 'accepted' | 'rejected';
export type ApplicationSource = 'manual' | 'extension' | 'ghost';

export interface Application {
  _id: string;
  userId: string;
  companyName: string;
  position: string;
  jobUrl: string;
  status: ApplicationStatus;
  dateApplied: string;
  deadline?: string;
  source?: ApplicationSource;
  cvUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  text: string;
  applicationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CvDocument {
  _id: string;
  label: string;
  filename: string;
  url: string;
  uploadedAt: string;
  isPrimary: boolean;
}

export interface CvListResponse {
  cvs: CvDocument[];
  primaryCvId: string | null;
  hasCV: boolean;
  cvUrl: string | null;
  filename: string | null;
}

export interface User {
  _id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  countryCode?: string;
  university?: string;
  address?: string;
  skills?: string[];
  linkedin?: string;
  portfolio?: string;
  plan?: 'free' | 'pro' | 'advanced';
  subscriptionStatus?: string;
  profilePictureUrl?: string;
  profilePictureUpdatedAt?: number;
  cvUrl?: string | null;
  cvs?: CvDocument[];
  primaryCvId?: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}
