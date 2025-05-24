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
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{12,}$/;
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
      <div className="hero-section">
        <div className="hero-content">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1>Registrarse en PortaCloud</h1>
        </div>
      </div>

      <div className="login-section">
        <div className="login-card">
          <h2>
            <i className="fa-solid fa-user-plus"></i> Registrarse
          </h2>
          <br />
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
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="text"
                placeholder="Introduce tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <p className="mt-4 text-center">La contraseña debe contener al menos:</p>
            <ul className="mt-2">
              <li>12 caracteres</li>
              <li>Una letra mayúscula</li>
              <li>Un número</li>
              <li>Un símbolo especial (!,#,$, etc)</li>
            </ul>

            <div className="form-group">
              <label>
                <input
                  id="checkbox_aceptar"
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                />
                Acepto los
                <a
                  id="a_terminos"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                >
                  términos y condiciones.
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="login-button mt-3 mb-2"
              disabled={isLoading || !isTermsAccepted}
            >
              {isLoading ? <div className="text-center text-white spinner"></div> : "Registrarse"}
            </button>
          </form>

          <div className="register-link">
            <p>
              ¿Ya tienes una cuenta? <br />
              <a href="/login">Inicia sesión aquí</a>
            </p>
          </div>
        </div>
      </div>

      <TermsModal show={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default PublicPage(Register);
