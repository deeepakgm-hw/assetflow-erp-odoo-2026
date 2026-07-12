import React, { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { user: loggedUser, token: authToken } = response.data;
      setUser(loggedUser);
      setToken(authToken);
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await authService.signup({ name, email, password });
      const { user: registeredUser, token: authToken } = response.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(registeredUser));
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    role: user?.role || null,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
