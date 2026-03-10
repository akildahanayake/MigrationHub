import React, { useState } from 'react';
import { 
  Clock, 
  Video, 
  Plus, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../App';
import { Meeting } from '../types';
import { getProfilePic } from '../utils/user';

export default function Meetings() {
  const { meetings, currentUser, users, updateMeetingStatus, setMeetings } = useStore();
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const filteredMeetings = meetings.filter(m => {
    if (currentUser.role === 'USER') return m.userId === currentUser.id;
    if (currentUser.role === 'AGENT') return m.agentId === currentUser.id;
    return true;
  });

    const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(currentUser.role === 'AGENT' ? currentUser.id : '');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    const agentId = currentUser.role === 'AGENT' ? currentUser.id : selectedAgentId;
    const userId = selectedUserId;

    if (!agentId || !userId) {
      alert("Please select both agent and client");
      return;
    }

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      agentId,
      userId,
      title: 'Consultation Session',
      type: 'ZOOM',
      startTime: `${meetingDate}T${meetingTime}:00Z`,
      duration: 30,
      link: 'https://zoom.us/j/demo',
      status: 'PENDING'
    };
    setMeetings(prev => [...prev, newMeeting]);
    setShowScheduleModal(false);
    alert(`Meeting scheduled between ${users.find(u => u.id === agentId)?.fullName} and ${users.find(u => u.id === userId)?.fullName}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight transition-colors">Meetings & Consultations</h2>
          <p className="text-sm text-muted-foreground font-medium transition-colors">Manage your virtual appointments and schedules.</p>
        </div>
        
        {(currentUser.role === 'AGENT' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-primary/20 active:scale-95 hover:scale-[1.02]"
          >
            <Plus size={18} className="stroke-[3px]" />
            <span>Schedule Meeting {currentUser.role !== 'AGENT' && "on Behalf"}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-foreground text-sm uppercase tracking-widest flex items-center gap-2">
              <Clock size={18} className="text-primary stroke-[2.5px]" />
              Upcoming
            </h3>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
              {filteredMeetings.filter(m => m.status !== 'COMPLETED').length} Active
            </span>
          </div>
          {filteredMeetings.filter(m => m.status !== 'COMPLETED').map(meet => (
            <MeetingCard 
              key={meet.id} 
              meeting={meet} 
              currentUser={currentUser} 
              users={users}
              updateStatus={updateMeetingStatus}
            />
          ))}
          {filteredMeetings.filter(m => m.status !== 'COMPLETED').length === 0 && (
            <div className="p-12 text-center bg-secondary/30 border-2 border-dashed border-border rounded-3xl text-muted-foreground font-bold italic">
              No upcoming meetings found
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-foreground text-sm uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500 stroke-[2.5px]" />
              Past Sessions
            </h3>
            <span className="bg-secondary text-muted-foreground text-[10px] font-black px-2 py-0.5 rounded-full">
              {filteredMeetings.filter(m => m.status === 'COMPLETED').length} Total
            </span>
          </div>
          {filteredMeetings.filter(m => m.status === 'COMPLETED').map(meet => (
            <MeetingCard 
              key={meet.id} 
              meeting={meet} 
              currentUser={currentUser} 
              users={users}
              updateStatus={updateMeetingStatus}
            />
          ))}
          {filteredMeetings.filter(m => m.status === 'COMPLETED').length === 0 && (
            <div className="p-12 text-center bg-secondary/30 border-2 border-dashed border-border rounded-3xl text-muted-foreground font-bold italic">
              No past history available
            </div>
          )}
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowScheduleModal(false)} />
          <div className="relative bg-card rounded-xl p-8 max-w-md w-full shadow-2xl border border-border animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-foreground mb-6">Schedule Consultation</h3>
            <form onSubmit={handleSchedule} className="space-y-4">
              {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Select Agent</label>
                  <select 
                    className="w-full px-4 py-2 bg-secondary/50 rounded-xl border border-border text-foreground focus:ring-2 focus:ring-primary outline-none font-bold transition-all"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    required
                  >
                    <option value="" className="bg-card">Select an agent</option>
                    {users.filter(u => u.role === 'AGENT').map(u => (
                      <option key={u.id} value={u.id} className="bg-card">{u.fullName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Select Client</label>
                <select 
                  className="w-full px-4 py-2 bg-secondary/50 rounded-xl border border-border text-foreground focus:ring-2 focus:ring-primary outline-none font-bold transition-all"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="" className="bg-card">Select a client</option>
                  {users
                    .filter(u => u.role === 'USER' && (currentUser.role === 'AGENT' ? u.assignedAgentId === currentUser.id : true))
                    .map(u => (
                      <option key={u.id} value={u.id} className="bg-card">{u.fullName} {u.assignedAgentId ? `(Assigned: ${users.find(a => a.id === u.assignedAgentId)?.fullName})` : '(Unassigned)'}</option>
                    ))
                  }
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-secondary/50 rounded-xl border border-border text-foreground outline-none transition-all" 
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Time</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-2 bg-secondary/50 rounded-xl border border-border text-foreground outline-none transition-all" 
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Meeting Link</label>
                <input type="url" placeholder="Zoom/Google Meet Link" className="w-full px-4 py-2 bg-secondary/50 border border-border text-foreground rounded-xl outline-none transition-all" defaultValue="https://zoom.us/j/demo" />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground font-bold hover:bg-secondary transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingCard({ meeting, currentUser, users, updateStatus }: any) {
  const partnerId = currentUser.role === 'USER' ? meeting.agentId : meeting.userId;
  const partner = users.find((u: any) => u.id === partnerId);
  const date = new Date(meeting.startTime);
  
  return (
    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all group hover:scale-[1.02] active:scale-[0.99]">
      <div className="flex items-start justify-between">
        <div className="flex gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20 shadow-inner">
            <span className="text-[10px] font-black uppercase leading-none tracking-widest">{date.toLocaleString('default', { month: 'short' })}</span>
            <span className="text-2xl font-black leading-none">{date.getDate()}</span>
          </div>
          <div>
            <h4 className="font-black text-foreground group-hover:text-primary transition-colors text-lg tracking-tight">{meeting.title}</h4>
            <div className="flex items-center gap-2 mt-2">
              <img 
                src={getProfilePic(partner?.fullName, partner?.photoUrl)} 
                className="w-5 h-5 rounded-full object-cover border-2 border-border shadow-sm" 
                alt="" 
              />
              <span className="text-xs text-muted-foreground font-black uppercase tracking-tight">with {partner?.fullName}</span>
            </div>
          </div>
        </div>
        <StatusIcon status={meeting.status} />
      </div>

      <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
            <Clock size={16} className="text-primary stroke-[3px]" />
            <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
            <Video size={16} className="text-primary stroke-[3px]" />
            <span>{meeting.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {meeting.status === 'PENDING' && currentUser.role === 'USER' && (
            <>
              <button 
                onClick={() => updateStatus(meeting.id, 'ACCEPTED')}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-90"
              >
                Accept
              </button>
              <button 
                onClick={() => updateStatus(meeting.id, 'RESCHEDULE_REQUESTED')}
                className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-90"
              >
                Reschedule
              </button>
            </>
          )}
          {meeting.status === 'ACCEPTED' && (
            <>
              <a 
                href={meeting.link} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-90"
              >
                Join Call
                <ExternalLink size={14} className="stroke-[3px]" />
              </a>
              {currentUser.role === 'AGENT' && (
                <button 
                  onClick={() => updateStatus(meeting.id, 'PENDING')}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-secondary text-muted-foreground border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-foreground hover:bg-secondary/80 transition-all active:scale-90"
                >
                  Edit Time
                </button>
              )}
            </>
          )}
          {meeting.status === 'RESCHEDULE_REQUESTED' && currentUser.role === 'AGENT' && (
            <button 
              onClick={() => updateStatus(meeting.id, 'PENDING')}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-90"
            >
              Update Schedule
            </button>
          )}
          {meeting.status === 'RESCHEDULE_REQUESTED' && currentUser.role === 'USER' && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-amber-500 uppercase px-3 py-1 bg-amber-500/10 rounded-full ring-1 ring-amber-500/20">Awaiting Update</span>
            </div>
          )}
          {meeting.status === 'PENDING' && currentUser.role === 'AGENT' && (
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50 italic">Pending Client Confirmation</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: Meeting['status'] }) {
  switch (status) {
    case 'ACCEPTED': return <CheckCircle2 size={18} className="text-emerald-500" />;
    case 'PENDING': return <Clock size={18} className="text-amber-500" />;
    case 'DECLINED': return <XCircle size={18} className="text-rose-500" />;
    case 'RESCHEDULE_REQUESTED': return <AlertCircle size={18} className="text-indigo-500" />;
    default: return null;
  }
}