"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {login: authLogin } = useAuth();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
  
      const data = await res.json(); 
      
      if (!res.ok) {
        throw new Error(data.message || "Error en la autenticación");
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("deviceId", data.deviceId);
      

      await authLogin({
        username: data.username,
        email: data.email,
        role: data.role,
        token: data.token,
        deviceId: data.deviceId,
        userId: data.userId,
      });
  
      router.push("/dashboard");
      router.refresh();
  
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(error.message || "Error al contactar con el servidor", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-landing-page">
      <div className="hero-section">
        <div className="hero-content zoom-al_cargar">
          <img src="/logo.png" alt="Logo" className="logo pe-3" />
              <span className="letras_login">
                <span className="negrita">PORTA</span>CLOUD
              </span>
        </div>
      </div>

      {/* Sección del formulario de login */}
      <div className="login-section">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group mt-4">
              <label htmlFor="login">Usuario o Email</label>
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
            <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button mt-3" disabled={isLoading}>
              {isLoading ? (
                <div className="text-center text-white fa cargando fa-circle-notch"></div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="register-link">
            <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
            <a href="/forgot-password">He olvidado mi contraseña</a>
          </div>
        </div>
      </div>
    </div>
  );
}