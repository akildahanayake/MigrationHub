import { useState } from 'react';
import { 
  Search, 
  Star, 
  Globe, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  X, 
  Briefcase, 
  Award, 
  BookOpen 
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';
import { getProfilePic } from '../utils/user';
import { User } from '../types';

interface AgentsProps {
  mode: 'market' | 'manage';
}

export default function Agents({ mode }: AgentsProps) {
  const { users, currentUser, setUsers, addUser, deleteUser, setActiveTab, setSelectedChatContactId, destinations } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAgentAnalytics, setSelectedAgentAnalytics] = useState<User | null>(null);

  const [newAgent, setNewAgent] = useState({
    fullName: '',
    email: '',
    phone: '',
    agencyName: currentUser.agencyName || 'Alpha Migration',
    licenseNumber: '',
    yearsExperience: 0,
    countriesSupported: '',
    visasSupported: '',
    bio: '',
  });

  const agents = users.filter(u => u.role === 'AGENT');
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === '' || agent.countriesSupported?.includes(selectedCountry);
    return matchesSearch && matchesCountry;
  });

  const handleSelectAgent = (agentId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === currentUser.id ? { ...u, requestedAgentId: agentId } : u
    ));
    alert("Request sent to admin for approval!");
  };

  const handleStartChat = (agentId: string) => {
    setSelectedChatContactId(agentId);
    setActiveTab('messaging');
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      role: 'AGENT',
      fullName: newAgent.fullName,
      email: newAgent.email,
      phone: newAgent.phone,
      agencyName: newAgent.agencyName,
      licenseNumber: newAgent.licenseNumber,
      yearsExperience: Number(newAgent.yearsExperience),
      countriesSupported: newAgent.countriesSupported.split(',').map(s => s.trim()),
      visasSupported: newAgent.visasSupported.split(',').map(s => s.trim()),
      bio: newAgent.bio,
      gender: 'N/A',
      age: 30,
      dob: '1990-01-01',
      nationality: 'Global',
      address: 'Agency Office',
      currentLivingCountry: 'Australia',
      registrationDate: new Date().toISOString(),
      rating: 5,
      successRate: 98,
    } as any);
    setIsAddModalOpen(false);
    setNewAgent({
      fullName: '',
      email: '',
      phone: '',
      agencyName: currentUser.agencyName || 'Alpha Migration',
      licenseNumber: '',
      yearsExperience: 0,
      countriesSupported: '',
      visasSupported: '',
      bio: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {mode === 'market' ? 'Find Your Migration Agent' : 'Agent Management'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === 'market' ? 'Connect with certified experts to guide your journey.' : 'Monitor and manage agency instructors.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search agents..." 
              className="pl-10 pr-4 py-2 bg-card border border-border text-foreground rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-card border border-border text-foreground px-4 py-2 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary transition-all"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="" className="bg-card">All Expertise</option>
            {destinations.map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
          </select>

          {mode === 'manage' && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Agent
            </button>
          )}
        </div>
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
            <div className="p-8 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                  <Plus size={24} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Add Migration Agent</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Agency Instructor Enrollment</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all hover:rotate-90">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="p-8 overflow-y-auto max-h-[75vh] bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none font-bold"
                        value={newAgent.fullName}
                        onChange={e => setNewAgent({...newAgent, fullName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input 
                        required
                        type="email" 
                        placeholder="john@agency.com"
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none font-bold"
                        value={newAgent.email}
                        onChange={e => setNewAgent({...newAgent, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-1.5 ml-1">License Number</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input 
                        required
                        type="text" 
                        placeholder="MARN 1234567"
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none font-bold"
                        value={newAgent.licenseNumber}
                        onChange={e => setNewAgent({...newAgent, licenseNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-1.5 ml-1">Experience (Years)</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input 
                        required
                        type="number" 
                        placeholder="5"
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none font-bold"
                        value={newAgent.yearsExperience || ''}
                        onChange={e => setNewAgent({...newAgent, yearsExperience: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-1.5 ml-1">Countries Supported</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input 
                        required
                        type="text" 
                        placeholder="Australia, Canada, UK"
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none font-bold"
                        value={newAgent.countriesSupported}
                        onChange={e => setNewAgent({...newAgent, countriesSupported: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-1.5 ml-1">Visas Supported</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input 
                        required
                        type="text" 
                        placeholder="Student Visa, PR, Work Visa"
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none font-bold"
                        value={newAgent.visasSupported}
                        onChange={e => setNewAgent({...newAgent, visasSupported: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-1.5 ml-1">Agent Bio</label>
                  <textarea 
                    required
                    placeholder="Brief professional background..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none resize-none font-bold"
                    value={newAgent.bio}
                    onChange={e => setNewAgent({...newAgent, bio: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 border border-border text-muted-foreground rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Create Agent Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            mode={mode} 
            currentUser={currentUser}
            onSelect={() => handleSelectAgent(agent.id)}
            onChat={() => handleStartChat(agent.id)}
            onViewAnalytics={() => setSelectedAgentAnalytics(agent)}
            onDelete={() => {
              if (window.confirm(`Are you sure you want to remove Agent ${agent.fullName}? This will unassign all their clients.`)) {
                deleteUser(agent.id);
              }
            }}
          />
        ))}
      </div>

      {/* Agent Analytics Modal */}
      {selectedAgentAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedAgentAnalytics(null)} />
          <div className="relative bg-card w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-border">
            <div className="p-10 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-inner">
                  <Briefcase size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground tracking-tighter">{selectedAgentAnalytics.fullName}'s Portfolio</h3>
                  <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Live Operational Oversight & Analytics</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgentAnalytics(null)} className="p-3 hover:bg-muted rounded-2xl transition-all hover:rotate-90">
                <X size={24} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto bg-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-muted p-6 rounded-3xl border border-border shadow-sm">
                  <p className="text-[10px] font-black text-vibrant-blue uppercase tracking-[0.2em] mb-2">Total Assigned</p>
                  <p className="text-4xl font-black text-foreground">
                    {users.filter(u => u.role === 'USER' && u.assignedAgentId === selectedAgentAnalytics.id).length}
                  </p>
                </div>
                <div className="bg-muted p-6 rounded-3xl border border-border shadow-sm">
                  <p className="text-[10px] font-black text-vibrant-green uppercase tracking-[0.2em] mb-2">Success Case</p>
                  <p className="text-4xl font-black text-foreground">
                    {users.filter(u => u.role === 'USER' && u.assignedAgentId === selectedAgentAnalytics.id && u.applicationStatus === 'APPROVED').length}
                  </p>
                </div>
                <div className="bg-muted p-6 rounded-3xl border border-border shadow-sm">
                  <p className="text-[10px] font-black text-vibrant-yellow uppercase tracking-[0.2em] mb-2">Active Pipeline</p>
                  <p className="text-4xl font-black text-foreground">
                    {users.filter(u => u.role === 'USER' && u.assignedAgentId === selectedAgentAnalytics.id && u.applicationStatus !== 'APPROVED' && u.applicationStatus !== 'REJECTED').length}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-base font-black text-foreground mb-6 flex items-center gap-3">
                  <ShieldCheck size={24} className="text-primary" />
                  Assigned Clients & Live Progress
                </h4>
                {users.filter(u => u.role === 'USER' && u.assignedAgentId === selectedAgentAnalytics.id).length > 0 ? (
                  <div className="overflow-hidden border border-border rounded-3xl shadow-xl bg-card">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Client Name</th>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Destination</th>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Visa Category</th>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Stage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.filter(u => u.role === 'USER' && u.assignedAgentId === selectedAgentAnalytics.id).map(client => (
                          <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img src={getProfilePic(client.fullName, client.photoUrl)} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-card shadow-md" alt="" />
                                <div>
                                  <p className="text-sm font-black text-foreground">{client.fullName}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ID: {client.id.split('-')[0].toUpperCase()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm text-foreground font-black uppercase tracking-tight">{client.targetCountry}</span>
                            </td>
                            <td className="px-8 py-6 text-sm text-muted-foreground font-bold">
                              <span className="px-3 py-1 bg-muted rounded-lg text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border">{client.visaType}</span>
                            </td>
                            <td className="px-8 py-6">
                              <span className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm border",
                                client.applicationStatus === 'APPROVED' ? "bg-vibrant-green/10 text-vibrant-green border-vibrant-green/20" :
                                client.applicationStatus === 'REJECTED' ? "bg-vibrant-red/10 text-vibrant-red border-vibrant-red/20" :
                                "bg-vibrant-blue/10 text-vibrant-blue border-vibrant-blue/20"
                              )}>
                                {client.applicationStatus || 'In Progress'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-muted/30 rounded-[3rem] border-4 border-dashed border-border">
                    <div className="bg-card w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <Plus className="text-muted/50" size={40} strokeWidth={3} />
                    </div>
                    <p className="text-lg font-black text-foreground">No active clients assigned</p>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-2">Expert portfolio is currently empty</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-10 border-t border-border bg-muted/50 flex justify-end gap-6 items-center">
              <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mr-auto">System Analysis Verified • UTC {new Date().getHours()}:{new Date().getMinutes()}</div>
              <button 
                onClick={() => setSelectedAgentAnalytics(null)}
                className="px-10 py-4 bg-card border border-border text-foreground rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95 shadow-lg shadow-black/5"
              >
                Close Oversight View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, mode, currentUser, onSelect, onChat, onViewAnalytics, onDelete }: any) {
  const isSelected = currentUser.requestedAgentId === agent.id;
  const isAssigned = currentUser.assignedAgentId === agent.id;
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group/card relative">
      {mode === 'manage' && isAdmin && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-vibrant-red rounded-xl opacity-0 group-hover/card:opacity-100 transition-all z-10 border border-border shadow-sm"
          title="Remove Agent"
        >
          <Trash2 size={18} />
        </button>
      )}
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img 
              src={getProfilePic(agent.fullName, agent.photoUrl)} 
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-transparent group-hover/card:ring-primary transition-all" 
              alt="" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{agent.fullName}</h3>
                <ShieldCheck size={16} className="text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">{agent.agencyName}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={cn("fill-current", i < 4 ? "text-amber-400" : "text-border")} />
                ))}
                <span className="text-[10px] font-bold text-muted-foreground ml-1">{agent.rating} (48 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic leading-relaxed">
          "{agent.bio}"
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe size={14} className="text-primary" />
            <span className="font-medium">Supports: {agent.countriesSupported?.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 size={14} className="text-vibrant-green" />
            <span className="font-medium">{agent.yearsExperience} Years Experience</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {agent.visasSupported?.map((v: string) => (
            <span key={v} className="px-2 py-1 bg-secondary text-muted-foreground rounded-md text-[10px] font-bold uppercase tracking-tight">
              {v}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 bg-muted/50 border-t border-border flex items-center gap-2 transition-colors">
        {mode === 'market' ? (
          <>
            {isAssigned ? (
              <button disabled className="flex-1 bg-vibrant-green text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                <CheckCircle2 size={18} />
                Your Agent
              </button>
            ) : isSelected ? (
              <button disabled className="flex-1 bg-vibrant-yellow text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 animate-pulse">
                <Clock size={18} />
                Request Pending
              </button>
            ) : (
              <button 
                onClick={onSelect}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95"
              >
                Choose Agent
              </button>
            )}
            <button 
              onClick={onChat}
              className="p-2 bg-secondary border border-border rounded-xl text-muted-foreground hover:text-primary transition-colors shadow-sm"
            >
              <MessageSquare size={18} />
            </button>
          </>
        ) : (
          <button 
            onClick={onViewAnalytics}
            className="flex-1 bg-secondary border border-border hover:bg-muted text-foreground py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
          >
            View Analytics & Portfolio
          </button>
        )}
      </div>
    </div>
  );
}
