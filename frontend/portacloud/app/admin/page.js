"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Estados para el formulario de creación de usuarios
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  // Estados para controlar modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  // modalType puede ser: 'editRole', 'deleteUser', 'createUser'
  const [modalType, setModalType] = useState(null);
  // Para identificar el usuario seleccionado al editar/eliminar
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      } else {
        await fetchUsers();
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [user, router]);

  // Obtener la lista de usuarios
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

  // Funciones para abrir modales
  const openEditRoleModal = (userId, currentRole) => {
    setSelectedUserId(userId);
    setNewRole(currentRole); // Preselecciona el rol actual
    setModalType("editRole");
    setIsModalOpen(true);
  };

  const openDeleteUserModal = (userId) => {
    setSelectedUserId(userId);
    setModalType("deleteUser");
    setIsModalOpen(true);
  };

  const openCreateUserModal = () => {
    // Limpia los campos del formulario al abrir el modal
    setNewUsername("");
    setNewPassword("");
    setNewRole("user");
    setModalType("createUser");
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedUserId(null);
  };

  // Función para enviar el cambio de rol
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
      } else {
        toast.error("Error al actualizar el rol");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
    closeModal();
  };

  // Función para eliminar usuario
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
      } else {
        toast.error("Error al eliminar el usuario");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
    closeModal();
  };

  // Función para crear usuario (para el formulario fuera del modal)
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
            role: newRole,
          }),
        }
      );

      if (response.ok) {
        toast.success("Usuario creado exitosamente");
        await fetchUsers();
      } else {
        toast.error("Error al crear el usuario");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  if (isCheckingAuth || (!user && typeof window !== "undefined")) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container py-5">
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
                <td className="bold">{userItem.username}</td>
                <td>{userItem.role}</td>
                <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                <td>
                  {userItem.lastLogin
                    ? new Date(userItem.lastLogin).toLocaleDateString()
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content text-center">
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
