'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Obtener el token y los datos del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Si no hay token, redirigir al login
      router.push('/login');
      return;
    }

    // Si hay token, intentar obtener la información del perfil
    fetch('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setUser(data);
        } else {
          // Si no se recibe la respuesta esperada, redirigir al login
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token
    router.push('/login'); // Redirigir al login
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Bienvenido, {user.username}!</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}
