import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  CheckCheck,
  Circle,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../App';
import { Message } from '../types';
import { cn } from '../utils/cn';
import { getProfilePic } from '../utils/user';

export default function Chat() {
  const { messages, setMessages, currentUser, users, selectedChatContactId, setSelectedChatContactId } = useStore();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(selectedChatContactId);
  // For Super Admin/Admin monitoring
  const [monitorPair, setMonitorPair] = useState<{ u1: string, u2: string } | null>(null);
  const [input, setInput] = useState('');

  // Clear global state once local state is set
  React.useEffect(() => {
    if (selectedChatContactId) {
      setSelectedContactId(selectedChatContactId);
      setSelectedChatContactId(null);
    }
  }, [selectedChatContactId, setSelectedChatContactId]);

  const isMonitorMode = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  // Get all unique pairs of users who have chatted
  const activeConversations = React.useMemo(() => {
    const pairs = new Map<string, { u1: string, u2: string }>();
    messages.forEach(m => {
      const key = [m.senderId, m.receiverId].sort().join(':');
      if (!pairs.has(key)) {
        pairs.set(key, { u1: m.senderId, u2: m.receiverId });
      }
    });
    return Array.from(pairs.values());
  }, [messages]);

  const contacts = users.filter(u => {
    if (u.id === currentUser.id) return false;
    // Clients only see their agent
    if (currentUser.role === 'USER') return u.id === currentUser.assignedAgentId;
    // Agents see their clients
    if (currentUser.role === 'AGENT') return u.assignedAgentId === currentUser.id;
    // Admins can see all users to start new chat or monitor existing ones
    return true;
  });

  const chatMessages = messages.filter(m => {
    if (isMonitorMode && monitorPair) {
      return (m.senderId === monitorPair.u1 && m.receiverId === monitorPair.u2) ||
             (m.senderId === monitorPair.u2 && m.receiverId === monitorPair.u1);
    }
    return (m.senderId === currentUser.id && m.receiverId === selectedContactId) ||
           (m.senderId === selectedContactId && m.receiverId === currentUser.id);
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSend = () => {
    if (!input.trim() || !selectedContactId) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedContactId,
      content: input,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
  };

  const selectedContact = users.find(u => u.id === selectedContactId);
  
  const getParticipantNames = (pair: { u1: string, u2: string }) => {
    const user1 = users.find(u => u.id === pair.u1);
    const user2 = users.find(u => u.id === pair.u2);
    return {
      name1: user1?.fullName || 'Unknown',
      name2: user2?.fullName || 'Unknown',
      role1: user1?.role || 'USER',
      role2: user2?.role || 'USER',
      photo1: user1?.photoUrl,
      photo2: user2?.photoUrl
    };
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-card rounded-3xl border border-border shadow-xl overflow-hidden transition-all">
      {/* Contact List */}
      <div className="w-80 border-r border-border flex flex-col bg-secondary/20">
        <div className="p-5 border-b border-border bg-card transition-colors">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={isMonitorMode ? "Search chats..." : "Search contacts..."}
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-transparent rounded-2xl text-sm font-bold text-foreground outline-none focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isMonitorMode && activeConversations.length > 0 && (
            <div className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50">
              Active Conversations
            </div>
          )}
          {isMonitorMode && activeConversations.map((pair, idx) => {
            const { name1, name2, photo1, photo2, role1, role2 } = getParticipantNames(pair);
            const isSelected = monitorPair?.u1 === pair.u1 && monitorPair?.u2 === pair.u2;
            return (
              <button
                key={`pair-${idx}`}
                onClick={() => {
                  setMonitorPair(pair);
                  setSelectedContactId(null);
                }}
                className={cn(
                  "w-full p-5 flex flex-col gap-2 transition-all text-left border-b border-border/30 hover:bg-muted/30",
                  isSelected ? "bg-card shadow-sm scale-[0.98] rounded-2xl mx-1 w-[calc(100%-8px)] my-1 border-none" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-4">
                    <img src={getProfilePic(name1, photo1)} className="w-9 h-9 rounded-full border-2 border-card object-cover shadow-sm" alt="" />
                    <img src={getProfilePic(name2, photo2)} className="w-9 h-9 rounded-full border-2 border-card object-cover shadow-sm" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate">{name1} & {name2}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tighter">{role1.replace('_', ' ')} / {role2.replace('_', ' ')}</p>
                  </div>
                </div>
              </button>
            );
          })}

          <div className="px-5 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 bg-muted/20">
            {isMonitorMode ? "Direct Messages" : "Contacts"}
          </div>
          
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => {
                setSelectedContactId(contact.id);
                setMonitorPair(null);
              }}
              className={cn(
                "w-full p-5 flex items-center gap-4 transition-all text-left border-b border-border/30 hover:bg-muted/30",
                selectedContactId === contact.id ? "bg-card shadow-sm scale-[0.98] rounded-2xl mx-1 w-[calc(100%-8px)] my-1 border-none" : ""
              )}
            >
              <div className="relative">
                <img 
                  src={getProfilePic(contact.fullName, contact.photoUrl)} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-border shadow-sm group-hover:scale-105 transition-transform" 
                  alt="" 
                />
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-card rounded-full shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground truncate tracking-tight">{contact.fullName}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-wider">{contact.role.replace('_', ' ')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card transition-colors">
        {(selectedContact || (isMonitorMode && monitorPair)) ? (
          <>
            <div className="p-5 border-b border-border flex items-center justify-between transition-colors bg-card/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                {monitorPair ? (
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                      <img 
                        src={getProfilePic(getParticipantNames(monitorPair).name1, getParticipantNames(monitorPair).photo1)} 
                        className="w-11 h-11 rounded-full border-2 border-card shadow-md object-cover" 
                        alt="" 
                      />
                      <img 
                        src={getProfilePic(getParticipantNames(monitorPair).name2, getParticipantNames(monitorPair).photo2)} 
                        className="w-11 h-11 rounded-full border-2 border-card shadow-md object-cover" 
                        alt="" 
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground tracking-tight">
                        {getParticipantNames(monitorPair).name1} + {getParticipantNames(monitorPair).name2}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-black uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Admin Monitor Mode</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img 
                      src={getProfilePic(selectedContact!.fullName, selectedContact!.photoUrl)} 
                      className="w-11 h-11 rounded-full object-cover border-2 border-border shadow-md" 
                      alt="" 
                    />
                    <div>
                      <h3 className="text-sm font-black text-foreground tracking-tight">{selectedContact!.fullName}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                        <Circle size={8} className="fill-current animate-pulse" />
                        <span>Online Now</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button className="p-2.5 text-muted-foreground hover:text-foreground rounded-2xl hover:bg-muted transition-all active:scale-90">
                <MoreVertical size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-muted/10 transition-colors">
              {chatMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                const sender = users.find(u => u.id === msg.senderId);
                const isMonitor = !!monitorPair;

                return (
                  <div key={msg.id} className={cn("flex flex-col group animate-in slide-in-from-bottom-2 duration-300", (isMe || (isMonitor && msg.senderId === monitorPair.u1)) ? "items-end" : "items-start")}>
                    {isMonitor && (
                      <span className="text-[10px] font-black text-muted-foreground mb-1.5 px-2 uppercase tracking-tight">
                        {sender?.fullName}
                      </span>
                    )}
                    <div className={cn(
                      "max-w-[75%] p-4 rounded-3xl shadow-sm transition-all hover:shadow-md",
                      (isMe || (isMonitor && msg.senderId === monitorPair.u1)) 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-card text-foreground rounded-tl-none border border-border"
                    )}>
                      <p className="text-sm font-bold leading-relaxed tracking-tight">{msg.content}</p>
                      <div className={cn(
                        "flex items-center gap-1.5 mt-2 text-[9px] font-black uppercase",
                        (isMe || (isMonitor && msg.senderId === monitorPair.u1)) ? "text-primary-foreground/70" : "text-muted-foreground/70"
                      )}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {(isMe || (isMonitor && msg.senderId === monitorPair.u1)) && <CheckCheck size={12} className="stroke-[3px]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-card border-t border-border transition-colors">
              {monitorPair ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
                  <p className="text-[11px] text-amber-600 font-black uppercase tracking-widest">Monitoring mode active • Messages are read-only</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-muted p-2 rounded-[2rem] border border-border transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50">
                  <button className="p-3 text-muted-foreground hover:text-primary transition-all active:scale-90">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-foreground px-2 placeholder:text-muted-foreground/50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button className="p-3 text-muted-foreground hover:text-primary transition-all active:scale-90">
                    <Smile size={20} />
                  </button>
                  <button 
                    onClick={handleSend}
                    className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-90 hover:scale-[1.05]"
                  >
                    <Send size={20} className="stroke-[2.5px]" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 transition-colors">
            <div className="w-24 h-24 bg-card rounded-[2.5rem] flex items-center justify-center mb-6 border border-border shadow-2xl animate-bounce duration-3000">
              <MessageSquare size={48} className="text-primary stroke-[2px]" />
            </div>
            <h3 className="font-black text-foreground text-lg tracking-tight mb-2">Private Secure Messaging</h3>
            <p className="font-bold text-muted-foreground text-sm">Select a contact to begin your private consultation</p>
          </div>
        )}
      </div>
    </div>
  );
}
