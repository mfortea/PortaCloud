"use client";

import { logout, useAuth } from "../context/AuthContext";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const contentClass = user ? "content" : "content-sinnavbar";
  const TIEMPO_INACTIVIDAD = 15 * 60 * 1000; // 15 minutos


  useEffect(() => {
    let inactivityTimer;
  
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!document.hasFocus()) {
          localStorage.removeItem("token");
          localStorage.removeItem("deviceId");
          logout();
          toast.error("Sesión cerrada por inactividad");
          console.log("Sesión cerrada por inactividad");
        } else {
          resetInactivityTimer();
        }
      }, TIEMPO_INACTIVIDAD);
    };
  
    const events = ["mousemove", "keydown", "click"];
    events.forEach(event => window.addEventListener(event, resetInactivityTimer));
  
    resetInactivityTimer();
  
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, []);
  

  return (
    <>
      {user && <AppNavbar />}

      <div className={`scroll-container ${contentClass}`}>
        <main>{children}</main>
        <Footer />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
