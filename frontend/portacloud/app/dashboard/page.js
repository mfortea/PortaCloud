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
import LoadingSpinner from "../../components/LoadingSpinner";
import { Modal, Button, Form } from "react-bootstrap";
import io from "socket.io-client";

import { Nav } from "react-bootstrap";
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
  const [downloading, setDownloading] = useState(false);
  const { logout } = useAuth();
  const [clipboardAnimation, setClipboardAnimation] = useState(false);
  const platform = require('platform');
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [lastHash, setLastHash] = useState("");
  const token = localStorage.getItem("token");
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  const deviceId = localStorage.getItem("deviceId");
  const [expandedText, setExpandedText] = useState(false);
  const [isProblematicBrowser, setIsProblematicBrowser] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  // Límites de tamaño
  const MAX_CONTENT_SIZE_BYTES = 10 * 1024 * 1024;
  const TEXT_PREVIEW_LENGTH = 500;
  const TIEMPO_ACTUALIZACION = 1000;


  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    document.title = 'Dashboard | PortaCloud';
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Página principal';
    document.head.appendChild(metaDescription);

    return () => {
      document.head.removeChild(metaDescription);
    };
  }, []);


  const actualizarPortapapeles = async () => {
    try {
      if (!document.hasFocus()) return;
      if (!navigator.clipboard) return;

      let newClipboardContent = null;
      let contentSize = 0;

      if (isSafari) {
        const text = await navigator.clipboard.readText();
        contentSize = new Blob([text]).size;
        newClipboardContent = { type: "text", content: text };
      } else {
        const clipboardData = await navigator.clipboard.read();
        for (const item of clipboardData) {
          if (item.types.includes("image/png")) {
            const blob = await item.getType("image/png");
            contentSize = blob.size;

            if (contentSize > MAX_CONTENT_SIZE_BYTES) {
              toast.error("La imagen supera el límite de 10MB");
              return;
            }

            const url = URL.createObjectURL(blob);
            newClipboardContent = {
              type: "image",
              content: url,
              blob: blob,
              raw: blob
            };
          } else if (item.types.includes("text/plain")) {
            const text = await item.getType("text/plain").then((r) => r.text());
            contentSize = new Blob([text]).size;

            if (contentSize > MAX_CONTENT_SIZE_BYTES) {
              toast.error("El texto supera el límite de 10MB");
              return;
            }

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

        const response = await fetch(`${serverUrl}/device/updateClipboard`, {
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

      formData.append("os", os);
      formData.append("browser", browser);
      formData.append("deviceType", deviceType);
      formData.append("type", type);

      if (type === "image") {
        if (content.startsWith("blob:")) {
          const response = await fetch(content);
          const blob = await response.blob();
          formData.append("image", blob, "clipboard-image.png");
        }
        else if (content.startsWith("/device/temp_image/")) {
          const cleanPath = content.replace(serverUrl, "");
          const response = await fetch(`${serverUrl}${cleanPath}`);
          const blob = await response.blob();
          formData.append("image", blob, "clipboard-image.png");
        }
        else if (content.startsWith("http") || content.startsWith("/")) {
          const response = await fetch(content);
          if (!response.ok) throw new Error("No se pudo obtener el archivo de la ruta proporcionada");
          const blob = await response.blob();
          formData.append("image", blob, "archivo-subido.png");
        }
      } else {
        formData.append("content", content);
      }

      const response = await fetch(`${serverUrl}/saved`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Aquí extraemos el mensaje de error del backend y lo mostramos en el frontend
        if (errorData.error) {
          toast.error(errorData.error, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
          });
        } else {
          toast.error("Error al guardar el contenido", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
          });
        }
      } else {
        // Si la imagen o el texto se guardó correctamente
        toast.success("Contenido guardado correctamente", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    } finally {
      setSaving(false);
    }
  };


  const actualizarDispositivos = async (token) => {
    setLoadingDevices(true); // Activar el estado de carga
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    try {
      const response = await fetch(`${serverUrl}/device/devices`, {
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
      setLoadingDevices(false);
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
    return () => {
      if (clipboardContent?.type === "image") {
        URL.revokeObjectURL(clipboardContent.content);
      }
    };
  }, [clipboardContent]);



  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isFirefox = userAgent.includes('firefox');
    setIsProblematicBrowser(isSafari || isFirefox);

    if ((isSafari || isFirefox) && !localStorage.getItem('browserModalShown')) {
      setShowBrowserModal(true);
      localStorage.setItem('browserModalShown', 'true');
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
    if (!isProblematicBrowser && autoRefreshClipboard) {
      let interval;

      const update = () => {
        actualizarPortapapeles();
      };

      const visibilityChangeHandler = () => {
        if (document.visibilityState === "visible") {
          update();
          interval = setInterval(update, TIEMPO_ACTUALIZACION);
        } else {
          clearInterval(interval);
        }
      };

      document.addEventListener("visibilitychange", visibilityChangeHandler);

      if (document.visibilityState === "visible") {
        update();
        interval = setInterval(update, TIEMPO_ACTUALIZACION);
      }

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", visibilityChangeHandler);
      };
    }
  }, [isProblematicBrowser, autoRefreshClipboard]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      actualizarDispositivos(token);
    }
    const interval = setInterval(() => {
      if (token) {
        actualizarDispositivos(token);
      }
    }, TIEMPO_ACTUALIZACION);
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
      firefox: "/firefox.png",
      opera: "/opera.png",
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
        case "firefox":
          return logos.firefox;
        case "mobile edge":
          return logos.edge;
        case "opera":
          return logos.opera;
        default:
          return logos.default;
      }
    }
    return logos.default;
  };
  const recargarDispositivos = () => {
    setRefreshing(true);
    actualizarDispositivos(localStorage.getItem("token"));
    setTimeout(() => setRefreshing(false), 1500);
  };

  const toggleAutoRefreshClipboard = () => {
    setAutoRefreshClipboard((prevState) => !prevState);
  };

  const descargarContenido = async () => {
    if (!clipboardContent) return;

    try {
      setDownloading(true);
      const now = new Date();
      const fileName = `portacloud_${now.toISOString().slice(0, 19).replace(/[:T-]/g, "_")}`;

      if (clipboardContent.type === "image") {
        if (clipboardContent.raw instanceof Blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(clipboardContent.raw);
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        else if (clipboardContent.content.startsWith("/device/temp_image/")) {
          const response = await fetch(`${serverUrl}${clipboardContent.content}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const blob = await response.blob();

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Texto plano
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
    } finally {
      setDownloading(false);
    }
  };

  const descargarContenidoDispositivo = async (content, type) => {
    if (!content) return;

    try {
      setDownloading(true);
      const now = new Date();
      const fileName = `portacloud_${now.toISOString().slice(0, 19).replace(/[:T-]/g, "_")}`;
      const link = document.createElement("a");

      if (content.startsWith("/device/temp_image/")) {
        const response = await fetch(`${serverUrl}${content}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await response.blob();

        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.png`;
      } else {
        const blob = new Blob([content], { type: "text/plain" });
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.txt`;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Error al descargar");
    } finally {
      setDownloading(false);
    }
  };


  const borrarContenido = async () => {
    try {
      await navigator.clipboard.writeText("");
      setClipboardContent("");
    } catch (error) {
      console.error("Error al borrar el portapapeles:", error);
    }
  };

  function ImagenPublica({ deviceId, filename, serverUrl }) {
    if (!deviceId || !filename) return null;

    const imageUrl = `${serverUrl}/device/temp_image/${deviceId}/${filename}`;

    return (
      <img
        src={imageUrl}
        alt="Imagen temporal"
        className="img-fluid"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = imageUrl;
        }}
      />
    );
  }


  const copiarContenido = async ({ content, type }) => {
    try {
      if (type === 'text') {
        await navigator.clipboard.writeText(content);
      } else if (type === 'image') {
        const imageUrl = content.startsWith("http") ? content : `${serverUrl}${content}`;
        const response = await fetch(imageUrl, { mode: 'cors' });
        const blob = await response.blob();

        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      }

      toast.success("Contenido copiado al portapapeles.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Función no soportada por el navegador.", {
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
    return <LoadingSpinner loading={loading} />;
  }


  return (


    <div className="container py-5 zoom-al_cargar">
      <h1 className="text-center mb-4">
        <i className="fa-solid fa-clipboard"></i>&nbsp; Mi portapapeles
      </h1>

      {showBrowserModal && (
        <Modal show={showBrowserModal} onHide={() => setShowBrowserModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fa-solid fa-triangle-exclamation"></i> Aviso para navegadores
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="d-flex justify-content-center gap-3 mb-4">
              <img src="/safari.png" style={{ width: 80 }} alt="Safari" />
              <img src="/firefox.png" style={{ width: 80 }} alt="Firefox" />
            </div>
            <h2>Limitaciones en Safari y Firefox</h2>
            <br />
            <p>
              Estos navegadores no soportan funciones como la actualización automática del portapapeles y el soporte para copiar imágenes al portapapeles.
            </p>
            <p>
              Para leer el contenido del portapapeles deberá utilizar el botón de lectura de portapapeles. Puede ver más información en el apartado de Ayuda
            </p>
            <p>
              Para una mejor compatibilidad se recomienda usar Google Chrome o Microsoft Edge
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn botones_ajustes w-100 btn-success"
              onClick={() => router.push("/ayuda")}
            >
              <i className="fa-solid fa-circle-question pe-2"></i> Ir a Ayuda
            </Button>

            <Button
              className="btn botones_ajustes w-100 btn-primary"
              onClick={() => setShowBrowserModal(false)}
            >
              Entendido
            </Button>
          </Modal.Footer>
        </Modal>
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
              src={`${clipboardContent.content}`}
              alt="Imagen del portapapeles"
              className="img-fluid"
              loading="lazy"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />



          ) : (
            <div>
              <p className="text-break">
                {expandedText
                  ? clipboardContent.content
                  : clipboardContent.content?.slice(0, TEXT_PREVIEW_LENGTH)}
                {clipboardContent.content?.length > TEXT_PREVIEW_LENGTH && !expandedText && "..."}
              </p>
              {clipboardContent.content?.length > TEXT_PREVIEW_LENGTH && (
                <button
                  className="boton_aux boton_mostrar"
                  onClick={() => setExpandedText(!expandedText)}
                  title="Mostrar/Ocultar el texto completo"
                >
                  <i className="fa-solid fa-eye pe-1"></i> {expandedText ? "Mostrar menos" : "Mostrar más"}
                </button>
              )}
            </div>
          )
        ) : (
          <p>No hay contenido en el portapapeles</p>
        )}
      </div>

      <div className="mt-3 text-center">
        <button
          className="btn boton_aux btn-primary"
          onClick={actualizarPortapapeles}
          disabled={refreshing}
          title={
            isProblematicBrowser
              ? "Lee el portapapeles de forma manual en navegadores no compatibles"
              : "Actualizar portapapeles ahora"
          }
        >
          {refreshing ? (
            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
          ) : isProblematicBrowser ? (
            <>
              <i className="fa-regular fa-clipboard"></i>
            </>
          ) : (
            <i className="fa fa-refresh" aria-hidden="true"></i>
          )}
        </button>

        <button
          className="btn boton_aux btn-success"
          title="Descargar el contenido a un fichero"
          disabled={saving || downloading || !clipboardContent}
          onClick={descargarContenido}
        >
          {downloading ? (
            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-download" aria-hidden="true"></i>
          )}
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
          disabled={saving || !clipboardContent}
          onClick={borrarContenido}
        >
          <i className="fa fa-remove" aria-hidden="true"></i>
        </button>

        {isProblematicBrowser && (
          <p className="texto_aviso mt-3 small">
            {isSafari ? "Safari" : "Firefox"} requiere actualización manual
          </p>
        )}
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
                  onClick={() => copiarContenido({
                    content: device.clipboardContent,
                    type: device.clipboardContent?.startsWith("/device/temp_image/") ? "image" : "text",
                  })}

                  title="Copiar contenido"

                  style={{ cursor: "pointer" }}
                >
                  {device.clipboardContent?.startsWith("/device/temp_image") ? (
                    <img
                      src={`${serverUrl + device.clipboardContent}`}
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
                    guardarContenido(device.clipboardContent, device.clipboardContent?.startsWith("/device/temp_image/") ? "image" : "text", device.os, device.browser, device.deviceType)
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
                  disabled={saving || downloading ||!device.clipboardContent}
                  onClick={() =>
                    descargarContenidoDispositivo(device.clipboardContent, "text")
                  }
                >
          {downloading ? (
            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-download" aria-hidden="true"></i>
          )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <h3>No se han encontrado dispositivos</h3>
            <h4>Inicia sesión con tu cuenta en otro dispositivo</h4>
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
