import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';
import { getProfilePic } from '../utils/user';

export default function Dashboard() {
  const { currentUser, users, documents, meetings, payments, setActiveTab, setSelectedUserProfileId, pipelineStages } = useStore();

  const renderSuperAdminStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-5">
      <StatCard icon={Users} label="Ecosystem Users" value={users.length} color="blue" trend="+12%" />
      <StatCard icon={FileText} label="Cloud Documents" value={documents.length} color="green" trend="+5%" />
      <StatCard icon={Calendar} label="Consultations" value={meetings.length} color="yellow" trend="+18%" />
      <StatCard icon={TrendingUp} label="Agency Revenue" value={`$${payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}`} color="red" trend="+10%" />
    </div>
  );

  const renderAgentStats = () => {
    const myClients = users.filter(u => u.assignedAgentId === currentUser.id);
    const pendingDocs = documents.filter(d => 
      myClients.some(c => c.id === d.userId) && d.status === 'UNDER_REVIEW'
    ).length;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-5">
        <StatCard icon={Users} label="Client Portfolio" value={myClients.length} color="blue" />
        <StatCard icon={AlertCircle} label="To Review" value={pendingDocs} color="yellow" />
        <StatCard icon={Calendar} label="Appointments" value={meetings.filter(m => m.agentId === currentUser.id && m.status === 'ACCEPTED').length} color="red" />
        <StatCard icon={CheckCircle} label="Success Rate" value={`${currentUser.successRate || 0}%`} color="green" />
      </div>
    );
  };

  const renderUserStats = () => {
    const myDocs = documents.filter(d => d.userId === currentUser.id);
    const myMeetings = meetings.filter(m => m.userId === currentUser.id);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-5">
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl flex flex-col justify-between transition-all hover:scale-[1.01] active:scale-[0.99] group relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Application Status</p>
              </div>
              <TrendingUp className="text-primary" size={20} />
            </div>
            <h3 className="text-3xl font-black text-foreground capitalize tracking-tighter">
              {(currentUser.applicationStatus || 'N/A').replace(/_/g, ' ')}
            </h3>
          </div>
          <div className="mt-10 space-y-4 relative z-10">
            <div className="flex justify-between text-[11px] font-black text-muted-foreground items-center">
              <span className="tracking-[0.25em]">PROGRESS MONITOR</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20 font-black">75%</span>
            </div>
            <div className="bg-muted h-5 rounded-full overflow-hidden p-1 border border-border shadow-inner">
              <div className="bg-gradient-to-r from-primary via-primary to-indigo-400 h-full w-3/4 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all duration-1000 relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <StatCard icon={FileText} label="My Documents" value={myDocs.length} color="blue" />
        <StatCard icon={Calendar} label="Consultations" value={myMeetings.length} color="green" />
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-indigo-600 via-primary to-violet-700 p-10 lg:p-14 rounded-[3rem] text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group border border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/20 rounded-full blur-[80px]" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">System Secure & Live</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none animate-in slide-in-from-left duration-700">
            Welcome, {currentUser.fullName.split(' ')[0]}!
          </h2>
          <p className="text-white/70 font-black uppercase tracking-[0.3em] text-[10px] animate-in slide-in-from-left duration-700 delay-100 flex items-center gap-2">
            <div className="w-8 h-[1px] bg-white/30" />
            Ecosystem Overview • Real-Time Feed
          </p>
        </div>
          <div className="bg-white/10 backdrop-blur-2xl px-10 py-7 rounded-[2rem] border border-white/30 relative z-10 shadow-2xl group-hover:bg-white/20 transition-all hover:scale-105 duration-500 cursor-default">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1.5 ml-1">Current Session</p>
          <p className="text-4xl font-black tabular-nums tracking-tighter leading-none flex items-center gap-2">
            <Clock size={28} className="text-white" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && renderSuperAdminStats()}
      {currentUser.role === 'AGENT' && renderAgentStats()}
      {currentUser.role === 'USER' && renderUserStats()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity / Tasks */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Recent Activity</h3>
              <button className="text-sm font-medium text-primary hover:text-primary/80">View All</button>
            </div>
            <div className="divide-y divide-border transition-colors">
              {(() => {
                let filteredDocs = documents;
                if (currentUser.role === 'AGENT') {
                  const myClients = users.filter(u => u.assignedAgentId === currentUser.id);
                  filteredDocs = documents.filter(d => myClients.some(c => c.id === d.userId));
                } else if (currentUser.role === 'USER') {
                  filteredDocs = documents.filter(d => d.userId === currentUser.id);
                }

                return filteredDocs.slice(0, 5).map(doc => {
                  const user = users.find(u => u.id === doc.userId);
                  return (
                    <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group">
                      <img 
                        src={getProfilePic(user?.fullName, user?.photoUrl)} 
                        className="w-10 h-10 rounded-lg object-cover border border-border cursor-pointer hover:ring-2 hover:ring-primary transition-all" 
                        alt="" 
                        onClick={() => user && setSelectedUserProfileId(user.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          <span 
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() => user && setSelectedUserProfileId(user.id)}
                          >
                            {user?.fullName}
                          </span> uploaded <span className="text-primary font-bold">{doc.name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm",
                        doc.status === 'APPROVED' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50" :
                        doc.status === 'REJECTED' ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50" :
                        "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
                      )}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                });
              })()}
              {documents.length === 0 && (
                <p className="text-sm text-center py-8 text-muted-foreground">No recent activity</p>
              )}
            </div>
          </div>

          {/* ADMIN ONLY: Top 10 Client Pipeline Stage with Percentage */}
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Top Client Pipeline Stages</h3>
                <div className="text-xs font-medium text-muted-foreground">Application progress distribution</div>
              </div>
              <div className="space-y-5">
                {(() => {
                  const stages = pipelineStages;
                  
                  const clientUsers = users.filter(u => u.role === 'USER');
                  const totalClients = clientUsers.length || 1;

                  // Sort stages by count to show "Top" stages
                  const stageData = stages.map(stage => {
                    const count = clientUsers.filter(u => u.applicationStatus === stage).length;
                    const percentage = Math.round((count / totalClients) * 100);
                    return { stage, count, percentage };
                  }).sort((a, b) => b.count - a.count);

                  return stageData.map(({ stage, count, percentage }) => (
                    <div key={stage} className="space-y-2 group">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-foreground dark:text-slate-300 capitalize tracking-tight">{stage.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black border border-primary/20">{count}</span>
                          <span className="font-black text-primary text-sm font-bold tracking-tight">{percentage}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-700 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)] relative group-hover:brightness-110"
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* AGENT ONLY: Their assigned clients pipeline status summary */}
          {currentUser.role === 'AGENT' && (
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">My Clients Status Overview</h3>
                <div className="text-xs font-medium text-muted-foreground">Your portfolio progress</div>
              </div>
              <div className="space-y-5">
                {(() => {
                  const myClients = users.filter(u => u.assignedAgentId === currentUser.id);
                  const totalMyClients = myClients.length || 1;
                  const stages = pipelineStages;

                  const stageData = stages.map(stage => {
                    const count = myClients.filter(u => u.applicationStatus === stage).length;
                    const percentage = Math.round((count / totalMyClients) * 100);
                    return { stage, count, percentage };
                  }).filter(s => s.count > 0);

                  if (stageData.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No active clients assigned.</p>;

                  return stageData.sort((a, b) => b.count - a.count).map(({ stage, count, percentage }) => (
                    <div key={stage} className="space-y-2 group">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-700 dark:text-slate-300 capitalize tracking-tight">{stage.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/20">{count}</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{percentage}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-700 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)] relative group-hover:brightness-110"
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* USER ONLY: Private "Pipeline Stage" */}
          {currentUser.role === 'USER' && (
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border transition-colors">
              <h3 className="font-bold text-foreground mb-6">Your Visa Application Timeline</h3>
              <div className="relative overflow-x-auto pb-4 scrollbar-hide">
                <div className="min-w-[600px] relative">
                  {/* Horizontal progress line */}
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-secondary -z-0" />
                  
                  <div className="flex justify-between items-start">
                    {pipelineStages.map((stage, idx, arr) => {
                      const currentStatus = currentUser.applicationStatus || pipelineStages[0];
                      const isCompleted = arr.indexOf(currentStatus) >= idx;
                      const isCurrent = currentStatus === stage;
                    
                      return (
                        <div key={stage} className="flex flex-col items-center flex-1 z-10">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background transition-all duration-500 shadow-sm",
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          )}>
                            {isCompleted ? <CheckCircle size={18} /> : <span>{idx + 1}</span>}
                          </div>
                          <p className={cn(
                            "mt-3 text-[10px] font-bold text-center leading-tight uppercase max-w-[80px]",
                            isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {stage.replace(/_/g, ' ')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-12 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-start gap-3 transition-colors">
                <AlertCircle className="text-primary mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-primary">Current Action Required</p>
                  <p className="text-xs text-primary/80 mt-1">
                    {currentUser.applicationStatus === 'DOCUMENT_COLLECTION' 
                      ? "Please upload your pending bank statements to proceed to eligibility check."
                      : "Your application is under review. We will notify you once we move to the next stage."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          {/* Upcoming Meetings */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">Upcoming Meetings</h3>
            </div>
            <div className="p-4 space-y-4">
              {(() => {
                let filteredMeetings = meetings.filter(m => m.status === 'ACCEPTED');
                if (currentUser.role === 'AGENT') {
                  filteredMeetings = filteredMeetings.filter(m => m.agentId === currentUser.id);
                } else if (currentUser.role === 'USER') {
                  filteredMeetings = filteredMeetings.filter(m => m.userId === currentUser.id);
                }

                return filteredMeetings.slice(0, 3).map(meet => {
                  const partnerId = currentUser.role === 'USER' ? meet.agentId : meet.userId;
                  const partner = users.find(u => u.id === partnerId);
                  return (
                    <div key={meet.id} className="flex gap-4 p-3 rounded-xl bg-background group hover:bg-card hover:shadow-md transition-all border border-transparent hover:border-border">
                      <div className="flex flex-col items-center justify-center w-12 bg-card rounded-lg border border-border shadow-sm">
                        <span className="text-[10px] font-bold text-primary uppercase">Feb</span>
                        <span className="text-lg font-black text-foreground">15</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{meet.title}</p>
                        <p className="text-xs text-muted-foreground">with {partner?.fullName}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-medium text-primary">
                          <Clock size={10} />
                          <span>10:00 AM (30 min)</span>
                        </div>
                      </div>
                      <button className="self-center p-2 rounded-lg text-muted-foreground group-hover:text-primary hover:bg-accent transition-colors">
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  );
                });
              })()}
              {(() => {
                let filteredMeetings = meetings.filter(m => m.status === 'ACCEPTED');
                if (currentUser.role === 'AGENT') {
                  filteredMeetings = filteredMeetings.filter(m => m.agentId === currentUser.id);
                } else if (currentUser.role === 'USER') {
                  filteredMeetings = filteredMeetings.filter(m => m.userId === currentUser.id);
                }
                return filteredMeetings.length === 0 && (
                  <p className="text-sm text-center py-4 text-muted-foreground">No upcoming meetings</p>
                );
              })()}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveTab('documents')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors gap-2"
              >
                <FileText size={20} />
                <span className="text-xs font-medium">Upload Doc</span>
              </button>
              <button 
                onClick={() => setActiveTab('meetings')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors gap-2"
              >
                <Calendar size={20} />
                <span className="text-xs font-medium">Book Call</span>
              </button>
              <button 
                onClick={() => setActiveTab('messaging')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors gap-2"
              >
                <MessageSquare size={20} />
                <span className="text-xs font-medium">Messages</span>
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors gap-2"
              >
                <CreditCard size={20} />
                <span className="text-xs font-medium">Payments</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: any) {
  const configs: any = {
    blue: {
      glass: "bg-card border-border shadow-sm",
      icon: "bg-vibrant-blue text-white shadow-vibrant-blue/30",
      badge: "bg-vibrant-blue/10 text-vibrant-blue border-vibrant-blue/20",
      hover: "hover:shadow-md hover:border-vibrant-blue/30"
    },
    green: {
      glass: "bg-card border-border shadow-sm",
      icon: "bg-vibrant-green text-white shadow-vibrant-green/30",
      badge: "bg-vibrant-green/10 text-vibrant-green border-vibrant-green/20",
      hover: "hover:shadow-md hover:border-vibrant-green/30"
    },
    yellow: {
      glass: "bg-card border-border shadow-sm",
      icon: "bg-vibrant-yellow text-white shadow-vibrant-yellow/30",
      badge: "bg-vibrant-yellow/10 text-vibrant-yellow border-vibrant-yellow/20",
      hover: "hover:shadow-md hover:border-vibrant-yellow/30"
    },
    red: {
      glass: "bg-card border-border shadow-sm",
      icon: "bg-vibrant-red text-white shadow-vibrant-red/30",
      badge: "bg-vibrant-red/10 text-vibrant-red border-vibrant-red/20",
      hover: "hover:shadow-md hover:border-vibrant-red/30"
    }
  };

  const config = configs[color] || configs.blue;

  return (
    <div className={cn(
      "p-6 rounded-[2rem] transition-all hover:-translate-y-1.5 active:scale-95 group relative overflow-hidden border",
      config.glass,
      config.hover
    )}>
      <div className="flex items-start justify-between relative z-10">
        <div className={cn("p-4 rounded-2xl transition-all shadow-xl group-hover:scale-110", config.icon)}>
          <Icon size={24} className="stroke-[2.5px]" />
        </div>
        {trend && (
          <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border", config.badge)}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-6 relative z-10">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
      </div>
      <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 transition-opacity group-hover:opacity-20", config.icon)} />
    </div>
  );
}
