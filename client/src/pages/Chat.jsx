import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { SocketContext } from "../contexts/SocketContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import {
  Send, Users, User, MessageSquare, Search, Paperclip, MoreVertical,
  ShieldCheck, Zap, PhoneCall, PhoneOff, ShieldAlert, ChevronLeft,
  GraduationCap, Edit2, Trash2, Loader2, StopCircle
} from "lucide-react";
import ReportModal from "../components/ReportModal";

export default function Chat() {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatType, setChatType] = useState("all");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mockCallActive, setMockCallActive] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const location = useLocation();
  const selectId = new URLSearchParams(location.search).get("select");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user) fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (message) => {
        if (activeRoom && ((activeRoom.groupId && message.groupId === activeRoom.groupId) || (!activeRoom.groupId && (message.sender._id === activeRoom.user._id || message.sender._id === user._id)))) {
          setMessages((prev) => [...prev, message]);
        }
      });
      socket.on("messageEdited", (msg) => setMessages(prev => prev.map(m => m._id === msg._id ? msg : m)));
      socket.on("messageDeleted", (data) => setMessages(prev => prev.map(m => m._id === data.id ? { ...m, isDeleted: true, content: 'This message was deleted.', mediaUrl: null } : m)));
      socket.on("incomingCall", (data) => setMockCallActive({ type: 'incoming', ...data }));
      socket.on("callAccepted", () => toast.success("Call connected."));
      socket.on("callRejected", () => { toast.error("Call declined."); setMockCallActive(false); });

      return () => {
         socket.off("receiveMessage"); socket.off("messageEdited"); socket.off("messageDeleted");
         socket.off("incomingCall"); socket.off("callAccepted"); socket.off("callRejected");
      }
    }
  }, [socket, activeRoom, user._id]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchInitialData = async () => {
    if (!user) return;
    try {
      const role = user.role?.toLowerCase();
      const mentorshipPath = (role === 'alumni' || role === 'collegeadmin') ? '/mentorship/mentor-requests' : '/mentorship/my-requests';
      const [reqsRes, mentorRes] = await Promise.all([
        api.get("/chat/requests").catch(() => ({ data: [] })),
        api.get(mentorshipPath).catch(() => ({ data: [] }))
      ]);
      const rawReqs = Array.isArray(reqsRes.data) ? reqsRes.data : [];
      const rawMentorships = Array.isArray(mentorRes.data) ? mentorRes.data : [];
      const acceptedRequests = rawReqs.filter(r => r && r.status === "accepted");
      setRequests(rawReqs.filter(r => r && r.status === "pending" && r.receiver?._id === user._id));
      const cId = user.collegeId?._id || user.collegeId;
      const roomsList = [];
      if (cId) {
        roomsList.push({ id: `general`, name: "Campus Hub", description: "Open discussion", groupId: `${cId}_general`, type: "group", icon: Users });
        if (role === "alumni" || role === "collegeadmin") roomsList.push({ id: `alumni_network`, name: "Alumni Circle", description: "Graduates only", groupId: `${cId}_alumni`, type: "group", icon: ShieldCheck });
        if (role === "student" || role === "collegeadmin") roomsList.push({ id: `student_network`, name: "Student Mesh", description: "Peer support", groupId: `${cId}_students`, type: "group", icon: GraduationCap });
      }
      const privateRoomsMap = new Map();
      acceptedRequests.forEach(r => {
        const other = r.sender?._id === user._id ? r.receiver : r.sender;
        if (other && other._id) privateRoomsMap.set(other._id, { id: other._id, name: other.name || 'User', user: { ...other, requestId: r._id }, type: "private", icon: User });
      });
      rawMentorships.filter(m => m && m.status === 'accepted').forEach(m => {
        const other = (role === 'student') ? m.mentor : m.student;
        if (other && other._id) privateRoomsMap.set(other._id, { id: other._id, name: other.name || 'Connected User', user: { ...other, requestId: m._id, callEnabled: m.callEnabled }, type: "private", icon: User });
      });
      const allRooms = [...roomsList, ...Array.from(privateRoomsMap.values())];
      setRooms(allRooms);
      if (selectId) {
        const targetRoom = allRooms.find(r => r.id === selectId);
        if (targetRoom) handleRoomSelect(targetRoom);
        else {
            try {
              const { data: targetUser } = await api.get(`/users/${selectId}/profile`);
              const newRoom = { id: targetUser._id, name: targetUser.name, user: targetUser, type: "private", icon: User };
              setRooms([newRoom, ...allRooms]); handleRoomSelect(newRoom);
            } catch (err) { if (allRooms.length > 0) handleRoomSelect(allRooms[0]); }
        }
      } else if (allRooms.length > 0) {
        if (window.innerWidth > 1024) handleRoomSelect(allRooms[0]);
      }
    } catch (err) { toast.error("Sync failed."); } finally { setLoading(false); }
  };

  const handleRoomSelect = async (room) => {
    if (room.type === "private" && room.user.role === "alumni" && user.role === "student" && user.plan === "Free") {
      toast.error("Pro exclusive feature.", { icon: "🔒" }); return;
    }
    setActiveRoom(room);
    setIsMobileListOpen(false);
    setShowMenu(false);
    try {
      const params = room.groupId ? { groupId: room.groupId } : { receiverId: room.user._id };
      const { data } = await api.get("/chat/messages", { params });
      setMessages(data);
      if (socket && room.groupId) socket.emit("joinRoom", room.groupId);
    } catch (err) { toast.error("History failed."); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeRoom) return;
    if (editingMsgId) {
       try { await api.put(`/chat/message/${editingMsgId}`, { content: newMessage }); setEditingMsgId(null); setNewMessage(""); }
       catch { toast.error("Edit failed"); } return;
    }
    const data = { content: newMessage, groupId: activeRoom.groupId || null, receiverId: activeRoom.user?._id || null };
    socket.emit("sendMessage", data); setNewMessage("");
  };

  const deleteMsg = async (id) => {
    try { await api.delete(`/chat/message/${id}`); toast.success("Recalled"); }
    catch { toast.error("Recall failed"); }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0]; if (!file || !activeRoom) return;
    const formData = new FormData(); formData.append("file", file);
    if (activeRoom.groupId) formData.append("groupId", activeRoom.groupId); else formData.append("receiverId", activeRoom.user._id);
    setUploading(true);
    try { const { data } = await api.post("/chat/media", formData); setMessages(prev => [...prev, data]); }
    catch { toast.error("Transfer failed"); } finally { setUploading(false); }
  };

  const startCall = () => {
      if (!activeRoom.user?.callEnabled && user.role === 'student') return toast.error("Call unauth.");
      setMockCallActive({ type: 'outgoing', target: activeRoom.user }); socket.emit("callInitiated", { receiverId: activeRoom.user._id });
  };

  const toggleCallAuth = async () => {
      try {
        const requestId = activeRoom.user?.requestId; if (!requestId) return toast.error("Error.");
        const { data } = await api.put(`/chat/request/${requestId}/call`);
        setActiveRoom(prev => ({ ...prev, user: { ...prev.user, callEnabled: data.callEnabled } }));
      } catch { toast.error("Failed."); }
  };

  const handleRequest = async (id, status) => {
    try { await api.put(`/chat/request/${id}`, { status }); toast.success(`Done.`); fetchInitialData(); }
    catch { toast.error("Error."); }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Establishing Mesh Link</p>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-slate-900/60 rounded-[2rem] overflow-hidden border border-white/[0.07] animate-in fade-in zoom-in-95 duration-500">
      
      {/* ── Sidebar (List) ── */}
      <div className={`
        absolute inset-0 z-20 w-full bg-slate-950 md:relative md:w-80 lg:w-[340px] flex flex-col border-r border-white-[0.05] md:bg-transparent
        transition-transform duration-500 ease-in-out
        ${isMobileListOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-white/5">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-sky-400" /> Nexus Mesh
          </h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
            <input
              type="text" placeholder="Search Mesh..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 placeholder:uppercase placeholder:tracking-widest outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex px-6 py-3 gap-1.5 border-b border-white/5 shrink-0 overflow-x-auto hide-scrollbar">
          {["all", "groups", "private"].map((t) => (
            <button
              key={t} onClick={() => setChatType(t)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chatType === t ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-500 hover:text-white bg-transparent hover:bg-white/5 border border-transparent"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 hide-scrollbar">
          {requests.map((r) => (
            <div key={r._id} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4">
               <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Req from {r.sender.name}</p>
               <div className="flex gap-2">
                 <button onClick={() => handleRequest(r._id, "accepted")} className="flex-1 py-2 bg-amber-500 shadow-lg shadow-amber-500/20 hover:bg-amber-600 text-slate-900 text-[10px] font-black uppercase rounded-xl transition-colors">Accept</button>
                 <button onClick={() => handleRequest(r._id, "rejected")} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-amber-500 text-[10px] font-black uppercase rounded-xl transition-colors">Reject</button>
               </div>
            </div>
          ))}

          {rooms.map((room) => {
            if (chatType !== "all" && chatType !== (room.type === "group" ? "groups" : "private")) return null;
            const isActive = activeRoom?.id === room.id;
            const isOnline = room.type === "private" && onlineUsers[room.user._id];

            return (
              <button
                key={room.id} onClick={() => handleRoomSelect(room)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border outline-none ${isActive ? "bg-white/10 border-white/10 shadow-lg" : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive || room.type === "group" ? "bg-gradient-to-br from-sky-500 to-indigo-600 text-white" : "bg-white/5 text-slate-400"}`}>
                    <room.icon className="w-5 h-5" />
                  </div>
                  {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[2px] border-slate-900 rounded-full" />}
                </div>
                <div className="flex-1 text-left min-w-0 pr-2">
                  <p className={`text-sm font-black truncate tracking-tight ${isActive ? 'text-white' : ''}`}>{room.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {room.type === "group" ? (
                      <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">{room.description}</span>
                    ) : (
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>{isOnline ? "Online" : "Offline"}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Chat Window ── */}
      <div className="flex-1 flex flex-col bg-transparent relative">
        {!activeRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/20">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-600 border border-white/5 mb-6 shadow-2xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-2">Nexus Messaging</h3>
            <p className="text-slate-500 font-medium text-xs max-w-xs">Select a node from the mesh to initiate secure communication.</p>
          </div>
        ) : (
          <>
            {/* Top Bar */}
            <div className="h-20 px-6 flex items-center justify-between border-b border-white-[0.05] bg-slate-900/40 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileListOpen(true)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                   <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <activeRoom.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight leading-none mb-1">{activeRoom.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${activeRoom.type === "group" || onlineUsers[activeRoom.user?._id] ? "bg-emerald-500" : "bg-slate-600"}`} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeRoom.type === "group" ? "Broadcast Active" : (onlineUsers[activeRoom.user?._id] ? "Node Online" : "Node Suspended")}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {activeRoom.type === "private" && (
                   <>
                     {user.role === 'alumni' && (
                        <button onClick={toggleCallAuth} className={`p-2.5 rounded-xl transition-all ${activeRoom.user?.callEnabled ? 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`} title="Toggle Call Access">
                           {activeRoom.user?.callEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                        </button>
                     )}
                     <button onClick={startCall} className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors" title="Initiate Call"><PhoneCall className="w-5 h-5" /></button>
                     <button onClick={() => setIsReporting(true)} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors" title="Report Flag"><ShieldAlert className="w-5 h-5" /></button>
                   </>
                )}
                
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                       <button onClick={() => { setMessages([]); setShowMenu(false); toast.success("Chat history cleared locally."); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">Clear Chat</button>
                       {activeRoom.type === 'private' && (
                          <button onClick={() => { setIsReporting(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">Report User</button>
                       )}
                       {activeRoom.type === 'group' && (
                          <button onClick={() => { setActiveRoom(null); setShowMenu(false); toast.success("Draft session closed."); }} className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors">Disconnect Mesh Node</button>
                       )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-slate-950/20">
              {messages.map((m, i) => {
                const isMe = m.sender._id === user._id;
                return (
                  <div key={m._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col space-y-1 relative group ${isMe ? "items-end" : "items-start"}`}>
                       
                       {activeRoom.type === "group" && (
                         <span className={`text-[10px] font-black uppercase tracking-widest drop-shadow-sm w-full ${isMe ? "text-right text-indigo-300 pr-2" : "text-left text-sky-400 pl-2"}`}>
                           {typeof m.sender === 'object' ? (m.sender?.name || 'Mesh User') : (isMe ? 'You' : 'Mesh User')}
                         </span>
                       )}
                       
                       <div className={`relative px-5 py-3.5 text-sm md:text-sm font-medium leading-relaxed transition-all 
                        ${isMe ? "bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-xl shadow-sky-500/10" 
                               : "bg-white/[0.04] border border-white/5 text-slate-200 rounded-2xl rounded-bl-sm"}`}>
                         
                         {/* Actions */}
                         {isMe && !m.isDeleted && (
                            <div className="absolute top-1 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex shadow-lg">
                               <button onClick={() => { setEditingMsgId(m._id); setNewMessage(m.content); }} className="w-8 h-8 flex items-center justify-center bg-slate-800 border border-white/10 rounded-l-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                               <button onClick={() => deleteMsg(m._id)} className="w-8 h-8 flex items-center justify-center bg-slate-800 border-y border-r border-white/10 rounded-r-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                         )}

                         {m.mediaUrl && m.mediaType === 'image' && (
                           <img src={m.mediaUrl} className="rounded-xl mb-3 max-h-60 w-full object-cover border border-white/10 cursor-zoom-in" onClick={() => window.open(m.mediaUrl, '_blank')} alt="attachment" />
                         )}
                         
                         <p className="whitespace-pre-wrap">{m.content}</p>
                         
                         <div className={`text-[9px] font-black uppercase tracking-widest mt-2 flex items-center justify-end ${isMe ? 'text-sky-200/80' : 'text-slate-500'}`}>
                           {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                           {m.isDeleted && <span className="ml-2 italic opacity-60">Deleted</span>}
                         </div>
                       </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/[0.05]">
              <form onSubmit={sendMessage} className="flex items-center gap-2 px-2 py-2 bg-slate-950/50 border border-white/10 rounded-[2rem] focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/50 transition-all shadow-inner">
                <label className="text-slate-400 hover:text-sky-400 p-3 cursor-pointer transition-all rounded-full hover:bg-white/5">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-sky-500" /> : <Paperclip className="w-5 h-5" />}
                  <input type="file" hidden onChange={handleMediaUpload} accept="image/*,application/pdf" />
                </label>
                
                <input
                  type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={editingMsgId ? "Editing... hit Enter to save" : "Enter unencrypted transmission..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-white placeholder:text-slate-500 outline-none px-2"
                />
                
                {editingMsgId && (
                  <button type="button" onClick={() => { setEditingMsgId(null); setNewMessage(""); }} className="p-3 text-slate-500 hover:text-rose-400 transition-colors">
                    <StopCircle className="w-5 h-5" />
                  </button>
                )}
                
                <button disabled={!newMessage.trim() && !uploading} type="submit" className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${newMessage.trim() ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 active:scale-95" : "bg-white/5 text-slate-600 cursor-not-allowed"}`}>
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* ── Call Interface ── */}
      {mockCallActive && (
         <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400 to-sky-600 flex items-center justify-center text-white text-6xl font-black shadow-[0_0_100px_rgba(16,185,129,0.3)] mb-12 relative animate-pulse">
               {mockCallActive.caller?.name?.[0] || mockCallActive.target?.name?.[0]}
               <div className="absolute inset-0 border-[4px] border-emerald-500 rounded-full animate-ping opacity-20" />
            </div>
            
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter truncate max-w-[80vw]">
               {mockCallActive.type === 'incoming' ? mockCallActive.caller.name : mockCallActive.target.name}
            </h2>
            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-16 animate-pulse">
               {mockCallActive.type === 'incoming' ? 'Incoming Transmision' : 'Establishing Secure Link...'}
            </p>
            
            <div className="flex gap-8">
               {mockCallActive.type === 'incoming' ? (
                  <>
                    <button onClick={() => { setMockCallActive(false); socket.emit("callAccepted", { callerId: mockCallActive.caller.id }); }} className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-transform"><PhoneCall className="w-6 h-6" /></button>
                    <button onClick={() => { setMockCallActive(false); socket.emit("callRejected", { callerId: mockCallActive.caller.id }); }} className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-500/40 hover:scale-110 transition-transform"><PhoneOff className="w-6 h-6" /></button>
                  </>
               ) : (
                  <button onClick={() => setMockCallActive(false)} className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-500/40 hover:scale-110 transition-transform"><PhoneOff className="w-6 h-6" /></button>
               )}
            </div>
         </div>
      )}
      
      {/* ── Report Modal ── */}
      {isReporting && activeRoom?.type === 'private' && (
        <ReportModal targetUser={activeRoom.user} onClose={() => setIsReporting(false)} />
      )}
    </div>
  );
}
