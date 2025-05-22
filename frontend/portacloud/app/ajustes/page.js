"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { format } from 'date-fns';


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
  const [showDeleteSavedModal, setShowDeleteSavedModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
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
      else if (modalType === "deleteSaved") {
        setShowDeleteSavedModal(false);
      }
      else if (modalType === "backup") {
        setShowBackupModal(false);
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

      const response = await fetch(`${serverUrl}/user/update-username`, {
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

      const response = await fetch(`${serverUrl}/user/update-password`, {
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

      const response = await fetch(`${serverUrl}/user/delete-account`, {
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

  const handleDeleteSaved = async () => {
    if (!deletePassword) {
      toast.error("Ingresa tu contraseña para confirmar");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

      const response = await fetch(`${serverUrl}/saved/deleteAll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Todos los guardados han sido eliminados correctamente");
        setDeletePassword("");
        setShowDeleteSavedModal(false);
      } else {
        toast.error(data.message || "Error al eliminar los guardados");
      }
    } catch (error) {
      console.error("Error en handleDeleteSaved:", error);
      toast.error("Error de conexión");
    }
  };

  const descargarBackup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/saved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const items = await response.json();
      
      const zip = new JSZip();
      const folder = zip.folder("portacloud_backup_" + user?.username);
      
      // Cargar imágenes a la caché (como en la página "Guardados")
      const imageItems = items.filter(item => item.type === "image");
      const imageCache = await preloadImages(imageItems);  // Aquí se precargan las imágenes
  
      // Agregar contenido de texto e imágenes al ZIP
      for (const item of items) {
        const date = new Date(item.createdAt);
        const filename = `portacloud_${format(date, 'dd-MM-yyyy_HH-mm-ss')}`;
        
        if (item.type === "text") {
          folder.file(`${filename}.txt`, item.content);
        } else if (item.type === "image") {
          const filename = item.filePath.split('/').pop();
          const imgUrl = imageCache[filename] || `${process.env.NEXT_PUBLIC_SERVER_IP}${item.filePath}`;
          
          const imgResponse = await fetch(imgUrl);
          const blob = await imgResponse.blob();
          folder.file(`${filename}.png`, blob);
        }
      }
  
      // Crear y guardar el archivo ZIP
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `portacloud_backup_${format(new Date(), 'dd-MM-yyyy')}.zip`);
      cerrarModal("backup");
    } catch (error) {
      toast.error("Error al generar la copia de seguridad. Detalles: " + error);
    }
  };
  
  // Pre-carga de imágenes en caché
  const preloadImages = async (imageItems) => {
    const imageCache = {};
    for (const item of imageItems) {
      const filename = item.filePath?.split('/').pop();
      if (!filename || imageCache[filename]) continue;
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_IP}/images/${filename}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        imageCache[filename] = url;
      }
    }
    return imageCache;
  };
  


  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
      </div>
    );
  }

  
  return (
    <div className="container py-5 zoom-al_cargar">
      <h1 className="text-center mb-4">
        <i className="fa fa-gear pe-2"></i> Ajustes de {user?.username || 'No disponible'}
      </h1>
      <div className="info_ajustes d-flex flex-column align-items-center mb-4">
        <div>
          <div className="mb-2">
            <strong><i className="fa fa-envelope me-2"></i>Email:</strong>
            <span className="ms-2">{user?.email || 'No registrado'}</span>
          </div>

          <div>
            <strong><i className="fa fa-calendar me-2"></i>Cuenta creada:</strong>
            <span className="ms-2">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : 'Fecha no disponible'}
            </span>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-center mt-4">
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
          className="btn botones_ajustes btn-success"
          onClick={() => setShowBackupModal(true)}
        >
          <i className="fa fa-download me-2"></i>
          Descargar todos los guardados
        </button>

        <button
          className="btn botones_ajustes btn-danger"
          onClick={() => setShowDeleteSavedModal(true)}
        >
          <i className="fa-solid fa-star-half-stroke pe-2"></i>
          Eliminar todos los guardados
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
      {showUsernameModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => cerrarModal("username")}>
          <div className="modal-backdrop-blur" />
          <div className={`modal-dialog ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fa fa-user-edit me-2"></i>
                  Cambiar nombre de usuario
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => cerrarModal("username")}
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
                  onClick={() => cerrarModal("username")}
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
          <div className="modal-backdrop-blur" />
          <div className={`modal-dialog ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fa fa-lock me-2"></i>
                  Cambiar contraseña
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => cerrarModal("password")}
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
                  onClick={() => cerrarModal("password")}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteSavedModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => cerrarModal("deleteSaved")}>
          <div className="modal-backdrop-blur" />
          <div className={`modal-dialog ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header bg-danger text-white">
                <h3 className="modal-title">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  Eliminar todos los guardados
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => cerrarModal("deleteSaved")}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-danger">
                  ¡Esta acción no se puede deshacer! Todos el contenido que tienes en guardados será eliminado (tanto imágenes como texto)
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
                  onClick={handleDeleteSaved}
                >
                  Eliminar todos mis guardados
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={() => cerrarModal("deleteSaved")}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBackupModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => cerrarModal("backup")}>
          <div className="modal-backdrop-blur" />
          <div className={`modal-dialog ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fa fa-download me-2"></i>
                  Realizar una copia de seguridad
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => cerrarModal("backup")}
                ></button>
              </div>
              <div className="modal-body">
                <p>Se descargará un copia de seguridad completa de todos los guardados del usuario, tanto el texto como imágenes en un fichero ZIP</p>

              </div>
              <div className="modal-footer">
                <button
                  className="btn botones_ajustes w-100 btn-success"
                  onClick={descargarBackup}
                >
                  <i className="fa fa-download me-2"></i> Descargar ZIP
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={() => cerrarModal("backup")}
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
          <div className="modal-backdrop-blur" />
          <div className={`modal-dialog ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header bg-danger text-white">
                <h3 className="modal-title">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  Eliminar cuenta
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => cerrarModal("delete")}
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
                  Eliminar cuenta definitivamente
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={() => cerrarModal("delete")}
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