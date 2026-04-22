import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Upload,
  User,
  Save,
  Plus,
  Trash2,
  GitBranch,
  Camera,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Briefcase,
  Globe,
  ExternalLink,
  Share2,
  Building2,
  Sparkles
} from "lucide-react";
import ReportModal from "../components/ReportModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { AuthContext } from "../contexts/AuthContext";

const Profile = () => {
  const { userId } = useParams();
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [file, setFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  // FIXED: moved here from below early return (was causing React hooks violation crash)
  const [claiming, setClaiming] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    company: "",
    college: "",
    currentRole: "",
    skills: "",
    batch: "",
    username: "",
    experience: [],
    projects: [],
    socialLinks: [],
    isPaidMentor: false,
    pricePerSession: 0,
  });

  const fetchProfile = async () => {
    try {
      let endpoint = "/users/profile";
      if (userId) {
        endpoint = `/users/${userId}/profile`;
        setIsOwnProfile(userId === user?._id);
      } else {
        setIsOwnProfile(true);
      }

      const { data } = await api.get(endpoint);
      setProfile(data);

      if (isOwnProfile) {
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          company: data.company || "",
          college: data.collegeId?.name || data.college || "Global Nexus Network",
          currentRole: data.currentRole || "",
          skills: data.skills ? data.skills.join(", ") : "",
          batch: data.batch || "",
          branch: data.branch || "",
          year: data.year || "",
          careerGoal: data.careerGoal || "",
          username: data.username || "",
          experience: data.experience || [],
          projects: data.projects || [],
          socialLinks: data.socialLinks || [],
          isPaidMentor: data.isPaidMentor || false,
          pricePerSession: data.pricePerSession || 0,
        });
      }
    } catch (error) {
      toast.error("Unable to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAvatarChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setAvatarFile(selected);
    setAvatarPreview(URL.createObjectURL(selected));
  };

  const handleAddArrayItem = (key, defaultObj) => {
    setFormData({ ...formData, [key]: [...formData[key], defaultObj] });
  };

  const handleRemoveArrayItem = (key, index) => {
    const arr = [...formData[key]];
    arr.splice(index, 1);
    setFormData({ ...formData, [key]: arr });
  };

  const handleArrayChange = (key, index, field, value) => {
    const arr = [...formData[key]];
    arr[index][field] = value;
    setFormData({ ...formData, [key]: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updateData = new FormData();
    
    // Add scalar fields
    ['name', 'bio', 'company', 'currentRole', 'batch', 'branch', 'year', 'careerGoal', 'skills', 'isPaidMentor', 'pricePerSession'].forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        updateData.append(key, formData[key]);
      }
    });
    
    // Add file (either profile picture or resume)
    // Priority: avatarFile (newly selected pic) > file (other uploads)
    if (avatarFile) {
      updateData.append("file", avatarFile);
    } else if (file) {
      updateData.append("file", file);
    }
    
    // Add complex fields
    updateData.append("experience", JSON.stringify(formData.experience));
    updateData.append("projects", JSON.stringify(formData.projects));
    updateData.append("socialLinks", JSON.stringify(formData.socialLinks));

    try {
      const { data } = await api.put("/users/profile", updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setProfile(data);
      setUser((prev) => ({
        ...prev,
        name: data.name,
        profilePicture: data.profilePicture,
      }));
      
      // Reset local file states
      setAvatarFile(null);
      setAvatarPreview(null);
      setFile(null);
      
      toast.success("Professional identity updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving profile mesh.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">
          Loading profile settings...
        </p>
      </div>
    );

  const avatarSrc = avatarPreview || profile?.profilePicture || null;
  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleClaimUsername = async () => {
        if (!formData.username) return;
        setClaiming(true);
        try {
            await api.put('/users/username', { username: formData.username });
            toast.success('Professional handle claimed successfully.');
            setProfile(prev => ({ ...prev, username: formData.username.toLowerCase() }));
            setUser(prev => ({ ...prev, username: formData.username.toLowerCase() }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Handle unavailable.');
        } finally {
            setClaiming(false);
        }
    };

    const handleRequestVerification = async () => {
        setVerifying(true);
        try {
            await api.post('/users/verify-request', { graduationYear: formData.batch });
            toast.success('Verification request submitted.');
            setProfile(prev => ({ ...prev, verificationStatus: 'pending' }));
        } catch (err) {
            toast.error('Failed to submit verification request.');
        } finally {
            setVerifying(false);
        }
    };

    const isVerified = profile?.verificationStatus === 'verified';
    const isPending = profile?.verificationStatus === 'pending';

    return (
        <div className="max-w-4xl mx-auto w-full pb-20 space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* ── Elite Page Header ── */}
          <div className="space-y-3 px-2 border-b border-white/5 pb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight whitespace-nowrap">
              {isOwnProfile ? (
                <>Professional <span className="text-sky-400">Profile</span></>
              ) : (
                <span className="text-sky-400">{profile?.name}</span>
              )}
            </h2>
            <p className="text-slate-400 text-sm font-medium whitespace-nowrap truncate">
              {isOwnProfile
                ? "Manage your personal information, career milestones, and institutional verification standing."
                : "Professional Identity Portfolio • Verified"}
            </p>
          </div>
    
          {isOwnProfile && (
            <div className="space-y-10">
              
            <form className="space-y-10" onSubmit={handleSubmit}>
              
              {/* ── Profile Picture ── */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative shrink-0 group">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl transition-transform group-hover:scale-105">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-4xl font-bold">
                          {initials}
                        </span>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-sky-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-sky-700 transition-all hover:rotate-12">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                      Profile Photo
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      PNG, JPG or WebP up to 5MB. A square photo works best.
                    </p>
                    {avatarFile && (
                      <span className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 text-[10px] font-bold uppercase rounded-lg border border-sky-100 dark:border-sky-800/50">
                        Ready to save: {avatarFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Verification & Identity Hub ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] border border-white/5 p-8 md:p-10 text-white overflow-hidden relative shadow-lg">
                      <div className="absolute -right-4 -top-4 opacity-10">
                          <ShieldAlert className="w-32 h-32" />
                      </div>
                      <div className="relative z-10 space-y-6">
                          <h3 className="text-xl font-bold uppercase tracking-tight">Institutional Verification</h3>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">Verified members gain access to elite career hubs, higher referral trust, and exclusive institutional badges.</p>
                          
                          {isVerified ? (
                              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                                  <ShieldCheck className="w-5 h-5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Institutionally Verified</span>
                              </div>
                          ) : isPending ? (
                              <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                                  <Clock className="w-5 h-5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Verification Pending</span>
                              </div>
                          ) : (
                              <button 
                                onClick={handleRequestVerification}
                                disabled={verifying}
                                className="w-full py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
                              >
                                {verifying ? 'Syncing...' : 'Request Verification'}
                              </button>
                          )}
                      </div>
                  </div>

                  <div className="pristine-card p-10 bg-slate-900 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-6xl pointer-events-none">@</div>
                        <div className="space-y-6 relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Professional Handle</h3>
                            
                            {profile?.username ? (
                                <div className="space-y-4">
                                  <div className="px-5 py-4 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-bold text-sky-400">nexus.app/@{profile.username}</span>
                                    <button onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(`https://nexus.app/@${profile.username}`); toast.success('Public handle copied!')}} className="text-[10px] font-black uppercase text-sky-400 hover:text-white transition-colors tracking-widest px-3 py-1.5 bg-sky-500/20 rounded-lg shrink-0">Copy Link</button>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Your professional portfolio is globally live. Inject this Handle link into your resume, GitHub, and external platforms to showcase your verified institutional standing.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">nexus.app/@<span className="text-sky-500 truncate">{formData.username || 'yourname'}</span></p>
                                  <div className="flex gap-2">
                                      <input 
                                          type="text" 
                                          name="username"
                                          placeholder="claim_your_handle"
                                          value={formData.username}
                                          onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                                          className="input-premium py-3 font-bold flex-1 text-sm bg-slate-950"
                                      />
                                      <button 
                                          onClick={(e) => { e.preventDefault(); handleClaimUsername(); }}
                                          disabled={claiming || !formData.username}
                                          className="px-6 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center shrink-0"
                                      >
                                          {claiming ? '...' : 'Claim Tag'}
                                      </button>
                                  </div>
                                </div>
                            )}
                        </div>
                  </div>
              </div>
    
              {/* ── Basic Mesh Intel ── */}
              <div className="bg-slate-900/40 rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-lg space-y-10">
                <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-sky-500 shadow-inner">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter">
                    Basic Intel
                  </h3>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="!py-3.5"
                />
              </div>
              {user?.role !== "collegeAdmin" && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Graduation Year
                    </label>
                    <Input
                      type="number"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      className="!py-3.5"
                    />
                  </div>
                  {user.role === 'student' ? (
                     <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Professional Status</label>
                          <div className="px-4 py-3.5 rounded-xl bg-slate-950/50 border border-white/5 text-sky-400 font-black text-sm uppercase tracking-widest flex items-center justify-center">Student Identity Active</div>
                        </div>
                        <div className="flex items-center gap-3 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 transition-colors">
                          <input type="checkbox" id="internToggle" checked={formData.currentRole === 'intern'} onChange={(e) => setFormData({...formData, currentRole: e.target.checked ? 'intern' : 'student'})} className="w-5 h-5 rounded cursor-pointer border-white/10 bg-slate-900 border-2 checked:bg-indigo-500 focus:ring-0 checked:border-indigo-500 accent-indigo-500 transition-all" />
                          <label htmlFor="internToggle" className="text-xs font-bold text-slate-300 cursor-pointer select-none">I am actively serving an Internship / Role</label>
                        </div>
                     </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Current Professional Status
                      </label>
                      <select
                        name="currentRole"
                        value={formData.currentRole}
                        onChange={handleChange}
                        className="input-premium py-3.5 bg-slate-950/50 font-bold text-sm"
                      >
                        <option value="employee">Working Professional</option>
                        <option value="founder">Entrepreneur</option>
                        <option value="intern">Intern</option>
                        <option value="student">Student</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Verified Institution
                    </label>
                    <div className="px-4 py-3.5 rounded-xl bg-slate-900/50 border border-emerald-500/10 text-emerald-400 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                       <Building2 className="w-4 h-4" />
                       {formData.college}
                       <div className="ml-auto px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[8px] tracking-[0.2em]">Verified</div>
                    </div>
                  </div>

                  {!(user.role === 'student' && formData.currentRole !== 'intern') && (
                    <div className="md:col-span-2 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Briefcase className="w-3 h-3 text-sky-400" /> Current Organization / Company
                      </label>
                      <Input
                        name="company"
                        placeholder="e.g. Google, Target, Meta"
                        value={formData.company}
                        onChange={handleChange}
                        className="!py-3.5"
                      />
                    </div>
                  )}
                </>
              )}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Short Biography
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-premium py-4"
                  placeholder="Briefly describe your professional background..."
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Key Skills (Comma separated)
                </label>
                <Input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Python, AWS"
                  className="!py-3.5"
                />
              </div>
            </div>
          </div>

          {/* ── Social Hub ── */}
          <div className="bg-slate-900/40 rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-lg space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-sky-500">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tighter">Social Hub</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddArrayItem("socialLinks", { platform: "", url: "" })}
                  className="!rounded-xl px-4 font-bold border-white/10 text-slate-300 hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Link
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.socialLinks.map((social, index) => (
                  <div key={index} className="flex items-center gap-3 p-5 bg-white/5 dark:bg-slate-950/50 border border-white/10 rounded-2xl group transition-all hover:border-sky-500/30">
                    <div className="shrink-0">
                       <select 
                          value={social.platform}
                          onChange={(e) => handleArrayChange("socialLinks", index, "platform", e.target.value)}
                          className="bg-slate-900 text-[10px] font-black uppercase tracking-widest text-sky-500 border border-white/10 rounded-lg px-2 py-1 focus:ring-1 focus:ring-sky-500/50 outline-none cursor-pointer appearance-none"
                       >
                          <option value="" disabled className="bg-slate-900">Select Link</option>
                          <option value="LinkedIn" className="bg-slate-900">LinkedIn</option>
                          <option value="GitHub" className="bg-slate-900">GitHub</option>
                          <option value="Twitter" className="bg-slate-900">Twitter</option>
                          <option value="Portfolio" className="bg-slate-900">Portfolio</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                       </select>
                    </div>
                    <div className="flex-1 relative">
                        <input 
                          type="url"
                          placeholder="https://..."
                          value={social.url}
                          onChange={(e) => handleArrayChange("socialLinks", index, "url", e.target.value)}
                          className="w-full bg-transparent border-b border-white/10 focus:border-sky-500 focus:ring-0 text-sm font-medium text-slate-300 placeholder:text-slate-600 py-1 transition-colors"
                        />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem("socialLinks", index)}
                      className="p-2 text-slate-500 hover:text-rose-500 transition-colors bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* ── Mentorship Monetization (Alumni Only) ── */}
          {user?.role === 'alumni' && (
            <div className="bg-slate-900/40 rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-lg space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white tracking-tighter">Monetization</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Optional premium mentorship settings</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-2xl border border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{formData.isPaidMentor ? 'Enabled' : 'Disabled'}</span>
                     <button 
                        type="button"
                        onClick={() => setFormData({...formData, isPaidMentor: !formData.isPaidMentor})}
                        className={`relative w-12 h-6 rounded-full flex items-center px-1 transition-all ${formData.isPaidMentor ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white/10'}`}
                     >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.isPaidMentor ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                  </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${formData.isPaidMentor ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price Per Session (₹)</label>
                      <Input 
                        type="number"
                        name="pricePerSession"
                        value={formData.pricePerSession}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        className="!py-3.5"
                      />
                   </div>
                </div>
            </div>
          )}

          {/* ── Experience, Projects, Resume (Hidden for Admins) ── */}
          {user?.role !== "collegeAdmin" && (
            <>
              {/* ── Experience ── */}
              {!(user.role === 'student' && formData.currentRole !== 'intern') && (
                <div className="glass-card rounded-[2.25rem] p-10 border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-10 animate-in fade-in duration-500">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Work Experience
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAddArrayItem("experience", {
                        role: "",
                        company: "",
                        duration: "",
                        description: "",
                      })
                    }
                    className="!rounded-xl px-4 font-bold border-indigo-200 text-indigo-600"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Experience
                  </Button>
                </div>

                <div className="space-y-6">
                  {formData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] relative group"
                    >
                      <button
                        type="button"
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveArrayItem("experience", index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Title / Role
                          </label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                index,
                                "role",
                                e.target.value,
                              )
                            }
                            className="input-premium py-2.5 text-base font-bold"
                            placeholder="e.g. Senior Developer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Company
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                index,
                                "company",
                                e.target.value,
                              )
                            }
                            className="input-premium py-2.5 text-base font-bold"
                            placeholder="e.g. Google"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Timeline & Description
                          </label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                index,
                                "duration",
                                e.target.value,
                              )
                            }
                            className="input-premium py-2.5 mb-2 text-sm font-medium"
                            placeholder="e.g. May 2021 - Present"
                          />
                          <textarea
                            rows={2}
                            value={exp.description}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className="input-premium py-3 text-sm"
                            placeholder="Summarize your key achievements..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.experience.length === 0 && (
                    <div className="text-center py-10 opacity-30 italic font-medium text-slate-500">
                      No experience records added.
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* ── Projects ── */}
              <div className="glass-card rounded-[2.25rem] p-10 border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-10">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Key Projects
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAddArrayItem("projects", {
                        title: "",
                        techStack: [],
                        description: "",
                      })
                    }
                    className="!rounded-xl px-4 font-bold border-emerald-200 text-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Project
                  </Button>
                </div>

                <div className="space-y-6">
                  {formData.projects.map((proj, index) => (
                    <div
                      key={index}
                      className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] relative group"
                    >
                      <button
                        type="button"
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveArrayItem("projects", index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) =>
                              handleArrayChange(
                                "projects",
                                index,
                                "title",
                                e.target.value,
                              )
                            }
                            className="input-premium py-2.5 text-base font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Technologies Used
                          </label>
                          <input
                            type="text"
                            value={
                              Array.isArray(proj.techStack)
                                ? proj.techStack.join(", ")
                                : proj.techStack
                            }
                            onChange={(e) =>
                              handleArrayChange(
                                "projects",
                                index,
                                "techStack",
                                e.target.value.split(",").map((s) => s.trim()),
                              )
                            }
                            className="input-premium py-2.5 text-sm font-medium"
                            placeholder="React, Node.js, etc."
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) =>
                              handleArrayChange(
                                "projects",
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className="input-premium py-3 text-sm"
                            placeholder="What impact did this project have?"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.projects.length === 0 && (
                    <div className="text-center py-10 opacity-30 italic font-medium text-slate-500">
                      No projects added yet.
                    </div>
                  )}
                </div>
              </div>

              {/* ── Resume ── */}
              <div className="glass-card rounded-[2.25rem] p-10 border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-8 text-center sm:text-left">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Professional Resume
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    Upload your latest CV to improve your referral chances.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 shrink-0 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block">
                      <span className="sr-only">Choose Resume</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </label>
                    {file && (
                      <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest pl-1">
                        ✓ {file.name} ready to upload
                      </p>
                    )}
                  </div>
                </div>
                {profile?.resume && (
                  <div className="flex items-center justify-center sm:justify-start gap-4 px-4">
                    <div className="w-8 h-8 bg-sky-50 dark:bg-sky-900/20 rounded-lg flex items-center justify-center text-sky-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      Current Resume:{" "}
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline"
                      >
                        View Document
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center justify-end px-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-16 py-5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-2xl shadow-3xl shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? "Transmitting..." : "Save Identity Changes"}
            </button>
          </div>
        </form>
            </div>
          )}

          {!isOwnProfile && (
            <div className="space-y-8">
              {/* ── Profile Picture ── */}
              <div className="glass-card rounded-[2rem] p-8 border-slate-200/60 dark:border-slate-800/60 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative shrink-0">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl">
                      {profile?.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-4xl font-bold">
                          {initials}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                      {profile?.name}
                    </h4>
                    {profile?.role !== "collegeAdmin" && (
                      <>
                        {profile?.currentRole && (
                          <p className="text-sm text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest">
                            {profile.currentRole}
                          </p>
                        )}
                        {profile?.company && (
                          <p className="text-sm text-slate-500 font-medium">
                            {profile.company}
                          </p>
                        )}
                      </>
                    )}
                    {profile?.role === "collegeAdmin" && (
                      <p className="text-sm text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest">
                        Institutional Administrator
                      </p>
                    )}
                  </div>
    
                  {/* Flag Button for others */}
                  {!isOwnProfile && (
                    <button
                      onClick={() => setIsReporting(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 transition-all ml-auto"
                      title="Flag this profile"
                    >
                      <ShieldAlert className="w-4 h-4" /> Flag
                    </button>
                  )}
                </div>
              </div>
    
              {/* ── Basic Info ── */}
              <div className="glass-card rounded-[2.25rem] p-10 border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800 pb-4">
                  {profile?.role === 'collegeAdmin' ? 'Administrative Information' : 'Professional Information'}
                </h3>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile?.bio && (
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Bio
                      </label>
                      <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    </div>
                  )}
    
                  {profile?.role !== 'collegeAdmin' && (
                    <>
                      {profile?.college && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            College
                          </label>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {profile.college}
                          </p>
                        </div>
                      )}
    
                      {profile?.batch && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Graduation Year
                          </label>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {profile.batch}
                          </p>
                        </div>
                      )}
    
                      {profile?.skills?.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Skills
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Social Links View */}
                {profile?.socialLinks?.length > 0 && (
                   <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Professional Presence</label>
                      <div className="flex flex-wrap gap-4">
                        {profile.socialLinks.map((link, i) => {
                          const Icon = Globe;
                          return (
                            <a 
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 dark:hover:bg-sky-500/10 hover:text-sky-500 rounded-xl transition-all border border-transparent hover:border-sky-500/20 group"
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-bold">{link.platform}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          );
                        })}
                      </div>
                   </div>
                )}
              </div>
            </div>
          )}

      {isReporting && (
        <ReportModal 
          targetUser={profile} 
          onClose={() => setIsReporting(false)} 
        />
      )}
    </div>
  );
};

export default Profile;
