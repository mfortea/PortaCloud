"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { MdOutlinePhoneIphone } from "react-icons/md";
import { IoMdDesktop } from "react-icons/io";
import { BsTabletLandscape } from "react-icons/bs";
import { MdDevices } from "react-icons/md";
import { Modal, Button } from 'react-bootstrap';
import LoadingSpinner from "../../components/LoadingSpinner";
import ImagePreviewModal from "../../components/modals/ImagePreviewModal";

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
  const [downloading, setDownloading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [closing, setClosing] = useState(false);
  const TEXT_PREVIEW_LENGTH = 500;
  const [expandedItems, setExpandedItems] = useState({});
  const [imageCache, setImageCache] = useState({});
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
  const [deleting, setDeleting] = useState(false);
  const TIEMPO_NOTIFICACION = 2000;

  useEffect(() => {
    document.title = 'Guardados | PortaCloud';
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Elementos guardados por el usuario';
    document.head.appendChild(metaDescription);

    return () => {
      document.head.removeChild(metaDescription);
    };
  }, []);

  const preloadImages = async (imageItems) => {
    const token = localStorage.getItem("token");
    const newCache = { ...imageCache };

    for (const item of imageItems) {
      const filename = item.filePath?.split('/').pop();
      if (!filename || newCache[filename]) continue;

      if (newCache[filename]) {
        URL.revokeObjectURL(newCache[filename]);
        delete newCache[filename];
      }

      try {
        const response = await fetch(`${serverUrl}/images/${filename}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          newCache[filename] = url;
        }
      } catch (error) {
        console.error(`Error preloading image ${filename}:`, error);
      }
    }

    setImageCache(newCache);
  };

  const renderImage = (filename) => {
    const cachedUrl = imageCache[filename];
  
    if (!cachedUrl) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <i className="fa fa-circle-notch fa-spin text-muted" aria-hidden="true" style={{ fontSize: '24px' }}></i>
        </div>
      );
    }
  
    return <img src={cachedUrl} alt="Imagen guardada" className="img-fluid rounded" style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }} />;
  };

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

  const fetchGuardados = useCallback(async () => {
    setRefreshing(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${serverUrl}/saved`, {
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

      const imageItems = data.filter(item => item.type === "image");
      await preloadImages(imageItems);
    } catch (error) {
      console.error("Error fetching saved items:", error);
      toast.error("Error al cargar los elementos guardados");
    } finally {
      setRefreshing(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    fetchGuardados();
  }, [fetchGuardados]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else if (!user) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [user, router, fetchGuardados]);

  const ImagenPrivada = ({ filename }) => {
    const [imgUrl, setImgUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      if (!filename || isInView) {
        setLoading(false);
        return;
      }

      if (imageCache[filename]) {
        setImgUrl(imageCache[filename]);
        setLoading(false);
        return;
      }

      const fetchImage = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`${serverUrl}/images/${filename}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Image not found');
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageCache(prev => ({ ...prev, [filename]: url }));
          setImgUrl(url);
        } catch (error) {
          console.error('Error loading image:', error);
          setImgUrl(null);
        } finally {
          setLoading(false);
        }
      };

      fetchImage();
    }, [filename, imageCache, isInView]);

    const observer = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
      const onIntersect = (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.current.disconnect();
          }
        });
      };

      if (imgRef.current) {
        observer.current = new IntersectionObserver(onIntersect, {
          rootMargin: "200px",
        });

        observer.current.observe(imgRef.current);
      }

      return () => {
        if (observer.current) {
          observer.current.disconnect();
        }
      };
    }, []);

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
          <i className="fa fa-circle-notch fa-spin text-muted" aria-hidden="true"></i>
        </div>
      );
    }

    if (!imgUrl) {
      return <p className="text-center py-3 text-muted">Imagen no disponible</p>;
    }

    return (
      <div className="d-flex justify-content-center h-100">
        <img
          ref={imgRef}
          src={imgUrl}
          alt="Imagen guardada"
          className="img-fluid rounded"
          style={{ maxHeight: '200px', objectFit: 'contain' }}
        />
      </div>
    );
  };

  const copiarContenido = async (item) => {
    try {
      if (item.type === 'text') {
        await navigator.clipboard.writeText(item.content);
      } else if (item.type === 'image') {
        const imageUrl = imageCache[item.filePath?.split('/').pop()] || `${serverUrl}/images/${item.filePath?.split('/').pop()}`;
        const response = await fetch(imageUrl, { mode: 'cors' });
        const blob = await response.blob();

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      }

      toast.success("Contenido copiado al portapapeles.", {
        position: "top-right",
        autoClose: TIEMPO_NOTIFICACION,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Función no soportada por el navegador", {
        position: "top-right",
        autoClose: TIEMPO_NOTIFICACION,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const borrarContenido = async (id) => {
    const token = localStorage.getItem("token");
    setDeleting(true);
    try {
      await fetch(`${serverUrl}/saved/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedItems(savedItems.filter((item) => item._id !== id));
      toast.success("Contenido borrado con éxito.", {
        position: "top-right",
        autoClose: TIEMPO_NOTIFICACION,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Error al borrar el contenido.", {
        position: "top-right",
        autoClose: TIEMPO_NOTIFICACION,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const descargarContenido = async (item) => {
    const link = document.createElement("a");
    const token = localStorage.getItem("token");

    try {
      setDownloading(true);
      if (item.type === "image") {
        const filename = item.filePath?.split('/').pop();
        const cachedUrl = imageCache[filename];

        if (cachedUrl) {
          link.href = cachedUrl;
          link.download = `guardado_${item._id}.png`;
        } else {
          const response = await fetch(`${serverUrl}/images/${filename}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Image not found');
          }

          const blob = await response.blob();
          const objectURL = URL.createObjectURL(blob);
          link.href = objectURL;
          link.download = `guardado_${item._id}.png`;

          link.onload = () => URL.revokeObjectURL(objectURL);
        }
      } else {
        const blob = new Blob([item.content], { type: "text/plain" });
        link.href = URL.createObjectURL(blob);
        link.download = `guardado_${item._id}.txt`;
        link.onload = () => URL.revokeObjectURL(link.href);
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading content:", error);
      toast.error("Error al descargar el contenido");
    } finally {
      setDownloading(false);
    }
  };

  const filteredItems = savedItems.filter(
    (item) =>
      (searchTerm === "" || item.content?.toLowerCase().includes(searchTerm.toLowerCase())) &&
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
      firefox: "/firefox.png",
      opera: "/opera.png",
      equipo: "/equipo.png",
      tablet: "/tablet.png",
      smartphone: "/smartphone.png",
      default: "/default.png",
    };

    if (deviceType === "os") {
      switch (deviceName.toLowerCase()) {
        case "macos": return logos.macos;
        case "windows": return logos.windows;
        case "linux": return logos.linux;
        case "android": return logos.android;
        case "ios": return logos.ios;
        default: return logos.default;
      }
    } else if (deviceType === "browser") {
      switch (deviceName.toLowerCase()) {
        case "chrome":
        case "mobile chrome": return logos.chrome;
        case "safari":
        case "mobile safari": return logos.safari;
        case "edge":
        case "mobile edge": return logos.edge;
        case "firefox": return logos.firefox;
        case "opera": return logos.opera;
        default: return logos.default;
      }
    }
    return logos.default;
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (loading) {
    return <LoadingSpinner loading={loading} />;
  }

  return (
    <div className="container py-4 zoom-al_cargar">
      {/* Estilo sutil para las barras de desplazamiento internas */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollable-content::-webkit-scrollbar { width: 6px; }
        .scrollable-content::-webkit-scrollbar-track { background: transparent; }
        .scrollable-content::-webkit-scrollbar-thumb { background-color: var(--border-color); border-radius: 10px; }
        .scrollable-content:hover::-webkit-scrollbar-thumb { background-color: var(--text-muted); }
      `}} />

      <ImagePreviewModal show={modalImage !== null} onClose={cerrarModal} imageUrl={modalImage} />

      <h1 className="text-center mb-5">
        <i className="fa fa-star me-2 text-warning"></i> Mis guardados
      </h1>

      {/* ========== PANEL DE CONTROL (FILTROS Y BUSCADOR) ========== */}
      <div className="p-3 mb-5 rounded-4 shadow-sm" style={{ background: "var(--surface-bg)", border: "1px solid var(--border-color)" }}>
        <div className="row g-3 align-items-center">
          
          {/* Buscador de texto (Izquierda) */}
          <div className="col-12 col-xl-4">
            <div className="position-relative">
              <i className="fa-solid fa-search position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
              <input
                type="text"
                className="form-control input_guardados w-100 m-0"
                placeholder="Buscar en el contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {/* Selectores de filtros (Derecha) */}
          <div className="col-12 col-xl-8 d-flex flex-wrap justify-content-xl-end gap-2">
            <select className="form-control select_guardados w-auto m-0 py-2" value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value)}>
              <option value="">Tipos</option>
              <option value="image">Imagen</option>
              <option value="text">Texto</option>
            </select>

            <select className="form-control select_guardados w-auto m-0 py-2" value={osFilter} onChange={(e) => setOsFilter(e.target.value)}>
              <option value="">S. Operativos</option>
              {osOptions.map((os) => (<option key={os} value={os}>{os}</option>))}
            </select>

            <select className="form-control select_guardados w-auto m-0 py-2" value={browserFilter} onChange={(e) => setBrowserFilter(e.target.value)}>
              <option value="">Navegadores</option>
              {browserOptions.map((browser) => (<option key={browser} value={browser}>{browser}</option>))}
            </select>

            <select className="form-control select_guardados w-auto m-0 py-2" value={deviceTypeFilter} onChange={(e) => setDeviceTypeFilter(e.target.value)}>
              <option value="">Dispositivos</option>
              {deviceTypeOptions.map((device) => (
                <option key={device} value={device}>
                  {device === "smartphone" ? "Móvil" : device === "tablet" ? "Tablet" : device === "equipo" ? "Escritorio" : device}
                </option>
              ))}
            </select>

            <select className="form-control select_guardados w-auto m-0 py-2" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <option value="grid">Tarjetas</option>
              <option value="list">Lista</option>
            </select>

            <button
              className="btn boton_aux btn-primary m-0"
              style={{ width: "46px", height: "46px", borderRadius: "14px" }}
              onClick={fetchGuardados}
              disabled={refreshing}
              title="Actualizar lista"
            >
              {refreshing ? <i className="fa fa-circle-notch fa-spin"></i> : <i className="fa fa-refresh"></i>}
            </button>
          </div>
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="text-center p-5 mt-4" style={{ background: "var(--surface-alt)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
          <i className="fa-regular fa-folder-open mb-3" style={{ fontSize: "3rem", color: "var(--text-muted)" }}></i>
          <h3 className="fw-bold mb-2">No se encontraron resultados</h3>
          <p className="text-muted">Prueba a cambiar o eliminar los filtros aplicados.</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="row g-4 align-items-stretch">
              {currentItems.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-lg-4">
                  
                  {/* Tarjeta con altura fija controlada (h-100) */}
                  <div className="device-card d-flex flex-column h-100 p-4">
                    
                    {/* Encabezado: Iconos y Fecha */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="tipo_dispositivo m-0" style={{ fontSize: "28px" }}>
                          {item.deviceType === "equipo" ? <IoMdDesktop /> : item.deviceType === "smartphone" ? <MdOutlinePhoneIphone /> : item.deviceType === "tablet" ? <BsTabletLandscape /> : <MdDevices />}
                        </span>
                        <img src={getDeviceLogo("os", item.os)} alt={item.os} style={{ width: 24, height: 24 }} className="m-0" />
                        <img src={getDeviceLogo("browser", item.browser)} alt={item.browser} style={{ width: 24, height: 24 }} className="m-0" />
                      </div>
                      <small className="text-muted text-end" style={{ fontSize: "0.8rem", lineHeight: "1.2" }}>
                        {new Date(item.createdAt).toLocaleDateString()} <br/>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>

                    {/* Contenido (Altura Fija + Scroll) */}
                    <div
                      className="clipboard-box-saved scrollable-content p-3 text-break text-wrap position-relative w-100"
                      onClick={() => copiarContenido(item)}
                      title="Copiar contenido"
                      style={{ 
                        cursor: "pointer", 
                        height: "200px",         /* ¡ALTURA FIJA! Todas las cajas son idénticas */
                        overflowY: "auto",       /* Scroll interno si el texto es muy largo */
                        flex: "none",            /* Evita que se estire */
                        margin: "0 0 16px 0"     /* Margen inferior en lugar de superior */
                      }}
                    >
                      {item.type === "image" ? (
                        renderImage(item.filePath?.split('/').pop())
                      ) : (
                        <p className="mb-0" style={{ wordBreak: "break-word", fontSize: "0.95rem", textAlign: "left" }}>
                          {expandedItems[item._id]
                            ? item.content
                            : item.content?.slice(0, TEXT_PREVIEW_LENGTH)}
                          {item.content?.length > TEXT_PREVIEW_LENGTH && !expandedItems[item._id] && "..."}
                        </p>
                      )}
                    </div>

                    {/* Espaciador flexible para empujar botones al fondo */}
                    <div className="mt-auto"></div>

                    {/* Botones de acción alineados al fondo */}
                    <div className="d-flex justify-content-center align-items-center gap-2 pt-3 border-top" style={{ borderColor: "var(--border-color) !important" }}>
                      
                      {item.type === "image" && (
                        <button className="btn boton_aux btn-primary m-0" style={{ width: "45px", height: "45px" }} onClick={() => verImagen(imageCache[item.filePath?.split('/').pop()] || `${serverUrl}/images/${item.filePath?.split('/').pop()}`)} title="Vista previa">
                          <i className="fa fa-eye"></i>
                        </button>
                      )}
                      
                      {item.type === "text" && item.content?.length > TEXT_PREVIEW_LENGTH && (
                        <button
                          className="btn boton_aux btn-secondary m-0"
                          style={{ width: "45px", height: "45px", fontSize: "16px" }}
                          title="Mostrar/Ocultar texto completo en la caja"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(item._id); }}
                        >
                          <i className={`fa-solid ${expandedItems[item._id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      )}

                      <button className="btn boton_aux btn-success m-0" style={{ width: "45px", height: "45px" }} title="Descargar" disabled={downloading} onClick={() => descargarContenido(item)}>
                        {downloading ? <i className="fa fa-circle-notch fa-spin"></i> : <i className="fa fa-download"></i>}
                      </button>

                      <button className="btn boton_aux btn-danger m-0" style={{ width: "45px", height: "45px" }} title="Eliminar" onClick={() => borrarContenido(item._id)} disabled={deleting}>
                        {deleting ? <i className="fa fa-circle-notch fa-spin"></i> : <i className="fa fa-trash"></i>}
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
              <table className="saved-table m-0">
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
                      <td
                        className="saved-clipboard p-3"
                        onClick={() => copiarContenido(item)}
                        style={{ cursor: "pointer", wordBreak: "break-word", background: "transparent" }}
                        title="Copiar contenido"
                      >
                        <div className="scrollable-content" style={{ maxHeight: "150px", overflowY: "auto", textAlign: "left" }}>
                          {item.type === "image" ? (
                            <ImagenPrivada filename={item.filePath?.split('/').pop()} />
                          ) : (
                            <p className="mb-0" style={{ wordBreak: "break-word", fontSize: "0.95rem" }}>
                              {expandedItems[item._id] ? item.content : item.content?.slice(0, TEXT_PREVIEW_LENGTH)}
                              {item.content?.length > TEXT_PREVIEW_LENGTH && !expandedItems[item._id] && "..."}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <div className="d-flex justify-content-center gap-2">
                          <img src={getDeviceLogo("os", item.os)} alt={item.os} style={{ width: 26, height: 26 }} />
                          <img src={getDeviceLogo("browser", item.browser)} alt={item.browser} style={{ width: 26, height: 26 }} />
                        </div>
                      </td>
                      <td className="align-middle text-muted small">{new Date(item.createdAt).toLocaleString()}</td>
                      <td className="align-middle">
                        <div className="d-flex justify-content-center gap-2">
                          {item.type === "image" && (
                            <button className="btn boton_aux btn-primary m-0" style={{ width: "40px", height: "40px" }} onClick={() => verImagen(imageCache[item.filePath?.split('/').pop()] || `${serverUrl}/images/${item.filePath?.split('/').pop()}`)}>
                              <i className="fa fa-eye"></i>
                            </button>
                          )}
                          {item.type === "text" && item.content?.length > TEXT_PREVIEW_LENGTH && (
                            <button className="btn boton_aux btn-secondary m-0" style={{ width: "40px", height: "40px", fontSize: "14px" }} onClick={(e) => { e.stopPropagation(); toggleExpand(item._id); }}>
                              <i className={`fa-solid ${expandedItems[item._id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          )}
                          <button className="btn boton_aux btn-success m-0" style={{ width: "40px", height: "40px" }} onClick={() => descargarContenido(item)}>
                            <i className="fa fa-download"></i>
                          </button>
                          <button className="btn boton_aux btn-danger m-0" style={{ width: "40px", height: "40px" }} onClick={() => borrarContenido(item._id)}>
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Paginación */}
      <h5 className="mt-4 text-center text-muted fw-semibold">{filteredItems.length} elementos guardados</h5>
      <div className="pagination-controls d-flex justify-content-center align-items-center gap-3 mt-3">
        <button
          className="btn boton_aux btn-secondary m-0"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          title="Página anterior"
        >
          <i className="fa fa-arrow-left"></i>
        </button>
        <span className="fw-medium px-3 py-2 rounded-pill" style={{ background: "var(--surface-bg)", border: "1px solid var(--border-color)" }}>
          Página {currentPage} de {Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
        </span>
        <button
          className="btn boton_aux btn-secondary m-0"
          disabled={indexOfLastItem >= filteredItems.length}
          onClick={() => setCurrentPage(currentPage + 1)}
          title="Página siguiente"
        >
          <i className="fa fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}