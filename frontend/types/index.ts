export type ApplicationStatus = 'Applied' | 'Pending' | 'Interview' | 'Accepted' | 'Rejected';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  university?: string;
  linkedin?: string;
  portfolio?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  company: string;
  position: string;
  url?: string;
  dateApplied: string;
  note?: string;
  status: ApplicationStatus;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
