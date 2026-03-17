import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  Globe, 
  CreditCard,
  Building2,
  Menu,
  X,
  Search,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';
import { User, Document, Message, Meeting, Payment, Agency, ApplicationStatus, PaymentGateway, Notification, EmailTemplate, EmailJSConfig, LibraryDocument } from './types';
import { mockUsers, mockDocuments, mockMessages, mockMeetings, mockPayments, mockAgencies, mockLibraryDocuments } from './mockData';
import emailjs from '@emailjs/browser';
import { cn } from './utils/cn';
import { getProfilePic } from './utils/user';
import { Auth } from './components/Auth';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import Agents from './components/Agents';
import Documents from './components/Documents';
import Chat from './components/Chat';
import Meetings from './components/Meetings';
import Payments from './components/Payments';
import Agencies from './components/Agencies';
import Profiles from './components/Profiles';
import Settings from './components/Settings';

// --- Context & State Management ---
interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface StoreContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  payments: Payment[];
  agencies: Agency[];
  setAgencies: React.Dispatch<React.SetStateAction<Agency[]>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedUserProfileId: string | null;
  setSelectedUserProfileId: (id: string | null) => void;
  selectedChatContactId: string | null;
  setSelectedChatContactId: (id: string | null) => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  assignAgent: (userId: string, agentId: string) => void;
  updateMeetingStatus: (meetingId: string, status: Meeting['status']) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  deleteMeeting: (meetingId: string) => void;
  updateApplicationStatus: (userId: string, status: ApplicationStatus) => void;
  updateDocumentStatus: (docId: string, status: Document['status']) => void;
  addDocument: (doc: Omit<Document, 'id'>) => void;
  rejectAgentRequest: (userId: string) => void;
  requestAgent: (agentId: string) => void;
  acceptClient: (userId: string) => void;
  addUser: (user: Omit<User, 'id' | 'registrationDate'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  deleteDocument: (docId: string) => void;
  deletePayment: (paymentId: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  libraryDocuments: LibraryDocument[];
  setLibraryDocuments: React.Dispatch<React.SetStateAction<LibraryDocument[]>>;
  addLibraryDocument: (doc: Omit<LibraryDocument, 'id'>) => void;
  deleteLibraryDocument: (docId: string) => void;
  destinations: string[];
  setDestinations: React.Dispatch<React.SetStateAction<string[]>>;
  currencies: string[];
  setCurrencies: React.Dispatch<React.SetStateAction<string[]>>;
  visaTypes: string[];
  setVisaTypes: React.Dispatch<React.SetStateAction<string[]>>;
  documentTypes: string[];
  setDocumentTypes: React.Dispatch<React.SetStateAction<string[]>>;
  pipelineStages: string[];
  setPipelineStages: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  notifications: Notification[];
  addNotification: (userId: string, title: string, message: string, type: Notification['type'], linkTab?: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (pref: 'light' | 'dark' | 'system') => void;
  notificationSettings: { email: boolean; push: boolean; dashboardAlerts: boolean; emailAlerts: boolean };
  setNotificationSettings: (settings: { email: boolean; push: boolean; dashboardAlerts: boolean; emailAlerts: boolean }) => void;
  privacySettings: { profilePublic: boolean };
  setPrivacySettings: (settings: { profilePublic: boolean }) => void;
  paymentGateways: PaymentGateway[];
  setPaymentGateways: React.Dispatch<React.SetStateAction<PaymentGateway[]>>;
  emailTemplates: EmailTemplate[];
  setEmailTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
  emailJSConfig: EmailJSConfig;
  setEmailJSConfig: React.Dispatch<React.SetStateAction<EmailJSConfig>>;
  queuedAdminNotifications: Notification[];
  sendAdminDailySummary: () => Promise<void>;
  backupSystem: () => void;
  restoreSystem: (data: any) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

// --- Main App Component ---
export default function App() {
  const DB_KEY = 'migratehub_sql_mock_v2';
  const AUTH_KEY = 'migratehub_auth_session';

  const loadData = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(`${DB_KEY}_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [users, setUsers] = useState<User[]>(() => loadData('users', mockUsers));
  const [documents, setDocuments] = useState<Document[]>(() => loadData('documents', mockDocuments));
  const [messages, setMessages] = useState<Message[]>(() => loadData('messages', mockMessages));
  const [meetings, setMeetings] = useState<Meeting[]>(() => loadData('meetings', mockMeetings));
  const [payments, setPayments] = useState<Payment[]>(() => loadData('payments', mockPayments));
  const [agencies, setAgencies] = useState<Agency[]>(() => loadData('agencies', mockAgencies));
  const [libraryDocuments, setLibraryDocuments] = useState<LibraryDocument[]>(() => loadData('library_documents', mockLibraryDocuments));
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [selectedChatContactId, setSelectedChatContactId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [destinations, setDestinations] = useState<string[]>(() => loadData('destinations', ['Australia', 'Canada', 'UK', 'USA', 'New Zealand', 'Germany', 'France', 'Japan', 'South Korea', 'Singapore']));
  const [currencies, setCurrencies] = useState<string[]>(() => loadData('currencies', ['USD', 'AUD', 'GBP', 'EUR', 'CAD', 'NZD', 'LKR', 'INR', 'JPY', 'CNY']));
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => loadData('selectedCurrency', 'USD'));
  const [visaTypes, setVisaTypes] = useState<string[]>(() => loadData('visaTypes', ['Student Visa', 'Travel Visa', 'Migration Visa', 'Work Visa', 'Temporary Stay Visa', 'Permanent Residency', 'Partner Visa', 'Business Visa']));
  const [documentTypes, setDocumentTypes] = useState<string[]>(() => loadData('documentTypes', ['Passport', 'Academic certificate', 'National ID', 'Visa Application', 'Bank Statement', 'School Application', 'Agreements', 'Offer Letter', 'Other']));
  const [pipelineStages, setPipelineStages] = useState<string[]>(() => loadData('pipelineStages', ['REGISTRATION', 'DOCUMENT_COLLECTION', 'ELIGIBILITY_CHECK', 'APPLICATION_SUBMITTED', 'VISA_PROCESSING', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED']));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadData('notifications', []));

  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('migratehub_theme_preference');
    return (saved as 'light' | 'dark' | 'system') || 'light';
  });

  const [notificationSettings, setNotificationSettings] = useState(() => loadData('notificationSettings', { email: true, push: false, dashboardAlerts: true, emailAlerts: true }));
  const [privacySettings, setPrivacySettings] = useState(() => loadData('privacySettings', { profilePublic: true }));

  const defaultEmailTemplates: EmailTemplate[] = [
    { id: 'welcome', type: 'Welcome Mail', subject: 'Welcome to MigrateHub', body: 'Hello {{name}}, welcome to MigrateHub! We are excited to help you with your migration journey.', enabled: true },
    { id: 'password_change', type: 'Password Change', subject: 'Password Changed Successfully', body: 'Hello {{name}}, your password has been changed successfully.', enabled: true },
    { id: 'new_meeting', type: 'New Meeting', subject: 'New Meeting Scheduled', body: 'Hello {{name}}, a new meeting "{{title}}" has been scheduled for {{date}} at {{time}}.', enabled: true },
    { id: 'reschedule_meeting', type: 'Reschedule Meeting', subject: 'Meeting Rescheduled', body: 'Hello {{name}}, your meeting "{{title}}" has been rescheduled to {{date}} at {{time}}.', enabled: true },
    { id: 'payment_request', type: 'Payment Request', subject: 'New Invoice Generated', body: 'Hello {{name}}, a new invoice for {{amount}} {{currency}} has been generated for: {{description}}.', enabled: true },
    { id: 'payment_received', type: 'Payment Received', subject: 'Payment Confirmation', body: 'Hello {{name}}, we have received your payment of {{amount}} {{currency}} for: {{description}}.', enabled: true },
    { id: 'doc_approved', type: 'Document Approved', subject: 'Document Approved', body: 'Hello {{name}}, your document "{{docName}}" has been approved.', enabled: true },
    { id: 'doc_rejected', type: 'Document Rejected', subject: 'Document Rejected', body: 'Hello {{name}}, your document "{{docName}}" has been rejected. Reason: {{reason}}', enabled: true },
    { id: 'agent_assign', type: 'Agent Assigned', subject: 'Agent Assigned to Your Case', body: 'Hello {{name}}, agent {{agentName}} has been assigned to your case.', enabled: true },
    { id: 'new_message', type: 'New Message', subject: 'New Message Received', body: 'Hello {{name}}, you have received a new message from {{senderName}}.', enabled: true },
  ];

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => loadData('email_templates', defaultEmailTemplates));
  const [emailJSConfig, setEmailJSConfig] = useState<EmailJSConfig>(() => loadData('emailjs_config', {
    serviceId: '',
    templateId: '',
    publicKey: '',
    enabled: false
  }));
  const [queuedAdminNotifications, setQueuedAdminNotifications] = useState<Notification[]>(() => loadData('queued_admin_notifications', []));

  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>(() => loadData('gateways', [
    { 
      id: 'stripe', name: 'Stripe Integration', enabled: true, icon: '💳',
      desc: 'Connect your agency to Stripe for instant credit card and Apple/Google Pay collections.', 
      fields: [
        { label: 'Publishable Key', key: 'pub_key', placeholder: 'pk_live_...', type: 'text', value: '' },
        { label: 'Secret Key', key: 'secret_key', placeholder: 'sk_live_...', type: 'password', value: '' },
        { label: 'Webhook Signing Secret', key: 'webhook_secret', placeholder: 'whsec_...', type: 'password', value: '' }
      ]
    },
    { 
      id: 'paypal', name: 'PayPal Global', enabled: true, icon: '🅿️',
      desc: 'Allow clients to pay via PayPal balance or connected bank accounts worldwide.', 
      fields: [
        { label: 'Client ID', key: 'client_id', placeholder: 'Enter PayPal Client ID', type: 'text', value: '' },
        { label: 'Secret Key', key: 'secret_key', placeholder: 'Enter PayPal Secret Key', type: 'password', value: '' }
      ],
      sandboxMode: true
    },
    { 
      id: 'bank', name: 'Direct Bank Transfer', enabled: true, icon: '🏦',
      desc: 'Configure bank details for clients who prefer manual wire transfers.', 
      fields: [
        { label: 'Bank Name', key: 'bank_name', placeholder: 'e.g. Commonwealth Bank', type: 'text', value: '' },
        { label: 'Account Name', key: 'acc_name', placeholder: 'Alpha Migration Services', type: 'text', value: '' },
        { label: 'Account Number', key: 'acc_num', placeholder: 'xxxx xxxx xxxx xxxx', type: 'text', value: '' },
        { label: 'SWIFT / BIC Code', key: 'swift', placeholder: 'Enter SWIFT code', type: 'text', value: '' }
      ]
    },
    { 
      id: 'cash', name: 'In-Office Cash', enabled: true, icon: '💵',
      desc: 'Provide instructions for physical cash payments at your agency locations.', 
      fields: [
        { label: 'Payment Instructions', key: 'instructions', placeholder: 'e.g. Visit Level 22, Migration Tower...', type: 'textarea', value: '' }
      ]
    }
  ]));

  useEffect(() => {
    if (!isReady) return;
    const saveData = (k: string, d: any) => localStorage.setItem(`${DB_KEY}_${k}`, JSON.stringify(d));
    saveData('users', users);
    saveData('documents', documents);
    saveData('messages', messages);
    saveData('meetings', meetings);
    saveData('payments', payments);
    saveData('agencies', agencies);
    saveData('library_documents', libraryDocuments);
    saveData('destinations', destinations);
    saveData('currencies', currencies);
    saveData('selectedCurrency', selectedCurrency);
    saveData('visaTypes', visaTypes);
    saveData('documentTypes', documentTypes);
    saveData('pipelineStages', pipelineStages);
    saveData('gateways', paymentGateways);
    saveData('notifications', notifications);
    saveData('notificationSettings', notificationSettings);
    saveData('privacySettings', privacySettings);
    saveData('email_templates', emailTemplates);
    saveData('emailjs_config', emailJSConfig);
    saveData('queued_admin_notifications', queuedAdminNotifications);
  }, [users, documents, messages, meetings, payments, agencies, libraryDocuments, destinations, currencies, selectedCurrency, visaTypes, documentTypes, pipelineStages, paymentGateways, notificationSettings, privacySettings, emailTemplates, emailJSConfig, queuedAdminNotifications, isReady]);

  useEffect(() => {
    const savedSession = localStorage.getItem(AUTH_KEY);
    if (savedSession) {
      try {
        const { userId, expiry } = JSON.parse(savedSession);
        if (expiry > Date.now()) {
          const user = users.find(u => u.id === userId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      } catch (e) { localStorage.removeItem(AUTH_KEY); }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        userId: currentUser.id,
        expiry: Date.now() + 1000 * 60 * 60 * 24
      }));
    } else if (isReady) {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [isAuthenticated, currentUser, isReady]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.fullName}`);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    localStorage.removeItem(AUTH_KEY);
    showToast('Signed out successfully');
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.setProperty('color-scheme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.setProperty('color-scheme', 'light');
      }
    };

    if (themePreference === 'system') {
      const systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(systemMediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      systemMediaQuery.addEventListener('change', handler);
      cleanup = () => systemMediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(themePreference === 'dark');
    }

    localStorage.setItem('migratehub_theme_preference', themePreference);
    return () => cleanup?.();
  }, [themePreference]);

  const assignAgent = (userId: string, agentId: string) => {
    const agent = users.find(u => u.id === agentId);
    const client = users.find(u => u.id === userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, assignedAgentId: agentId, requestedAgentId: undefined } : u));
    addNotification(userId, "Agent Assigned", `Agent ${agent?.fullName} has been assigned to your case.`, 'AGENT_ASSIGNMENT', 'profile', {
      agentName: agent?.fullName || 'Assigned Agent'
    });
    addNotification(agentId, "New Client Assigned", `You have been assigned to client ${client?.fullName}.`, 'AGENT_ASSIGNMENT', 'clients', {
      name: agent?.fullName || 'Agent',
      clientName: client?.fullName || 'Client'
    });
    showToast("Agent assigned successfully");
  };

  const updateMeetingStatus = (meetingId: string, status: Meeting['status']) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status } : m));
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      const recipientId = currentUser.id === meeting.agentId ? meeting.userId : meeting.agentId;
      addNotification(recipientId, "Meeting Update", `Meeting "${meeting.title}" status changed to ${status}.`, 'MEETING', 'meetings', {
        title: meeting.title,
        date: new Date(meeting.startTime).toLocaleDateString(),
        time: new Date(meeting.startTime).toLocaleTimeString(),
        status: status
      });
    }
    showToast(`Meeting ${status.toLowerCase()}`);
  };

  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, ...updates } : m));
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      const recipientId = currentUser.id === meeting.agentId ? meeting.userId : meeting.agentId;
      addNotification(recipientId, "Meeting Rescheduled", `Meeting "${meeting.title}" has been updated.`, 'MEETING', 'meetings', {
        title: meeting.title,
        date: new Date(updates.startTime || meeting.startTime).toLocaleDateString(),
        time: new Date(updates.startTime || meeting.startTime).toLocaleTimeString()
      });
    }
    showToast("Meeting updated");
  };

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = { ...meeting, id: `meet-${Date.now()}` };
    setMeetings(prev => [...prev, newMeeting]);
    const recipientId = currentUser.id === meeting.agentId ? meeting.userId : meeting.agentId;
    addNotification(recipientId, "New Meeting Scheduled", `A new meeting "${meeting.title}" has been scheduled.`, 'MEETING', 'meetings', {
      title: meeting.title,
      date: new Date(meeting.startTime).toLocaleDateString(),
      time: new Date(meeting.startTime).toLocaleTimeString()
    });
  };

  const deleteMeeting = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      const recipientId = currentUser.id === meeting.agentId ? meeting.userId : meeting.agentId;
      addNotification(recipientId, "Meeting Cancelled", `Meeting "${meeting.title}" has been removed.`, 'MEETING', 'meetings', {
        title: meeting.title
      });
    }
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
    showToast("Meeting deleted");
  };

  const updateApplicationStatus = (userId: string, status: ApplicationStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, applicationStatus: status } : u));
    addNotification(userId, "Application Status Updated", `Your application status has been updated to ${status.replace('_', ' ')}.`, 'SYSTEM', 'dashboard', {
      status: status.replace('_', ' ')
    });
    showToast("Application status updated");
  };

  const updateDocumentStatus = (docId: string, status: Document['status']) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status } : d));
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      addNotification(doc.userId, status === 'APPROVED' ? "Document Approved" : "Document Rejected", `Document "${doc.name}" status changed to ${status}.`, 'DOCUMENT', 'documents', {
        docName: doc.name,
        reason: status === 'REJECTED' ? 'Please check comments' : ''
      });
    }
    showToast(`Document status: ${status}`);
  };

  const rejectAgentRequest = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, requestedAgentId: undefined } : u));
    showToast("Agent request rejected");
  };

  const requestAgent = (agentId: string) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, requestedAgentId: agentId } : u));
    
    // Notify all admins
    users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').forEach(admin => {
      addNotification(admin.id, "New Agent Request", `${currentUser.fullName} has requested to be assigned to agent ${users.find(u => u.id === agentId)?.fullName}.`, 'AGENT_ASSIGNMENT', 'clients', {
        clientName: currentUser.fullName,
        agentName: users.find(u => u.id === agentId)?.fullName || 'Agent'
      });
    });
    
    showToast("Request sent to admin for approval!", "success");
  };

  const acceptClient = (userId: string) => {
    updateApplicationStatus(userId, 'DOCUMENT_COLLECTION');
    showToast("Client accepted");
  };

  const addUser = (userData: Omit<User, 'id' | 'registrationDate'>) => {
    const newUser: User = { ...userData, id: Math.random().toString(36).substr(2, 9), registrationDate: new Date().toISOString() };
    setUsers(prev => [newUser, ...prev]);
    showToast("User added successfully");
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    showToast("Profile updated successfully");
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.role === 'USER') {
      // Delete all records on that user
      setDocuments(prev => prev.filter(d => d.userId !== userId));
      setMeetings(prev => prev.filter(m => m.userId !== userId));
      setMessages(prev => prev.filter(m => m.senderId !== userId && m.receiverId !== userId));
      setPayments(prev => prev.filter(p => p.userId !== userId));
      // Remove the user
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else if (userToDelete.role === 'AGENT') {
      // Delete only agent data (meetings, messages)
      setMeetings(prev => prev.filter(m => m.agentId !== userId));
      setMessages(prev => prev.filter(m => m.senderId !== userId && m.receiverId !== userId));
      
      // Do NOT delete assigned user details.
      // Assigned user should be available again to choose an agent from find agent.
      setUsers(prev => prev.filter(u => u.id !== userId).map(u => {
        if (u.assignedAgentId === userId || u.requestedAgentId === userId) {
          return { 
            ...u, 
            assignedAgentId: undefined, 
            requestedAgentId: undefined,
            // Reset status to allow choosing a new agent if they were already in a stage that implies having an agent
            applicationStatus: 'REGISTRATION' 
          };
        }
        return u;
      }));
    } else {
      // Admin or other roles
      setUsers(prev => prev.filter(u => u.id !== userId));
    }

    if (currentUser?.id === userId) logout();
    showToast(`${userToDelete.role.replace('_', ' ')} deleted successfully`);
  };

  const addDocument = (doc: Omit<Document, 'id'>) => {
    const newDoc: Document = { ...doc, id: `doc-${Date.now()}` };
    setDocuments(prev => [newDoc, ...prev]);
    
    // If client uploads, notify agent
    const client = users.find(u => u.id === doc.userId);
    if (client?.assignedAgentId) {
      addNotification(client.assignedAgentId, "New Document Uploaded", `${client.fullName} uploaded a new document: ${doc.name}.`, 'DOCUMENT', 'documents', {
        docName: doc.name,
        clientName: client.fullName
      });
    }
  };

  const deleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') {
        addNotification(doc.userId, "Document Removed", `Your document "${doc.name}" has been removed by an administrator.`, 'DOCUMENT', 'documents', {
          docName: doc.name
        });
      }
    }
    setDocuments(prev => prev.filter(d => d.id !== docId));
    showToast("Document deleted");
  };

  const addLibraryDocument = (doc: Omit<LibraryDocument, 'id'>) => {
    const newDoc: LibraryDocument = {
      ...doc,
      id: `lib-${Date.now()}`
    };
    setLibraryDocuments(prev => [newDoc, ...prev]);
    showToast('Library document added');
  };

  const deleteLibraryDocument = (docId: string) => {
    setLibraryDocuments(prev => prev.filter(d => d.id !== docId));
    showToast('Library document deleted');
  };

  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      addNotification(payment.userId, "Invoice Cancelled", `Invoice for "${payment.description}" has been removed.`, 'PAYMENT', 'payments', {
        description: payment.description
      });
    }
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    showToast("Payment deleted");
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: Math.random().toString(36).substr(2, 9) };
    setPayments(prev => [newPayment, ...prev]);
    addNotification(payment.userId, "New Invoice", `A new invoice for ${payment.amount} ${payment.currency} has been generated.`, 'PAYMENT', 'payments', {
      amount: payment.amount.toString(),
      currency: payment.currency,
      description: payment.description
    });
    showToast("Invoice created");
  };

  const updatePayment = (paymentId: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, ...updates } : p));
    const payment = payments.find(p => p.id === paymentId);
    if (payment && updates.status === 'PAID') {
      // Notify admins/agents if needed, but for now notify user of confirmation
      addNotification(payment.userId, "Payment Received", `Your payment for "${payment.description}" has been confirmed.`, 'PAYMENT', 'payments', {
        amount: payment.amount.toString(),
        currency: payment.currency,
        description: payment.description
      });
    }
    showToast("Payment updated");
  };

  const addNotification = (userId: string, title: string, message: string, type: Notification['type'], linkTab?: string, emailData?: Record<string, string>) => {
    if (!notificationSettings.dashboardAlerts) return;
    
    const baseNotification = {
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      type,
      linkTab,
      senderName: currentUser?.fullName || 'System',
      senderRole: currentUser?.role || 'SYSTEM'
    };

    const newNotifications: Notification[] = [];
    
    // Add for the intended recipient
    newNotifications.push({
      ...baseNotification,
      id: Math.random().toString(36).substr(2, 9),
      userId
    });

    // Handle Email Alerts
    const recipient = users.find(u => u.id === userId);
    if (notificationSettings.emailAlerts && emailJSConfig.enabled && recipient) {
      if (recipient.role === 'USER' || recipient.role === 'AGENT') {
        // Send email immediately for users and agents
        // Determine template based on type
        let templateId = '';
        switch (type) {
          case 'MEETING': templateId = title.includes('Rescheduled') ? 'reschedule_meeting' : 'new_meeting'; break;
          case 'PAYMENT': templateId = title.includes('Invoice') ? 'payment_request' : 'payment_received'; break;
          case 'DOCUMENT': templateId = title.includes('Approved') ? 'doc_approved' : 'doc_rejected'; break;
          case 'AGENT_ASSIGNMENT': templateId = 'agent_assign'; break;
          case 'SYSTEM': templateId = title.includes('Welcome') ? 'welcome' : ''; break;
          default: templateId = '';
        }

        const enrichedData = { 
          name: recipient.fullName,
          senderName: currentUser?.fullName || 'System',
          senderRole: currentUser?.role || 'SYSTEM',
          activity: title,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          ...emailData 
        };

        const template = emailTemplates.find(t => t.id === templateId && t.enabled);
        if (template) {
          sendEmail(recipient, template, enrichedData);
        } else {
          // Fallback to generic if no template found or enabled
          sendEmail(recipient, { subject: title, body: message } as EmailTemplate, enrichedData);
        }
      } else if (recipient.role === 'ADMIN' || recipient.role === 'SUPER_ADMIN') {
        // For admins, we would ideally queue this for a daily summary.
        if (notificationSettings.emailAlerts && emailJSConfig.enabled) {
          setQueuedAdminNotifications(prev => [...prev, { ...baseNotification, id: Math.random().toString(36).substr(2, 9), userId }]);
        }
      }
    }

    // Add for all admins if the recipient is not an admin
    if (recipient && recipient.role !== 'ADMIN' && recipient.role !== 'SUPER_ADMIN') {
      const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
      admins.forEach(admin => {
        if (admin.id !== userId) {
          const adminNotif = {
            ...baseNotification,
            id: Math.random().toString(36).substr(2, 9),
            userId: admin.id
          };
          newNotifications.push(adminNotif);
          
          // Daily summary logic for admins (simulated)
          if (notificationSettings.emailAlerts && emailJSConfig.enabled) {
             setQueuedAdminNotifications(prev => [...prev, adminNotif]);
          }
        }
      });
    }

    setNotifications(prev => [...newNotifications, ...prev]);
  };

  const sendEmail = async (recipient: User, template: EmailTemplate, data: Record<string, string>) => {
    if (!emailJSConfig.serviceId || !emailJSConfig.templateId || !emailJSConfig.publicKey) {
      console.warn('EmailJS not configured');
      return;
    }

    // Replace placeholders in subject and body
    const replacePlaceholders = (text: string) => {
      let result = text;
      Object.entries(data).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
      });
      return result;
    };

    const finalSubject = replacePlaceholders(template.subject);
    const finalBody = replacePlaceholders(template.body);

    try {
      await emailjs.send(
        emailJSConfig.serviceId,
        emailJSConfig.templateId,
        {
          to_name: recipient.fullName,
          to_email: recipient.email,
          subject: finalSubject,
          message: finalBody,
          from_name: 'MigrateHub'
        },
        emailJSConfig.publicKey
      );
      console.log(`Email sent to ${recipient.email}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      showToast("Failed to send email notification", "error");
    }
  };

  const sendAdminDailySummary = async () => {
    if (queuedAdminNotifications.length === 0) {
      showToast("No notifications to summarize", "error");
      return;
    }

    const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
    
    for (const admin of admins) {
      const adminNotifs = queuedAdminNotifications.filter(n => n.userId === admin.id);
      if (adminNotifs.length === 0) continue;

      const summary = adminNotifs.map(n => `- [${n.type}] ${n.title}: ${n.message} (${new Date(n.timestamp).toLocaleString()})`).join('\n');
      
      await sendEmail(admin, { 
        subject: `Daily Activity Summary - ${new Date().toLocaleDateString()}`, 
        body: `Hello {{name}},\n\nHere is the summary of today's activities:\n\n{{summary}}\n\nBest regards,\nMigrateHub Team` 
      } as EmailTemplate, { 
        name: admin.fullName,
        summary: summary
      });
    }

    setQueuedAdminNotifications([]);
    showToast("Daily summary emails sent to all admins", "success");
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const backupSystem = () => {
    const backupData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        users,
        documents,
        messages,
        meetings,
        payments,
        agencies,
        destinations,
        currencies,
        selectedCurrency,
        visaTypes,
        documentTypes,
        pipelineStages,
        paymentGateways,
        notificationSettings,
        privacySettings,
        themePreference
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `migratehub_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("System backup generated successfully");
  };

  const restoreSystem = (backup: any) => {
    try {
      if (!backup || !backup.data) throw new Error("Invalid backup file");
      const { data } = backup;
      
      if (data.users) setUsers(data.users);
      if (data.documents) setDocuments(data.documents);
      if (data.messages) setMessages(data.messages);
      if (data.meetings) setMeetings(data.meetings);
      if (data.payments) setPayments(data.payments);
      if (data.agencies) setAgencies(data.agencies);
      if (data.destinations) setDestinations(data.destinations);
      if (data.currencies) setCurrencies(data.currencies);
      if (data.selectedCurrency) setSelectedCurrency(data.selectedCurrency);
      if (data.visaTypes) setVisaTypes(data.visaTypes);
      if (data.documentTypes) setDocumentTypes(data.documentTypes);
      if (data.pipelineStages) setPipelineStages(data.pipelineStages);
      if (data.paymentGateways) setPaymentGateways(data.paymentGateways);
      if (data.notificationSettings) setNotificationSettings(data.notificationSettings);
      if (data.privacySettings) setPrivacySettings(data.privacySettings);
      if (data.themePreference) setThemePreference(data.themePreference);

      showToast("System restored successfully", "success");
    } catch (e) {
      showToast("Failed to restore system: Invalid format", "error");
    }
  };

  const value: StoreContextType = {
    currentUser: currentUser!, isAuthenticated, login, logout,
    users, setUsers, documents, setDocuments, messages, setMessages, meetings, setMeetings,
    payments, agencies, setAgencies, activeTab, setActiveTab,
    selectedUserProfileId, setSelectedUserProfileId, selectedChatContactId, setSelectedChatContactId,
    toast, showToast, assignAgent, updateMeetingStatus, updateMeeting, deleteMeeting, updateApplicationStatus, updateDocumentStatus,
    rejectAgentRequest, acceptClient, addUser, updateUser, deleteUser, deleteDocument, addPayment, updatePayment,
    libraryDocuments, setLibraryDocuments, addLibraryDocument, deleteLibraryDocument,
    destinations, setDestinations, currencies, setCurrencies, visaTypes, setVisaTypes,
    documentTypes, setDocumentTypes, pipelineStages, setPipelineStages,
    addMeeting, addDocument, deletePayment, requestAgent,
    selectedCurrency, setSelectedCurrency, themePreference, setThemePreference,
    notifications, addNotification, markNotificationAsRead,
    notificationSettings, setNotificationSettings, privacySettings, setPrivacySettings,
    paymentGateways, setPaymentGateways,
    emailTemplates, setEmailTemplates,
    emailJSConfig, setEmailJSConfig,
    queuedAdminNotifications,
    sendAdminDailySummary,
    backupSystem, restoreSystem
  };

  if (!isReady) return null;

  if (!isAuthenticated || !currentUser) {
    return (
      <StoreContext.Provider value={value}>
        <Auth />
        {toast && (
          <div className={cn("fixed bottom-8 right-8 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300", toast.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">{toast.type === 'success' ? '✓' : '!'}</div>
            <p className="font-medium">{toast.message}</p>
          </div>
        )}
      </StoreContext.Provider>
    );
  }

  const selectedUser = users.find(u => u.id === selectedUserProfileId);

  return (
    <StoreContext.Provider value={value}>
      <div className={cn("flex h-screen overflow-hidden font-sans transition-colors duration-300 bg-background text-foreground")}>
        {selectedUser && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedUserProfileId(null)} />
            <div className="relative bg-white dark:bg-slate-950 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 transition-colors scrollbar-hide">
              <button onClick={() => setSelectedUserProfileId(null)} className="absolute top-8 right-8 z-10 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl text-slate-500 dark:text-slate-400 hover:text-vibrant-red border border-slate-100 dark:border-slate-800 transition-all hover:rotate-90">
                <X size={24} strokeWidth={2.5} />
              </button>
              <div className="p-0"><Profiles user={selectedUser} /></div>
            </div>
          </div>
        )}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 z-20 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-lg lg:hidden">
                <Menu size={20} className="text-muted-foreground" />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-foreground capitalize">{activeTab.replace('-', ' ')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full border border-border">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">Demo Role:</span>
                <select className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer" value={currentUser?.id} onChange={(e) => { const selected = users.find(u => u.id === e.target.value); if (selected) { setCurrentUser(selected); setActiveTab('dashboard'); } }}>
                  {users.map(u => <option key={u.id} value={u.id} className="bg-card">{u.fullName} ({u.role})</option>)}
                </select>
              </div>
              <button 
                onClick={() => setActiveTab('notifications')}
                className="p-2 text-muted-foreground hover:text-primary transition-colors relative"
              >
                <Bell size={20} />
                {notifications.filter(n => n.userId === currentUser.id && !n.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-card">
                    {notifications.filter(n => n.userId === currentUser.id && !n.isRead).length}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border text-right hidden sm:block">
                  <p className="text-sm font-bold leading-tight text-foreground">{currentUser?.fullName}</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{currentUser?.role.replace('_', ' ')}</p>
              </div>
              <img src={getProfilePic(currentUser?.fullName || '', currentUser?.photoUrl)} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-border shadow-sm object-cover" />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 lg:p-8"><ContentRenderer /></div>
          {toast && (
            <div className={cn("fixed bottom-8 right-8 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300", toast.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">{toast.type === 'success' ? '✓' : '!'}</div>
              <p className="font-medium">{toast.message}</p>
            </div>
          )}
        </main>
      </div>
    </StoreContext.Provider>
  );
}

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const { activeTab, setActiveTab, currentUser, logout } = useStore();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'clients', label: 'Client CRM', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT'] },
    { id: 'find-agent', label: 'Find Agent', icon: Search, roles: ['USER'] },
    { id: 'agents', label: 'Agents', icon: Globe, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'documents', label: 'Documents', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'messaging', label: 'Messages', icon: MessageSquare, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'meetings', label: 'Meetings', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
    { id: 'agencies', label: 'Agencies', icon: Building2, roles: ['SUPER_ADMIN'] },
    { id: 'profile', label: 'My Profile', icon: UserIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
  ];
  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 lg:hidden z-30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 w-72 z-40 transition-transform duration-300 lg:static lg:translate-x-0 border-r flex flex-col shadow-2xl transition-colors bg-card dark:bg-card/80 dark:backdrop-blur-xl text-card-foreground border-border/50", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-8 flex items-center gap-4 bg-primary/5 border-b border-border/50">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-violet-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/30 group-hover:rotate-12 transition-transform duration-500"><Globe className="text-primary-foreground" size={28} /></div>
          <div><h2 className="text-foreground font-black text-2xl tracking-tighter leading-none">MigrateHub</h2><p className="text-[10px] text-primary mt-1.5 uppercase tracking-[0.2em] font-black opacity-80">Migration CRM</p></div>
        </div>
        <nav className="flex-1 mt-8 px-5 space-y-2 overflow-y-auto scrollbar-hide pb-10">
          {filteredItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setIsOpen(false); }} className={cn("w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden", activeTab === item.id ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]" : "hover:bg-primary/10 text-muted-foreground hover:text-foreground hover:translate-x-1")}>
              <item.icon size={20} className={cn("transition-all stroke-[2.5px] relative z-10", activeTab === item.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary group-hover:scale-110")} />
              <span className="font-black text-sm tracking-tight relative z-10 uppercase tracking-widest text-[11px]">{item.label}</span>
              {activeTab === item.id && <><div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 opacity-100" /><div className="absolute right-0 w-1.5 h-6 bg-white/40 rounded-l-full blur-[1px]" /></>}
            </button>
          ))}
        </nav>
        <div className="p-4 bg-secondary/30 border-t border-border mt-auto">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"><LogOut size={16} className="stroke-[3px]" /><span>Sign Out</span></button>
        </div>
      </aside>
    </>
  );
}

function ContentRenderer() {
  const { activeTab } = useStore();
  switch (activeTab) {
    case 'dashboard': return <Dashboard />;
    case 'clients': return <UserList />;
    case 'find-agent': return <Agents mode="market" />;
    case 'agents': return <Agents mode="manage" />;
    case 'documents': return <Documents />;
    case 'messaging': return <Chat />;
    case 'meetings': return <Meetings />;
    case 'payments': return <Payments />;
    case 'agencies': return <Agencies />;
    case 'profile': return <Profiles />;
    case 'settings': return <Settings />;
    case 'notifications': return <NotificationsPage />;
    default: return <Dashboard />;
  }
}

function NotificationsPage() {
  const { notifications, currentUser, markNotificationAsRead, setActiveTab } = useStore();
  const myNotifications = notifications.filter(n => n.userId === currentUser.id);

  const handleNotificationClick = (n: Notification) => {
    markNotificationAsRead(n.id);
    if (n.linkTab) {
      setActiveTab(n.linkTab);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">Notifications</h2>
        <p className="text-muted-foreground font-medium">Stay updated with your migration progress and system alerts.</p>
      </div>

      <div className="space-y-4">
        {myNotifications.length > 0 ? (
          myNotifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={cn(
                "w-full text-left p-6 rounded-[2rem] border transition-all hover:scale-[1.01] active:scale-[0.99] flex gap-6 items-start",
                n.isRead ? "bg-card border-border opacity-70" : "bg-card border-primary/30 shadow-lg shadow-primary/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                n.type === 'MEETING' ? "bg-vibrant-blue/10 text-vibrant-blue" :
                n.type === 'MESSAGE' ? "bg-vibrant-green/10 text-vibrant-green" :
                n.type === 'DOCUMENT' ? "bg-vibrant-yellow/10 text-vibrant-yellow" :
                n.type === 'PAYMENT' ? "bg-vibrant-red/10 text-vibrant-red" :
                "bg-primary/10 text-primary"
              )}>
                {n.type === 'MEETING' ? <Calendar size={20} /> :
                 n.type === 'MESSAGE' ? <MessageSquare size={20} /> :
                 n.type === 'DOCUMENT' ? <FileText size={20} /> :
                 n.type === 'PAYMENT' ? <CreditCard size={20} /> :
                 <Bell size={20} />}
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="text-primary">{n.senderRole?.replace('_', ' ')}</span>
                    <span className="text-muted-foreground opacity-30">|</span>
                    <span className="text-foreground">{n.senderName}</span>
                    <span className="text-muted-foreground opacity-30">|</span>
                    <span className="text-foreground">{n.title}</span>
                    <span className="text-muted-foreground opacity-30">|</span>
                    <span className="text-muted-foreground">{new Date(n.timestamp).toLocaleDateString()}</span>
                    <span className="text-muted-foreground opacity-30">|</span>
                    <span className="text-muted-foreground">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{n.message}</p>
              </div>
              {!n.isRead && <div className="w-3 h-3 bg-primary rounded-full mt-2" />}
            </button>
          ))
        ) : (
          <div className="p-20 text-center bg-secondary/30 border-2 border-dashed border-border rounded-[3rem]">
            <Bell className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <p className="text-lg font-black text-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-2">We'll alert you when something happens</p>
          </div>
        )}
      </div>
    </div>
  );
}
