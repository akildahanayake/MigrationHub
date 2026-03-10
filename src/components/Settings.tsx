import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Check,
  ChevronRight,
  LogOut,
  Trash2,
  MapPin,
  Coins,
  FileType,
  GitBranch,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Globe,
  Sun,
  Moon,
  Monitor,
  Eye,
  CreditCard,
  Settings as SettingsIcon
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';

const Settings: React.FC = () => {
  const { 
    logout, 
    currentUser,
    destinations, setDestinations,
    currencies, setCurrencies,
    visaTypes, setVisaTypes,
    documentTypes, setDocumentTypes,
    pipelineStages, setPipelineStages,
    selectedCurrency, setSelectedCurrency,
    themePreference, setThemePreference,
    paymentGateways, setPaymentGateways,
    showToast
  } = useStore();
  
  const [activeSection, setActiveSection] = useState(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? 'destinations' : 'notifications');
  const [localTheme, setLocalTheme] = useState(themePreference);

  useEffect(() => {
    setLocalTheme(themePreference);
  }, [themePreference]);

  const sections = [
    ...(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? [
      { id: 'destinations', label: 'Destinations', icon: MapPin },
      { id: 'currencies', label: 'Currencies', icon: Coins },
      { id: 'visa-types', label: 'Visa Types', icon: Shield },
      { id: 'documents', label: 'Document Types', icon: FileType },
      { id: 'pipeline', label: 'Pipeline Stages', icon: GitBranch },
      { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
    ] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'display', label: 'Display & Theme', icon: Eye },
    { id: 'account', label: 'Account Actions', icon: SettingsIcon },
  ];

  const [settingsState, setSettingsState] = useState({
    emailNotifications: true,
    pushNotifications: false,
    profilePublic: true,
  });

  const toggleSetting = (key: keyof typeof settingsState) => {
    setSettingsState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter">System Settings</h2>
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Agency Control & Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] transition-all font-black text-xs uppercase tracking-[0.2em] group relative overflow-hidden",
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.05] z-10"
                    : "text-muted-foreground hover:bg-muted bg-card border border-border"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 stroke-[3px] transition-transform duration-300 group-hover:scale-110",
                  activeSection === section.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                )} />
                <span className="relative z-10">{section.label}</span>
                {activeSection === section.id && (
                  <div className="absolute right-0 w-1.5 h-6 bg-white/30 rounded-l-full blur-[1px]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-card rounded-[3rem] border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden transition-all relative">
          <div className="p-10 md:p-14 transition-colors relative z-10 bg-card shadow-inner">
            {activeSection === 'destinations' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-vibrant-blue/10 rounded-[1.5rem] flex items-center justify-center border border-vibrant-blue/20 shadow-xl shadow-vibrant-blue/5">
                    <MapPin className="w-8 h-8 text-vibrant-blue stroke-[2.5px]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">Migration Destinations</h3>
                    <p className="text-sm text-muted-foreground font-bold">Configure active service countries.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <input 
                    id="new-dest"
                    type="text" 
                    placeholder="Enter country name..." 
                    className="flex-1 px-8 py-4 bg-card border border-border text-foreground rounded-[1.5rem] font-black outline-none focus:ring-4 focus:ring-vibrant-blue/10 focus:border-vibrant-blue transition-all placeholder:text-muted-foreground/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          setDestinations([...destinations, input.value.trim()]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-dest') as HTMLInputElement;
                      if (input.value.trim()) {
                        setDestinations([...destinations, input.value.trim()]);
                        input.value = '';
                      }
                    }}
                    className="p-4 bg-vibrant-blue text-white rounded-[1.5rem] hover:bg-vibrant-blue/90 shadow-xl shadow-vibrant-blue/20 active:scale-90 transition-all group"
                  >
                    <Plus size={32} className="stroke-[4px] group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {destinations.map((dest) => (
                    <div key={dest} className="flex items-center gap-3 px-6 py-3 bg-vibrant-blue/10 text-vibrant-blue rounded-2xl border border-vibrant-blue/20 font-black text-[11px] uppercase tracking-widest animate-in zoom-in-90 duration-300 hover:bg-vibrant-blue/20 hover:scale-105 cursor-default group transition-all">
                      {dest}
                      <button onClick={() => setDestinations(destinations.filter(d => d !== dest))} className="text-vibrant-blue/40 hover:text-vibrant-red transition-colors">
                        <X size={16} className="stroke-[4px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'currencies' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Currency Management</h3>
                  <p className="text-sm text-muted-foreground font-medium">Manage currencies and set your preferred default.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Default System Currency</label>
                    <select 
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer"
                    >
                      {currencies.map(c => <option key={c} value={c} className="bg-card font-black">{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Add New Currency</label>
                    <div className="flex gap-3">
                      <input 
                        id="new-curr"
                        type="text" 
                        placeholder="e.g. LKR, AUD" 
                        className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all uppercase placeholder:text-muted-foreground/50"
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById('new-curr') as HTMLInputElement;
                          if (input.value.trim()) {
                            setCurrencies([...currencies, input.value.trim().toUpperCase()]);
                            input.value = '';
                          }
                        }}
                        className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-90 transition-all"
                      >
                        <Plus size={28} className="stroke-[3px]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  {currencies.map((curr) => (
                    <div key={curr} className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-full border font-black text-[10px] uppercase tracking-widest transition-all",
                      selectedCurrency === curr 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-110 z-10' 
                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                    )}>
                      {curr}
                      <button onClick={() => setCurrencies(currencies.filter(c => c !== curr))} className={cn(
                        "transition-colors",
                        selectedCurrency === curr ? 'text-primary-foreground/50 hover:text-white' : 'text-muted-foreground/50 hover:text-rose-500'
                      )}>
                        <X size={14} className="stroke-[4px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'visa-types' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Visa Categories</h3>
                  <p className="text-sm text-muted-foreground font-medium">Manage the visa types available for selection across the platform.</p>
                </div>
                <div className="flex gap-3">
                  <input 
                    id="new-visa-type"
                    type="text" 
                    placeholder="e.g. Student Visa..." 
                    className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          setVisaTypes([...visaTypes, input.value.trim()]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-visa-type') as HTMLInputElement;
                      if (input.value.trim()) {
                        setVisaTypes([...visaTypes, input.value.trim()]);
                        input.value = '';
                      }
                    }}
                    className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-90 transition-all"
                  >
                    <Plus size={28} className="stroke-[3px]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visaTypes.map((type) => (
                    <div key={type} className="flex items-center justify-between p-5 bg-card border border-border rounded-3xl transition-all hover:shadow-2xl hover:border-primary group">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                          <Shield size={22} className="stroke-[2.5px]" />
                        </div>
                        <span className="font-black text-sm tracking-tight text-foreground uppercase">{type}</span>
                      </div>
                      <button onClick={() => setVisaTypes(visaTypes.filter(t => t !== type))} className="text-muted-foreground/30 hover:text-rose-500 transition-colors p-2 hover:bg-rose-500/10 rounded-xl">
                        <X size={20} className="stroke-[4px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'documents' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Requirement Checklist</h3>
                  <p className="text-sm text-muted-foreground font-medium">Define which document types clients need to upload.</p>
                </div>
                <div className="flex gap-3">
                  <input 
                    id="new-doc"
                    type="text" 
                    placeholder="e.g. Birth Certificate..." 
                    className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-doc') as HTMLInputElement;
                      if (input.value.trim()) {
                        setDocumentTypes([...documentTypes, input.value.trim()]);
                        input.value = '';
                      }
                    }}
                    className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-90 transition-all"
                  >
                    <Plus size={28} className="stroke-[3px]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documentTypes.map((type) => (
                    <div key={type} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl transition-all hover:border-primary group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/10">
                          <FileType size={18} className="stroke-[2.5px]" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-foreground">{type}</span>
                      </div>
                      <button onClick={() => setDocumentTypes(documentTypes.filter(t => t !== type))} className="text-muted-foreground/30 hover:text-rose-500 transition-colors p-2 hover:bg-rose-500/10 rounded-xl">
                        <X size={18} className="stroke-[4px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'pipeline' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Visa Pipeline Builder</h3>
                  <p className="text-sm text-muted-foreground font-medium">Customize the stages of your migration workflow.</p>
                </div>
                <div className="flex gap-3">
                  <input 
                    id="new-stage"
                    type="text" 
                    placeholder="Enter new stage name..." 
                    className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-stage') as HTMLInputElement;
                      if (input.value.trim()) {
                        setPipelineStages([...pipelineStages, input.value.trim().toUpperCase()]);
                        input.value = '';
                      }
                    }}
                    className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-90 transition-all"
                  >
                    <Plus size={28} className="stroke-[3px]" />
                  </button>
                </div>
                <div className="space-y-4">
                  {pipelineStages.map((stage, index) => (
                    <div key={stage} className="flex items-center gap-6 group">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-black text-sm border-2 border-primary/10">
                          {index + 1}
                        </div>
                        {index !== pipelineStages.length - 1 && <div className="w-1 h-10 bg-card rounded-full" />}
                      </div>
                      <div className="flex-1 flex items-center justify-between p-5 bg-card border-2 border-border rounded-3xl shadow-sm group-hover:border-primary group-hover:shadow-xl transition-all duration-300">
                        <span className="font-black text-sm text-foreground uppercase tracking-widest">{stage.replace(/_/g, ' ')}</span>
                        <button onClick={() => setPipelineStages(pipelineStages.filter(s => s !== stage))} className="text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-all">
                          <Trash2 size={20} className="stroke-[2.5px]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Communication Rules</h3>
                  <p className="text-sm text-muted-foreground font-medium">Manage how you receive updates about your migration process.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Alerts', desc: 'Receive important updates via secure email.' },
                    { key: 'pushNotifications', label: 'Dashboard Alerts', desc: 'Instant in-app notifications for messages.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-6 bg-card rounded-3xl border border-border transition-all hover:bg-card/80">
                      <div>
                        <p className="font-black text-foreground uppercase tracking-tight text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleSetting(item.key as any)}
                        className={cn(
                          "w-14 h-8 rounded-full transition-all relative ring-4 ring-transparent hover:ring-primary/10",
                          settingsState[item.key as keyof typeof settingsState] ? 'bg-primary' : 'bg-muted-foreground/30'
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md",
                          settingsState[item.key as keyof typeof settingsState] ? 'translate-x-6' : ''
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'display' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-primary p-8 rounded-[3rem] text-primary-foreground shadow-2xl shadow-primary/20 mb-8 transition-all overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-inner">
                        <Eye className="w-8 h-8 text-white stroke-[2.5px]" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight">System Appearance</h3>
                        <p className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">UI Personalization Engine</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-primary-foreground/80 leading-relaxed italic max-w-2xl">
                      Tailor your migration workspace to your environment. Select a visual scheme and click <strong className="text-white underline underline-offset-4">Save Changes</strong> to apply the theme instantly.
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-7 bg-primary rounded-full shadow-lg shadow-primary/30" />
                      <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Theme Protocol</label>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { id: 'light', label: 'Daylight Mode', icon: Sun, sub: 'Optimized for high-clarity environments', color: 'primary' },
                        { id: 'dark', label: 'Midnight Mode', icon: Moon, sub: 'Enhanced contrast for low-light focus', color: 'primary' },
                        { id: 'system', label: 'Auto Sync', icon: Monitor, sub: 'Follows your operating system rules', color: 'primary' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLocalTheme(item.id as any)}
                          className={cn(
                            "relative flex flex-col items-start p-8 rounded-[2.5rem] border-4 transition-all text-left group",
                            localTheme === item.id 
                              ? "bg-card border-primary shadow-2xl scale-[1.05] z-10" 
                              : "bg-card/50 border-transparent hover:border-primary/30 hover:bg-card"
                          )}
                        >
                          <div className={cn(
                            "w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all duration-500",
                            localTheme === item.id 
                              ? "bg-primary text-primary-foreground rotate-[360deg] shadow-lg shadow-primary/30" 
                              : "bg-muted text-muted-foreground group-hover:scale-110"
                          )}>
                            <item.icon size={28} className="stroke-[2.5px]" />
                          </div>
                          <span className={cn(
                            "font-black text-xl tracking-tighter",
                            localTheme === item.id ? "text-foreground" : "text-muted-foreground"
                          )}>{item.label}</span>
                          <span className="text-[11px] text-muted-foreground/70 mt-3 font-bold uppercase leading-tight tracking-tight">{item.sub}</span>
                          
                          {localTheme === item.id && (
                            <div className="absolute top-8 right-8 animate-in zoom-in-50 duration-300">
                              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                <Check size={16} className="text-primary-foreground" strokeWidth={5} />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-7 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30" />
                        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Visual Preview</label>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-1.5 bg-secondary text-primary rounded-full border border-border shadow-sm">
                        <Loader2 size={14} className="animate-spin stroke-[3px]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Staging: {localTheme} Mode</span>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "p-10 rounded-[3.5rem] border-[6px] transition-all duration-1000 shadow-2xl relative overflow-hidden group scale-[0.98] origin-top",
                      localTheme === 'dark' ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
                    )}>
                      {/* Abstract Background for Preview */}
                      <div className={cn(
                        "absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] transition-colors duration-1000",
                        localTheme === 'dark' ? "bg-indigo-500/30" : "bg-indigo-500/10"
                      )} />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                          <div className="flex gap-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-700">
                              <Globe size={32} className="text-primary-foreground" />
                            </div>
                            <div className="space-y-3">
                              <div className={cn("h-6 w-56 rounded-full transition-colors duration-1000", localTheme === 'dark' ? "bg-slate-800" : "bg-slate-200")} />
                              <div className={cn("h-3 w-36 rounded-full transition-colors duration-1000", localTheme === 'dark' ? "bg-slate-900" : "bg-slate-300")} />
                            </div>
                          </div>
                          <div className={cn("w-14 h-14 rounded-full transition-colors duration-1000 ring-4 ring-border/20", localTheme === 'dark' ? "bg-slate-800" : "bg-white shadow-md")} />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-8">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={cn(
                              "p-6 rounded-[2rem] border-2 transition-all duration-1000",
                              localTheme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
                            )}>
                              <div className={cn("h-2.5 w-1/2 rounded-full mb-4", localTheme === 'dark' ? "bg-slate-800" : "bg-slate-200")} />
                              <div className={cn("h-8 w-full rounded-2xl", localTheme === 'dark' ? "bg-primary/20" : "bg-primary/10")} />
                            </div>
                          ))}
                        </div>

                        <div className="mt-10 p-8 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/40 text-primary-foreground overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full animate-pulse duration-5000" />
                          <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
                            <span className="text-[11px] font-black uppercase tracking-widest opacity-90">Live Migration Status Monitor</span>
                          </div>
                          <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden p-1 relative z-10">
                            <div className="h-full w-2/3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'payments' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-emerald-500/20 mb-8 transition-all overflow-hidden relative border-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-inner">
                        <CreditCard className="w-8 h-8 text-white stroke-[2.5px]" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-white">Payment Gateways</h3>
                        <p className="text-white/70 font-bold uppercase text-[10px] tracking-widest">Financial Connectivity & APIs</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-white/80 leading-relaxed italic max-w-2xl">
                      Configure your secure payment integrations. Enable Stripe or PayPal for instant digital collections, or keep Cash/Bank Transfer active for offline records.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {paymentGateways.map((gateway) => (
                    <div key={gateway.id} className="bg-card border-2 border-border rounded-[2.5rem] overflow-hidden transition-all hover:border-emerald-500/30 shadow-sm">
                      <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-background shadow-lg rounded-[1.5rem] flex items-center justify-center text-3xl shrink-0 border border-border">
                            {gateway.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-black text-foreground uppercase tracking-tight text-xl">{gateway.name}</h4>
                              <div className={cn(
                                "px-3 py-1 rounded-full border font-black text-[9px] uppercase tracking-widest transition-colors",
                                gateway.enabled ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                              )}>
                                {gateway.enabled ? 'Enabled' : 'Disabled'}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-bold mt-1 max-w-xl">{gateway.description || (gateway as any).desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border shadow-sm">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Gateway Status</span>
                          <button
                            onClick={() => {
                              const newGateways = paymentGateways.map(g => 
                                g.id === gateway.id ? { ...g, enabled: !g.enabled } : g
                              );
                              setPaymentGateways(newGateways);
                              showToast(`${gateway.name} ${!gateway.enabled ? 'Enabled' : 'Disabled'}`, 'success');
                            }}
                            className={cn(
                              "w-14 h-8 rounded-full transition-all relative ring-4 ring-transparent hover:ring-emerald-500/10",
                              gateway.enabled ? "bg-emerald-500" : "bg-muted"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md",
                              gateway.enabled ? "translate-x-6" : ""
                            )} />
                          </button>
                        </div>
                      </div>

                      {gateway.enabled && (
                        <div className="p-8 md:p-12 space-y-8 border-t border-border animate-in slide-in-from-top-4 duration-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {gateway.fields.map((field) => (
                              <div key={field.label} className={cn("space-y-3", field.type === 'textarea' && "md:col-span-2")}>
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{field.label}</label>
                                {field.type === 'textarea' ? (
                                  <textarea 
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      const newGateways = paymentGateways.map(g => 
                                        g.id === gateway.id ? { 
                                          ...g, 
                                          fields: g.fields.map(f => f.label === field.label ? { ...f, value: newValue } : f)
                                        } : g
                                      );
                                      setPaymentGateways(newGateways);
                                    }}
                                    className="w-full px-6 py-4 bg-card border-2 border-border text-foreground rounded-2xl font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/50 min-h-[120px]"
                                  />
                                ) : (
                                  <input 
                                    type={field.type} 
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      const newGateways = paymentGateways.map(g => 
                                        g.id === gateway.id ? { 
                                          ...g, 
                                          fields: g.fields.map(f => f.label === field.label ? { ...f, value: newValue } : f)
                                        } : g
                                      );
                                      setPaymentGateways(newGateways);
                                    }}
                                    className="w-full px-6 py-4 bg-card border-2 border-border text-foreground rounded-2xl font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/50"
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          {'sandboxMode' in gateway && (
                            <div className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border">
                              <input 
                                type="checkbox" 
                                id={gateway.id + '-check'} 
                                className="w-5 h-5 rounded accent-emerald-500" 
                                checked={gateway.sandboxMode}
                                onChange={(e) => {
                                  const newGateways = paymentGateways.map(g => 
                                    g.id === gateway.id ? { ...g, sandboxMode: e.target.checked } : g
                                  );
                                  setPaymentGateways(newGateways);
                                }}
                              />
                              <label htmlFor={gateway.id + '-check'} className="cursor-pointer">
                                <p className="font-black text-xs text-foreground uppercase tracking-tight">Enable Sandbox Mode</p>
                                <p className="text-[10px] text-muted-foreground font-bold">Use for testing payments before going live.</p>
                              </label>
                            </div>
                          )}

                          <div className="flex justify-end pt-4">
                            <button 
                              onClick={() => showToast(`${gateway.name} credentials updated successfully`, 'success')}
                              className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Check size={18} strokeWidth={4} />
                              Save {gateway.name.split(' ')[0]} Credentials
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}



            {activeSection === 'privacy' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Privacy Protocol</h3>
                  <p className="text-sm text-muted-foreground font-medium">Control who can access your digital migration profile.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-card rounded-[2rem] border border-border shadow-sm">
                    <div className="max-w-md">
                      <p className="font-black text-foreground uppercase tracking-tight text-sm">Marketplace Visibility</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Allow approved migration agents to find and link with your profile in the agent marketplace.</p>
                    </div>
                    <button
                      onClick={() => toggleSetting('profilePublic')}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative ring-4 ring-transparent hover:ring-primary/10",
                        settingsState.profilePublic ? 'bg-primary' : 'bg-muted-foreground/30'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md",
                        settingsState.profilePublic ? 'translate-x-6' : ''
                      )} />
                    </button>
                  </div>
                  
                  <div className="p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex gap-5 text-primary shadow-inner">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Shield className="w-6 h-6 text-primary-foreground stroke-[2.5px]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase tracking-widest leading-none">Military-Grade Encryption</h4>
                      <p className="text-xs font-bold text-primary/80 leading-relaxed">
                        Your sensitive migration documents are protected by state-of-the-art encryption standards. They are only accessible by your explicitly assigned agent and high-level administrators.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {activeSection === 'account' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">System Termination</h3>
                  <p className="text-sm text-muted-foreground font-medium italic">High-impact actions that affect your session or account permanently.</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      showToast('Terminating session...', 'success');
                      setTimeout(() => logout(), 500);
                    }}
                    className="w-full flex items-center justify-between p-6 bg-card hover:bg-background rounded-[2rem] transition-all border border-border group shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <LogOut className="w-6 h-6 text-muted-foreground group-hover:text-primary stroke-[2.5px]" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-foreground uppercase tracking-tight text-sm">Secure Sign Out</p>
                        <p className="text-xs text-muted-foreground font-medium">Safely end your current encrypted session.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm('CRITICAL ACTION: Are you absolutely sure you want to terminate your account? All documents and visa progress will be PERMANENTLY DELETED. This cannot be undone.')) {
                        showToast('Account successfully terminated', 'success');
                        setTimeout(() => logout(), 1000);
                      }
                    }}
                    className="w-full flex items-center justify-between p-6 bg-rose-500/5 hover:bg-rose-500/10 rounded-[2rem] transition-all border border-rose-500/20 group hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                        <Trash2 className="w-6 h-6 text-rose-500 stroke-[2.5px]" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-rose-500 uppercase tracking-tight text-sm">Terminate Account</p>
                        <p className="text-xs text-rose-500/60 font-medium">Permanently purge all data from MigrateHub servers.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-rose-500/30 group-hover:text-rose-500 transition-all group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-card border-t border-border flex flex-col sm:flex-row justify-end gap-6 items-center transition-colors relative z-10">
            <div className="flex items-center gap-4">
              <div id="save-feedback" className="hidden animate-in fade-in slide-in-from-right-2 duration-300 text-emerald-600 text-xs font-black uppercase tracking-widest items-center gap-2">
                <Check size={16} strokeWidth={4} />
                Protocol Updated
              </div>
              <div id="save-error" className="hidden animate-in fade-in slide-in-from-right-2 duration-300 text-rose-600 text-xs font-black uppercase tracking-widest items-center gap-2">
                <AlertCircle size={16} strokeWidth={4} />
                Update Failed
              </div>
              
              <button 
                onClick={() => {
                  setLocalTheme('light');
                  setSettingsState({
                    emailNotifications: true,
                    pushNotifications: false,
                    profilePublic: true,
                  });
                  showToast('Configuration restored to factory defaults');
                }}
                className="px-6 py-2.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-all active:scale-95"
              >
                Restore Defaults
              </button>
              
              <button 
                id="save-settings-btn"
                onClick={() => {
                  const btn = document.getElementById('save-settings-btn') as HTMLButtonElement;
                  const feedback = document.getElementById('save-feedback');
                  const saveIcon = document.getElementById('save-icon');
                  const loadingIcon = document.getElementById('loading-icon');
                  
                  if (btn) btn.disabled = true;
                  if (saveIcon) saveIcon.classList.add('hidden');
                  if (loadingIcon) loadingIcon.classList.remove('hidden');
                  
                  setTimeout(() => {
                    setThemePreference(localTheme);
                    showToast('Global settings updated');
                    if (btn) btn.disabled = false;
                    if (saveIcon) saveIcon.classList.remove('hidden');
                    if (loadingIcon) loadingIcon.classList.add('hidden');
                    
                    if (feedback) {
                      feedback.classList.remove('hidden');
                      feedback.classList.add('flex');
                      setTimeout(() => {
                        feedback.classList.add('hidden');
                        feedback.classList.remove('flex');
                      }, 4000);
                    }
                  }, 1200);
                }}
                className="px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all flex items-center gap-3 disabled:opacity-50 min-w-[200px] justify-center hover:scale-[1.05] active:scale-[0.95]"
              >
                <div id="save-icon" className="flex items-center gap-3">
                  <Check size={16} strokeWidth={4} />
                  <span>Update Settings</span>
                </div>
                <div id="loading-icon" className="hidden items-center gap-3">
                  <Loader2 size={16} className="animate-spin stroke-[4px]" />
                  <span>Synchronizing...</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;