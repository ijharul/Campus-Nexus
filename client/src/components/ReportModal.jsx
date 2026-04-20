import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { ShieldAlert, X, Loader2 } from "lucide-react";

const ReportModal = ({ targetUser, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setLoading(true);
    try {
      await api.post("/college-admin/reports", {
        targetId: targetUser._id,
        reason: reason,
      });
      toast.success("User successfully flagged. Our team will review this shortly.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="glass-card rounded-[2.5rem] w-full max-w-xl shadow-3xl animate-in zoom-in-95 duration-300 border-rose-500/20 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-rose-500" /> Flag for Review
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            You are flagging{" "}
            <span className="font-bold text-slate-900 dark:text-white px-2 bg-slate-100 dark:bg-slate-800 rounded">
              {targetUser.name}
            </span>
            . Please provide a clear reason for our moderation team.
          </p>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block pl-1">
              Reason for Report
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Harassment, fake profile, inappropriate content..."
              className="input-premium min-h-[160px] !text-base focus:ring-rose-500 border-slate-200 dark:border-slate-800 rounded-2xl"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-4 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
            {loading ? "Submitting..." : "Flag User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
