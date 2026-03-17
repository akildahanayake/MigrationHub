export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'USER';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  password?: string; // For mock authentication
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
  applicationStatus?: ApplicationStatus;
  assignedAgentId?: string;
  requestedAgentId?: string; // For Agent Selection flow
  
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

export type ApplicationStatus = string;
export type DocumentCategory = string;

export interface AvailabilitySlot {
  day: string; // e.g., 'Monday'
  slots: string[]; // e.g., ['09:00', '10:00', '14:00']
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

export interface LibraryDocument {
  id: string;
  name: string;
  category: string;
  uploadedAt: string;
  fileUrl: string;
  fileType: string;
  uploadedById: string;
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
  duration: number; // in minutes
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'MEETING' | 'MESSAGE' | 'DOCUMENT' | 'PAYMENT' | 'SYSTEM' | 'AGENT_ASSIGNMENT';
  linkTab?: string;
  senderName?: string;
  senderRole?: string;
}

export interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
  enabled: boolean;
}

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  enabled: boolean;
}

export interface PaymentGateway {
  id: 'stripe' | 'paypal' | 'bank' | 'cash';
  name: string;
  enabled: boolean;
  description: string;
  icon: string;
  fields: {
    label: string;
    key: string;
    placeholder: string;
    type: 'text' | 'password' | 'textarea';
    value: string;
  }[];
  sandboxMode?: boolean;
}
