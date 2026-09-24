"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import DownloadUsersModal from "../../components/modals/DownloadUsersModal";
import DownloadLogsModal from "../../components/modals/DownloadLogsModal";
import EditUserModal from "../../components/modals/EditUserModal";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("user");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  const [showDownloadUsersModal, setShowDownloadUsersModal] = useState(false);
  const [showDownloadLogsModal, setShowDownloadLogsModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("json");

  const closeModal = () => setShowModal(false);
  const closeDownloadModal = () => {
    setTimeout(() => {
      setShowDownloadUsersModal(false);
      setShowDownloadLogsModal(false);
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
        await fetchLogs(currentPage);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/admin/users`,
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

  const fetchLogs = async (page = currentPage) => {
    setIsRefreshingLogs(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/admin/logs?page=${page}&limit=${logsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalLogs(data.total);
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

  const downloadLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let allLogs = [];
      let page = 1;
      const pageSize = 100;
  
      const firstResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/admin/logs?page=${page}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (!firstResponse.ok) {
        toast.error("Error al obtener logs");
        return;
      }
  
      const firstData = await firstResponse.json();
      allLogs = allLogs.concat(firstData.logs);
      const totalPages = firstData.totalPages;
  
      while (page < totalPages) {
        page++;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_IP}/admin/logs?page=${page}&limit=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          toast.error("Error al obtener logs en página " + page);
          return;
        }
        const data = await response.json();
        allLogs = allLogs.concat(data.logs);
      }
  
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `logs-portacloud-${timestamp}.${downloadFormat}`;
  
      if (downloadFormat === "json") {
        const content = JSON.stringify(allLogs, null, 2);
        const blob = new Blob([content], { type: "application/json" });
        downloadFile(blob, filename);
      } else if (downloadFormat === "csv") {
        const headers = ["Timestamp", "User", "Action", "IP Address", "Details"];
        const rows = allLogs.map(log => [
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
  
      toast.success("Lista completa de logs descargada");
      setShowDownloadLogsModal(false);
    } catch (error) {
      toast.error("Error al descargar logs");
    } finally {
      setLoading(false);
    }
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

  const currentLogs = logs;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchLogs(pageNumber);
  };

  const openModal = (type, userId = null) => {
    setSelectedUserId(userId);
    setModalType(type);
    setShowModal(true);
  };

  const submitEditRole = async () => {
    if (newRole !== "user" && newRole !== "admin") {
      toast.error("Rol no válido");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/admin/users/${selectedUserId}/role`,
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
      const admin_user = localStorage.getItem("username");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_IP}/admin/users/${selectedUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            admin_user: admin_user,
          }),
        },
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
        `${process.env.NEXT_PUBLIC_SERVER_IP}/admin/users`,
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
        setNewUsername("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("user");
      } else {
        const errorData = await response.json();
        toast.error("Error al crear el usuario: " + (errorData.message || "Error desconocido"));
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  if (isCheckingAuth || (!user && typeof window !== "undefined")) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <h3 id="comprobar_rol" className="fw-bold">Comprobando credenciales...</h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="container py-5 zoom-al_cargar" style={{ maxWidth: "1200px" }}>
        
        {/* Cabecera Principal */}
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-3">
            <i className="fa-solid fa-user-shield" style={{ color: "var(--portal-blue)" }}></i> Panel de Administración
          </h1>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>
            Gestión centralizada de usuarios, auditoría del sistema y copias de seguridad.
          </p>
        </div>

        {/* --- TARJETA: LISTA DE USUARIOS --- */}
        <div className="p-4 p-md-5 mb-5 shadow-sm" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h5 fw-bold m-0" style={{ color: "var(--foreground)" }}>
              <i className="fa-solid fa-users pe-2" style={{ color: "var(--portal-blue)" }}></i> Usuarios Registrados
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <i className="fa fa-circle-notch fa-spin text-muted" style={{ fontSize: "2rem" }}></i>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
              <table className="users-table w-100 m-0">
                <thead>
                  <tr>
                    <th>Nombre de Usuario</th>
                    <th>Rol</th>
                    <th>Fecha de Creación</th>
                    <th>Último Acceso</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem._id}>
                      <td className="align-middle">
                        <span className="fw-bold text-nowrap d-block">{userItem.username}</span>
                        <span className="text-muted small">{userItem.email}</span>
                      </td>
                      <td className="align-middle">
                        <span className={`badge ${userItem.role === 'admin' ? 'bg-primary' : 'bg-secondary'} rounded-pill fw-medium`} style={{ opacity: 0.9 }}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="align-middle text-nowrap">
                        {format(new Date(userItem.createdAt), 'dd MMM yyyy HH:mm:ss', { locale: es })}
                      </td>
                      <td className="align-middle text-nowrap text-muted">
                        {userItem.lastLogin ? format(new Date(userItem.lastLogin), 'dd MMM yyyy HH:mm', { locale: es }) : "Nunca"}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn boton_aux btn-primary m-0"
                            style={{ width: "40px", height: "40px", fontSize: "14px" }}
                            title="Cambiar rol"
                            onClick={() => openModal("editRole", userItem._id)}
                          >
                            <i className="fa-solid fa-user-tag"></i>
                          </button>
                          <button
                            className="btn boton_aux btn-danger m-0"
                            style={{ width: "40px", height: "40px", fontSize: "14px" }}
                            title="Eliminar usuario"
                            onClick={() => openModal("deleteUser", userItem._id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="row g-4 mb-5">
          {/* --- TARJETA: CREAR NUEVO USUARIO --- */}
          <div className="col-lg-6">
            <div className="p-4 p-md-5 h-100 shadow-sm d-flex flex-column" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
              <h3 className="h5 fw-bold mb-4" style={{ color: "var(--foreground)" }}>
                <i className="fa-solid fa-user-plus pe-2" style={{ color: "var(--portal-blue)" }}></i> Crear Nuevo Usuario
              </h3>
              <form onSubmit={handleCreateUser} className="d-flex flex-column gap-3 mt-auto">
                <div>
                  <label className="text-muted small fw-semibold mb-1 ms-1">Nombre de Usuario</label>
                  <input type="text" className="form-control m-0" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
                </div>
                <div>
                  <label className="text-muted small fw-semibold mb-1 ms-1">Correo Electrónico</label>
                  <input type="email" className="form-control m-0" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="text-muted small fw-semibold mb-1 ms-1">Contraseña</label>
                  <input type="password" className="form-control m-0" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="text-muted small fw-semibold mb-1 ms-1">Privilegios (Rol)</label>
                  <select className="form-select select_guardados w-100 m-0" value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: "12px 20px" }}>
                    <option value="user">Usuario Estándar</option>
                    <option value="admin">Administrador del Sistema</option>
                  </select>
                </div>
                <button className="btn botones_ajustes btn-success w-100 mt-3 m-0" type="submit" style={{ height: "56px" }}>
                  Añadir Usuario
                </button>
              </form>
            </div>
          </div>

          {/* --- TARJETA: COPIAS DE SEGURIDAD --- */}
          <div className="col-lg-6">
            <div className="p-4 p-md-5 h-100 shadow-sm d-flex flex-column" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
              <h3 className="h5 fw-bold mb-3" style={{ color: "var(--foreground)" }}>
                <i className="fa-solid fa-cloud-arrow-down pe-2" style={{ color: "var(--portal-blue)" }}></i> Exportar Sistema
              </h3>
              <p className="text-muted small mb-4">Genera copias de seguridad de las bases de datos en formato JSON estructurado o CSV para análisis externo.</p>

              <div className="d-flex flex-column gap-3 mt-auto">
                <button 
                  className="btn botones_ajustes btn-primary w-100 m-0 d-flex justify-content-center align-items-center gap-2" 
                  onClick={() => setShowDownloadUsersModal(true)}
                >
                  <i className="fa-solid fa-users"></i> Base de Datos de Usuarios
                </button>
                <button 
                  className="btn botones_ajustes btn-primary w-100 m-0 d-flex justify-content-center align-items-center gap-2" 
                  onClick={() => setShowDownloadLogsModal(true)}
                >
                  <i className="fa-solid fa-scroll"></i> Histórico de Logs Completos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- TARJETA: REGISTRO DE ACTIVIDADES (LOGS) --- */}
        <div className="p-4 p-md-5 mb-5 shadow-sm" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <h3 className="h5 fw-bold m-0" style={{ color: "var(--foreground)" }}>
              <i className="fa-solid fa-clipboard-list pe-2" style={{ color: "var(--portal-blue)" }}></i> Auditoría de Actividades
            </h3>
            <button 
              onClick={() => fetchLogs(currentPage)} 
              className="btn boton_aux btn-secondary m-0" 
              style={{ width: "45px", height: "45px", fontSize: "16px" }} 
              disabled={isRefreshingLogs} 
              title="Refrescar logs"
            >
              {isRefreshingLogs ? <i className="fa fa-circle-notch fa-spin"></i> : <i className="fa fa-refresh"></i>}
            </button>
          </div>
          
          <div className="table-responsive" style={{ borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <table className="users-table w-100 m-0">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción Registrada</th>
                  <th>Dirección IP</th>
                  <th>Detalles Adicionales</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="align-middle text-nowrap">
                      {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: es })}
                    </td>
                    <td className="align-middle fw-medium">{log.username || 'Sistema'}</td>
                    <td className="align-middle">
                      {log.action === 'login' && 'Inicio de sesión'}
                      {log.action === 'logout' && 'Cierre de sesión'}
                      {log.action === 'register' && 'Registro nuevo'}
                      {log.action === 'user_created' && `Usuario creado: ${log.details?.createdUser}`}
                      {log.action === 'role_changed' && `Rol cambiado: ${log.details?.targetUser} → (${log.details?.newRole})`}
                      {log.action === 'user_deleted' && `Usuario eliminado: ${log.details?.deletedUser}`}
                      {log.action === 'username_changed' && `Usuario renombrado: ${log.details?.oldUsername} → ${log.details?.newUsername}`}
                      {log.action === 'password_changed' && 'Contraseña actualizada'}
                      {log.action === 'account_deleted' && 'Cuenta eliminada'}
                    </td>
                    <td className="align-middle text-muted" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{log.ipAddress}</td>
                    <td className="align-middle">
                      {log.details && log.details.os && (
                        <span className="log-details text-muted small fw-medium">
                          {log.details.os} · {log.details.browser}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginación */}
          <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
            {(() => {
              const totalPages = Math.ceil(totalLogs / logsPerPage);
              const delta = 2; 
              let range = [];
              let left = Math.max(2, currentPage - delta);
              let right = Math.min(totalPages - 1, currentPage + delta);

              range.push(1); 
              if (left > 2) range.push("left-ellipsis");
              for (let i = left; i <= right; i++) range.push(i);
              if (right < totalPages - 1) range.push("right-ellipsis");
              if (totalPages > 1) range.push(totalPages); 

              return range.map((page, index) => {
                if (page === "left-ellipsis" || page === "right-ellipsis") {
                  return <span key={page + index} className="px-2 text-muted fw-bold">...</span>;
                }
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className="btn m-0 fw-semibold"
                    style={{
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "12px", 
                      border: `1px solid ${isActive ? 'transparent' : 'var(--border-color)'}`,
                      background: isActive ? "var(--portal-blue)" : "var(--surface-alt)",
                      color: isActive ? "#ffffff" : "var(--foreground)",
                      transition: "0.2s ease"
                    }}
                  >
                    {page}
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Renderizado de Modales */}
        <DownloadUsersModal
          show={showDownloadUsersModal}
          onClose={closeDownloadModal}
          downloadFormat={downloadFormat}
          setDownloadFormat={setDownloadFormat}
          onDownload={downloadUsers}
        />

        <DownloadLogsModal
          show={showDownloadLogsModal}
          onClose={closeDownloadModal}
          downloadFormat={downloadFormat}
          setDownloadFormat={setDownloadFormat}
          onDownload={downloadLogs}
          loading={loading}
        />

        <EditUserModal
          show={showModal}
          onClose={closeModal}
          modalType={modalType}
          newRole={newRole}
          setNewRole={setNewRole}
          onSubmitEditRole={submitEditRole}
          onSubmitDeleteUser={submitDeleteUser}
        />
      </div>
    </>
  );
}