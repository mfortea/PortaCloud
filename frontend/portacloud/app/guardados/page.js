"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function Guardados() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [osFilter, setOsFilter] = useState("");
  const [browserFilter, setBrowserFilter] = useState("");
  const [osOptions, setOsOptions] = useState([]);
  const [browserOptions, setBrowserOptions] = useState([]);
  
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
    setOsOptions([...osSet]);
    setBrowserOptions([...browserSet]);
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
      (browserFilter === "" || item.browser === browserFilter)
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa fa-star"></i> Mis guardados
      </h1>

      <div className="mb-4 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="form-control" value={osFilter} onChange={(e) => setOsFilter(e.target.value)}>
          <option value="">Todos los SO ▼ </option>
          {osOptions.map((os) => (
            <option key={os} value={os}>{os}</option>
          ))}
        </select>
        <select className="form-control" value={browserFilter} onChange={(e) => setBrowserFilter(e.target.value)}>
          <option value="">Todos los Navegadores ▼ </option>
          {browserOptions.map((browser) => (
            <option key={browser} value={browser}>{browser}</option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <h3 className="text-center">No hay elementos guardados que coincidan.</h3>
      ) : (
        <div className="row">
          {filteredItems.map((item) => (
            <div key={item._id} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                <div className="clipboard-box p-3 m-3" onClick={() => copiarContenido(item.content)} title="Copiar contenido" style={{ cursor: "pointer" }}>
                    {item.type === "image" ? (
                      <img src={item.content} alt="Guardado" className="img-fluid mb-3" />
                    ) : (
                      <p>{item.content}</p>
                    )}
                  </div>
                  <p><strong>Sistema Operativo:</strong> {item.os}</p>
                  <p><strong>Navegador:</strong> {item.browser}</p>
                  <p>Guardado el {new Date(item.createdAt).toLocaleString()}</p>
                  <button className="btn btn-success m-2" onClick={() => descargarContenido(item)}>
                    <i className="fa fa-download"></i>
                  </button>
                  <button className="btn btn-danger" onClick={() => borrarContenido(item._id)}>
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