import React, { useState } from 'react';
import { 
  Mail, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Save,
  X,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';
import { EmailTemplate } from '../types';

export default function EmailTemplateManager() {
  const { emailTemplates, setEmailTemplates, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const filteredTemplates = emailTemplates.filter(t => 
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleTemplate = (id: string) => {
    setEmailTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
    showToast("Template status updated", "success");
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setEmailTemplates(prev => prev.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    ));
    setEditingTemplate(null);
    showToast("Template saved successfully", "success");
  };

  return (
    <div className="space-y-6 relative z-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Email Templates</h2>
          <p className="text-sm text-muted-foreground font-medium">Manage and customize automated email notifications.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="pl-10 pr-4 py-2 bg-card border border-border text-foreground rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                    template.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Mail size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground tracking-tight">{template.type}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ID: {template.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleTemplate(template.id)}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    template.enabled ? "text-vibrant-green hover:bg-vibrant-green/10" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {template.enabled ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{template.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Body Preview</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{template.body}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border flex items-center gap-2">
              <button 
                onClick={() => setEditingTemplate(template)}
                className="flex-1 flex items-center justify-center gap-2 bg-card border border-border hover:bg-muted text-foreground py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button 
                onClick={() => {
                  setPreviewTemplate(template);
                  setIsPreviewOpen(true);
                }}
                className="p-2 bg-card border border-border hover:bg-muted text-muted-foreground rounded-xl transition-all"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingTemplate(null)} />
          <div className="relative bg-card w-full max-w-2xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border my-auto">
            <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                  <Edit2 size={20} className="md:w-6 md:h-6" strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-foreground tracking-tight">Edit Template</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{editingTemplate.type}</p>
                </div>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-muted rounded-xl transition-all">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              <form onSubmit={handleSaveTemplate} className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-2 ml-1">Email Subject</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none font-bold"
                    value={editingTemplate.subject}
                    onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-2 ml-1">Email Body</label>
                  <textarea 
                    required
                    rows={8}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary transition-all outline-none resize-none font-medium leading-relaxed"
                    value={editingTemplate.body}
                    onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})}
                  />
                  <div className="mt-3 p-4 bg-muted/30 rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">Available Placeholders</p>
                    <div className="flex flex-wrap gap-2">
                      {["name", "title", "date", "time", "amount", "currency", "description", "docName", "reason", "agentName", "senderName"].map(tag => (
                        <code key={tag} className="px-2 py-1 bg-card border border-border rounded-lg text-[10px] font-bold text-primary">
                          {"{{"}{tag}{"}}"}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="w-full sm:flex-1 py-4 border border-border text-muted-foreground rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewTemplate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative bg-card w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border my-auto">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30 sticky top-0 z-10">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Email Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6 md:p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">From</p>
                <p className="text-sm font-bold text-foreground">MigrateHub &lt;noreply@migratehub.com&gt;</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject</p>
                <p className="text-sm font-bold text-foreground">{previewTemplate.subject}</p>
              </div>
              <div className="h-px bg-border" />
              <div className="bg-muted/30 p-5 md:p-6 rounded-2xl border border-border">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {previewTemplate.body.replace(/\{\{.*?\}\}/g, (match) => {
                    const key = match.replace(/\{\{|\}\}/g, '');
                    return `[${key.toUpperCase()}]`;
                  })}
                </p>
              </div>
            </div>
            <div className="p-6 bg-muted/30 border-t border-border flex justify-center sticky bottom-0 z-10">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="w-full sm:w-auto px-8 py-3 bg-card border border-border text-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
