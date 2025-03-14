"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Ajustes() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notificacion, setNotificacion] = useState({ mensaje: "", tipo: "" });
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [confirmarContraseñaBorrado, setConfirmarContraseñaBorrado] =
    useState("");

  const [showModalNombre, setShowModalNombre] = useState(false);
  const [showModalContraseña, setShowModalContraseña] = useState(false);
  const [showModalEliminarCuenta, setShowModalEliminarCuenta] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion({ mensaje: "", tipo: "" }), 3000);
  };

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
      logout();
      router.push("/login");
    });
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa fa-gear"></i> Ajustes
      </h1>

      {notificacion.mensaje && (
        <div className={`alert alert-${notificacion.tipo}`} role="alert">
          {notificacion.mensaje}
        </div>
      )}

      {/* Contenedor de botones */}
      <div className="d-flex flex-column align-items-center">
        <button
          className="btn botones_ajustes btn-primary"
          onClick={() => setShowModalNombre(true)}
        >
          <i className="fa fa-user"></i> Cambiar nombre de usuario
        </button>

        <button
          className="btn botones_ajustes btn-primary"
          onClick={() => setShowModalContraseña(true)}
        >
          <i className="fa fa-lock"></i> Cambiar contraseña
        </button>

        <button
          className="btn botones_ajustes btn-danger"
          onClick={() => setShowModalEliminarCuenta(true)}
        >
          <i className="fa-solid fa-trash-can"></i> Eliminar cuenta
        </button>

        <button className="btn botones_ajustes btn-primary" onClick={handleLogout}>
          <i className="fa fa-right-from-bracket"></i> Cerrar sesión
        </button>
        <br></br>
        <br></br>
        <Link className="nav-link" href="/acercade">
          <i className="fa-solid fa-circle-question"></i>&nbsp; Acerca de PortaCloud
        </Link>
      </div>

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
                <h3 className="modal-title" id="modalCambiarNombreLabel">
                  <i className="fa fa-user"></i> Cambiar Nombre de Usuario
                </h3>
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
                  className="btn w-100 botones_ajustes btn-success"
                  onClick={cambiarNombreUsuario}
                >
                  Cambiar nombre de usuario
                </button>
                <button
                  type="button"
                  className="btn w-100 botones_ajustes btn-primary"
                  onClick={() => setShowModalNombre(false)}
                >
                  <i className="fa-solid fa-xmark"></i> Cerrar
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
                <h3 className="modal-title" id="modalCambiarContraseñaLabel">
                  <i class="fa-solid fa-lock"></i> Cambiar Contraseña
                </h3>
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
                  className="btn w-100 botones_ajustes btn-success"
                  onClick={cambiarContraseña}
                >
                  Cambiar contraseña
                </button>
                <button
                  type="button"
                  className="btn w-100 botones_ajustes  btn-primary"
                  onClick={() => setShowModalContraseña(false)}
                >
                  <i className="fa-solid fa-xmark"></i> Cerrar
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
                <h3 className="modal-title" id="modalEliminarCuentaLabel">
                  <i className="fa-solid fa-trash-can"></i> Eliminar Cuenta
                </h3>
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
                  className="btn w-100 botones_ajustes btn-danger"
                  onClick={eliminarCuenta}
                >
                  <i className="fa-solid fa-trash-can"></i> Eliminar cuenta
                </button>
                <button
                  type="button"
                  className="btn w-100 botones_ajustes btn-primary"
                  onClick={() => setShowModalEliminarCuenta(false)}
                >
                  <i className="fa-solid fa-xmark"></i> Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}