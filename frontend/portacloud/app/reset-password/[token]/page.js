'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { token } = useParams();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Token de recuperación inválido');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Ambos campos son obligatorios');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${serverUrl}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contraseña restablecida correctamente');
        router.push('/login');
      } else {
        toast.error(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1>Restablecer contraseña</h1>
        </div>
      </div>

      <div className="login-section">
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <h2><i className="fa-solid fa-key pe-2"></i> Nueva contraseña</h2>
              <br />
              <p>Introduce tu nueva contraseña</p>
              
              <label htmlFor="new-password">Nueva contraseña</label>
              <input
                id="new-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />

              <label className="mt-3" htmlFor="confirm-password">Confirmar contraseña</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repite tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <button 
                className="login-button mt-4" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fa fa-spinner fa-spin me-2"></i>
                    Procesando...
                  </>
                ) : 'Restablecer contraseña'}
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