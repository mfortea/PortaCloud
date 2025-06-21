"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicPage from "../../components/PublicPage";

function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  const { login: authLogin, user, authChecked } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const res = await fetch(`${serverUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
  
      // Verificamos que el fetch no haya fallado antes de intentar .json()
      let data = {};
      try {
        data = await res.json();
      } catch (jsonError) {
        console.warn("Respuesta no válida JSON:", jsonError);
      }
  
      if (!res.ok) {
        // Extraemos el mensaje del backend (si existe)
        const backendMessage = data.message || "Error en la autenticación";
        throw new Error(backendMessage); // Lanzamos el error con el mensaje del backend
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("deviceId", data.deviceId);
      localStorage.setItem("username", data.username);
  
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
  
      const isNetworkError = error.message === "Failed to fetch";
  
      // Mostrar el toast con el mensaje del error o el error por defecto
      toast.error(
        isNetworkError
          ? "Error: No se ha podido establecer conexión con el servidor"
          : error.message || "Error inesperado", // Usamos error.message aquí
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
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
                <div className="text-center text-white spinner"></div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="mt-4 register-link">
            <p>¿No tienes una cuenta?<br></br><a  className="boton_registrar btn" href="/register"><i className="fa-solid fa-user-plus pe-2"></i> Registrarse</a></p>
            <a href="/forgot-password">He olvidado mi contraseña</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicPage(Login);