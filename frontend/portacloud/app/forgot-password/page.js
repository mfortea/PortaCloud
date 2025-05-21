'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import PublicPage from "../../components/PublicPage";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${serverUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success('Correo enviado. Revisa tu bandeja de entrada');
        router.push('/login');
      } else {
        toast.error('Error al enviar el correo');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1>Contraseña olvidada</h1>
        </div>
      </div>

      <div className="login-section">
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <h2><i className="fa-solid fa-key pe-2"></i> Recuperar contraseña</h2>
              <br></br>
              <p className='mb-4'>Introduce el correo electrónico asociado a tu cuenta. Te enviaremos un correo para restablecer tu contraseña. Deberás revisar la bandeja de entrada y tu carpeta de SPAM</p>
              <input
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <button type="submit" className="login-button mt-3" disabled={isLoading}>
                {isLoading ? (
                  <div className="text-center text-white fa cargando fa-circle-notch"></div>
                ) : (
                  "Enviar correo"
                )}
              </button>
            </div>
          </form>
          <div className="register-link">
            <a href="/login">Volver a Inicio</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicPage(ForgotPassword);