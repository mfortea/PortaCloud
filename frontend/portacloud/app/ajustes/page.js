"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import LoadingSpinner from "../../components/LoadingSpinner";

import UsernameModal from "../../components/modals/UsernameModal";
import PasswordModal from "../../components/modals/PasswordModal";
import DeleteAccountModal from "../../components/modals/DeleteAccountModal";
import DeleteSavedModal from "../../components/modals/DeleteSavedModal";
import BackupModal from "../../components/modals/BackupModal";

export default function Ajustes() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$\%^&*(),.?":{}\vert{}<>]{12,}$/;

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
    setIsLoading(true);
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }
    if (!currentPassword) {
      toast.error("Ingresa tu contraseña actual");
      setIsLoading(false);
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      toast.error('La contraseña no cumple los mínimos establecidos');
      setIsLoading(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

    fetch(`${serverUrl}/auth/logout`, {
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
        toast.success("Cuenta eliminada correctamente");
      } else {
        toast.error(data.message || "Error al eliminar la cuenta");
      }
    } catch (error) {
      console.error("Error en handleDeleteAccount:", error);
      toast.error("Error de conexión");
    }

    handleLogout();
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

      const imageItems = items.filter(item => item.type === "image");
      const imageCache = await preloadImages(imageItems);

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

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `portacloud_backup_${format(new Date(), 'dd-MM-yyyy')}.zip`);
      setShowBackupModal(false);
    } catch (error) {
      toast.error("Error al generar la copia de seguridad. Detalles: " + error);
    }
  };

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
    return <LoadingSpinner loading={loading} />;
  }

  return (
    <div className="container py-5 zoom-al_cargar" style={{ maxWidth: "1000px" }}>
      {/* Título de la página */}
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-3">
          <i className="fa-solid fa-gear" style={{ color: "var(--portal-blue)" }}></i> Ajustes
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>
          Gestiona las preferencias y la seguridad de la cuenta de <strong>{user?.username || 'No disponible'}</strong>.
        </p>
      </div>

      {/* Tarjeta de Información del Usuario */}
      <div className="p-4 p-md-5 mb-4 shadow-sm" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
        <h3 className="h5 fw-bold mb-4" style={{ color: "var(--foreground)" }}>
          <i className="fa-regular fa-address-card pe-2" style={{ color: "var(--portal-blue)" }}></i> Información de la cuenta
        </h3>
        
        <div className="row g-4 mt-2">
          <div className="col-12 col-md-6 d-flex align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: "54px", height: "54px", background: "var(--surface-alt)", color: "var(--portal-blue)", fontSize: "1.5rem" }}>
              <i className="fa fa-envelope"></i>
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: "0.5px" }}>Email Registrado</p>
              <p className="fw-bold mb-0" style={{ fontSize: "1.1rem", wordBreak: "break-all" }}>{user?.email || 'No registrado'}</p>
            </div>
          </div>
          
          <div className="col-12 col-md-6 d-flex align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: "54px", height: "54px", background: "var(--surface-alt)", color: "var(--portal-blue)", fontSize: "1.5rem" }}>
              <i className="fa fa-calendar-alt"></i>
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: "0.5px" }}>Miembro desde</p>
              <p className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })
                  : 'Fecha no disponible'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Sección: Perfil y Seguridad */}
        <div className="col-lg-6">
          <div className="p-4 p-md-5 h-100 shadow-sm d-flex flex-column" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
            <h3 className="h5 fw-bold mb-4" style={{ color: "var(--foreground)" }}>
              <i className="fa-solid fa-shield-halved pe-2" style={{ color: "var(--portal-blue)" }}></i> Perfil y Seguridad
            </h3>
            <p className="text-muted small mb-4">Actualiza tus credenciales de acceso. Te recomendamos usar contraseñas seguras.</p>
            
            <div className="d-flex flex-column gap-3 mt-auto">
              <button className="btn botones_ajustes w-100 btn-primary m-0 d-flex justify-content-center align-items-center gap-2" onClick={() => setShowUsernameModal(true)}>
                <i className="fa fa-user-edit"></i> Cambiar nombre de usuario
              </button>
              <button className="btn botones_ajustes w-100 btn-primary m-0 d-flex justify-content-center align-items-center gap-2" onClick={() => setShowPasswordModal(true)}>
                <i className="fa fa-lock"></i> Cambiar contraseña
              </button>
            </div>
          </div>
        </div>

        {/* Sección: Datos y Privacidad */}
        <div className="col-lg-6">
          <div className="p-4 p-md-5 h-100 shadow-sm d-flex flex-column" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
            <h3 className="h5 fw-bold mb-4" style={{ color: "var(--foreground)" }}>
              <i className="fa-solid fa-database pe-2" style={{ color: "var(--portal-blue)" }}></i> Datos y Privacidad
            </h3>
            <p className="text-muted small mb-4">Exporta tu información o elimina contenido de forma permanente. Estas acciones son irreversibles.</p>
            
            <div className="d-flex flex-column gap-3 mt-auto">
              <button className="btn botones_ajustes w-100 btn-success m-0 d-flex justify-content-center align-items-center gap-2" onClick={() => setShowBackupModal(true)}>
                <i className="fa fa-download"></i> Descargar todos los guardados
              </button>
              <button className="btn botones_ajustes w-100 btn-danger m-0 d-flex justify-content-center align-items-center gap-2" onClick={() => setShowDeleteSavedModal(true)}>
                <i className="fa-solid fa-star-half-stroke"></i> Eliminar todos los guardados
              </button>
              <button className="btn botones_ajustes w-100 btn-danger m-0 d-flex justify-content-center align-items-center gap-2"  onClick={() => setShowDeleteModal(true)}>
                <i className="fa fa-trash"></i> Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Acerca de PortaCloud */}
      <div className="text-center mt-5 mb-5">
        <Link href="/acercade" className="btn boton_aux btn-secondary d-inline-flex justify-content-center align-items-center text-decoration-none px-4 m-0" style={{ width: "auto", height: "50px", fontSize: "1rem", borderRadius: "14px", fontWeight: "600" }}>
          <i className="fa fa-info-circle me-2"></i> Acerca de PortaCloud
        </Link>
      </div>

      {/* Modales */}
      <UsernameModal
        show={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        onSave={handleUpdateUsername}
      />

      <PasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        onSave={handleUpdatePassword}
        isLoading={isLoading}
      />

      <DeleteSavedModal
        show={showDeleteSavedModal}
        onClose={() => setShowDeleteSavedModal(false)}
        deletePassword={deletePassword}
        setDeletePassword={setDeletePassword}
        onDeleteSaved={handleDeleteSaved}
      />

      <BackupModal
        show={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onDownload={descargarBackup}
      />

      <DeleteAccountModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        deletePassword={deletePassword}
        setDeletePassword={setDeletePassword}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
}