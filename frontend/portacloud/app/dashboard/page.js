"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [clipboardContent, setClipboardContent] = useState(null);
  const [isSafari, setIsSafari] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const router = useRouter();
  let socket;
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshClipboard, setAutoRefreshClipboard] = useState(true);

  // Detectar si el navegador es Safari 
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser =
      userAgent.includes("safari") && !userAgent.includes("chrome");
    setIsSafari(isSafariBrowser);
  }, []);

  // Obtener el token y los datos del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    fetch(`${serverUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setUser(data);
          initSocket(serverUrl, token);
          fetchDevices(token);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Iniciar conexión de WebSocket
  const initSocket = (serverUrl, token) => {
    socket = io(serverUrl, { auth: { token } });

    socket.on("updateDevices", (devices) => {
      setConnectedDevices(devices);
    });

    socket.on("newConnection", (message) => {
      console.log(message);
    });

    socket.on("disconnectClient", (message) => {
      console.log(message);
    });
  };

  // Obtener dispositivos conectados
  const fetchDevices = async (token) => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    try {
      const response = await fetch(`${serverUrl}/api/auth/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const devices = await response.json();
      setConnectedDevices(devices);
    } catch (error) {
      console.error("Error al obtener los dispositivos:", error);
    }
  };

  // Función para leer el contenido del portapapeles
  const fetchClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        console.warn("El acceso al portapapeles no está soportado en este navegador.");
        return;
      }
  
      if (!document.hasFocus()) {
        console.warn("Intento de leer el portapapeles sin foco en la pestaña.");
        return;
      }
  
      let newClipboardContent = null;
  
      if (isSafari) {
        const text = await navigator.clipboard.readText();
        newClipboardContent = { type: "text", content: text };
        setClipboardContent(newClipboardContent);
      } else {
        const clipboardData = await navigator.clipboard.read();
        for (const item of clipboardData) {
          if (item.types.includes("image/png")) {
            const blob = await item.getType("image/png");
            const url = URL.createObjectURL(blob);
            newClipboardContent = { type: "image", content: url, blob };
            setClipboardContent(newClipboardContent);
          } else if (item.types.includes("text/plain")) {
            const text = await item.getType("text/plain").then((r) => r.text());
            newClipboardContent = { type: "text", content: text };
            setClipboardContent(newClipboardContent);
          }
        }
      }
  
      if (newClipboardContent) {
        const token = localStorage.getItem("token");
        const deviceId = localStorage.getItem("deviceId");
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  
        // Enviar el contenido del portapapeles al backend
        await fetch(`${serverUrl}/api/auth/updateClipboard`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceId,
            clipboardContent: newClipboardContent.content,
          }),
        });
      }
    } catch (error) {
      console.error("Error leyendo el portapapeles:", error);
    }
  };
  

  // Configurar actualización automática cada 1 segundo para portapapeles si autoRefreshClipboard está activado
  useEffect(() => {
    if (autoRefreshClipboard) {
      const interval = setInterval(() => {
        fetchClipboard();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefreshClipboard]);

  // Configurar actualización automática cada 5 segundos para dispositivos conectados
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDevices(localStorage.getItem("token"));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Función para descargar la imagen
  const descargarImagen = () => {
    if (clipboardContent?.type === "image" && clipboardContent.blob) {
      const link = document.createElement("a");
      const now = new Date();
      const fileName = `portacloud_${now
        .toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/[\s/:]/g, "_")}.png`;

      link.href = URL.createObjectURL(clipboardContent.blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

    fetch(`${serverUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceId }),
    }).finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("deviceId");
      router.push("/login");
    });
  };

  // Refrescar manualmente los dispositivos conectados
  const recargarDispositivos = () => {
    setRefreshing(true);
    fetchDevices(localStorage.getItem("token"));
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Controlar la actualización automática
  const toggleAutoRefreshClipboard = () => {
    setAutoRefreshClipboard((prevState) => !prevState);
  };

  return (
    <div className="home-container">
      <h3>
        <i className="fa-solid fa-user"></i>&nbsp;Usuario: {user?.username}
      </h3>
      <br />
      <h2>
        <i className="fa-solid fa-clipboard"></i>&nbsp;Tu portapapeles
      </h2>
      <div className="clipboard-display">
        {clipboardContent ? (
          clipboardContent.type === "image" ? (
            <>
              <img
                src={clipboardContent.content}
                alt="Imagen del portapapeles"
                className="clipboard-image"
              />
              <br />
              <button onClick={descargarImagen}>
                <i className="fa fa-download" aria-hidden="true"></i> Descargar
                imagen
              </button>
            </>
          ) : (
            <p>{clipboardContent.content}</p>
          )
        ) : (
          <p>No hay contenido en el portapapeles</p>
        )}
      </div>

      <br></br>

      <button onClick={fetchClipboard}>
        <i className="fa fa-refresh" aria-hidden="true"></i> Refrescar
        portapapeles
      </button>


      {isSafari && (
        <button onClick={fetchClipboard}>
          <i className="fa fa-clipboard" aria-hidden="true"></i> Leer
          portapapeles
        </button>
      )}

      <button onClick={handleLogout}>
        <i className="fa fa-sign-out" aria-hidden="true"></i> Cerrar sesión
      </button>

      <hr />
      <br />
      <h2>
        <i className="fa-solid fa-tower-broadcast"></i> &nbsp;Dispositivos
        conectados
      </h2>

      <button onClick={recargarDispositivos} disabled={refreshing}>
        {refreshing ? (
          <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
        ) : (
          <i className="fa fa-refresh" aria-hidden="true"></i>
        )}
        &nbsp;Actualizar dispositivos
      </button>

      <div className="device-list">
        {connectedDevices.map((device, index) => (
          <div key={index} className="device-card">
            <p>
              <strong>Sistema Operativo:</strong> {device.os}
            </p>
            <p>
              <strong>Navegador:</strong> {device.browser}
            </p>
            <p>
              <strong>Contenido del portapapeles:</strong>{" "}
              {device.clipboardContent}
            </p>
          </div>
        ))}
      </div>

      <button onClick={toggleAutoRefreshClipboard}>
        {autoRefreshClipboard
          ? "Desactivar actualización automática del portapapeles"
          : "Activar actualización automática del portapapeles"}
      </button>
    </div>
  );
}
