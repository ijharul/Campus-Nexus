import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Mail, 
  MapPin, 
  Award,
  ExternalLink,
  Code2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';


const PublicProfile = () => {
    const { username, id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [username, id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const endpoint = id ? `/users/${id}` : `/users/u/${username}`;
            const { data } = await api.get(endpoint);
            setProfile(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Profile visibility restricted.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Portfolio Nodes</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                <Globe className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Portfolio Locked</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium mb-8">This professional node is either private or does not exist in our global institutional mesh.</p>
            <Link to="/" className="px-8 py-4 bg-brand-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-brand-500/20 active:scale-95 transition-all">Return to Nexus</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 animate-in fade-in duration-1000">
            {/* Header / Banner */}
            <div className="h-64 md:h-80 w-full bg-gradient-to-br from-slate-900 via-brand-900 to-indigo-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                
                {/* Floating Stats */}
                <div className="absolute top-8 right-8 hidden md:flex items-center gap-4">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                        <div className="text-xl font-black text-white leading-none">{profile.contributionScore}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Global Points</div>
                    </div>
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                        <div className="text-xl font-black text-emerald-400 leading-none">{profile.badges?.length || 0}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Badges</div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8">
                {/* Profile Card */}
                <div className="-mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Essential Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
                            <div className="relative inline-block mb-6">
                                <img 
                                    src={profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`} 
                                    className="w-40 h-40 rounded-[2.5rem] object-cover ring-8 ring-slate-50 dark:ring-slate-950 shadow-inner"
                                    alt={profile.name}
                                />
                                {profile.verificationStatus === 'verified' && (
                                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-sky-500 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-2">{profile.name}</h1>
                            {profile.role === 'alumni' && (
                                <div className="flex justify-center gap-4 mb-6">
                                    <div className="text-center">
                                        <div className="text-lg font-black text-sky-500">{profile.impactStats?.studentsHelped || 0}</div>
                                        <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Students Helped</div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 self-center" />
                                    <div className="text-center">
                                        <div className="text-lg font-black text-emerald-500">{profile.impactStats?.referralsGiven || 0}</div>
                                        <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Referrals</div>
                                    </div>
                                </div>
                            )}
                            <p className="text-brand-600 dark:text-brand-400 font-bold text-sm uppercase tracking-widest mb-6">@{profile.username || profile._id.slice(-6)}</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {profile.badges?.map(badge => (
                                    <span key={badge} className="px-3 py-1 bg-sky-500/10 text-sky-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-sky-500/20">{badge}</span>
                                ))}
                            </div>

                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"><Briefcase className="w-4 h-4" /></div>
                                    <span className="text-xs truncate">{profile.currentRole || 'Professional'} @ {profile.company || 'Enterprise'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"><GraduationCap className="w-4 h-4" /></div>
                                    <span className="text-xs truncate">{profile.collegeId?.name || 'Institutional Member'}</span>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                {profile.role === 'alumni' ? (
                                    <>
                                        <button 
                                            onClick={() => toast.success('Mentorship request sent!')}
                                            className="w-full py-4 bg-sky-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Request Mentorship
                                        </button>
                                        {profile.isPaidMentor && (
                                            <button 
                                                onClick={() => {
                                                    toast.loading('Initializing secure checkout...');
                                                    setTimeout(() => {
                                                        toast.dismiss();
                                                        toast.success(`Premium session with ${profile.name} booked!`);
                                                    }, 1500);
                                                }}
                                                className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                                            >
                                                Book Premium (₹{profile.pricePerSession})
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button className="w-full py-4 bg-slate-900 dark:bg-brand-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95">Send Nexus Message</button>
                                )}
                            </div>
                        </div>

                        {/* Ratings & Testimonials Card */}
                        {profile.role === 'alumni' && profile.ratings?.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" /> Student Success Stories
                                </h3>
                                <div className="space-y-4">
                                    {profile.testimonials?.slice(0, 3).map((t, i) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed">"{t.text}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills Box */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-brand-500" /> Professional Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map(skill => (
                                    <span key={skill} className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-xl border border-slate-100 dark:border-slate-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Experience / Projects */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Bio Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-amber-500" /> Executive Summary
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic italic">
                                "{profile.bio || 'This professional is building their legacy in silence. Check back soon for the vision.'}"
                              </p>
                        </div>

                        {/* Experience Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                             <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-brand-500" /> Career Trajectory
                             </h3>
                             <div className="space-y-12">
                                {profile.experience?.length > 0 ? profile.experience.map((exp, i) => (
                                    <div key={i} className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 last:border-0 pb-2">
                                        <div className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900" />
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white">{exp.role}</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exp.duration}</span>
                                        </div>
                                        <div className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Building2 className="w-4 h-4" /> {exp.company}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {exp.description}
                                        </p>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center opacity-30">
                                        <Briefcase className="w-12 h-12 mx-auto mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">Entry Level Node</p>
                                    </div>
                                )}
                             </div>
                        </div>

                        {/* Projects Section */}
                        {profile.projects?.length > 0 && (
                             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                             <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                                <Code2 className="w-5 h-5 text-indigo-500" /> Key Projects
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {profile.projects.map((proj, i) => (
                                    <div key={i} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">{proj.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 line-clamp-3">
                                            {proj.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-auto">
                                            {proj.techStack?.map(tech => (
                                                <span key={tech} className="text-[8px] font-black text-slate-400 uppercase border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-md">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
            
            <footer className="mt-20 py-10 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Professional Mesh • Nexus Security V2.5</p>
            </footer>
        </div>
    );
};

export default PublicProfile;
