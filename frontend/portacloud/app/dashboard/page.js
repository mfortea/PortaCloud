"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [clipboardContent, setClipboardContent] = useState("");
  const router = useRouter();

  // Obtener el token y los datos del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Si no hay token, redirigir al login
      router.push("/login");
      return;
    }

    // Si hay token, intentar obtener la información del perfil
    fetch("http://localhost:5000/api/auth/profile", {
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
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });

    // Función para leer el contenido del portapapeles
    const fetchClipboardContent = async () => {
      try {
        const text = await navigator.clipboard.readText();
        setClipboardContent(text);
      } catch (err) {
        console.error("No se pudo acceder al portapapeles:", err);
        setClipboardContent("No se pudo obtener el contenido del portapapeles.");
      }
    };

    // Llamada inicial para obtener el contenido del portapapeles
    fetchClipboardContent();

    // Verificar el portapapeles cada segundo
    const intervalId = setInterval(() => {
      fetchClipboardContent(); 
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);


  const handleLogout = () => {
    localStorage.removeItem("token"); 
    router.push("/login"); 
  };

  if (!user) return <p>Cargando...</p>;

  const handleIndex = () => {
    router.push('/');
  };

  return (
    <div className="home-container">
      <img
        id="logo_ppal"
        onClick={handleIndex}
        src="/logo_horizontal.png"
        alt="Portacloud Logo"
      />
      <h1>Bienvenido, {user.username}!</h1>
      <h2>Tu portapapeles:</h2>
      <div
        className="clipboard-section"
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          marginTop: "10px",
          borderRadius: "5px",
          minHeight: "100px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {clipboardContent ? clipboardContent : "No hay contenido en el portapapeles."}
      </div>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}
