import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useStore } from '../App';
import { ArrowRight, Shield, Globe, MapPin, Phone, Mail, User as UserIcon, Calendar, Heart } from 'lucide-react';
import { cn } from '../utils/cn';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('USER');
  const { login, users, setUsers, visaTypes } = useStore();
  
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    gender: 'Male',
    age: 25,
    dob: '',
    nationality: '',
    address: '',
    currentLivingCountry: '',
    mailingAddress: '',
    maritalStatus: 'Single',
    targetCountry: '',
    visaType: 'Student Visa',
    educationLevel: '',
    englishScore: '',
    passportNumber: '',
    agencyName: '',
    licenseNumber: '',
    bio: '',
    yearsExperience: 0,
    countriesSupported: [],
    visasSupported: [],
    languagesSpoken: [],
  });

  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (name: keyof User, value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setFormData(prev => ({ ...prev, [name]: arr }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login logic
      // Default superadmin case
      if (formData.email === 'akil' && formData.password === 'eternals') {
        const superAdmin = users.find(u => u.id === 'super-admin-1');
        if (superAdmin) {
          login(superAdmin);
          return;
        }
      }

      const user = users.find(u => (u.email === formData.email || (u.role === 'SUPER_ADMIN' && formData.email === 'akil')) && u.password === formData.password);
      if (user) {
        login(user);
      } else {
        setError('Invalid email or password');
      }
    } else {
      // Registration logic
      if (!formData.email || !formData.password || !formData.fullName) {
        setError('Please fill in all required fields');
        return;
      }

      const existingUser = users.find(u => u.email === formData.email);
      if (existingUser) {
        setError('Email already registered');
        return;
      }

      const newUser: User = {
        ...formData as User,
        id: `user-${Date.now()}`,
        role: role,
        registrationDate: new Date().toISOString(),
        applicationStatus: role === 'USER' ? 'REGISTRATION' : undefined,
      };

      setUsers([...users, newUser]);
      login(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-vibrant-blue/5 dark:bg-vibrant-blue/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-vibrant-purple/5 dark:bg-vibrant-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-vibrant-green/5 dark:bg-vibrant-green/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl w-full bg-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-border dark:border-white/20">
        {/* Left Side - Branding */}
        <div className="md:w-2/5 bg-gradient-to-br from-indigo-600 via-primary to-violet-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 dark:backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">MigrateHub</span>
            </div>
            <h2 className="text-4xl font-black mb-6 leading-tight tracking-tight">Your Migration Journey Starts Here</h2>
            <p className="text-indigo-100/90 text-lg font-medium leading-relaxed">
              Connect with top migration experts, manage your documents securely, and track your visa progress in real-time.
            </p>
          </div>
          <div className="relative z-10 mt-8 border-t border-white/20 pt-6">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-100/70">Connecting dreams across borders</p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-20 -left-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        </div>

        {/* Right Side - Form */}
        <div className="md:w-3/5 p-8 lg:p-12 max-h-[90vh] overflow-y-auto bg-card dark:bg-card/40 dark:backdrop-blur-md">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-3xl font-black text-foreground tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
              <p className="text-muted-foreground font-medium mt-1">{isLogin ? 'Access your dashboard' : 'Fill in your details to get started'}</p>
            </div>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-black uppercase tracking-widest text-[10px] hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>

          {error && (
            <div className="bg-vibrant-red/10 border border-vibrant-red/20 text-vibrant-red px-4 py-3 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl mb-8 border border-border/50">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    role === 'USER' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole('AGENT')}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    role === 'AGENT' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Agent
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Common Fields */}
              {!isLogin && (
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              <div className={isLogin ? 'md:col-span-2' : ''}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className={isLogin ? 'md:col-span-2' : ''}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">WhatsApp Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Date of Birth</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Residential Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Mailing Address</label>
                    <input
                      type="text"
                      name="mailingAddress"
                      value={formData.mailingAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Marital Status</label>
                    <div className="relative group">
                      <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Current Living Country</label>
                    <input
                      type="text"
                      name="currentLivingCountry"
                      value={formData.currentLivingCountry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                      required
                    />
                  </div>

                  {/* Client Specific Fields */}
                  {role === 'USER' && (
                    <>
                      <div className="md:col-span-2 border-t border-border pt-6 mt-4">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Migration Details</h4>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Desired Destination</label>
                        <input
                          type="text"
                          name="targetCountry"
                          value={formData.targetCountry}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Visa Type</label>
                        <select
                          name="visaType"
                          value={formData.visaType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        >
                          {visaTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Education Level</label>
                        <input
                          type="text"
                          name="educationLevel"
                          value={formData.educationLevel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">English Score (IELTS/PTE)</label>
                        <input
                          type="text"
                          name="englishScore"
                          value={formData.englishScore}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Passport Number</label>
                        <input
                          type="text"
                          name="passportNumber"
                          value={formData.passportNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        />
                      </div>
                    </>
                  )}

                  {/* Agent Specific Fields */}
                  {role === 'AGENT' && (
                    <>
                      <div className="md:col-span-2 border-t border-border pt-6 mt-4">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Professional Details</h4>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Agency Name</label>
                        <input
                          type="text"
                          name="agencyName"
                          value={formData.agencyName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">License Number</label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Years of Experience</label>
                        <input
                          type="number"
                          name="yearsExperience"
                          value={formData.yearsExperience}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Countries Supported (comma separated)</label>
                        <input
                          type="text"
                          onChange={(e) => handleArrayInputChange('countriesSupported', e.target.value)}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                          placeholder="Australia, Canada, UK"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Languages Spoken (comma separated)</label>
                        <input
                          type="text"
                          onChange={(e) => handleArrayInputChange('languagesSpoken', e.target.value)}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                          placeholder="English, French, Spanish"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Professional Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground resize-none"
                          placeholder="Briefly describe your expertise..."
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group mt-6 active:scale-95"
            >
              {isLogin ? 'Sign In Protocol' : 'Finalize Registration'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
