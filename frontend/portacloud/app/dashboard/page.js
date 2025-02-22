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

  const getDeviceLogo = (deviceType, deviceName) => {
    const logos = {
      macos: "/macos.png",
      windows: "/windows.png",
      linux: "/linux.png",
      chrome: "/chrome.png",
      firefox: "/firefox.png",
      safari: "/safari.png",
      default: "/default.png",
    };

    if (deviceType === "os") {
      switch (deviceName.toLowerCase()) {
        case "macos":
          return logos.macos;
        case "windows":
          return logos.windows;
        case "linux":
          return logos.linux;
        default:
          return logos.default;
      }
    } else if (deviceType === "browser") {
      switch (deviceName.toLowerCase()) {
        case "chrome":
          return logos.chrome;
        case "firefox":
          return logos.firefox;
        case "safari":
          return logos.safari;
        default:
          return logos.default;
      }
    }
    return logos.default;
  };

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser =
      userAgent.includes("safari") && !userAgent.includes("chrome");
    setIsSafari(isSafariBrowser);
  }, []);

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

  useEffect(() => {
    if (autoRefreshClipboard) {
      const interval = setInterval(() => {
        fetchClipboard();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefreshClipboard]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDevices(localStorage.getItem("token"));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const recargarDispositivos = () => {
    setRefreshing(true);
    fetchDevices(localStorage.getItem("token"));
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleAutoRefreshClipboard = () => {
    setAutoRefreshClipboard((prevState) => !prevState);
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa-solid fa-clipboard"></i>&nbsp; Mi portapapeles
      </h1>
      <div className="clipboard-display mb-4 text-center">
        {clipboardContent ? (
          clipboardContent.type === "image" ? (
            <>
              <img
                src={clipboardContent.content}
                alt="Imagen del portapapeles"
                className="img-fluid clipboard-image"
              />
              <br />
              <button className="btn btn-secondary mt-3" onClick={descargarImagen}>
                <i className="fa fa-download" aria-hidden="true"></i> Descargar imagen
              </button>
            </>
          ) : (
            <p>{clipboardContent.content}</p>
          )
        ) : (
          <p>No hay contenido en el portapapeles</p>
        )}
      </div>

      <div className="text-center mb-4">
        <button className="btn btn-primary" onClick={fetchClipboard}>
          <i className="fa fa-refresh" aria-hidden="true"></i> Refrescar portapapeles
        </button>
        {isSafari && (
          <button className="btn btn-info ms-2" onClick={fetchClipboard}>
            <i className="fa fa-clipboard" aria-hidden="true"></i> Leer portapapeles
          </button>
        )}
      </div>

      <hr />
      <h2 className="text-center mt-4 mb-4">
        <i className="fa-solid fa-tower-broadcast"></i> &nbsp;Dispositivos conectados
      </h2>

      <div className="text-center mb-4">
        <button className="btn btn-warning" onClick={recargarDispositivos} disabled={refreshing}>
          {refreshing ? (
            <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-refresh" aria-hidden="true"></i>
          )}
          &nbsp;Actualizar dispositivos
        </button>
      </div>

<div className="row">
  {connectedDevices.map((device, index) => (
    <div key={index} className="col-12 col-md-4 mb-3">
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <div className="d-flex justify-content-center mb-2">
            <img
              src={getDeviceLogo("os", device.os)}
              alt={device.os}
              className="img-fluid"
              style={{ width: 40, height: 40 }}
            />
            
            <img
              src={getDeviceLogo("browser", device.browser)}
              alt={device.browser}
              className="img-fluid"
              style={{ width: 40, height: 40 }}
            />
          </div>

          <p><strong>Portapapeles</strong></p>

          <div className="clipboard-box p-3 mt-3">
            <p>{device.clipboardContent || "No hay contenido en el portapapeles"}</p>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={toggleAutoRefreshClipboard}>
          {autoRefreshClipboard
            ? "Desactivar actualización automática del portapapeles"
            : "Activar actualización automática del portapapeles"}
        </button>
      </div>
    </div>
  );
}