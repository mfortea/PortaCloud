"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Estados para el formulario de creación de usuarios
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("user");

  // Estados para controlar modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [closing, setClosing] = useState(false);

  // Estados para los modales de descarga
  const [showDownloadUsersModal, setShowDownloadUsersModal] = useState(false);
  const [showDownloadLogsModal, setShowDownloadLogsModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("json");

  const closeModal = (modalType) => {
    setClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setModalType(null);
      setSelectedUserId(null);
      setClosing(false);
    }, 100);
  };

  const closeDownloadModal = () => {
    setClosing(true);
    setTimeout(() => {
      setShowDownloadUsersModal(false);
      setShowDownloadLogsModal(false);
      setClosing(false);
    }, 100);
  };

  useEffect(() => {
    document.title = 'Administración | PortaCloud';
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Funciones para los Administradores';
    document.head.appendChild(metaDescription);

    return () => {
      document.head.removeChild(metaDescription);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      } else {
        await fetchUsers();
        await fetchLogs();
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Error al obtener los usuarios");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/api/admin/logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        toast.error("Error al obtener los logs");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  const downloadUsers = () => {
    let content;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `usuarios-portacloud-${timestamp}.${downloadFormat}`;

    if (downloadFormat === "json") {
      content = JSON.stringify(users, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      downloadFile(blob, filename);
    } else if (downloadFormat === "csv") {
      // Convertir a CSV
      const headers = ["Username", "Email", "Role", "Created At", "Last Login"];
      const rows = users.map(user => [
        `"${user.username}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${format(new Date(user.createdAt), 'dd MMM yyyy HH:mm:ss', { locale: es })}"`,
        user.lastLogin ? `"${format(new Date(user.lastLogin), 'dd MMM yyyy HH:mm:ss', { locale: es })}"` : '"Nunca"'
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      downloadFile(blob, filename);
    }

    toast.success("Lista de usuarios descargada");
    setShowDownloadUsersModal(false);
  };

  const downloadLogs = () => {
    let content;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `logs-portacloud-${timestamp}.${downloadFormat}`;

    if (downloadFormat === "json") {
      content = JSON.stringify(logs, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      downloadFile(blob, filename);
    } else if (downloadFormat === "csv") {
      // Convertir a CSV
      const headers = ["Timestamp", "User", "Action", "IP Address", "Details"];
      const rows = logs.map(log => [
        `"${format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: es })}"`,
        `"${log.userId?.username || 'Sistema'}"`,
        `"${getActionDescription(log.action, log.details)}"`,
        `"${log.ipAddress}"`,
        log.details ? `"${log.details.os} · ${log.details.browser}"` : '""'
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      downloadFile(blob, filename);
    }

    toast.success("Lista de logs descargada");
    setShowDownloadLogsModal(false);
  };

  const getActionDescription = (action, details) => {
    switch (action) {
      case 'login': return 'Inicio de sesión';
      case 'logout': return 'Cierre de sesión';
      case 'register': return 'Registro nuevo';
      case 'user_created': return `Usuario creado: ${details?.createdUser}`;
      case 'role_changed': return `Rol cambiado: ${details?.targetUser} (${details?.newRole})`;
      case 'user_deleted': return `Usuario eliminado: ${details?.deletedUser}`;
      case 'username_changed': return `Nombre de usuario cambiado: ${details?.oldUsername} → ${details?.newUsername}`;
      case 'password_changed': return 'Contraseña actualizada';
      case 'account_deleted': return 'Cuenta eliminada';
      default: return action;
    }
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openEditRoleModal = (userId, currentRole) => {
    setSelectedUserId(userId);
    setNewRole(currentRole);
    setModalType("editRole");
    setIsModalOpen(true);
  };

  const openDeleteUserModal = (userId) => {
    setSelectedUserId(userId);
    setModalType("deleteUser");
    setIsModalOpen(true);
  };

  const submitEditRole = async () => {
    if (newRole !== "user" && newRole !== "admin") {
      toast.error("Rol no válido");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/api/admin/users/${selectedUserId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        toast.success("Rol actualizado exitosamente");
        await fetchUsers();
        await fetchLogs();
      } else {
        toast.error("Error al actualizar el rol");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
    closeModal();
  };

  const submitDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/api/admin/users/${selectedUserId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Usuario eliminado exitosamente");
        await fetchUsers();
        await fetchLogs();
      } else {
        toast.error("Error al eliminar el usuario");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
    closeModal();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: newUsername,
            password: newPassword,
            email: newEmail,
            role: newRole,
          }),
        }
      );

      if (response.ok) {
        toast.success("Usuario creado exitosamente");
        await fetchUsers();
        await fetchLogs();
      } else {
        toast.error("Error al crear el usuario");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  if (isCheckingAuth || (!user && typeof window !== "undefined")) {
    return <div className="loading-spinner">
      <i className="fa fa-circle-notch cargando" aria-hidden="true"></i>
    </div>;
  }

  return (
    <div className="container py-5 zoom-al_cargar">
      <ToastContainer />
      <h1 className="text-center">
        <i className="fa-solid fa-user-shield"></i> Administración de Usuarios
      </h1>
      <br />
      <br />
      <h2>
        <i className="mb-3 fa-solid fa-users"></i> Lista de usuarios
      </h2>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
              <th>Rol</th>
              <th>Fecha de Creación</th>
              <th>Último Inicio de Sesión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem) => (
              <tr key={userItem._id}>
                <td><span className="bold">{userItem.username}</span><br></br>{userItem.email}</td>
                <td>{userItem.role}</td>
                <td>
                  {format(new Date(userItem.createdAt), 'dd MMM yyyy HH:mm:ss', { locale: es })}
                </td>
                <td>
                  {userItem.lastLogin
                    ? format(new Date(userItem.lastLogin), 'dd MMM yyyy HH:mm:ss', { locale: es })
                    : "Nunca"}
                </td>
                <td>
                  <button
                    className="btn boton_aux btn-primary"
                    title="Cambiar rol del usuario"
                    onClick={() =>
                      openEditRoleModal(userItem._id, userItem.role)
                    }
                  >
                    <i className="fa-solid fa-user-tag"></i>
                  </button>
                  <button
                    className="btn boton_aux  m-2 btn-danger" title="Eliminar usuario"
                    onClick={() => openDeleteUserModal(userItem._id)}
                  >
                    <i className="fa-solid fa-circle-minus"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br />
      <br />
      <br />
      <h2>
        <i className="mb-3 fa-solid fa-user-plus"></i> Crear Nuevo Usuario
      </h2>
      <form onSubmit={handleCreateUser} className="create-user-form">
        <div>
          <label>Nombre de Usuario:</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Correo electrónico:</label>
          <input
            type="text"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Rol:</label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button className="mt-3 w-100 btn botones_ajustes btn-success" type="submit">
          Crear Usuario
        </button>
      </form>

      <div className="mt-5">
        <h2>
          <i className="mb-3 fa-solid fa-scroll"></i> Registro de Actividades
          &nbsp;
          <button
            onClick={fetchLogs}
            className="ml-3 btn boton_aux btn-primary ms-3"
            disabled={isRefreshingLogs}
          >
            {isRefreshingLogs ? (
              <i className="fa fa-circle-notch fa-spin" aria-hidden="true"></i>
            ) : (
              <i className="fa fa-refresh" aria-hidden="true"></i>
            )}
          </button>
        </h2>
        <div className="logs-container">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Dirección IP</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: es })}
                    </td>
                    <td>{log.userId?.username || 'Sistema'}</td>
                    <td>
                      {log.action === 'login' && 'Inicio de sesión'}
                      {log.action === 'logout' && 'Cierre de sesión'}
                      {log.action === 'register' && 'Registro nuevo'}
                      {log.action === 'user_created' && `Usuario creado: ${log.details?.createdUser}`}
                      {log.action === 'role_changed' && `Rol cambiado: ${log.details?.targetUser} (${log.details?.newRole})`}
                      {log.action === 'user_deleted' && `Usuario eliminado: ${log.details?.deletedUser}`}
                      {log.action === 'username_changed' && `Nombre de usuario cambiado: ${log.details?.oldUsername} → ${log.details?.newUsername}`}
                      {log.action === 'password_changed' && 'Contraseña actualizada'}
                      {log.action === 'account_deleted' && 'Cuenta eliminada'}
                    </td>
                    <td>{log.ipAddress}</td>
                    <td>
                      {log.details && (
                        <span className="log-details">
                          {log.details.os} · {log.details.browser}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pagination mt-3">
          {Array.from({ length: Math.ceil(logs.length / logsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <br />
      <br />
      <h2>
        <i className="mb-3 fa-solid fa-rotate"></i> Copias de seguridad
      </h2>
      <h4>Realizar copia de seguridad a fichero de los usuarios y logs</h4>
      <br></br>
      <button 
        className="btn botones_ajustes btn-success"
        onClick={() => setShowDownloadUsersModal(true)}
      >
        <i className="fa-solid fa-users pe-2"></i>
        Lista de usuarios
      </button>
      <br></br>
      <button 
        className="btn botones_ajustes btn-success"
        onClick={() => setShowDownloadLogsModal(true)}
      >
        <i className="fa-solid fa-scroll pe-2"></i>
        Lista de Logs
      </button>

      {/* Modal para descargar usuarios */}
      {showDownloadUsersModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => closeDownloadModal()}>
          <div className="modal-backdrop-blur" />
          <div className={`modal-dialog ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fa-solid fa-users me-2"></i>
                  Descargar lista de usuarios
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => closeDownloadModal()}
                ></button>
              </div>
              <div className="modal-body">
                <h3>Selecciona el formato para descargar la lista de usuarios:</h3>
                <br></br>
                <div className="form-group">
                  <select 
                    className="form-control"
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV (Excel)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn botones_ajustes w-100 btn-success"
                  onClick={downloadUsers}
                >
                  <i className="fa fa-download me-2"></i> Descargar
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={() => closeDownloadModal()}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para descargar logs */}
      {showDownloadLogsModal && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`} onClick={() => closeDownloadModal()}>
          <div className="modal-backdrop-blur" />
          <div className={`modal-dialog ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fa-solid fa-scroll me-2"></i>
                  Descargar listado de logs
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => closeDownloadModal()}
                ></button>
              </div>
              <div className="modal-body">
                <h3>Selecciona el formato para descargar el registro de actividades:</h3>
                <br></br>
                <div className="form-group">
                  <select 
                    className="form-control"
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV (Excel)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn botones_ajustes w-100 btn-success"
                  onClick={downloadLogs}
                >
                  <i className="fa fa-download me-2"></i> Descargar
                </button>
                <button
                  className="btn botones_ajustes w-100 btn-primary"
                  onClick={() => closeDownloadModal()}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar/eliminar usuarios */}
      {isModalOpen && (
        <div className={`modal show d-block ${closing ? "closing" : ""}`}>
          <div className={`modal-dialog ${closing ? "closing" : ""}`}>
            <div className={`modal-content ${closing ? "closing" : ""}`}>
              <div className="modal-header">
                {modalType === "editRole" && (
                  <h2 className="modal-title"><i className="fa-solid fa-user-tag"></i> Cambiar Rol</h2>
                )}
                {modalType === "deleteUser" && (
                  <h2 className="modal-title"><i className="fa-solid fa-user-xmark"></i> Confirmar Eliminación</h2>
                )}
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {modalType === "editRole" && (
                  <>
                    <h3>Selecciona un rol para aplicar</h3>
                    <select className="w-100 mt-2 text-center" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </>
                )}
                {modalType === "deleteUser" && (
                  <h3>¿Estás seguro de que deseas eliminar este usuario?</h3>
                )}
              </div>
              <div className="modal-footer">
                {modalType === "editRole" && (
                  <button className="btn w-100 botones_ajustes btn-success" onClick={submitEditRole}>
                    Confirmar
                  </button>
                )}
                {modalType === "deleteUser" && (
                  <button className="btn w-100 botones_ajustes btn-danger" onClick={submitDeleteUser}>
                    Sí, Eliminar
                  </button>
                )}
                <button className="btn w-100 botones_ajustes btn-primary" onClick={closeModal}>
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