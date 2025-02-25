// pages/dashboard.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth(); // Usa el contexto
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [clipboardContent, setClipboardContent] = useState(null);
  const [isSafari, setIsSafari] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshClipboard, setAutoRefreshClipboard] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showAlert, setShowAlert] = useState(false);

const [clipboardAnimation, setClipboardAnimation] = useState(false);

const actualizarPortapapeles = async () => {
  try {
    if (!navigator.clipboard || !document.hasFocus()) return;

    let newClipboardContent = null;

    if (isSafari) {
      const text = await navigator.clipboard.readText();
      newClipboardContent = { type: "text", content: text };
    } else {
      const clipboardData = await navigator.clipboard.read();
      for (const item of clipboardData) {
        if (item.types.includes("image/png")) {
          const blob = await item.getType("image/png");
          const url = URL.createObjectURL(blob);
          newClipboardContent = { type: "image", content: url, blob };
        } else if (item.types.includes("text/plain")) {
          const text = await item.getType("text/plain").then((r) => r.text());
          newClipboardContent = { type: "text", content: text };
        }
      }
    }

    if (newClipboardContent && newClipboardContent.content !== clipboardContent?.content) {
      setClipboardAnimation(true); // Activa la animación
      setTimeout(() => setClipboardAnimation(false), 1000); // Se desactiva tras 1s
      setClipboardContent(newClipboardContent);
    }
  } catch (error) {
    console.error("Error leyendo el portapapeles:", error);
  }
};


  const actualizarDispositivos = async (token) => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    try {
      const response = await fetch(`${serverUrl}/api/auth/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let devices = await response.json();

      // Excluir el dispositivo actual
      const currentDeviceId = localStorage.getItem("deviceId");
      devices = devices.filter((device) => device.deviceId !== currentDeviceId);

      setConnectedDevices(devices);
    } catch (error) {
      console.error("Error al obtener los dispositivos:", error);
    }
  };

  useEffect(() => {
    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("deviceId");
        router.push("/login"); // Redirige al login tras la inactividad
      }, 10 * 60 * 1000); // 10 minutos de inactividad
    };

    // Detectar eventos de usuario
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
    };
  }, []);


  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000); // Oculta el alert después de 3 segundos
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser =
      userAgent.includes("safari") && !userAgent.includes("chrome");
    setIsSafari(isSafariBrowser);
  }, []);

  useEffect(() => {
    actualizarPortapapeles();

    if (autoRefreshClipboard) {
      const interval = setInterval(() => {
        actualizarPortapapeles();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefreshClipboard]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      actualizarDispositivos(token);
    }
    const interval = setInterval(() => {
      if (token) {
        actualizarDispositivos(token);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); 
    } else if (!user) {
      setLoading(true);
    } else {
      setLoading(false); 
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fa fa-spinner cargando" aria-hidden="true"></i>
      </div>
    );
  }

  const getDeviceLogo = (deviceType, deviceName) => {
    const logos = {
      macos: "/macos.png",
      windows: "/windows.png",
      linux: "/linux.png",
      chrome: "/chrome.png",
      firefox: "/firefox.png",
      safari: "/safari.png",
      edge: "/edge.png",
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
        case "edge":
          return logos.edge;
        default:
          return logos.default;
      }
    }
    return logos.default;
  };

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

  const recargarDispositivos = () => {
    setRefreshing(true);
    actualizarDispositivos(localStorage.getItem("token"));
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleAutoRefreshClipboard = () => {
    setAutoRefreshClipboard((prevState) => !prevState);
  };

  const descargarContenido = () => {
    if (!clipboardContent) return;

    const now = new Date();
    const fileName = `${now.getDate().toString().padStart(2, "0")}_${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}_${now.getFullYear()}_${now
      .getHours()
      .toString()
      .padStart(2, "0")}_${now.getMinutes().toString().padStart(2, "0")}_${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const link = document.createElement("a");

    if (clipboardContent.type === "image" && clipboardContent.blob) {
      link.href = URL.createObjectURL(clipboardContent.blob);
      link.download = `portacloud_${fileName}.png`;
    } else if (clipboardContent.type === "text") {
      const blob = new Blob([clipboardContent.content], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.txt`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const borrarContenido = async () => {
    try {
      await navigator.clipboard.writeText("");
      setClipboardContent(" ");
    } catch (error) {
      console.error("Error al borrar el portapapeles:", error);
    }
  };

  const copiarContenido = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Contenido copiado al portapapeles.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Error al copiar el contenido.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const guardarContenido = async (content, type) => {
    if (!content) return;

    setSaving(true);
    const os = navigator.platform;
    const browser = navigator.userAgent;
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${serverUrl}/api/saved`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          os,
          browser,
          content,
          type,
        }),
      });

      if (response.ok) {
        toast.success("Contenido guardado con éxito.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error("Error al guardar el contenido.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      toast.error("Error al guardar el contenido.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa-solid fa-clipboard"></i>&nbsp; Mi portapapeles
      </h1>

      {notification.message && (
        <div>
          {showAlert && (
            <div className={`alert alert-${notification.type}`} role="alert">
              {notification.message}
            </div>
          )}
        </div>
      )}

      <div className="clipboard-display mb-4 text-center">
        {clipboardContent ? (
          clipboardContent.type === "image" ? (
            <img
              src={clipboardContent.content}
              alt="Imagen del portapapeles"
              className="img-fluid clipboard-image"
            />
          ) : (
            <p>{clipboardContent.content}</p>
          )
        ) : (
          <p>No hay contenido en el portapapeles</p>
        )}
      </div>

      {isSafari && (
        <button className="btn btn-info" onClick={actualizarPortapapeles}>
          <i className="fa fa-clipboard" aria-hidden="true"></i> Leer
          portapapeles
        </button>
      )}

      <div className="mt-3 text-center">
        <button
          className="btn boton_aux btn-primary"
          onClick={actualizarPortapapeles}
          disabled={refreshing}
        >
          {refreshing ? (
            <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-refresh" aria-hidden="true"></i>
          )}
        </button>

        <button
          className="btn boton_aux btn-success"
          title="Descargar el contenido a un fichero"
          onClick={descargarContenido}
        >
          <i className="fa fa-download" aria-hidden="true"></i>
        </button>

        <button
          className="btn boton_aux btn-warning"
          onClick={() =>
            guardarContenido(clipboardContent.content, clipboardContent.type)
          }
          title="Guardar contenido actual"
          disabled={saving || !clipboardContent}
        >
          {saving ? (
            <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-star" aria-hidden="true"></i>
          )}
        </button>

        <button
          className="btn boton_aux btn-danger"
          title="Limpiar portapapeles"
          onClick={borrarContenido}
        >
          <i className="fa fa-remove" aria-hidden="true"></i>
        </button>
      </div>

      <br></br><br></br>
      <h1 className="text-center mt-4 mb-4">
        <i className="fa-solid fa-tower-broadcast"></i> &nbsp;Dispositivos
        conectados
      </h1>

      <div className="text-center mb-4">
        <button
          className="btn boton_aux btn-primary"
          title="Refrescar lista de dispositivos"
          onClick={recargarDispositivos}
          disabled={refreshing}
        >
          {refreshing ? (
            <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-refresh" aria-hidden="true"></i>
          )}
        </button>
      </div>

      <div className="row">
        {connectedDevices.length > 0 ? (
          connectedDevices.map((device, index) => (
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

                  <p>
                    <strong>Portapapeles</strong>
                  </p>

                  <div
                    className="clipboard-box p-3 mt-3"
                    onClick={() => copiarContenido(device.clipboardContent)}
                    title="Copiar contenido"
                    style={{ cursor: "pointer" }}
                  >
                    <p>
                      {device.clipboardContent ||
                        "No hay contenido en el portapapeles"}
                    </p>
                  </div>

                  <button
                    className="btn boton_aux btn-warning mt-3"
                    onClick={() =>
                      guardarContenido(device.clipboardContent, "text")
                    }
                    disabled={saving || !device.clipboardContent}
                  >
                    {saving ? (
                      <i
                        className="fa fa-spinner fa-spin"
                        aria-hidden="true"
                      ></i>
                    ) : (
                      <i
                        className="fa fa-star"
                        aria-hidden="true"
                      ></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <h3>No hay dispositivos cercanos</h3>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-secondary"
          onClick={toggleAutoRefreshClipboard}
        >
          {autoRefreshClipboard
            ? "Desactivar actualización automática del portapapeles"
            : "Activar actualización automática del portapapeles"}
        </button>
      </div>
    </div>
  );
}
