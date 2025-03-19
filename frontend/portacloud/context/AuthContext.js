// AuthContext.js
"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const login = (userData) => {
    setUser({
      userId: userData.userId,
      username: userData.username,
      role: userData.role
    });
    localStorage.setItem("token", userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("deviceId");
  };

  // Función para actualizar la información del usuario
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthChecked(true);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_IP}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            userId: data.userId,
            username: data.username,
            role: data.role
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
      {authChecked ? children : <div className="loading-spinner">
        <i className="fa fa-circle-notch cargando" aria-hidden="true"></i>
      </div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);