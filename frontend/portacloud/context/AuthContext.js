// context/AuthContext.js
"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData); // Actualiza el estado del usuario
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null); // Limpia el estado del usuario
    localStorage.removeItem("token");
    localStorage.removeItem("deviceId");
  };

  // Verificar si el usuario está autenticado al cargar la página
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
      fetch(`${serverUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setUser(data); 
          }
        })
        .catch(() => {
          logout(); 
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);