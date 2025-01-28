"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [clipboardContent, setClipboardContent] = useState(null);
  const [isFetching, setIsFetching] = useState(false); 
  const router = useRouter();

  // Obtener el token y los datos del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP; 

    fetch(`${serverUrl}/api/auth/profile`, {
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

  // Leer contenido del portapapeles
  const fetchClipboard = async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const clipboardData = await navigator.clipboard.read();
      for (const item of clipboardData) {
        if (item.types.includes("image/png")) {
          const blob = await item.getType("image/png");
          const url = URL.createObjectURL(blob);
          if (clipboardContent?.content !== url) {
            setClipboardContent({ type: "image", content: url });
          }
        } else if (item.types.includes("text/plain")) {
          const text = await item.getType("text/plain").then((r) => r.text());
          if (clipboardContent?.content !== text) {
            setClipboardContent({ type: "text", content: text });
          }
        }
      }
    } catch (error) {
      console.error("Error leyendo el portapapeles:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Intervalo para actualizar el contenido del portapapeles cada 2 segundos
  useEffect(() => {
    const interval = setInterval(fetchClipboard, 2000);
    return () => clearInterval(interval);
  }, [clipboardContent]);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Función para refrescar manualmente el portapapeles
  const handleRefresh = () => {
    fetchClipboard();
  };

  if (!user) return <p>Cargando...</p>;

  // Volver al inicio
  const handleIndex = () => {
    router.push("/");
  };

  return (
    <div className="home-container">
      <img id="logo_ppal" onClick={handleIndex} src="/logo_horizontal.png" />
      <h1>Bienvenido, {user.username}!</h1>
      <h2>Tu portapapeles:</h2>
      <div className="clipboard-display">
        {clipboardContent ? (
          clipboardContent.type === "image" ? (
            <img
              src={clipboardContent.content}
              alt="Imagen del portapapeles"
              className="clipboard-image"
            />
          ) : (
            <p>{clipboardContent.content}</p>
          )
        ) : (
          <p>No hay contenido en el portapapeles</p>
        )}
      </div>
      <button onClick={handleRefresh}>Refrescar portapapeles</button>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}
