'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Comprobar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    if (token) {
      // Si el token está presente, redirigir al dashboard
      router.push('/dashboard');
    } else {
      // Si no hay token, redirigir al login
      router.push('/login');
    }
  }, [router]);

  // No es necesario renderizar nada en la página de inicio
  return null;
}