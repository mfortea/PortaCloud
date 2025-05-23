"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const login = (userData) => {
    setUser({
      userId: userData.userId,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      resetPasswordToken: userData.resetPasswordToken,
      resetPasswordExpires: userData.resetPasswordExpires,
      createdAt: userData.createdAt,
      lastLogin: userData.lastLogin
    });
    localStorage.setItem("token", userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("deviceId");
  };

  const updateUser = (updatedUser) => {
    setUser({
      userId: updatedUser.userId,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      resetPasswordToken: updatedUser.resetPasswordToken,
      resetPasswordExpires: updatedUser.resetPasswordExpires,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin
    });
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthChecked(true);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_IP}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            userId: data.userId,
            username: data.username,
            email: data.email,
            role: data.role,
            resetPasswordToken: data.resetPasswordToken,
            resetPasswordExpires: data.resetPasswordExpires,
            createdAt: data.createdAt,
            lastLogin: data.lastLogin
          });
        }
      } catch (error) {
        console.error("Auth verification error:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, authChecked }}>
      {authChecked ? children : (
        <LoadingSpinner />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);