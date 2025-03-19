// pages/dashboard.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { UAParser } from 'ua-parser-js';
import { MdOutlinePhoneIphone } from "react-icons/md";
import { IoMdDesktop } from "react-icons/io";
import { BsTabletLandscape } from "react-icons/bs";
import { MdDevices } from "react-icons/md";
import { MdUpdate } from "react-icons/md";
import { MdUpdateDisabled } from "react-icons/md";
import CryptoJS from "crypto-js";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clipboardContent, setClipboardContent] = useState(null);
  const [isSafari, setIsSafari] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshClipboard, setAutoRefreshClipboard] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [clipboardAnimation, setClipboardAnimation] = useState(false);
  const platform = require('platform');
  const [showSafariModal, setShowSafariModal] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [lastHash, setLastHash] = useState("");
  const token = localStorage.getItem("token");
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

  const actualizarPortapapeles = async () => {
    try {
      if (!navigator.clipboard) return;

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
            newClipboardContent = { 
              type: "image", 
              content: url,
              blob: blob,
              raw: blob // Guardamos el blob original para enviar al backend
            };
          } else if (item.types.includes("text/plain")) {
            const text = await item.getType("text/plain").then((r) => r.text());
            newClipboardContent = { type: "text", content: text };
          }
        }
      }

      if (newClipboardContent?.content !== clipboardContent?.content) {
        setClipboardAnimation(true);
        setTimeout(() => setClipboardAnimation(false), 1000);
        setClipboardContent(newClipboardContent);

        // Envío al backend
        const token = localStorage.getItem("token");
        const deviceId = localStorage.getItem("deviceId");
        const formData = new FormData();

        if (newClipboardContent.type === "image") {
          formData.append("image", newClipboardContent.raw, "clipboard-image.png");
          formData.append("type", "image");
        } else {
          formData.append("content", newClipboardContent.content);
          formData.append("type", "text");
        }

        formData.append("deviceId", deviceId);

        const response = await fetch(`${serverUrl}/api/auth/updateClipboard`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const result = await response.json();
        console.log("Respuesta del servidor:", result);
      }
    } catch (error) {
      console.error("Error actualizando el portapapeles:", error);
    }
  };


  const guardarContenido = async (content, type, os, browser, deviceType) => {
    if (!content) {
      toast.error("No hay contenido para guardar");
      return;
    }
  
    setSaving(true);
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    const token = localStorage.getItem("token");
  
    try {
      const formData = new FormData();
  
      // Añadir campos comunes al FormData
      formData.append("os", os);
      formData.append("browser", browser);
      formData.append("deviceType", deviceType);
      formData.append("type", type);
  
      if (type === "image") {
        // Si es una imagen del portapapeles local
        if (content.startsWith("blob:")) {
          // Obtener el Blob desde la URL de tipo blob
          const response = await fetch(content);
          const blob = await response.blob();
          formData.append("image", blob, "clipboard-image.png");
        } 
        // Si es una imagen de un dispositivo remoto
        else if (content.startsWith("/uploads/")) {
          const cleanPath = content.replace(serverUrl, ""); // Eliminar serverUrl si está presente
          const response = await fetch(`${serverUrl}${cleanPath}`);
          const blob = await response.blob();
          formData.append("image", blob, "clipboard-image.png");
        }
      } else {
        // Si es texto, adjuntar el contenido directamente
        formData.append("content", content);
      }
  
      // Enviar la solicitud al backend
      const response = await fetch(`${serverUrl}/api/saved`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error del servidor");
      }
  
      // Mostrar notificación de éxito
      toast.success("Contenido guardado con éxito");
    } catch (error) {
      // Mostrar notificación de error
      toast.error(`Error al guardar: ${error.message}`);
      console.error("Error en guardarContenido:", error.message);
    } finally {
      setSaving(false);
    }
  };

  const actualizarDispositivos = async (token) => {
    setLoadingDevices(true); // Activar el estado de carga
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    try {
      const response = await fetch(`${serverUrl}/api/auth/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let devices = await response.json();

      const currentDeviceId = localStorage.getItem("deviceId");
      devices = devices.filter((device) => device.deviceId !== currentDeviceId);

      setConnectedDevices((prevDevices) => {
        return devices.map((device) => {
          const prevDevice = prevDevices.find((d) => d.deviceId === device.deviceId);
          const contentChanged = prevDevice && prevDevice.clipboardContent !== device.clipboardContent;

          return {
            ...device,
            new: !prevDevices.some((d) => d.deviceId === device.deviceId),
            flash: contentChanged,
          };
        });
      });

      setTimeout(() => {
        setConnectedDevices((prevDevices) =>
          prevDevices.map((device) => ({ ...device, flash: false }))
        );
      }, 1000);
    } catch (error) {
      console.error("Error al obtener los dispositivos:", error);
    } finally {
      setLoadingDevices(false); // Desactivar el estado de carga
    }
  };

  const infoDispositivo = () => {
    const parser = new UAParser();
    const result = parser.setUA(navigator.userAgent).getResult();

    const os = result.os.name || "Desconocido";
    const browser = result.browser.name || "Desconocido";

    let deviceType = result.device.type || "equipo";
    if (deviceType === "mobile") {
      deviceType = "smartphone";
    }

    return { os, browser, deviceType };
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");

    const handleLogout = async () => {
      try {
        await fetch(`${serverUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deviceId }),
        });
        localStorage.removeItem("token");
        localStorage.removeItem("deviceId");
        router.push("/login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    const inactivityTimer = setTimeout(() => {
      handleLogout();
    }, 10 * 60 * 1000); // 10 minutos de inactividad

    window.addEventListener("mousemove", () => clearTimeout(inactivityTimer));
    window.addEventListener("keydown", () => clearTimeout(inactivityTimer));
    window.addEventListener("click", () => clearTimeout(inactivityTimer));

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", () => clearTimeout(inactivityTimer));
      window.removeEventListener("keydown", () => clearTimeout(inactivityTimer));
      window.removeEventListener("click", () => clearTimeout(inactivityTimer));
    };
  }, []);


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
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser =
      userAgent.includes("safari") && !userAgent.includes("chrome");
    setIsSafari(isSafariBrowser);

    if (isSafariBrowser && !localStorage.getItem("safariModalShown")) {
      setShowSafariModal(true);
      localStorage.setItem("safariModalShown", "true");
    }
  }, []);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
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
    }, 2500);
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
        <i className="fa fa-circle-notch cargando" aria-hidden="true"></i>
      </div>
    );
  }

  const getDeviceLogo = (deviceType, deviceName) => {
    const logos = {
      macos: "/macos.png",
      windows: "/windows.png",
      linux: "/linux.png",
      android: "/android.png",
      ios: "/ios.png",
      chrome: "/chrome.png",
      safari: "/safari.png",
      edge: "/edge.png",
      equipo: "/equipo.png",
      tablet: "/tablet.png",
      smartphone: "/smartphone.png",
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
        case "android":
          return logos.android;
        case "ios":
          return logos.ios;
        default:
          return logos.default;
      }
    } else if (deviceType === "browser") {
      switch (deviceName.toLowerCase()) {
        case "chrome":
          return logos.chrome;
        case "mobile chrome":
          return logos.chrome;
        case "safari":
          return logos.safari;
        case "mobile safari":
          return logos.safari;
        case "edge":
          return logos.edge;
        case "mobile edge":
          return logos.edge;
        default:
          return logos.default;
      }
    }
    return logos.default;
  };
  const recargarDispositivos = () => {
    setRefreshing(true);
    actualizarDispositivos(localStorage.getItem("token"));
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleAutoRefreshClipboard = () => {
    setAutoRefreshClipboard((prevState) => !prevState);
  };

  const descargarContenido = async () => {
    if (!clipboardContent) return;
  
    try {
      const now = new Date();
      const fileName = `portacloud_${now.toISOString().slice(0, 19).replace(/[:T-]/g, "_")}`;
  
      if (clipboardContent.type === "image") {
        const cleanPath = clipboardContent.content.replace(serverUrl, "");
        const response = await fetch(`${serverUrl}${cleanPath}`);
        const blob = await response.blob();
        
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const blob = new Blob([clipboardContent.content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast.error("Error al descargar");
    }
  };


  const descargarContenidoDispositivo = (content, type) => {
    if (!content) return;

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

    if (content.startsWith("/uploads/")) {
      link.href = `${serverUrl}${content}`;
      link.download = `portacloud_${fileName}.png`;
    } else { 
      const blob = new Blob([content], { type: "text/plain" });
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


  if (loading) {
    return <p>Cargando...</p>;
  }

  return (


    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa-solid fa-clipboard"></i>&nbsp; Mi portapapeles
      </h1>

      {/* Modal para usuarios de Safari */}
      {showSafariModal && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content text-center">
              <div className="modal-header">
                <h5 className="modal-title"><i class="fa-solid fa-triangle-exclamation"></i> Aviso para usuarios de Safari</h5>
                <button type="button" className="btn-close" onClick={() => setShowSafariModal(false)}></button>
              </div>
              <div className="modal-body">
                <img className="mb-3" src="/safari.png" style={{ width: 80 }}></img>
                <h2>La funcionalidad de portapapeles automático y de imágenes no está disponible en Safari.</h2>
                <br></br>
                <p>Safari no soporta la copia automática del contenido del portapapeles ni otro formato que no sea texto plano</p>
                <p>Por favor, utiliza el botón "Leer portapapeles en Safari" para pegar manualmente.</p>
                <img className="w-50 mb-3" src="/boton-safari.png"></img>
                <p>Para poder utilizar todas las funciones de PortaCloud, por favor use el navegador Google Chrome o Microsoft Edge</p>
              </div>
              <div className="modal-footer">
                <button className="btn w-100 botones_ajustes btn-primary" onClick={() => setShowSafariModal(false)}>Entendido</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="mt-3 text-center">
          <button className="btn btn-primary" onClick={actualizarPortapapeles}>
            <i className="fa fa-clipboard" aria-hidden="true"></i> Leer
            portapapeles en Safari
          </button>
        </div>
      )}

      <div className="mt-3 text-center">
        <button
          className="btn boton_aux btn-primary"
          onClick={actualizarPortapapeles}
          disabled={refreshing}
        >
          {refreshing ? (
            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
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
          onClick={() => {
            const { os, browser, deviceType } = infoDispositivo();
            guardarContenido(
              clipboardContent.content,
              clipboardContent.type,
              os,
              browser,
              deviceType
            );
          }}
          title="Guardar contenido actual"
          disabled={saving || !clipboardContent}
        >
          {saving ? (
            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
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
            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-refresh" aria-hidden="true"></i>
          )}
        </button>
      </div>

      <div className="device-container">
        {connectedDevices.length > 0 ? (
          connectedDevices.map((device, index) => (
            <div
              key={device.deviceId}
              className={`device-card-dashboard shadow-lg ${connectedDevices.length === 1 ? "single" : ""} ${device.new ? "enter" : ""}`}
            >
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <p className="tipo_dispositivo mb-0 me-2 d-flex align-items-center">
                    {device.deviceType === "equipo"
                      ? <IoMdDesktop />
                      : device.deviceType === "smartphone"
                        ? <MdOutlinePhoneIphone />
                        : device.deviceType === "tablet"
                          ? <BsTabletLandscape />
                          : <MdDevices />}
                  </p>
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

                <div
                  className={`clipboard-box p-3 mt-3 text-break text-wrap ${device.flash ? "flash" : ""}`}
                  onClick={() => copiarContenido(device.clipboardContent)}
                  title="Copiar contenido"
                  style={{ cursor: "pointer" }}
                >
                  {device.clipboardContent?.startsWith("/uploads/") ? (
                    <img
                      src={`${serverUrl}${device.clipboardContent}`}
                      alt="Imagen del portapapeles"
                      className="img-fluid"
                    />
                  ) : (
                    <p>{device.clipboardContent || "No hay contenido en el portapapeles"}</p>
                  )}
                </div>

                <button
                  className="btn boton_aux btn-warning mt-3"
                  onClick={() =>
                    guardarContenido(device.clipboardContent, device.clipboardContent?.startsWith("/uploads/") ? "image" : "text", device.os, device.browser, device.deviceType)
                  }
                  disabled={saving || !device.clipboardContent}
                >
                  {saving ? (
                    <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
                  ) : (
                    <i className="fa fa-star" aria-hidden="true"></i>
                  )}
                </button>

                <button
                  className="btn boton_aux btn-success mt-3"
                  title="Descargar el contenido a un fichero"
                  onClick={() =>
                    descargarContenidoDispositivo(device.clipboardContent, "text")
                  }
                >
                  <i className="fa fa-download" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <h3>No hay dispositivos cercanos</h3>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn boton_aux btn-secondary d-flex justify-content-center align-items-center"
          onClick={toggleAutoRefreshClipboard}
          title="Activa o desactiva la actualización automática del portapapeles"
        >
          {autoRefreshClipboard ? <MdUpdate size={30} /> : <MdUpdateDisabled size={30} />}
        </button>
      </div>

    </div>
  );
}
