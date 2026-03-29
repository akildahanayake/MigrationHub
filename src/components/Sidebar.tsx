import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Globe, 
  FileText, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  Building2, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const { activeTab, setActiveTab, currentUser } = useStore();
  
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
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 lg:hidden z-30 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[var(--card-bg)] text-[var(--text-secondary)] z-40 transition-transform duration-300 lg:static lg:translate-x-0 border-r border-[var(--border-color)] flex flex-col shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 bg-[var(--bg-primary)]/50">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Globe className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-bold text-xl tracking-tight leading-none">MigrateHub</h2>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">Migration CRM</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white text-gray-500 dark:text-slate-400"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-white" : "text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              )} />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-800">
          <button 
            onClick={() => useStore().logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
