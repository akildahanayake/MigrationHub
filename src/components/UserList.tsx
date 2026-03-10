import { useState } from 'react';
import { 
  Search, 
  Globe, 
  UserCheck, 
  UserPlus, 
  ArrowRight, 
  Trash2, 
  Calendar 
} from 'lucide-react';
import { useStore } from '../App';
import { ApplicationStatus } from '../types';
import { cn } from '../utils/cn';
import { getProfilePic } from '../utils/user';

export default function UserList() {
  const { 
    users, 
    currentUser, 
    assignAgent, 
    updateApplicationStatus, 
    rejectAgentRequest, 
    deleteUser, 
    setActiveTab, 
    setSelectedUserProfileId,
    destinations,
    pipelineStages: STAGES,
    showToast
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('');

  // Filter logic
  const filteredUsers = users.filter(u => {
    if (u.role !== 'USER') return false;
    
    // Agent only sees assigned clients
    if (currentUser.role === 'AGENT' && u.assignedAgentId !== currentUser.id) return false;
    
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === '' || u.targetCountry === filterCountry;
    const matchesStatus = filterStatus === '' || u.applicationStatus === filterStatus;
    
    return matchesSearch && matchesCountry && matchesStatus;
  });

  const countries = destinations;
  const agents = users.filter(u => u.role === 'AGENT');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search clients by name or email..." 
            className="w-full pl-10 pr-4 py-2 bg-card border border-border text-foreground rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-card border border-border text-foreground px-4 py-2 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="" className="bg-card">All Countries</option>
            {countries.map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
          </select>
          <select 
            className="bg-card border border-border text-foreground px-4 py-2 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="" className="bg-card">All Statuses</option>
            {STAGES.map(s => <option key={s} value={s} className="bg-card">{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border transition-colors">
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Client</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Target & Visa</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Agent</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Pipeline Stage</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(user => (
                <ClientRow 
                  key={user.id} 
                  user={user} 
                  agents={agents}
                  currentUser={currentUser}
                  assignAgent={assignAgent}
                  updateApplicationStatus={updateApplicationStatus}
                  rejectAgentRequest={rejectAgentRequest}
                  deleteUser={deleteUser}
                  setActiveTab={setActiveTab}
                  setSelectedUserProfileId={setSelectedUserProfileId}
                  STAGES={STAGES}
                  showToast={showToast}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClientRow({ user, agents, currentUser, assignAgent, updateApplicationStatus, rejectAgentRequest, deleteUser, setActiveTab, setSelectedUserProfileId, STAGES }: any) {
  const currentAgent = agents.find((a: any) => a.id === user.assignedAgentId);
  const requestedAgent = agents.find((a: any) => a.id === user.requestedAgentId);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN' || isSuperAdmin;
  const isAgent = currentUser.role === 'AGENT';

  return (
    <tr className="hover:bg-primary/5 transition-all group relative">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4 cursor-pointer group/item" onClick={() => setSelectedUserProfileId(user.id)}>
          <div className="relative">
            <img 
              src={getProfilePic(user.fullName, user.photoUrl)} 
              className="w-12 h-12 rounded-2xl border-2 border-border/50 object-cover group-hover/item:border-primary group-hover/item:scale-105 transition-all shadow-lg" 
              alt="" 
            />
            {user.assignedAgentId && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-vibrant-green rounded-full border-2 border-card flex items-center justify-center shadow-lg">
                <UserCheck size={10} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-black text-foreground group-hover/item:text-primary transition-colors tracking-tight">{user.fullName}</p>
            <p className="text-[10px] text-muted-foreground font-bold tracking-tight">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2 mb-1.5 text-foreground">
          <Globe size={16} className="text-vibrant-blue group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-black tracking-tight">{user.targetCountry}</span>
        </div>
        <span className="text-[10px] px-2.5 py-1 bg-vibrant-blue/10 text-vibrant-blue rounded-lg font-black uppercase tracking-widest border border-vibrant-blue/20">
          {user.visaType}
        </span>
      </td>
      <td className="px-8 py-6">
        {user.assignedAgentId ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <img 
                src={getProfilePic(currentAgent?.fullName)} 
                className="w-8 h-8 rounded-xl border border-border object-cover" 
                alt="" 
              />
              <span className="text-sm font-black text-muted-foreground tracking-tight">{currentAgent?.fullName}</span>
            </div>
            {isSuperAdmin && (
              <select 
                className="text-[10px] bg-vibrant-blue/10 text-vibrant-blue border border-vibrant-blue/20 rounded-lg px-2.5 py-1.5 outline-none font-black uppercase tracking-widest cursor-pointer hover:bg-vibrant-blue/20 transition-colors"
                onChange={(e) => assignAgent(user.id, e.target.value)}
                value={user.assignedAgentId}
              >
                {agents.map((a: any) => <option key={a.id} value={a.id} className="bg-card">{a.fullName}</option>)}
                <option value="" className="bg-card">Remove Agent</option>
              </select>
            )}
          </div>
        ) : user.requestedAgentId ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-vibrant-yellow bg-vibrant-yellow/10 px-3 py-1.5 rounded-xl border border-vibrant-yellow/20 w-fit">
              <UserPlus size={14} className="stroke-[3px]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Pending: {requestedAgent?.fullName}</span>
            </div>
            {isSuperAdmin && (
              <div className="flex gap-2">
                <button 
                  onClick={() => assignAgent(user.id, user.requestedAgentId)}
                  className="text-[10px] bg-vibrant-blue text-white px-3 py-1.5 rounded-xl hover:bg-vibrant-blue/90 font-black uppercase tracking-widest transition-all shadow-lg shadow-vibrant-blue/20 active:scale-95"
                >
                  APPROVE
                </button>
                <button 
                  onClick={() => rejectAgentRequest(user.id)}
                  className="text-[10px] bg-muted text-muted-foreground px-3 py-1.5 rounded-xl border border-border hover:bg-muted/80 font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  REJECT
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-vibrant-red font-black uppercase tracking-[0.2em] animate-pulse">Unassigned</span>
            {isSuperAdmin && (
              <select 
                className="text-[10px] bg-muted/50 text-foreground border border-border/50 rounded-xl px-3 py-2 outline-none font-black uppercase tracking-widest cursor-pointer hover:border-primary transition-colors"
                onChange={(e) => assignAgent(user.id, e.target.value)}
                value=""
              >
                <option value="" className="bg-card">Select Agent</option>
                {agents.map((a: any) => <option key={a.id} value={a.id} className="bg-card">{a.fullName}</option>)}
              </select>
            )}
          </div>
        )}
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col gap-2.5 max-w-[140px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">
              {user.applicationStatus?.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
              {Math.round(((STAGES.indexOf(user.applicationStatus!) + 1) / STAGES.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden flex border border-border/50 p-0.5 shadow-inner">
            {(STAGES as string[]).map((s: string, idx: number) => (
              <div 
                key={s}
                className={cn(
                  "flex-1 h-full first:rounded-l-full last:rounded-r-full border-r border-border/10 last:border-none transition-all duration-700",
                  (STAGES as string[]).indexOf(user.applicationStatus!) >= idx ? "bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "bg-transparent"
                )}
              />
            ))}
          </div>
          {(isAdmin || (currentUser.role === 'AGENT' && user.assignedAgentId === currentUser.id)) && (
            <select 
              className="text-[10px] font-black bg-transparent text-primary outline-none cursor-pointer hover:underline uppercase tracking-widest text-left"
              value={user.applicationStatus}
              onChange={(e) => updateApplicationStatus(user.id, e.target.value as ApplicationStatus)}
            >
              {(STAGES as string[]).map((s: string) => <option key={s} value={s} className="bg-card">{s.replace('_', ' ')}</option>)}
            </select>
          )}
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2.5">
          {isAdmin && (
            <button 
              onClick={() => {
                if (window.confirm(`Are you sure you want to completely remove ${user.fullName} and all their related data?`)) {
                  deleteUser(user.id);
                }
              }}
              className="p-3 text-muted-foreground hover:text-vibrant-red hover:bg-vibrant-red/10 rounded-2xl transition-all active:scale-90"
              title="Delete User"
            >
              <Trash2 size={20} className="stroke-[2.5px]" />
            </button>
          )}
          {(isAdmin || (isAgent && user.assignedAgentId === currentUser.id)) && (
            <button 
              onClick={() => {
                setActiveTab('meetings');
              }}
              className="p-3 text-muted-foreground hover:text-vibrant-green hover:bg-vibrant-green/10 rounded-2xl transition-all active:scale-90"
              title="Schedule Meeting"
            >
              <Calendar size={20} className="stroke-[2.5px]" />
            </button>
          )}
          <button 
            onClick={() => setSelectedUserProfileId(user.id)}
            className="p-3 text-muted-foreground hover:text-vibrant-blue hover:bg-vibrant-blue/10 rounded-2xl transition-all active:scale-90"
            title="View Full Profile"
          >
            <ArrowRight size={20} className="stroke-[2.5px]" />
          </button>
        </div>
      </td>
    </tr>
  );
}
