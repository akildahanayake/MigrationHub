import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Briefcase,
  Languages,
  BadgeCheck,
  Award,
  BookOpen,
  ShieldCheck,
  Star,
  Edit2,
  Save,
  X,
  Heart,
  Camera,
  Clock,
  Fingerprint,
  UserCircle2
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';
import { getProfilePic } from '../utils/user';

export default function Profiles({ user: propUser }: { user?: any }) {
  const { currentUser, updateUser, showToast } = useStore();
  const displayUser = propUser || currentUser;
  const isOwnProfile = displayUser.id === currentUser.id;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...displayUser });

  // Update form data if propUser changes
  useEffect(() => {
    setFormData({ ...displayUser });
  }, [displayUser.id]);

  const handleSave = () => {
    updateUser(displayUser.id, formData);
    setIsEditing(false);
    showToast('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({ ...displayUser });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 transition-colors">
      {/* Profile Header */}
      <div className="bg-card rounded-[2.5rem] p-10 shadow-2xl border border-border flex flex-col md:flex-row items-center gap-10 relative transition-all">
        {isOwnProfile && (
          <div className="absolute top-10 right-10 flex gap-3">
            {isEditing && (
              <button 
                onClick={handleCancel}
                className="p-3.5 rounded-2xl bg-secondary text-muted-foreground hover:bg-muted transition-all duration-200 flex items-center gap-2 font-black text-xs uppercase tracking-widest border border-border"
              >
                <X size={18} strokeWidth={3} /> Cancel
              </button>
            )}
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={cn(
                "p-3.5 rounded-2xl transition-all duration-200 flex items-center gap-2 font-black text-xs uppercase tracking-widest",
                isEditing 
                  ? "bg-vibrant-green text-white hover:opacity-90 shadow-xl shadow-emerald-500/20" 
                  : "bg-primary text-primary-foreground hover:opacity-90 shadow-xl shadow-primary/20"
              )}
            >
              {isEditing ? <><Save size={18} strokeWidth={3} /> Save Profile</> : <><Edit2 size={18} strokeWidth={3} /> Edit Profile</>}
            </button>
          </div>
        )}

        <div className="relative group">
          <img 
            src={getProfilePic(formData.fullName, formData.photoUrl)} 
            className={cn(
              "w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl shadow-primary/10 transition-all duration-500 ring-4 ring-card",
              isEditing && "group-hover:brightness-50 cursor-pointer"
            )} 
            alt={displayUser.fullName} 
            onClick={() => isEditing && document.getElementById('photo-upload')?.click()}
          />
          {isEditing && (
            <div 
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 text-white">
                <Camera size={32} strokeWidth={2.5} />
              </div>
            </div>
          )}
          <input 
            id="photo-upload"
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handlePhotoUpload}
          />
          <div className="absolute -bottom-3 -right-3 bg-vibrant-green p-3 rounded-2xl border-8 border-card text-white shadow-xl">
            <BadgeCheck size={24} strokeWidth={3} />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left mt-6 md:mt-0">
          {isEditing ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Profile Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="text-4xl font-black text-foreground bg-secondary border border-border rounded-2xl px-6 py-3 w-full max-w-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all tracking-tighter"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2 justify-center md:justify-start">
                <h2 className="text-5xl font-black text-foreground tracking-tighter leading-none">{displayUser.fullName}</h2>
                <span className="px-4 py-1.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-[0.2em] w-fit mx-auto md:mx-0 shadow-lg shadow-primary/10">
                  {displayUser.role.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-xl border border-border">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm font-black text-foreground uppercase tracking-tight">{displayUser.address}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex flex-wrap gap-6 justify-center md:justify-start">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Registration</span>
              <span className="text-base font-black text-foreground uppercase tracking-tighter leading-none">{new Date(displayUser.registrationDate).toLocaleDateString()}</span>
            </div>
            <div className="w-px h-10 bg-border hidden md:block" />
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Nationality</span>
              {isEditing ? (
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="bg-secondary border border-border text-foreground rounded-xl px-3 py-1 text-sm font-bold focus:ring-2 focus:ring-primary outline-none w-32"
                />
              ) : (
                <span className="text-base font-black text-foreground uppercase tracking-tighter leading-none">{displayUser.nationality}</span>
              )}
            </div>
            {displayUser.role === 'AGENT' && (
              <>
                <div className="w-px h-10 bg-border hidden md:block" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Experience</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      className="bg-secondary border border-border text-foreground rounded-xl px-3 py-1 text-sm font-bold focus:ring-2 focus:ring-primary outline-none w-20"
                    />
                  ) : (
                    <span className="text-base font-black text-foreground uppercase tracking-tighter leading-none">{displayUser.yearsExperience} Years</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Basic Info & Contact */}
        <div className="bg-card rounded-[3rem] p-10 shadow-xl border border-border transition-all">
          <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Globe size={24} strokeWidth={2.5} />
            </div>
            Contact & Identity
          </h3>
          <div className="space-y-6">
            <ContactEditItem 
              icon={Mail} 
              label="Email Address" 
              name="email"
              value={formData.email} 
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ContactEditItem 
              icon={Phone} 
              label="Phone Number" 
              name="phone"
              value={formData.phone} 
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ContactEditItem 
              icon={Phone} 
              label="WhatsApp" 
              name="whatsapp"
              value={formData.whatsapp || ''} 
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ContactEditItem 
              icon={MapPin} 
              label="Mailing Address" 
              name="mailingAddress"
              value={formData.mailingAddress || ''} 
              isEditing={isEditing}
              onChange={handleChange}
            />
            <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-secondary transition-all border border-transparent hover:border-border">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                <Globe size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Living Country</p>
                {isEditing ? (
                  <select
                    name="currentLivingCountry"
                    value={formData.currentLivingCountry || ''}
                    onChange={handleChange}
                    className="w-full text-sm font-black text-foreground mt-1.5 bg-secondary border border-border rounded-xl px-3 py-2 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select country</option>
                    {useStore().destinations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <p className="text-base font-black text-foreground mt-0.5 tracking-tight uppercase leading-none">{displayUser.currentLivingCountry || 'Not specified'}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-secondary transition-all border border-transparent hover:border-border">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                <Heart size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Marital Status</p>
                {isEditing ? (
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus || ''}
                    onChange={handleChange}
                    className="w-full text-sm font-black text-foreground mt-1.5 bg-secondary border border-border rounded-xl px-3 py-2 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                ) : (
                  <p className="text-base font-black text-foreground mt-0.5 tracking-tight uppercase leading-none">{displayUser.maritalStatus || 'Not specified'}</p>
                )}
              </div>
            </div>
            <ContactEditItem 
              icon={Calendar} 
              label="Date of Birth" 
              name="dob"
              type="date"
              value={formData.dob} 
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ContactEditItem 
              icon={UserCircle2} 
              label="Gender" 
              name="gender"
              value={formData.gender || ''} 
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ContactEditItem 
              icon={UserIcon} 
              label="Age" 
              name="age"
              type="number"
              value={formData.age?.toString() || ''} 
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Migration Goals (User Only) */}
        {displayUser.role === 'USER' && (
          <div className="bg-card rounded-[3rem] p-10 shadow-xl border border-border transition-all">
            <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-4">
              <div className="w-10 h-10 bg-vibrant-green/10 text-vibrant-green rounded-xl flex items-center justify-center">
                <Award size={24} strokeWidth={2.5} />
              </div>
              Migration Goals
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-secondary transition-all border border-transparent hover:border-border">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                  <Globe size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Target Country</p>
                  {isEditing ? (
                    <select
                      name="targetCountry"
                      value={formData.targetCountry || ''}
                      onChange={handleChange}
                      className="w-full text-sm font-black text-foreground mt-1.5 bg-secondary border border-border rounded-xl px-3 py-2 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    >
                      <option value="">Select country</option>
                      {useStore().destinations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <p className="text-base font-black text-foreground mt-0.5 tracking-tight uppercase leading-none">{displayUser.targetCountry || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-secondary transition-all border border-transparent hover:border-border">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Visa Type</p>
                  {isEditing ? (
                    <select
                      name="visaType"
                      value={formData.visaType || ''}
                      onChange={handleChange}
                      className="w-full text-sm font-black text-foreground mt-1.5 bg-secondary border border-border rounded-xl px-3 py-2 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    >
                      <option value="">Select type</option>
                      {useStore().visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  ) : (
                    <p className="text-base font-black text-foreground mt-0.5 tracking-tight uppercase leading-none">{displayUser.visaType || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <ContactEditItem 
                icon={BookOpen} 
                label="Education" 
                name="educationLevel"
                value={formData.educationLevel || ''} 
                isEditing={isEditing}
                onChange={handleChange}
              />
              <ContactEditItem 
                icon={Star} 
                label="English Score" 
                name="englishScore"
                value={formData.englishScore || ''} 
                isEditing={isEditing}
                onChange={handleChange}
              />
              <ContactEditItem 
                icon={Fingerprint} 
                label="Passport Number" 
                name="passportNumber"
                value={formData.passportNumber || ''} 
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Agent Specialization (Agent Only) */}
        {displayUser.role === 'AGENT' && (
          <div className="bg-card rounded-[3rem] p-10 shadow-xl border border-border transition-all">
            <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-4">
              <div className="w-10 h-10 bg-vibrant-yellow/10 text-vibrant-yellow rounded-xl flex items-center justify-center">
                <Briefcase size={24} strokeWidth={2.5} />
              </div>
              Professional Info
            </h3>
            <div className="space-y-6">
              <ContactEditItem 
                icon={ShieldCheck} 
                label="License No." 
                name="licenseNumber"
                value={formData.licenseNumber || ''} 
                isEditing={isEditing}
                onChange={handleChange}
              />
              <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-secondary transition-all border border-transparent hover:border-border">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                  <Globe size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Agency</p>
                  <p className="text-base font-black text-foreground mt-0.5 tracking-tight uppercase leading-none">{displayUser.agencyName || 'N/A'}</p>
                </div>
              </div>
              <ContactEditItem 
                icon={Languages} 
                label="Languages" 
                name="languagesSpoken"
                value={Array.isArray(formData.languagesSpoken) ? formData.languagesSpoken.join(', ') : ''} 
                isEditing={isEditing}
                onChange={(e: any) => {
                  const val = e.target.value.split(',').map((s: string = '') => s.trim());
                  setFormData((prev: any) => ({ ...prev, languagesSpoken: val }));
                }}
              />
              <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-secondary transition-all border border-transparent hover:border-border">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Availability Schedule</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="availabilitySchedule"
                      value={formData.availabilitySchedule || ''}
                      onChange={handleChange}
                      placeholder="e.g., Mon-Fri, 9AM - 5PM"
                      className="w-full text-sm font-black text-foreground mt-1.5 bg-secondary border border-border rounded-xl px-3 py-2 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base font-black text-foreground mt-0.5 tracking-tight uppercase leading-none">{displayUser.availabilitySchedule || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bio / About */}
      {(displayUser.role === 'AGENT' || isEditing) && (
        <div className="bg-card rounded-[3rem] p-10 shadow-xl border border-border transition-all">
          <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <UserIcon size={24} strokeWidth={2.5} />
            </div>
            {displayUser.role === 'AGENT' ? 'Professional Bio' : 'About Me'}
          </h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={4}
              className="w-full text-base font-bold text-foreground leading-relaxed bg-secondary border border-border rounded-2xl p-6 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div className="bg-secondary p-8 rounded-3xl border border-border">
              <p className="text-muted-foreground leading-relaxed text-base font-bold italic">
                "{displayUser.bio || 'No bio provided.'}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ContactEditItemProps {
  icon: any;
  label: string;
  name: string;
  value: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function ContactEditItem({ icon: Icon, label, name, value, isEditing, onChange, type = "text" }: ContactEditItemProps) {
  return (
    <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-secondary transition-all border border-transparent hover:border-border">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
        {isEditing ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full text-sm font-black text-foreground mt-1.5 bg-secondary border border-border rounded-xl px-3 py-2 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
          />
        ) : (
          <p className="text-base font-black text-foreground mt-0.5 tracking-tight uppercase leading-none">
            {type === 'date' && value ? new Date(value).toLocaleDateString() : (value || 'N/A')}
          </p>
        )}
      </div>
    </div>
  );
}
