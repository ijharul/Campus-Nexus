import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import { Search, User, Briefcase, Loader2, X } from "lucide-react";

const SearchBox = () => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], drives: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults({ users: [], drives: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/search?q=${query}`);
      setResults(data);
      setIsOpen(true);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type, id) => {
    setIsOpen(false);
    setQuery("");
    if (type === "user") {
      navigate(`/alumni/${id}`);
    } else {
      navigate(`/drives/${id}`);
    }
  };

  return (
    <div className="relative flex-1 max-w-lg" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="block w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-brand-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 outline-none transition-all"
          placeholder={user?.role === 'alumni' ? "Search alumni, students..." : "Search people, placement drives..."}
        />
        {query && (
            <button 
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
                <X className="h-4 w-4" />
            </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (results.users.length > 0 || results.drives.length > 0) && (
        <div className="absolute mt-3 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* Users Section */}
            {results.users.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Members</p>
                {results.users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelect("user", user._id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-transparent group-hover:border-brand-500/30 transition-all shrink-0">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                          {user.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tight">
                        {user.currentRole || user.role} {user.company ? `@ ${user.company}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Placement Drives Section - Only for Students and Admins */}
            {user?.role !== 'alumni' && results.drives.length > 0 && (
              <div className="p-2 border-t border-slate-50 dark:border-slate-800">
                <p className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Placement Drives</p>
                {results.drives.map((drive) => (
                  <button
                    key={drive._id}
                    onClick={() => handleSelect("drive", drive._id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{drive.companyName}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tight">{drive.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.users.length === 0 && results.drives.length === 0 && !loading && (
        <div className="absolute mt-3 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center shadow-2xl z-[60]">
          <p className="text-sm font-medium text-slate-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
