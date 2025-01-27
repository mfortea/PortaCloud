'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './globals.css'; // Importamos los estilos de la página

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Comprobar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    if (token) {
      // Si el token está presente, redirigir al dashboard
      router.push('/dashboard');
    }
  }, [router]);

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Bienvenido a PortaCloud</h1>
      <p className="home-description">Si ya tienes cuenta, puedes iniciar sesión, o si no, registrarte.</p>
      <div className="home-buttons">
        <button onClick={handleLoginClick} className="home-button">
          Iniciar sesión
        </button>
        <button onClick={handleRegisterClick} className="home-button">
          Registrarse
        </button>
      </div>
    </div>
  );
}
