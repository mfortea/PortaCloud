"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); 
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  
    try {
      const res = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("deviceId", data.deviceId);
  
        // Asegúrate de pasar el userId al hacer login
        login({
          username: data.username,
          role: data.role,
          token: data.token,
          deviceId: data.deviceId,
          userId: data.userId, // Añadir esta línea
        });
  
        router.push("/");
      } else {
        // Notificación de error
        toast.error("Usuario o contraseña no válidos", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      // Notificación de error en caso de excepción
      toast.error("Error al conectar con el servidor", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

    useEffect(() => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isFirefox = userAgent.includes("firefox");
  
      if (isFirefox) {
        router.push("/no-soportado");
        return;
      }
    });

  return (
    <div className="login-landing-page">

      <div className="hero-section">
        <div className="hero-content">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1>Bienvenido a PortaCloud</h1>
          <p>Gestor de Portapapeles Multiplataforma con Sincronización en la Nube</p>
        </div>
      </div>

      {/* Sección del formulario de login */}
      <div className="login-section">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                id="username"
                type="text"
                placeholder="Introduce tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Introduce tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <div className="text-center text-white fa cargando fa-circle-notch"></div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="register-link">
            <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
          </div>
        </div>
      </div>

      {/* Estilos para el spinner */}
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s ease infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}