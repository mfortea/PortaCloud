"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { MdOutlinePhoneIphone } from "react-icons/md";
import { IoMdDesktop } from "react-icons/io";
import { BsTabletLandscape } from "react-icons/bs";
import { MdDevices } from "react-icons/md";


export default function Guardados() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [osFilter, setOsFilter] = useState("");
  const [browserFilter, setBrowserFilter] = useState("");
  const [osOptions, setOsOptions] = useState([]);
  const [deviceTypeOptions, setDeviceTypeOptions] = useState([]);
  const [browserOptions, setBrowserOptions] = useState([]);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("");


  const fetchGuardados = async () => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    const token = localStorage.getItem("token");

    const res = await fetch(`${serverUrl}/api/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSavedItems(data);

    const osSet = new Set(data.map((item) => item.os));
    const browserSet = new Set(data.map((item) => item.browser));
    const deviceTypeSet = new Set(data.map((item) => item.deviceType));

    setOsOptions([...osSet]);
    setBrowserOptions([...browserSet]);
    setDeviceTypeOptions([...deviceTypeSet]);

  };


  useEffect(() => {
    fetchGuardados();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else if (!user) {
      setLoading(true);
    } else {
      setLoading(false);
      fetchGuardados();
    }
  }, [user, router]);

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

  const borrarContenido = async (id) => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    const token = localStorage.getItem("token");

    try {
      await fetch(`${serverUrl}/api/saved/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedItems(savedItems.filter((item) => item._id !== id));
      toast.success("Contenido borrado con éxito.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Error al borrar el contenido.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const descargarContenido = (item) => {
    const link = document.createElement("a");
    if (item.type === "image") {
      link.href = item.content;
      link.download = `guardado_${new Date(item.createdAt).toISOString()}.png`;
    } else {
      const blob = new Blob([item.content], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
      link.download = `guardado_${new Date(item.createdAt).toISOString()}.txt`;
    }
    link.click();
  };

  const filteredItems = savedItems.filter(
    (item) =>
      (searchTerm === "" || item.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (osFilter === "" || item.os === osFilter) &&
      (browserFilter === "" || item.browser === browserFilter) &&
      (deviceTypeFilter === "" || item.deviceType === deviceTypeFilter)
  );

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

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa fa-star"></i> Mis guardados
      </h1>

      <div className="mb-4 d-flex flex-column text-center flex-md-row gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="form-control" value={osFilter} onChange={(e) => setOsFilter(e.target.value)}>
          <option value="">▼ Todos los SO </option>
          {osOptions.map((os) => (
            <option key={os} value={os}>{os}</option>
          ))}
        </select>
        <select className="form-control" value={browserFilter} onChange={(e) => setBrowserFilter(e.target.value)}>
          <option value="">▼ Todos los Navegadores  </option>
          {browserOptions.map((browser) => (
            <option key={browser} value={browser}>{browser}</option>
          ))}
        </select>
        <select className="form-control" value={deviceTypeFilter} onChange={(e) => setDeviceTypeFilter(e.target.value)}>
          <option value="">▼ Todos los Tipos  </option>
          {deviceTypeOptions.map((device) => (
            <option key={device} value={device}>
              {device === "smartphone"
                ? "Dispositivo móvil"
                : device === "tablet"
                  ? "Tablet"
                  : device === "equipo"
                    ? "Dispositivo de Escritorio"
                    : device}
            </option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <h3 className="text-center">No hay elementos guardados que coincidan.</h3>
      ) : (
        <div className="row">
          {filteredItems.map((item) => (
            <div key={item._id} className="col-12 col-sm-6 col-md-6 col-lg-4 mb-4">
              <div className="device-card shadow-lg">
                <div className="mb-3 tipo_dispositivo">
                  <p className="text-center">
                    {item.deviceType === "equipo"
                      ? <IoMdDesktop />
                      : item.deviceType === "smartphone"
                        ? <MdOutlinePhoneIphone />
                        : item.deviceType === "tablet"
                          ? <BsTabletLandscape />
                          : <MdDevices />}
                  </p>
                </div>
                <div className="card-body text-center">
                  <div className="clipboard-box p-3 m-3 text-break text-wrap" onClick={() => copiarContenido(item.content)} title="Copiar contenido" style={{ cursor: "pointer", wordBreak: "break-word", overflowWrap: "break-word" }}>
                    {item.type === "image" ? (
                      <img src={item.content} alt="Guardado" className="img-fluid mb-3" />
                    ) : (
                      <p className="text-break text-wrap" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>{item.content}</p>
                    )}
                  </div>
                  <img
                    src={getDeviceLogo("os", item.os)}
                    alt={item.os}
                    className="img-fluid"
                    style={{ width: 40, height: 40 }}
                  />
                  <img
                    src={getDeviceLogo("browser", item.browser)}
                    alt={item.browser}
                    className="img-fluid"
                    style={{ width: 40, height: 40 }}
                  />
                  <p className="mt-3">Guardado el {new Date(item.createdAt).toLocaleString()}</p>
                  <button className="btn boton_aux btn-success m-2" onClick={() => descargarContenido(item)}>
                    <i className="fa fa-download"></i>
                  </button>
                  <button className="btn boton_aux btn-danger" onClick={() => borrarContenido(item._id)}>
                    <i className="fa fa-remove"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}