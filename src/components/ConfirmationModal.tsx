import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              variant === 'danger' ? "bg-rose-500/10 text-rose-500" : 
              variant === 'warning' ? "bg-amber-500/10 text-amber-500" : 
              "bg-primary/10 text-primary"
            )}>
              <AlertCircle size={24} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">{title}</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Security Confirmation Required</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {message}
          </p>

          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-secondary text-muted-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-[1.5] py-4 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl",
                variant === 'danger' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" : 
                variant === 'warning' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : 
                "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-xl transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
