"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PublicPage from "../../components/PublicPage";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${serverUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Correo enviado. Revisa tu bandeja de entrada");
        router.push("/login");
      } else {
        toast.error("Error al enviar el correo. Verifica que el correo sea correcto o esté asociado a una cuenta existente");
      }
    } catch (error) {
      toast.error("Error de conexión");
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
            Recupera el acceso a tu portapapeles.
          </p>
        </div>
      </div>

      {/* Mitad Derecha (Formulario) */}
      <div className="login-section">
        <div className="login-card">
          <h2 className="mb-3 text-start">Recuperar contraseña</h2>
          
          <p className="mb-4 text-start" style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Introduce el correo electrónico asociado a tu cuenta. Te enviaremos un correo para restablecer tu contraseña. (No olvides revisar tu carpeta de SPAM).
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group mt-4">
              <input
                id="email"
                type="email"
                placeholder=" " /* Necesario para que flote la etiqueta */
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">Correo electrónico</label>
            </div>
            
            <button type="submit" className="login-button mt-3 mb-2" disabled={isLoading}>
              {isLoading ? (
                <div className="text-center text-white spinner"></div>
              ) : (
                "Enviar correo de recuperación"
              )}
            </button>
          </form>

          <div className="register-link mt-4">
            <p className="mb-2">¿Recordaste tu contraseña?</p>
            <a href="/login" className="boton_registrar btn w-100">
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicPage(ForgotPassword);