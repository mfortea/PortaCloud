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
    const interval = setInterval(fetchClipboard, 1000);
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

  if (!user)
    return (
      <div className="home-container">
        <i className="fa-solid fa-spinner cargando"></i>
      </div>
    );

  return (
    <div className="home-container">
      <h3>
        <i className="fa-solid fa-user"></i>&nbsp;Usuario: {user.username}
      </h3>
      <br />
      <br />
      <h2>
        <i className="fa-solid fa-clipboard"></i>&nbsp;Tu portapapeles
      </h2>
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
      <br></br>
      <button onClick={handleRefresh}>
        <i className="fa fa-refresh" aria-hidden="true"></i> Refrescar
        portapapeles
      </button>
      <button onClick={handleLogout}>
        <i className="fa fa-sign-out" aria-hidden="true"></i> Cerrar sesión
      </button>
      <hr></hr>
      <br />
      <br />
      <h2>
        <i className="fa-solid fa-tower-broadcast"></i> &nbsp;Dispositivos
        conectados
      </h2>
    </div>
  );
}
