import { useState, useEffect, useContext, useRef } from 'react';
import { Bell, Check, ExternalLink, Inbox, MessageSquare, UserCheck, Zap, MailOpen, Clock, Trash2 } from 'lucide-react';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        
        // Listen for real-time notifications
        if (socket && user) {
            const eventName = `notification_${user._id}`;
            socket.on(eventName, (newNotify) => {
                setNotifications(prev => [newNotify, ...prev]);
                setUnreadCount(c => c + 1);
            });
            return () => socket.off(eventName);
        }
    }, [socket, user]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to sync notification nodes.');
        }
    };

    const markOneRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch (err) {
            console.error('Failed to sync node state.');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (err) {
            console.error('Failed to update read state.');
        }
    };

    const clearAllNotifications = async () => {
        if (!window.confirm('Delete all notifications permanently?')) return;
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setUnreadCount(0);
            toast.success('Notifications cleared');
        } catch (err) {
            toast.error('Failed to clear notifications');
        }
    };

    const typeIcons = {
        mentorship: { icon: UserCheck, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
        referral: { icon: Inbox, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
        message: { icon: MessageSquare, color: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10' },
        request_accepted: { icon: Check, color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
        request_rejected: { icon: MailOpen, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' },
        donation: { icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                 )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-[24rem] bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all border border-slate-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Alert Center</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{unreadCount} unread items</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-[10px] font-black text-sky-500 hover:text-sky-600 uppercase tracking-widest transition-colors">Mark Read</button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={clearAllNotifications} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-20 px-10 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Clear Sector</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">No anomalies detected in your notification mesh.</p>
                                </div>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const meta = typeIcons[n.type] || { icon: Bell, color: 'text-gray-400 bg-gray-50' };
                                return (
                                    <Link 
                                        key={n._id}
                                        to={n.link || '#'}
                                        onClick={() => {
                                            if (!n.isRead) markOneRead(n._id);
                                            setIsOpen(false);
                                        }}
                                        className={`block p-5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors border-b border-gray-50 dark:border-white/5 last:border-0 ${!n.isRead ? 'bg-sky-50/30 dark:bg-sky-500/5' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`h-11 w-11 rounded-2xl shrink-0 flex items-center justify-center shadow-inner ${meta.color} ${!n.isRead ? 'ring-2 ring-sky-500/20' : ''}`}>
                                                <meta.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                   <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{n.type?.replace('_', ' ')}</span>
                                                   {!n.isRead && <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] animate-pulse"></span>}
                                                </div>
                                                <p className={`text-xs font-medium leading-relaxed ${!n.isRead ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-tighter">
                                                        {new Date(n.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
