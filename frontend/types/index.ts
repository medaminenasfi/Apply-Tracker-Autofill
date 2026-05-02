export type ApplicationStatus = 'applied' | 'interview' | 'accepted' | 'rejected';

export interface Application {
  _id: string;
  userId: string;
  companyName: string;
  position: string;
  jobUrl?: string;
  status: ApplicationStatus;
  dateApplied?: string;
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

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  countryCode?: string;
  university?: string;
  linkedin?: string;
  portfolio?: string;
  profilePictureUrl?: string;
  profilePictureUpdatedAt?: number;
  role: 'user' | 'admin';
  createdAt: string;
}
