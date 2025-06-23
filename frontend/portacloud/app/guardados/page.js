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

  useEffect(() => {
    const fetchGuardados = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const res = await fetch(`${serverUrl}/saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSavedItems(data);
        const imageItems = data.filter(item => item.type === "image");
        await preloadImages(imageItems);
      } catch (error) {
        console.error("Error fetching saved items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuardados();
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
  
    console.log("Comprobando caché para la imagen: ", filename);
    console.log("URL caché: ", cachedUrl);
  
    if (!cachedUrl) {
      console.log("Imagen no encontrada en caché, mostrando el spinner...");
      return <i className="fa fa-circle-notch fa-spin cargando" aria-hidden="true"></i>;
    }
  
    console.log("Imagen encontrada en caché, mostrando imagen...");
    return <img src={cachedUrl} alt="Imagen guardada" className="img-fluid" />;
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
          <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
        </div>
      );
    }

    if (!imgUrl) {
      return <p className="text-center py-3">Imagen no disponible</p>;
    }

    return (
      <div className="d-flex justify-content-center">
        <img
          ref={imgRef}
          src={imgUrl}
          alt="Imagen guardada"
          className="img-fluid"
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
      firefox: "firefox.png",
      opera: "opera.png",
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
    <div className="container py-5 zoom-al_cargar">
      <ImagePreviewModal show={modalImage !== null} onClose={cerrarModal} imageUrl={modalImage} />

      <h1 className="text-center mb-4">
        <i className="fa fa-star"></i> Mis guardados
      </h1>

      {/* Form filters and controls */}
      <div className="mb-4 d-flex flex-column text-center flex-md-row gap-2">
        <input
          type="text"
          className="form-control input_guardados"
          placeholder="Buscar ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="form-control select_guardados" value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value)}>
          <option value="">▼ Tipos</option>
          <option value="image">Imagen</option>
          <option value="text">Texto</option>
        </select>

        <select className="form-control select_guardados" value={osFilter} onChange={(e) => setOsFilter(e.target.value)}>
          <option value="">▼ S. Operativos </option>
          {osOptions.map((os) => (
            <option key={os} value={os}>{os}</option>
          ))}
        </select>
        <select className="form-control select_guardados" value={browserFilter} onChange={(e) => setBrowserFilter(e.target.value)}>
          <option value="">▼ Navegadores  </option>
          {browserOptions.map((browser) => (
            <option key={browser} value={browser}>{browser}</option>
          ))}
        </select>
        <select className="form-control  select_guardados" value={deviceTypeFilter} onChange={(e) => setDeviceTypeFilter(e.target.value)}>
          <option value="">▼ Dispositivos  </option>
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
        <select className="form-control select_guardados" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
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
          title="Actualizar lista"
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
                <div key={item._id} className="col-12 col-md-6 col-lg-4 mb-4">
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
                            onClick={() => verImagen(imageCache[item.filePath?.split('/').pop()] || `${serverUrl}/images/${item.filePath?.split('/').pop()}`)}
                            title="Vista previa de la imagen"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                        )}
                        {item.type === "text" && item.content?.length > TEXT_PREVIEW_LENGTH && (
                          <div className="text-center mt-2">
                            <button
                              className="boton_aux boton_mostrar p-0 text-decoration-none"
                              title="Mostrar/Ocultar el texto completo"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(item._id);
                              }}
                            >
                              <i className="fa-solid fa-eye pe-1"></i> {expandedItems[item._id] ? "Mostrar menos" : "Mostrar más"}
                            </button>
                          </div>
                        )}
                        <button className="btn boton_aux btn-success m-2" title="Descargar a un archivo" disabled={downloading} onClick={() => descargarContenido(item)}>
                          {downloading ? (
                            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
                          ) : (
                            <i className="fa fa-download" aria-hidden="true"></i>
                          )}
                        </button>
                        <button className="btn boton_aux btn-danger" title="Eliminar" onClick={() => borrarContenido(item._id)} disabled={deleting}>
                          {deleting ? (
                            <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
                          ) : (
                            <i className="fa fa-remove" aria-hidden="true"></i>
                          )}
                        </button>
                      </div>
                      <div
                        className="clipboard-box-saved p-3 m-3 text-break text-wrap"
                        onClick={() => copiarContenido(item)}
                        title="Copiar contenido"
                        style={{ cursor: "pointer" }}
                      >
                        {item.type === "image" ? (
                          renderImage(item.filePath?.split('/').pop())
                        ) : (
                          <p style={{ wordBreak: "break-word" }}>
                            {expandedItems[item._id]
                              ? item.content
                              : item.content?.slice(0, TEXT_PREVIEW_LENGTH)}
                            {item.content?.length > TEXT_PREVIEW_LENGTH && !expandedItems[item._id] && "..."}
                          </p>
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
                      <td
                        className="saved-clipboard"
                        onClick={() => copiarContenido(item)}
                        style={{ cursor: "pointer", wordBreak: "break-word" }}
                        title="Copiar contenido"
                      >
                        <div>
                          {item.type === "image" ? (
                            <ImagenPrivada filename={item.filePath?.split('/').pop()} />
                          ) : (
                            <p style={{ wordBreak: "break-word" }}>
                              {expandedItems[item._id]
                                ? item.content
                                : item.content?.slice(0, TEXT_PREVIEW_LENGTH)}
                              {item.content?.length > TEXT_PREVIEW_LENGTH && !expandedItems[item._id] && "..."}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <img className="me-2" src={getDeviceLogo("os", item.os)} alt={item.os} style={{ width: 30 }} />
                        <img src={getDeviceLogo("browser", item.browser)} alt={item.browser} style={{ width: 30 }} />
                      </td>

                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        {item.type === "image" && (
                          <button
                            className="btn boton_aux btn-primary m-2"
                            onClick={() => verImagen(imageCache[item.filePath?.split('/').pop()] || `${serverUrl}/images/${item.filePath?.split('/').pop()}`)}
                            title="Vista previa de la imagen"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                        )}
                        {item.type === "text" && item.content?.length > TEXT_PREVIEW_LENGTH && (
                          <button
                            className="boton_aux boton_mostrar p-0 text-decoration-none"
                            title="Mostrar/Ocultar el texto completo"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(item._id);
                            }}
                          >
                            <i className="fa-solid fa-eye pe-1"></i> {expandedItems[item._id] ? "Mostrar menos" : "Mostrar más"}
                          </button>
                        )}
                        <button className="btn boton_aux btn-success mx-1" title="Descargar elemento a un archivo" onClick={() => descargarContenido(item)}>
                          <i className="fa fa-download"></i>
                        </button>
                        <button className="btn boton_aux btn-danger" title="Eliminar elemento" onClick={() => borrarContenido(item._id)}>
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
        <button
          className="btn me-3 boton_aux btn-secondary mx-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          title="Página anterior"
        >
          <i className="fa fa-arrow-left"></i>
        </button>
        <span className="me-2">Página {currentPage} de {Math.ceil(filteredItems.length / itemsPerPage)}</span>
        <button
          className="btn boton_aux btn-secondary mx-2"
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
