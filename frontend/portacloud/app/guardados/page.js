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
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [refreshing, setRefreshing] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [closing, setClosing] = useState(false);

  const verImagen = (imageUrl) => {
    setModalImage(imageUrl);
    setClosing(false);
  };

  const cerrarModal = () => {
    setClosing(true);
    setTimeout(() => {
      setModalImage(null);
      setClosing(false);
    }, 100);
  };

  const fetchGuardados = async () => {
    setRefreshing(true);
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
    setTimeout(() => setRefreshing(false), 1000);
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

  const descargarContenido = async (item) => {
    const link = document.createElement("a");

    if (item.type === "image") {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_IP}${item.filePath}`);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      link.href = objectURL;
      link.download = `guardado_${new Date(item.createdAt).toISOString()}.png`;
    } else {
      const blob = new Blob([item.content], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
      link.download = `guardado_${new Date(item.createdAt).toISOString()}.txt`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = savedItems.filter(
    (item) =>
      (searchTerm === "" || item.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (osFilter === "" || item.os === osFilter) &&
      (browserFilter === "" || item.browser === browserFilter) &&
      (deviceTypeFilter === "" || item.deviceType === deviceTypeFilter) &&
      (contentTypeFilter === "" || item.type === contentTypeFilter)
  );


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

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
      {modalImage && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={cerrarModal}>
          <div className={`modal-dialog ${closing ? "closing" : ""}`}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title text-center">
                  <i className="fa fa-eye me-2"></i> Vista previa
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body">
                <img src={modalImage} alt="Vista previa" onClick={cerrarModal} className="modal-image" />
              </div>
            </div>
          </div>
        </div>

      )}


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
        <select className="form-control" value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value)}>
          <option value="">▼ Todos los tipos</option>
          <option value="image">Imagen</option>
          <option value="text">Texto</option>
        </select>

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
          <option value="">▼ Todos los dispositivos  </option>
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
        <select className="form-control" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
          <option value="list">▼ Tipo de vista  </option>
          <option value="grid">Tarjetas</option>
          <option value="list">Lista</option>
        </select>
      </div>
      <div className="mt-3 mb-3 text-center">
        <button
          className="btn boton_aux btn-primary"
          onClick={fetchGuardados}
          disabled={refreshing}
        >
          {refreshing ? (
            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-refresh" aria-hidden="true"></i>
          )}
        </button>
      </div>
      {currentItems.length === 0 ? (
        <h3 className="text-center">No hay elementos guardados que coincidan.</h3>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="row">
              {currentItems.map((item) => (
                <div key={item._id} className="col-12 col-sm-6 col-md-6 col-lg-4 mb-4">
                  <div className="device-card shadow-lg">
                    <div className="card-body text-center">
                      <div className="d-flex justify-content-center align-items-center mt-3 gap-2 mb-3">
                        <div>
                          {item.deviceType === "equipo"
                            ? <IoMdDesktop size={40} />
                            : item.deviceType === "smartphone"
                              ? <MdOutlinePhoneIphone size={40} />
                              : item.deviceType === "tablet"
                                ? <BsTabletLandscape size={40} />
                                : <MdDevices size={40} />}
                        </div>
                        {/* Icono del SO */}
                        <img
                          src={getDeviceLogo("os", item.os)}
                          alt={item.os}
                          style={{ width: 40, height: 40 }}
                        />
                        <img
                          src={getDeviceLogo("browser", item.browser)}
                          alt={item.browser}
                          style={{ width: 40, height: 40 }}
                        />
                      </div>
                      <p className="mt-3">Guardado el {new Date(item.createdAt).toLocaleString()}</p>
                      <div>
                        {item.type === "image" && (
                          <button
                            className="btn boton_aux btn-primary m-2"
                            onClick={() => verImagen(`${process.env.NEXT_PUBLIC_SERVER_IP}${item.filePath}`)}
                            title="Vista previa de la imagen"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                        )}
                        <button className="btn boton_aux btn-success m-2" title="Descargar a un archivo" onClick={() => descargarContenido(item)}>
                          <i className="fa fa-download"></i>
                        </button>
                        <button className="btn boton_aux btn-danger" title="Eliminar" onClick={() => borrarContenido(item._id)}>
                          <i className="fa fa-remove"></i>
                        </button>
                      </div>
                      <div className="clipboard-box-saved p-3 m-3 text-break text-wrap" onClick={() => copiarContenido(item.content)} title="Copiar contenido" style={{ cursor: "pointer", wordBreak: "break-word", overflowWrap: "break-word" }}>
                        {item.type === "image" ? (
                          <img src={`${process.env.NEXT_PUBLIC_SERVER_IP}${item.content}`} alt="Guardado" className="img-fluid mb-3" />
                        ) : (
                          <p className="text-break text-wrap" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>{item.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="saved-table">
                <thead>
                  <tr>
                    <th>Contenido</th>
                    <th>Plataforma</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item._id}>
                      <td className="saved-clipboard" onClick={() => copiarContenido(item.content)} style={{ cursor: "pointer", wordBreak: "break-word", overflowWrap: "break-word" }} title="Copiar contenido">
                        {item.type === "image" ? (
                          <img src={`${process.env.NEXT_PUBLIC_SERVER_IP}${item.content}`} alt="Guardado" className="img-fluid mb-3" />
                        ) : (
                          <p className="text-break text-wrap" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>{item.content}</p>
                        )}
                      </td>
                      <td className="text-center"><img className="me-2" src={getDeviceLogo("os", item.os)} alt={item.os} style={{ width: 30 }} /><img src={getDeviceLogo("browser", item.browser)} alt={item.browser} style={{ width: 30 }} /></td>

                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        {item.type === "image" && (
                          <button
                            className="btn boton_aux btn-primary m-2"
                            onClick={() => verImagen(`${process.env.NEXT_PUBLIC_SERVER_IP}${item.filePath}`)}
                            title="Vista previa de la imagen"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                        )}
                        <button className="btn boton_aux btn-success mx-1" onClick={() => descargarContenido(item)}>
                          <i className="fa fa-download"></i>
                        </button>
                        <button className="btn boton_aux btn-danger" onClick={() => borrarContenido(item._id)}>
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <h5 className="mt-3 text-center">{filteredItems.length} elementos guardados</h5>
      <div className="pagination-controls text-center mt-3">
        <button className="btn me-3 boton_aux btn-secondary mx-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          <i className="fa fa-arrow-left"></i>
        </button>
        <span className="me-2">Página {currentPage} de {Math.ceil(filteredItems.length / itemsPerPage)}</span>
        <button className="btn boton_aux  btn-secondary mx-2" disabled={indexOfLastItem >= filteredItems.length} onClick={() => setCurrentPage(currentPage + 1)}>
          <i className="fa fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}