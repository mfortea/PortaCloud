"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import PublicPage from "../../components/PublicPage";
import TermsModal from "../../components/modals/TermsModal";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    document.title = "Registro | PortaCloud";
    const metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = "Crea tu cuenta en PortaCloud";
    document.head.appendChild(metaDescription);
    return () => {
      document.head.removeChild(metaDescription);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isTermsAccepted) {
      toast.error("Debes aceptar los términos y condiciones.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$\%^&*(),.?":{}\vert{}<>]{12,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("La contraseña no cumple los requisitos mínimos indicados.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsLoading(true);
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

    try {
      const res = await fetch(`${serverUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        toast.success("Registro exitoso", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        login({
          username: data.username,
          email: data.email,
          role: data.role,
          token: data.token,
          userId: data.userId,
        });
        router.push("/dashboard");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Registro fallido. Verifica tus credenciales.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor", {
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
      {/* Mitad Izquierda (Branding) */}
      <div className="hero-section">
        <div className="hero-content zoom-al_cargar">
          <img src="/logo.png" alt="Logo" className="logo pe-3" />
          <span className="letras_login">
            <span className="negrita">PORTA</span>CLOUD
          </span>
          <p className="hero-subtitle mt-3">
            Únete a PortaCloud y sincroniza tu mundo al instante.
          </p>
        </div>
      </div>

      {/* Mitad Derecha (Formulario) */}
      <div className="login-section">
        <div className="login-card">
          <h2 className="mb-4 text-start">Crear cuenta nueva</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group mt-4">
              <input
                id="username"
                type="text"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="username">Nombre de usuario</label>
            </div>

            <div className="form-group">
              <input
                id="email"
                type="text"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">Correo electrónico</label>
            </div>

            <div className="form-group password-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Contraseña</label>
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            <div className="form-group password-group">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            <div className="password-requirements mb-4">
              <p>Requisitos de seguridad:</p>
              <ul>
                <li>Mínimo 12 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos un número</li>
                <li>Un símbolo especial (!, #, $, etc)</li>
              </ul>
            </div>

            <div className="checkbox-group mb-4">
              <label className="d-flex align-items-center gap-2">
                <input
                  id="checkbox_aceptar"
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                />
                <span>Acepto los <a id="a_terminos" href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>términos y condiciones.</a></span>
              </label>
            </div>

            <button
              type="submit"
              className="login-button mt-1 mb-2"
              disabled={isLoading || !isTermsAccepted}
            >
              {isLoading ? <div className="text-center text-white spinner"></div> : "Registrarse"}
            </button>
          </form>

          <div className="register-link mt-4">
            <p className="mb-2">¿Ya tienes una cuenta?</p>
            <a href="/login" className="boton_registrar btn w-100">Inicia sesión aquí</a>
          </div>
        </div>
      </div>

      <TermsModal show={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default PublicPage(Register);