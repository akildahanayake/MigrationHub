import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Download, 
  Search, 
  Plus, 
  X, 
  User as UserIcon, 
  Banknote, 
  Landmark, 
  Edit2, 
  Wallet, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';
import { Payment } from '../types';

export default function Payments() {
  const { payments, currentUser, users, addPayment, updatePayment, selectedCurrency, showToast, paymentGateways } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPaymentForGateway, setSelectedPaymentForGateway] = useState<Payment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Payment, 'id'>>({
    userId: '',
    amount: 0,
    currency: selectedCurrency || 'USD',
    status: 'PENDING',
    description: '',
    date: new Date().toISOString(),
    method: 'CARD'
  });

  const filteredPayments = payments.filter(p => {
    if (currentUser.role === 'USER') return p.userId === currentUser.id;
    return true;
  });

  const clients = users.filter(u => u.role === 'USER');

  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.description || formData.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (editingId) {
      updatePayment(editingId, formData);
      showToast('Invoice updated successfully!');
    } else {
      addPayment(formData);
      showToast('New invoice created successfully!');
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      userId: '',
      amount: 0,
      currency: selectedCurrency || 'USD',
      status: 'PENDING',
      description: '',
      date: new Date().toISOString(),
      method: 'CARD'
    });
  };

  const handleGatewayPayment = (method: string) => {
    if (!selectedPaymentForGateway) return;

    if (method === 'STRIPE' || method === 'PAYPAL') {
      setIsProcessing(true);
      
      // Simulate API Handshake with Stripe/PayPal
      setTimeout(() => {
        setIsProcessing(false);
        updatePayment(selectedPaymentForGateway.id, { 
          status: 'PAID',
          method: method as any
        });
        showToast(`Payment of $${selectedPaymentForGateway.amount} successfully processed via ${method} Gateway`, 'success');
        setSelectedPaymentForGateway(null);
      }, 2500);
    } else {
      // Offline methods (Cash/Bank)
      updatePayment(selectedPaymentForGateway.id, { 
        status: 'PAID',
        method: method as any
      });
      showToast(`Payment confirmation received for ${method}`, 'success');
      setSelectedPaymentForGateway(null);
    }
  };

  const openEditModal = (payment: Payment) => {
    const { id, ...rest } = payment;
    setFormData(rest);
    setEditingId(id);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setFormData({
      userId: '',
      amount: 0,
      currency: selectedCurrency || 'USD',
      status: 'PENDING',
      description: '',
      date: new Date().toISOString(),
      method: 'CARD'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Payments & Invoices</h2>
          <p className="text-sm text-muted-foreground">Track your billing and migration service fees.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
            />
          </div>
          {currentUser.role !== 'USER' && (
            <button 
              onClick={openNewModal}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              <span>New Invoice</span>
            </button>
          )}
        </div>
      </div>

      {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary p-6 rounded-2xl text-primary-foreground shadow-xl shadow-primary/20">
            <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Total Paid Revenue</p>
            <h3 className="text-3xl font-black mt-1">${totalRevenue.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary-foreground/80">
              <ArrowUpRight size={14} />
              <span>Verified transactions</span>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pending</p>
            <h3 className="text-3xl font-black mt-1 text-foreground">${pendingAmount.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600">
              <Clock size={14} />
              <span>{pendingCount} Outstanding Invoices</span>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Invoices Issued</p>
            <h3 className="text-3xl font-black mt-1 text-foreground">{payments.length}</h3>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={14} />
              <span>Lifetime billing count</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map(pay => {
                const user = users.find(u => u.id === pay.userId);
                const getMethodIcon = (method: string) => {
                  switch (method) {
                    case 'CASH': return <Banknote size={16} />;
                    case 'BANK_TRANSFER': return <Landmark size={16} />;
                    case 'PAYPAL': return <span className="text-[10px] font-black">PP</span>;
                    case 'STRIPE': return <span className="text-[10px] font-black">ST</span>;
                    default: return <CreditCard size={16} />;
                  }
                };
                return (
                  <tr key={pay.id} className="hover:bg-secondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                          {getMethodIcon(pay.method)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{pay.description}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{pay.method.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-muted-foreground">{user?.fullName || 'Deleted User'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-foreground">${pay.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        pay.status === 'PAID' ? "bg-emerald-500/10 text-emerald-500" : 
                        pay.status === 'FAILED' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {currentUser.role === 'USER' && pay.status === 'PENDING' && (
                          <button 
                            onClick={() => setSelectedPaymentForGateway(pay)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                          >
                            <Wallet size={14} />
                            Pay Now
                          </button>
                        )}
                        {currentUser.role !== 'USER' && (
                          <button 
                            onClick={() => openEditModal(pay)}
                            className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Download">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal for User */}
      {selectedPaymentForGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedPaymentForGateway(null)} />
          <div className="relative bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
            <div className="p-8 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                  <Wallet size={24} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Complete Payment</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Secure Transaction Protocol</p>
                </div>
              </div>
              <button onClick={() => setSelectedPaymentForGateway(null)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-8 space-y-8 bg-card min-h-[400px] flex flex-col justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <h4 className="text-xl font-black text-foreground">Secure Checkout Session</h4>
                    <p className="text-sm text-muted-foreground font-bold mt-1">Establishing encrypted link with payment gateway...</p>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">PCI-DSS Level 1 Secure</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-muted p-6 rounded-2xl border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Amount Due</span>
                      <span className="text-2xl font-black text-foreground">${selectedPaymentForGateway.amount}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-foreground">{selectedPaymentForGateway.description}</p>
                      <p className="text-[10px] text-muted-foreground font-medium italic">Invoice ID: {selectedPaymentForGateway.id.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Select Payment Gateway</p>
                    
                    {selectedPaymentForGateway.method === 'CASH' || selectedPaymentForGateway.method === 'BANK_TRANSFER' ? (
                      <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/30 rounded-3xl">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                            <AlertCircle size={24} className="stroke-[3px]" />
                          </div>
                          <p className="font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">Offline Payment Rules</p>
                        </div>
                        <div className="space-y-4 text-sm text-amber-950 dark:text-amber-200 font-bold leading-relaxed bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/30 shadow-sm">
                          <p>This invoice is processed via <strong className="text-amber-700 dark:text-amber-300 font-black">{selectedPaymentForGateway.method.replace('_', ' ')}</strong>.</p>
                          
                          {selectedPaymentForGateway.method === 'BANK_TRANSFER' && paymentGateways.find(g => g.id === 'bank')?.enabled && (
                            <div className="pt-4 border-t border-amber-100 dark:border-amber-900/30">
                              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 font-black">Transfer Destination:</p>
                              <div className="space-y-2 font-black text-amber-950 dark:text-amber-100">
                                {paymentGateways.find(g => g.id === 'bank')?.fields.map(f => (
                                  <p key={f.key} className="text-xs flex justify-between gap-4">
                                    <span className="opacity-60 font-bold text-amber-900 dark:text-amber-400 shrink-0">{f.label}:</span>
                                    <span className="text-right text-amber-950 dark:text-amber-100 break-all">{f.value || '(Not set by agency)'}</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedPaymentForGateway.method === 'CASH' && paymentGateways.find(g => g.id === 'cash')?.enabled && (
                            <div className="pt-4 border-t border-amber-100 dark:border-amber-900/30">
                              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 font-black">Instructions:</p>
                              <p className="text-sm font-black text-amber-950 dark:text-amber-100 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-100 dark:border-amber-800">
                                {paymentGateways.find(g => g.id === 'cash')?.fields[0].value || 'Please visit our office to pay.'}
                              </p>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleGatewayPayment(selectedPaymentForGateway.method)}
                          className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20 active:scale-95"
                        >
                          I have transferred the funds
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {paymentGateways.find(g => g.id === 'stripe')?.enabled && (
                          <button 
                            onClick={() => handleGatewayPayment('STRIPE')}
                            className="flex items-center justify-between p-6 bg-secondary border border-border rounded-3xl hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-lg">ST</div>
                              <div className="text-left">
                                <span className="block font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">Pay via Stripe</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Credit Card / Apple Pay</span>
                                {paymentGateways.find(g => g.id === 'stripe')?.fields.find(f => f.key === 'pub_key')?.value && (
                                  <span className="block mt-1 text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-black w-fit">PROD CONNECTED</span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                          </button>
                        )}

                        {paymentGateways.find(g => g.id === 'paypal')?.enabled && (
                          <button 
                            onClick={() => handleGatewayPayment('PAYPAL')}
                            className="flex items-center justify-between p-6 bg-secondary border border-border rounded-3xl hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center font-black text-lg">PP</div>
                              <div className="text-left">
                                <span className="block font-black text-sm text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors">Pay via PayPal</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">PayPal Wallet / Credit</span>
                                {paymentGateways.find(g => g.id === 'paypal')?.fields.find(f => f.key === 'client_id')?.value && (
                                  <span className="block mt-1 text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-black w-fit">PROD CONNECTED</span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={20} className="text-muted-foreground group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                          </button>
                        )}

                        {!paymentGateways.find(g => g.id === 'stripe')?.enabled && !paymentGateways.find(g => g.id === 'paypal')?.enabled && (
                          <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/30 rounded-3xl text-center">
                            <p className="text-rose-600 dark:text-rose-400 font-black uppercase text-sm">No Digital Gateways Active</p>
                            <p className="text-xs text-rose-500/70 mt-1">Please contact your agent for payment instructions.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Plus size={24} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingId ? 'Modify Invoice' : 'Generate Invoice'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Financial Transaction Management</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Select Client</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Description</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Visa Consultation Fee"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Amount ($)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Method</label>
                  <select 
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value as any})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  >
                    <option value="CARD">Credit Card</option>
                    {paymentGateways.find(g => g.id === 'stripe')?.enabled && <option value="STRIPE">Stripe API</option>}
                    {paymentGateways.find(g => g.id === 'paypal')?.enabled && <option value="PAYPAL">PayPal API</option>}
                    {paymentGateways.find(g => g.id === 'cash')?.enabled && <option value="CASH">Cash Deposit</option>}
                    {paymentGateways.find(g => g.id === 'bank')?.enabled && <option value="BANK_TRANSFER">Bank Transfer</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                >
                  <option value="PENDING">Pending Approval</option>
                  <option value="PAID">Paid / Verified</option>
                  <option value="FAILED">Declined / Failed</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
                >
                  {editingId ? 'Update Invoice' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

