"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicPage from "../../components/PublicPage";

function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NUEVO: Estado para ver contraseña
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
  
      let data = {};
      try {
        data = await res.json();
      } catch (jsonError) {
        console.warn("Respuesta no válida JSON:", jsonError);
      }
  
      if (!res.ok) {
        const backendMessage = data.message || "Error en la autenticación";
        throw new Error(backendMessage);
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
  
      toast.error(
        isNetworkError
          ? "Error: No se ha podido establecer conexión con el servidor"
          : error.message || "Error inesperado",
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
      {/* Mitad Izquierda (Branding) */}
      <div className="hero-section">
        <div className="hero-content zoom-al_cargar">
          <img src="/logo.png" alt="Logo" className="logo pe-3" />
          <span className="letras_login">
            <span className="negrita">PORTA</span>CLOUD
          </span>
          <p className="hero-subtitle mt-3">
            Tu portapapeles universal, sincronizado al instante.
          </p>
        </div>
      </div>

      {/* Mitad Derecha (Formulario) */}
      <div className="login-section">
        <div className="login-card">
          <h2 className="mb-4 text-start">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group mt-4">
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                placeholder=" " /* Necesario para la etiqueta flotante */
              />
              <label htmlFor="login">Usuario o Email</label>
            </div>
            
            <div className="form-group password-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" " /* Necesario para la etiqueta flotante */
              />
              <label htmlFor="password">Contraseña</label>
              
              {/* NUEVO: Botón de ojito para la contraseña */}
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            <div className="d-flex justify-content-end mb-4">
               <a href="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="login-button mt-1" disabled={isLoading}>
              {isLoading ? (
                <div className="text-center text-white spinner"></div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="mt-5 register-link">
            <p className="mb-3">¿No tienes una cuenta?</p>
            <a className="boton_registrar btn w-100" href="/register">
              Crear cuenta nueva
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicPage(Login);