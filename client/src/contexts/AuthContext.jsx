import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { token, ...userData } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}! 👋`);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (
    name,
    email,
    password,
    role,
    collegeId,
    pendingCollege = "",
    pendingCollegeAddress = "",
    pendingCollegeWebsite = "",
    batch = "",
  ) => {
    try {
      const { data } = await api.post("/auth/signup", {
        name,
        email,
        password,
        role,
        collegeId,
        pendingCollege,
        pendingCollegeAddress,
        pendingCollegeWebsite,
        batch,
      });
      const { token, ...userData } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Account created! Welcome to Campus Nexus 🎉");
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  // Update local user cache after profile edits
  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, updateUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
