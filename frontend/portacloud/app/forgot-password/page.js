'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
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
              <p>Introduce el correo electrónico asociado a tu cuenta. Te enviaremos un correo para restablecer tu contraseña</p>
              <br></br>
              <input
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <button className="login-button mt-4" type="submit">Enviar correo</button>
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