import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  ChevronRight,
  Zap,
  X,
  Plus,
  Edit,
  Phone,
  MapPin,
  Mail,
  Fingerprint
} from 'lucide-react';
import { useStore } from '../App';
import { Agency } from '../types';

export default function Agencies() {
  const { agencies, setAgencies, showToast } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    licenseNumber: '',
    subscriptionPlan: 'FREE' as Agency['subscriptionPlan'],
    status: 'ACTIVE' as Agency['status']
  });

  const handleOpenModal = (agency?: Agency) => {
    if (agency) {
      setEditingAgency(agency);
      setFormData({
        name: agency.name,
        email: agency.email || '',
        contactNumber: agency.contactNumber || '',
        address: agency.address || '',
        licenseNumber: agency.licenseNumber || '',
        subscriptionPlan: agency.subscriptionPlan,
        status: agency.status
      });
    } else {
      setEditingAgency(null);
      setFormData({
        name: '',
        email: '',
        contactNumber: '',
        address: '',
        licenseNumber: '',
        subscriptionPlan: 'FREE',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgency) {
      const updatedAgencies = agencies.map(a => 
        a.id === editingAgency.id ? { ...a, ...formData } : a
      );
      setAgencies(updatedAgencies);
      showToast('Agency updated successfully!');
    } else {
      const newAgency: Agency = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        ownerId: 'unassigned',
        totalClients: 0,
        totalAgents: 0,
        revenue: 0,
        joinedAt: new Date().toISOString()
      };
      setAgencies([...agencies, newAgency]);
      showToast('New agency registered successfully!');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingAgency ? 'Edit Agency' : 'Register Agency'}</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mt-0.5">
                    {editingAgency ? 'Protocol Oversight' : 'Agency Ecosystem Enrollment'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X size={24} className="stroke-[2.5px]" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto bg-white">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Agency Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Global Pathways Ltd"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Contact Email</label>
                  <div className="relative group">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="email"
                      placeholder="contact@agency.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Contact Number</label>
                  <div className="relative group">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      value={formData.contactNumber}
                      onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Agency Address</label>
                <div className="relative group">
                  <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="123 Migration Way, Business District"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">License Number</label>
                <div className="relative group">
                  <Fingerprint size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="REG-9988-77"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={formData.licenseNumber}
                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Subscription Plan</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.subscriptionPlan}
                    onChange={e => setFormData({ ...formData, subscriptionPlan: e.target.value as Agency['subscriptionPlan'] })}
                  >
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Current Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as Agency['status'] })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {editingAgency ? <Edit size={18} /> : <Plus size={18} />}
                  <span>{editingAgency ? 'Update Agency' : 'Register Agency'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Agency Ecosystem</h2>
          <p className="text-sm text-muted-foreground font-medium">Monitor and manage all migration agencies on the platform.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Zap size={18} />
          <span>Register Agency</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agencies.map(agency => (
          <div key={agency.id} className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                  <Building2 size={32} className="text-foreground" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase border border-primary/20">
                    {agency.subscriptionPlan}
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                    agency.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' :
                    agency.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' :
                    'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'
                  }`}>
                    {agency.status}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-black text-foreground mb-2">{agency.name}</h3>
              
              <div className="space-y-3 mb-6">
                {agency.email && (
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Mail size={14} className="text-primary" />
                    <span>{agency.email}</span>
                  </div>
                )}
                {agency.contactNumber && (
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Phone size={14} className="text-primary" />
                    <span>{agency.contactNumber}</span>
                  </div>
                )}
                {agency.address && (
                  <div className="flex items-start gap-2 text-xs font-bold text-muted-foreground">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span className="line-clamp-2">{agency.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-3 rounded-2xl border border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clients</p>
                  <p className="text-lg font-black text-foreground">{agency.totalClients}</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded-2xl border border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Agents</p>
                  <p className="text-lg font-black text-foreground">{agency.totalAgents}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-secondary/30 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-black text-primary uppercase tracking-tight">
                <TrendingUp size={14} className="stroke-[2.5px]" />
                <span>${agency.revenue.toLocaleString()} Rev</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(agency)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-card rounded-lg transition-all"
                >
                  <Edit size={16} />
                </button>
                <button className="p-2 text-muted-foreground hover:text-primary hover:bg-card rounded-lg transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
