// pages/ajustes.js
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export default function Ajustes() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Usa el contexto
  const [notificacion, setNotificacion] = useState({ mensaje: "", tipo: "" });
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [confirmarContraseñaBorrado, setConfirmarContraseñaBorrado] =
    useState("");

  // Estados de visibilidad de modales
  const [showModalNombre, setShowModalNombre] = useState(false);
  const [showModalContraseña, setShowModalContraseña] = useState(false);
  const [showModalEliminarCuenta, setShowModalEliminarCuenta] = useState(false);

  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Redirige al login si no hay token
    } else if (!user) {
      // Si hay token pero el usuario no está cargado, espera
      setLoading(true);
    } else {
      setLoading(false); // El usuario está autenticado, detén la carga
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fa fa-spinner cargando" aria-hidden="true"></i>
      </div>
    );
  }



  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion({ mensaje: "", tipo: "" }), 3000);
  };

  // Función para cambiar el nombre de usuario
  const cambiarNombreUsuario = async () => {
    const token = localStorage.getItem("token");
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

    if (!nuevoNombre) {
      mostrarNotificacion(
        "Por favor, ingresa un nuevo nombre de usuario.",
        "danger"
      );
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/api/auth/cambiarNombre`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });

      if (response.ok) {
        mostrarNotificacion("Nombre de usuario cambiado con éxito.", "success");
      } else {
        mostrarNotificacion("Error al cambiar el nombre de usuario.", "danger");
      }
    } catch (error) {
      mostrarNotificacion("Error al cambiar el nombre de usuario.", "danger");
    }
  };

  // Función para cambiar la contraseña
  const cambiarContraseña = async () => {
    const token = localStorage.getItem("token");
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

    if (!nuevaContraseña || !confirmarContraseña) {
      mostrarNotificacion(
        "Por favor, ingresa la nueva contraseña y la confirmación.",
        "danger"
      );
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      mostrarNotificacion("Las contraseñas no coinciden.", "danger");
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/api/auth/cambiarContraseña`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nuevaContraseña }),
      });

      if (response.ok) {
        mostrarNotificacion("Contraseña cambiada con éxito.", "success");
      } else {
        mostrarNotificacion("Error al cambiar la contraseña.", "danger");
      }
    } catch (error) {
      mostrarNotificacion("Error al cambiar la contraseña.", "danger");
    }
  };

  // Función para eliminar cuenta
  const eliminarCuenta = async () => {
    const token = localStorage.getItem("token");
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

    if (confirmarContraseñaBorrado !== nuevaContraseña) {
      mostrarNotificacion(
        "Las contraseñas no coinciden, no se puede eliminar la cuenta.",
        "danger"
      );
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/api/auth/eliminarCuenta`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        router.push("/login");
        mostrarNotificacion("Cuenta eliminada con éxito.", "success");
      } else {
        mostrarNotificacion("Error al eliminar la cuenta.", "danger");
      }
    } catch (error) {
      mostrarNotificacion("Error al eliminar la cuenta.", "danger");
    }
  };

  // Función para cerrar sesión
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
      logout(); // Llama a la función de logout del contexto
      router.push("/login");
    });
  };

  return (
    <div className="container py-5 text-center">
      <h1 className="text-center mb-4"><i className="fa fa-gear"></i> Ajustes</h1>

      {notificacion.mensaje && (
        <div className={`alert alert-${notificacion.tipo}`} role="alert">
          {notificacion.mensaje}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={() => setShowModalNombre(true)}
      >
        <i className="fa fa-user"></i> Cambiar nombre de usuario
      </button>

      <button
        className="btn btn-primary"
        onClick={() => setShowModalContraseña(true)}
      >
        <i className="fa fa-lock"></i> Cambiar contraseña
      </button>

      <button
        className="btn btn-danger"
        onClick={() => setShowModalEliminarCuenta(true)}
      >
        <i className="fa fa-remove"></i> Eliminar cuenta
      </button>

      <button className="btn btn-primary" onClick={handleLogout}>
        <i className="fa fa-right-from-bracket"></i> Cerrar sesión
      </button>

      {/* Modal Cambiar Nombre */}
      {showModalNombre && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          aria-labelledby="modalCambiarNombreLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modalCambiarNombreLabel">
                  Cambiar Nombre de Usuario
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalNombre(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nuevo nombre de usuario"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModalNombre(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={cambiarNombreUsuario}
                >
                  Cambiar nombre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {showModalContraseña && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          aria-labelledby="modalCambiarContraseñaLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modalCambiarContraseñaLabel">
                  Cambiar Contraseña
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalContraseña(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nueva contraseña"
                  value={nuevaContraseña}
                  onChange={(e) => setNuevaContraseña(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mt-2"
                  placeholder="Confirmar contraseña"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModalContraseña(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={cambiarContraseña}
                >
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Cuenta */}
      {showModalEliminarCuenta && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          aria-labelledby="modalEliminarCuentaLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modalEliminarCuentaLabel">
                  Eliminar Cuenta
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalEliminarCuenta(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar tu cuenta?</p>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña para confirmar"
                  value={confirmarContraseñaBorrado}
                  onChange={(e) =>
                    setConfirmarContraseñaBorrado(e.target.value)
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModalEliminarCuenta(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={eliminarCuenta}
                >
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
