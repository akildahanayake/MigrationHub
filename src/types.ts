export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'USER';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  whatsapp?: string;
  gender: string;
  age: number;
  dob: string;
  nationality: string;
  address: string;
  currentLivingCountry: string;
  mailingAddress?: string;
  maritalStatus?: string;
  photoUrl?: string;
  registrationDate: string;
  
  // Client Specific
  targetCountry?: string;
  visaType?: string;
  educationLevel?: string;
  englishScore?: string;
  passportNumber?: string;
  applicationStatus?: string;
  assignedAgentId?: string;
  requestedAgentId?: string;
  
  // Agent Specific
  agencyId?: string;
  agencyName?: string;
  licenseNumber?: string;
  countriesSupported?: string[];
  visasSupported?: string[];
  languagesSpoken?: string[];
  yearsExperience?: number;
  bio?: string;
  availability?: AvailabilitySlot[];
  rating?: number;
  successRate?: number;
}

export interface AvailabilitySlot {
  day: string;
  slots: string[];
}

export interface Agency {
  id: string;
  name: string;
  ownerId: string;
  subscriptionPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  revenue: number;
  totalClients: number;
  totalAgents: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  joinedAt: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  licenseNumber?: string;
}

export interface Document {
  id: string;
  userId: string;
  uploadedById: string;
  name: string;
  category: string;
  status: 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CORRECTION_NEEDED';
  uploadedAt: string;
  fileUrl: string;
  fileType: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}

export interface Meeting {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  type: 'ZOOM' | 'WHATSAPP' | 'GOOGLE_MEET';
  startTime: string;
  duration: number;
  link: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'RESCHEDULE_REQUESTED' | 'DECLINED' | 'COMPLETED';
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  description: string;
  date: string;
  method: 'STRIPE' | 'PAYPAL' | 'CARD' | 'CASH' | 'BANK_TRANSFER';
}
