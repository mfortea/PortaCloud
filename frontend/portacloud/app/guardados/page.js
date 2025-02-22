"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { CSSTransition } from "react-transition-group";

export default function Guardados() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setNotification({ message: "", type: "" }); // Clear the notification
      }, 3000); // Hide the alert after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Redirect to login if no token
    } else if (!user) {
      // If there's a token but the user isn't loaded, wait
      setLoading(true);
    } else {
      setLoading(false); // User is authenticated, stop loading
      fetchGuardados();
    }
  }, [user, router]);

  useEffect(() => {
    fetchGuardados();
  }, []);

  const fetchGuardados = async () => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    const token = localStorage.getItem("token");

    const res = await fetch(`${serverUrl}/api/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSavedItems(data);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fa fa-spinner cargando" aria-hidden="true"></i>
      </div>
    );
  }

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

  const borrarContenido = async (id) => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    const token = localStorage.getItem("token");

    await fetch(`${serverUrl}/api/saved/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSavedItems(savedItems.filter((item) => item._id !== id));
  };

  const copiarContenido = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setShowAlert(true);
      setNotification({
        message: "Contenido copiado al portapapeles.",
        type: "success",
      });
    } catch (error) {
      setNotification({
        message: "Error al copiar el contenido.",
        type: "danger",
      });
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa fa-star"></i> Mis guardados
      </h1>

      {notification.message && (
        <CSSTransition
          in={showAlert}
          timeout={300}
          classNames="alert"
          unmountOnExit
        >
          <div className={`alert alert-${notification.type}`} role="alert">
            {notification.message}
          </div>
        </CSSTransition>
      )}

      {savedItems.length === 0 ? (
        <h3 className="text-center">No hay elementos guardados aún.</h3>
      ) : (
        <div className="row">
          {savedItems.map((item) => (
            <div key={item._id} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <br></br>
                  <div
                    className="clipboard-box p-3 mt-3"
                    onClick={() => copiarContenido(item.content)}
                    title="Copiar contenido"
                    style={{ cursor: "pointer" }}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.content}
                        alt="Guardado"
                        className="img-fluid mb-3"
                      />
                    ) : (
                      <p>{item.content}</p>
                    )}
                  </div>
                  <br></br>
                  <p>
                    <strong>Sistema Operativo:</strong> {item.os}
                  </p>
                  <p>
                    <strong>Navegador:</strong> {item.browser}
                  </p>
                  <p>Guardado el {new Date(item.createdAt).toLocaleString()}</p>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => descargarContenido(item)}
                  >
                    <i className="fa fa-download"></i>
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => borrarContenido(item._id)}
                  >
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