"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [clipboardContent, setClipboardContent] = useState(""); 
  const [isSafari, setIsSafari] = useState(false);
  const router = useRouter();

  // Detectar si el navegador es Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsSafari(/Safari/.test(ua) && !/Chrome/.test(ua));
  }, []);

  // Obtener el token y los datos del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:5050/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setUser(data);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login"); 
  };

  if (!user) return <p>Cargando...</p>;

  const handleIndex = () => {
    router.push("/");
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
      {}
      {isSafari && (
        <button
          onClick={fetchClipboardContent}
          style={{
            marginBottom: "10px",
            padding: "8px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Refrescar portapapeles
        </button>
      )}
      <div
        className="clipboard-section"
        style={{
          border: "1px solid #ddd",
          padding: "15px",
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