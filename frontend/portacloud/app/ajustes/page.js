"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function Ajustes() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  
  const cerrarModal = (modalType) => {
    setClosing(true);
    
    setTimeout(() => {
      if (modalType === "username") {
        setShowUsernameModal(false);
      } else if (modalType === "password") {
        setShowPasswordModal(false);
      } else if (modalType === "delete") {
        setShowDeleteModal(false);
      }
      
      setClosing(false);
    }, 100);
  };
  
  useEffect(() => {
    document.title = 'Ajustes | PortaCloud';
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Ajustes del usuario';
    document.head.appendChild(metaDescription);
    
    return () => {
      document.head.removeChild(metaDescription);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setLoading(!user);
    }
  }, [user, router]);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Ingresa un nuevo nombre de usuario");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

      const response = await fetch(`${serverUrl}/api/auth/update-username`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Nombre de usuario actualizado");
        setShowUsernameModal(false);
        setNewUsername("");
        updateUser({ ...user, username: newUsername });
      } else {
        toast.error(data.message || "Error al actualizar el nombre de usuario");
      }
    } catch (error) {
      console.error("Error en handleUpdateUsername:", error);
      toast.error("Error de conexión");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!currentPassword) {
      toast.error("Ingresa tu contraseña actual");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

      const response = await fetch(`${serverUrl}/api/auth/update-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Contraseña actualizada");
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Error al actualizar la contraseña");
      }
    } catch (error) {
      console.error("Error en handleUpdatePassword:", error);
      toast.error("Error de conexión");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Ingresa tu contraseña para confirmar");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

      const response = await fetch(`${serverUrl}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.clear();
        router.push("/login");
        toast.success("Cuenta eliminada correctamente");
      } else {
        toast.error(data.message || "Error al eliminar la cuenta");
      }
    } catch (error) {
      console.error("Error en handleDeleteAccount:", error);
      toast.error("Error de conexión");
    }
  };


  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        <i className="fa fa-gear"></i> Ajustes
      </h1>

      <div className="d-flex flex-column align-items-center">
        <button
          className="btn botones_ajustes btn-primary"
          onClick={() => setShowUsernameModal(true)}
        >
          <i className="fa fa-user-edit me-2"></i>
          Cambiar nombre de usuario
        </button>

        <button
          className="btn botones_ajustes btn-primary"
          onClick={() => setShowPasswordModal(true)}
        >
          <i className="fa fa-lock me-2"></i>
          Cambiar contraseña
        </button>

        <button
          className="btn botones_ajustes btn-danger"
          onClick={() => setShowDeleteModal(true)}
        >
          <i className="fa fa-trash me-2"></i>
          Eliminar cuenta
        </button>

        <Link href="/acercade" className=" nav-link text-decoration-none">
          <i className="fa fa-info-circle me-2"></i>
          Acerca de PortaCloud
        </Link>
      </div>

      {/* Modales */}
      {/* Modales */}
      {showUsernameModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => cerrarModal("username")}>
          <div className={`modal-dialog ${closing ? "closing" : ""}`}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fa fa-user-edit me-2"></i>
                  Cambiar nombre de usuario
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Nuevo nombre de usuario"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn botones_ajustes w-100 btn-success"
                  onClick={handleUpdateUsername}
                >
                  Guardar cambios
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => cerrarModal("password")}>
          <div className={`modal-dialog ${closing ? "closing" : ""}`}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fa fa-lock me-2"></i>
                  Cambiar contraseña
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn botones_ajustes w-100 btn-success"
                  onClick={handleUpdatePassword}
                >
                  Actualizar contraseña
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => cerrarModal("delete")}>
          <div className={`modal-dialog ${closing ? "closing" : ""}`}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header bg-danger text-white">
                <h3 className="modal-title">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  Eliminar cuenta
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-danger">
                  ¡Esta acción no se puede deshacer! Todos tus datos serán eliminados.
                </p>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña para confirmar"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn botones_ajustes w-100 btn-danger"
                  onClick={handleDeleteAccount}
                >
                  Eliminar definitivamente
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}