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
import { User, Document, Message, Meeting, Payment, Agency, ApplicationStatus, PaymentGateway } from './types';
import { mockUsers, mockDocuments, mockMessages, mockMeetings, mockPayments, mockAgencies } from './mockData';
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
  updateApplicationStatus: (userId: string, status: ApplicationStatus) => void;
  updateDocumentStatus: (docId: string, status: Document['status']) => void;
  rejectAgentRequest: (userId: string) => void;
  acceptClient: (userId: string) => void;
  addUser: (user: Omit<User, 'id' | 'registrationDate'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  deleteDocument: (docId: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
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
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (pref: 'light' | 'dark' | 'system') => void;
  paymentGateways: PaymentGateway[];
  setPaymentGateways: React.Dispatch<React.SetStateAction<PaymentGateway[]>>;
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

  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('migratehub_theme_preference');
    return (saved as 'light' | 'dark' | 'system') || 'light';
  });

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
    const fetchData = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          // If backend is up, we could fetch all data here
          // For now, let's just log it
          console.log('Backend connected');
          
          // Example of fetching users from backend
          const usersRes = await fetch('/api/users');
          if (usersRes.ok) {
            const data = await usersRes.json();
            if (data.length > 0) setUsers(data);
          }
        }
      } catch (e) {
        console.log('Backend not available, using local storage');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const saveData = (k: string, d: any) => localStorage.setItem(`${DB_KEY}_${k}`, JSON.stringify(d));
    saveData('users', users);
    saveData('documents', documents);
    saveData('messages', messages);
    saveData('meetings', meetings);
    saveData('payments', payments);
    saveData('agencies', agencies);
    saveData('destinations', destinations);
    saveData('currencies', currencies);
    saveData('selectedCurrency', selectedCurrency);
    saveData('visaTypes', visaTypes);
    saveData('documentTypes', documentTypes);
    saveData('pipelineStages', pipelineStages);
    saveData('gateways', paymentGateways);
  }, [users, documents, messages, meetings, payments, agencies, destinations, currencies, selectedCurrency, visaTypes, documentTypes, pipelineStages, paymentGateways, isReady]);

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

  const login = async (user: User) => {
    // In a real app, we'd handle the login via API here
    // But the Auth component handles the login call usually
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
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, assignedAgentId: agentId, requestedAgentId: undefined } : u));
    showToast("Agent assigned successfully");
  };

  const updateMeetingStatus = (meetingId: string, status: Meeting['status']) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status } : m));
    showToast(`Meeting ${status.toLowerCase()}`);
  };

  const updateApplicationStatus = (userId: string, status: ApplicationStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, applicationStatus: status } : u));
    showToast("Application status updated");
  };

  const updateDocumentStatus = (docId: string, status: Document['status']) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status } : d));
    showToast(`Document status: ${status}`);
  };

  const rejectAgentRequest = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, requestedAgentId: undefined } : u));
    showToast("Agent request rejected");
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
    setDocuments(prev => prev.filter(d => d.userId !== userId && d.uploadedById !== userId));
    setMeetings(prev => prev.filter(m => m.agentId !== userId && m.userId !== userId));
    setMessages(prev => prev.filter(m => m.senderId !== userId && m.receiverId !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId).map(u => (u.assignedAgentId === userId || u.requestedAgentId === userId) ? { ...u, assignedAgentId: undefined, requestedAgentId: undefined } : u));
    if (currentUser?.id === userId) logout();
    showToast("User deleted completely");
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    showToast("Document deleted");
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: Math.random().toString(36).substr(2, 9) };
    setPayments(prev => [newPayment, ...prev]);
    showToast("Invoice created");
  };

  const updatePayment = (paymentId: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, ...updates } : p));
    showToast("Payment updated");
  };

  const value: StoreContextType = {
    currentUser: currentUser!, isAuthenticated, login, logout,
    users, setUsers, documents, setDocuments, messages, setMessages, meetings, setMeetings,
    payments, agencies, setAgencies, activeTab, setActiveTab,
    selectedUserProfileId, setSelectedUserProfileId, selectedChatContactId, setSelectedChatContactId,
    toast, showToast, assignAgent, updateMeetingStatus, updateApplicationStatus, updateDocumentStatus,
    rejectAgentRequest, acceptClient, addUser, updateUser, deleteUser, deleteDocument, addPayment, updatePayment,
    destinations, setDestinations, currencies, setCurrencies, visaTypes, setVisaTypes,
    documentTypes, setDocumentTypes, pipelineStages, setPipelineStages,
    selectedCurrency, setSelectedCurrency, themePreference, setThemePreference,
    paymentGateways, setPaymentGateways
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Bell size={20} /></button>
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
    default: return <Dashboard />;
  }
}
