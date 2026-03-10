import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  Trash2
} from 'lucide-react';
import { useStore } from '../App';
import { Document } from '../types';
import { cn } from '../utils/cn';
import { getProfilePic } from '../utils/user';

export default function Documents() {
  const { documents, currentUser, users, updateDocumentStatus, setDocuments, deleteDocument, documentTypes } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc => {
    // Access Control
    if (currentUser.role === 'USER' && doc.userId !== currentUser.id) return false;
    if (currentUser.role === 'AGENT') {
      const client = users.find(u => u.id === doc.userId);
      if (client?.assignedAgentId !== currentUser.id) return false;
    }

    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Passport');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Simulate real upload by creating a local URL
      const fileUrl = URL.createObjectURL(file);
      
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        userId: currentUser.id,
        uploadedById: currentUser.id,
        name: file.name,
        category: selectedCategory,
        status: 'UPLOADED',
        uploadedAt: new Date().toISOString(),
        fileUrl: fileUrl,
        fileType: file.type.split('/')[1] || 'file'
      };
      setDocuments(prev => [newDoc, ...prev]);
      alert(`${file.name} uploaded successfully as ${selectedCategory.replace('_', ' ')}!`);
    }
  };

  const handleDownload = (doc: Document) => {
    if (!doc.fileUrl || doc.fileUrl === '#') {
      alert("This is a sample document and cannot be downloaded.");
      return;
    }
    
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight transition-colors">Document Center</h2>
          <p className="text-sm text-muted-foreground font-medium transition-colors">Securely manage and share migration documents.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="pl-10 pr-4 py-2 bg-card border border-border text-foreground rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="bg-card border border-border text-foreground px-3 py-2 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {documentTypes.map(type => (
                <option key={type} value={type} className="bg-card">{type}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-black cursor-pointer transition-all shadow-lg shadow-primary/20 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]">
              <Upload size={18} />
              <span>Upload</span>
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border transition-colors">
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Document Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Owner</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocs.map(doc => {
                const owner = users.find(u => u.id === doc.userId);
                return (
                  <tr key={doc.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                          <FileText size={18} className="stroke-[2.5px]" />
                        </div>
                        <span className="text-sm font-black text-foreground">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={owner ? getProfilePic(owner.fullName, owner.photoUrl) : `https://ui-avatars.com/api/?name=User&background=random`} 
                          className="w-7 h-7 rounded-full object-cover border-2 border-border shadow-sm" 
                          alt="" 
                        />
                        <span className="text-xs font-bold text-muted-foreground truncate max-w-[100px]">{owner?.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-muted-foreground uppercase bg-secondary px-2 py-1 rounded-md tracking-tighter">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(currentUser.role === 'AGENT' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                          <select 
                            className="text-[10px] bg-secondary border border-border rounded-lg px-2 py-1.5 font-black uppercase tracking-tight outline-none text-primary focus:ring-2 focus:ring-primary cursor-pointer transition-all"
                            value={doc.status}
                            onChange={(e) => updateDocumentStatus(doc.id, e.target.value as any)}
                          >
                            <option value="UPLOADED" className="bg-card text-foreground">Uploaded</option>
                            <option value="UNDER_REVIEW" className="bg-card text-foreground">Reviewing</option>
                            <option value="APPROVED" className="bg-card text-foreground">Approved</option>
                            <option value="REJECTED" className="bg-card text-foreground">Rejected</option>
                            <option value="CORRECTION_NEEDED" className="bg-card text-foreground">Fix Needed</option>
                          </select>
                        )}
                        <button 
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-muted-foreground hover:text-primary transition-all rounded-xl hover:bg-primary/10 active:scale-90"
                          title="Download Document"
                        >
                          <Download size={20} className="stroke-[2px]" />
                        </button>

                        {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this document?')) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className={cn(
                              "p-2 rounded-xl transition-all active:scale-90",
                              doc.status === 'REJECTED' 
                                ? "text-rose-500 hover:bg-rose-500/10" 
                                : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                            )}
                            title="Delete Document"
                          >
                            <Trash2 size={20} className="stroke-[2px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Document['status'] }) {
  const styles: any = {
    UPLOADED: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
    UNDER_REVIEW: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    APPROVED: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    REJECTED: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
    CORRECTION_NEEDED: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50",
  };

  const icons: any = {
    UPLOADED: <Clock size={12} />,
    UNDER_REVIEW: <AlertCircle size={12} />,
    APPROVED: <CheckCircle size={12} />,
    REJECTED: <XCircle size={12} />,
    CORRECTION_NEEDED: <AlertCircle size={12} />,
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center w-fit gap-1",
      styles[status]
    )}>
      {icons[status]}
      {status.replace('_', ' ')}
    </span>
  );
}
