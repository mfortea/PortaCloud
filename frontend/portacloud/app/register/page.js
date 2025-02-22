'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CSSTransition } from 'react-transition-group';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Estados para las alertas
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showAlert, setShowAlert] = useState(false);

  // Efecto para ocultar la alerta automáticamente
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setNotification({ message: '', type: '' }); // Limpia la notificación
      }, 3000); // Oculta la alerta después de 3 segundos
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  
    const res = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token); // Guardar el token
      router.push('/dashboard'); // Redirige al dashboard
    } else {
      const errorData = await res.json(); // Obtén los detalles del error
      console.error('Error en el registro:', errorData); // Imprime el error en la consola
      setNotification({
        message: errorData.message || 'Registro fallido. Verifica tus credenciales.',
        type: 'danger',
      });
      setShowAlert(true); // Muestra la alerta
    }
  };

  return (
    <div className="container d-flex justify-content-center flex-column" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="card card_login shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', margin: 'auto' }}>
        <div className="d-flex align-items-center justify-content-center mb-4">
          <img src="/logo.png" alt="Logo" className="logo_ppal" />
          <span className="logo_letras ms-2 fs-2">
            <span className="negrita">PORTA</span>CLOUD
          </span>
        </div>

        <h2 className="text-center mb-4">Registrarse</h2>

        {notification.message && (
          <CSSTransition
            in={showAlert}
            timeout={300}
            classNames="alert"
            unmountOnExit
          >
            <div className={`alert alert-${notification.type}`} role="alert">
              {notification.message}
            </div>
          </CSSTransition>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Introduce tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '90%' }}>Registrarse</button>
        </form>

        <div className="text-center mt-3">
          <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a></p>
        </div>
      </div>
    </div>
  );
}