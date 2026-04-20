import { useState, useEffect, useContext, useRef } from 'react';
import { Bell, Check, ExternalLink, Inbox, MessageSquare, UserCheck, Zap, MailOpen } from 'lucide-react';
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
                toast(newNotify.message, { icon: '🔔' });
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

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to update read state.');
        }
    };

    const typeIcons = {
        mentorship: { icon: UserCheck, color: 'text-indigo-500 bg-indigo-50' },
        referral: { icon: Inbox, color: 'text-emerald-500 bg-emerald-50' },
        message: { icon: MessageSquare, color: 'text-sky-500 bg-sky-50' },
        request_accepted: { icon: Check, color: 'text-green-500 bg-green-50' },
        request_rejected: { icon: MailOpen, color: 'text-rose-500 bg-rose-50' },
        donation: { icon: Zap, color: 'text-amber-500 bg-amber-50' }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-100 rounded-full transition-all focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                 )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Notification Center</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase">Mark all read</button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-xs text-gray-400 font-medium">No alerts detected in this sector.</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const meta = typeIcons[n.type] || { icon: Bell, color: 'text-gray-400 bg-gray-50' };
                                return (
                                    <Link 
                                        key={n._id}
                                        to={n.link || '#'}
                                        onClick={() => setIsOpen(false)}
                                        className={`block p-4 hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-sky-50/30' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${meta.color}`}>
                                                <meta.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium leading-relaxed ${!n.isRead ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                                        {new Date(n.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-500"></span>}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-gray-100 text-center">
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">View All Activity</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
