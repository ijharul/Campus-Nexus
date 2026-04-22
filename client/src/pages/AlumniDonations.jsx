import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Heart, Zap, TrendingUp, Calendar, ChevronRight, 
  History, Wallet, Loader2, Sparkles, Building2, ArrowRight, ShieldCheck, Trophy, Award
} from 'lucide-react';

const AlumniDonations = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchData = async () => {
    try {
      const [c, d] = await Promise.all([
        api.get('/college-admin/campaigns'),
        api.get('/donations/my')
      ]);
      const activeCamps = c.data.filter(camp => camp.isActive !== false);
      setCampaigns(activeCamps);
      setMyDonations(d.data);

      // Handle deep linking from dashboard
      const params = new URLSearchParams(window.location.search);
      const campId = params.get('campaignId');
      if (campId) {
        const found = activeCamps.find(ac => ac._id === campId);
        if (found) setSelectedCampaign(found);
      }
    } catch {
      toast.error('Failed to sync donation ecosystem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!donationAmount || !selectedCampaign) return;
    
    setBusyId(selectedCampaign._id);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("External Payment SDK failed to deploy.");
        setBusyId(null);
        return;
      }

      const { data: order } = await api.post('/donations/create-order', {
        amount: Number(donationAmount)
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key',
        amount: order.amount,
        currency: order.currency,
        name: "Campus Nexus Philanthropy",
        description: `Project: ${selectedCampaign.title}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post('/donations/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(donationAmount),
              message: 'Alumni Contribution',
              campaignId: selectedCampaign._id
            });
            toast.success(`Donation of ₹${donationAmount} executed successfully!`);
            setDonationAmount('');
            setSelectedCampaign(null);
            fetchData();
          } catch (err) {
            toast.error("Transaction validation failed centrally.");
          }
        },
        prefill: {
          name: "Alumni Giveback"
        },
        theme: { color: "#6366f1" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
         toast.error(response.error.description || "Routing timeout");
      });
      paymentObject.open();

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Transaction initialization failed.';
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-[0.3em] font-display">Synching Philanthropy Nodes</p>
    </div>
  );

  const totalImpact = myDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-12 animate-in fade-in duration-700">
      
      {/* ── Philanthropy Header ── */}
      <div className="space-y-8">
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase rounded-lg tracking-[0.2em] border border-indigo-500/20 font-display">
              Endowment Hub
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5 font-display">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE LEGACY NETWORK
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none font-display uppercase whitespace-nowrap">
            Legacy <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent">Endowment</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm lg:text-base leading-relaxed italic border-l-2 border-indigo-500/20 pl-4 whitespace-nowrap">
            Architect institutional growth and empower the next generation of masters through strategic, high-impact contributions.
          </p>
        </div>

        <div className="flex bg-slate-900/60 p-2 rounded-2xl border border-white/5 backdrop-blur-3xl w-fit shadow-2xl">
          <button 
            onClick={() => setShowHistory(false)} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all font-display ${!showHistory ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-200'}`}
          >
            Active Missions
          </button>
          <button 
            onClick={() => setShowHistory(true)} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all font-display ${showHistory ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-200'}`}
          >
            Mission History
          </button>
        </div>
      </div>

      {/* ── Impact Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-slate-900/40 p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl transition-all hover:border-indigo-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-50" />
            <div className="absolute -top-12 -right-12 pointer-events-none opacity-[0.02] group-hover:opacity-[0.04] transition-all duration-1000 scale-150 rotate-12">
               <Trophy className="w-80 h-80" />
            </div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-display">Legacy Value</p>
                    <div className="h-0.5 w-6 bg-indigo-500 mt-0.5 rounded-full" />
                  </div>
               </div>
               <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter font-display uppercase">
                  ₹{totalImpact.toLocaleString()}
               </h2>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2.5 mt-6">
               <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/40 flex items-center gap-1.5 font-display">
                 <Award className="w-3.5 h-3.5" /> ELITE BENEFACTOR
               </div>
               <div className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 font-display">
                 <Zap className="w-3.5 h-3.5 text-amber-400" /> {myDonations.length} Contributions
               </div>
            </div>
         </div>

         <div className="rounded-[2.5rem] border border-white/[0.08] bg-slate-900/40 p-8 flex flex-col justify-center relative group hover:border-sky-500/30 transition-all duration-700 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-6 right-6 w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shadow-inner">
               <Building2 className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2 font-display">Active Missions</p>
            <h3 className="text-4xl font-black text-white tracking-tighter font-display">{campaigns.length}</h3>
         </div>

         <div className="rounded-[2.5rem] border border-white/[0.08] bg-slate-900/40 p-8 flex flex-col justify-center relative group hover:border-emerald-500/30 transition-all duration-700 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-6 right-6 w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
               <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2 font-display">Impact Tokens</p>
            <h3 className="text-4xl font-black text-emerald-400 tracking-tighter font-display">{Math.floor(totalImpact / 100)} IP</h3>
         </div>
      </div>

      {!showHistory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {campaigns.length === 0 ? (
             <div className="md:col-span-3 py-40 flex flex-col items-center justify-center rounded-[3.5rem] border border-dashed border-white/10 bg-slate-100/5 group shadow-2xl backdrop-blur-md">
                <Building2 className="w-20 h-20 text-slate-800 mb-8 group-hover:scale-110 transition-transform duration-700 opacity-50" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] font-display">Endowment Pipeline Empty</p>
             </div>
           ) : (
             campaigns.map(c => (
                <div key={c._id} className="relative group rounded-[3rem] border border-white/[0.08] bg-slate-900/60 p-10 flex flex-col transition-all duration-700 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] shadow-2xl backdrop-blur-xl">
                   <div className="flex justify-between items-start mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Heart className="w-7 h-7 fill-white/20" />
                      </div>
                      <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 font-display">
                        Live Mission
                      </div>
                   </div>
                   
                   <h3 className="text-3xl font-black text-white tracking-tight leading-tight mb-4 uppercase font-display group-hover:text-indigo-400 transition-colors">
                      {c.title}
                   </h3>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium mb-10 italic opacity-80 line-clamp-3">
                      "{c.description}"
                   </p>
                   
                   <div className="mt-auto space-y-8">
                      <div className="space-y-4">
                         <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-[0.1em] font-display">
                            <span className="text-slate-500 font-black">Capital Status</span>
                            <span className="text-white space-x-1">
                               <span className="text-lg tracking-tighter text-indigo-400">₹{c.raisedAmount.toLocaleString()}</span>
                               <span className="text-[10px] text-slate-600">/ ₹{c.goalAmount.toLocaleString()}</span>
                            </span>
                         </div>
                         <div className="relative w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
                            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                            <div className="relative h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-1000 ease-out" style={{ width: `${Math.min((c.raisedAmount / c.goalAmount) * 100, 100)}%` }} />
                         </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 font-display">
                         <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-slate-600" /> {new Date(c.endDate).toLocaleDateString()}</div>
                         <div className="flex items-center gap-2.5 text-emerald-500"><TrendingUp className="w-4 h-4" /> {Math.round((c.raisedAmount / c.goalAmount) * 100)}%</div>
                      </div>

                      {selectedCampaign?._id === c._id ? (
                        <form onSubmit={handleDonate} className="space-y-4 pt-4 animate-in slide-in-from-bottom-6 duration-500">
                           <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-lg font-display">₹</span>
                              <input 
                                 required type="number" autoFocus 
                                 placeholder="Enter Investment" 
                                 value={donationAmount}
                                 onChange={e => setDonationAmount(e.target.value)}
                                 className="w-full pl-12 pr-6 py-5 bg-slate-950/80 border border-indigo-500/40 rounded-2xl text-base font-black text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-slate-700 font-display shadow-inner"
                              />
                           </div>
                           <div className="flex gap-3">
                              <button disabled={busyId === c._id} type="submit" className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all font-display">
                                {busyId === c._id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Legacy Asset'}
                              </button>
                              <button type="button" onClick={() => setSelectedCampaign(null)} className="px-6 py-5 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-200 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl transition-all font-display">Cancel</button>
                           </div>
                        </form>
                      ) : (
                        <button onClick={() => setSelectedCampaign(c)} className="w-full py-5 bg-white hover:bg-slate-100 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center group active:scale-95 font-display border-2 border-transparent hover:border-white">
                           Endow Project <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                        </button>
                      )}
                   </div>
                </div>
              ))
           )}
        </div>
      ) : (
        <div className="rounded-[3rem] border border-white/[0.08] bg-slate-950/60 backdrop-blur-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-white/[0.03]">
                      {['Node ID', 'Mission / Asset', 'Execution Date', 'Legacy Value'].map(h => (
                        <th key={h} className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] font-display">{h}</th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                   {myDonations.length === 0 ? (
                      <tr><td colSpan="4" className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20 group">
                          <History className="w-16 h-16 group-hover:rotate-[-45deg] transition-transform duration-1000" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] font-display">No documented legacy nodes</p>
                        </div>
                      </td></tr>
                   ) : (
                      myDonations.map(d => (
                         <tr key={d._id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-10 py-8">
                              <span className="px-3 py-1.5 bg-white/5 rounded-xl font-mono text-[10px] text-slate-500 uppercase group-hover:text-indigo-400 group-hover:bg-indigo-500/5 transition-all border border-transparent group-hover:border-indigo-500/20">
                                #{d._id.slice(-8)}
                              </span>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-base font-black text-white tracking-tight uppercase font-display group-hover:text-indigo-400 transition-colors">{d.campaignId?.title || 'General Endowment'}</p>
                               <p className="text-[10px] text-slate-600 font-bold mt-2 tracking-[0.1em] uppercase font-display">{d.message || 'Strategic Asset Allocation'}</p>
                            </td>
                            <td className="px-10 py-8 text-[11px] text-slate-500 font-black uppercase tracking-[0.15em] font-display">{new Date(d.createdAt).toLocaleDateString()}</td>
                            <td className="px-10 py-8">
                               <div className="flex flex-col items-start gap-1">
                                  <span className="text-xl font-black text-emerald-400 tracking-tighter font-display">+ ₹{d.amount.toLocaleString()}</span>
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-sm">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest font-display">Verified Legacy</span>
                                  </div>
                               </div>
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
           </div>
        </div>
      )}

    </div>
  );
};

export default AlumniDonations;
