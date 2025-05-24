import { Modal, Button, Form } from "react-bootstrap";

export default function EditUserModal({ show, onClose, modalType, newRole, setNewRole, onSubmitEditRole, onSubmitDeleteUser }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {modalType === "editRole" ? (
            <>
              <i className="fa-solid fa-user-tag pe-2"></i> Cambiar Rol
            </>
          ) : (
            <>
              <i className="fa-solid fa-user-xmark pe-2"></i> Confirmar Eliminación
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalType === "editRole" && (
          <Form.Group controlId="newRole">
            <Form.Label>Selecciona un rol para aplicar</Form.Label>
            <Form.Control as="select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </Form.Control>
          </Form.Group>
        )}
        {modalType === "deleteUser" && (
          <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        {modalType === "editRole" && (
          <Button variant="success" className="btn botones_ajustes w-100" onClick={onSubmitEditRole}>
            <i className="fa-solid fa-check pe-2"></i> Confirmar
          </Button>
        )}
        {modalType === "deleteUser" && (
          <Button variant="danger" className="btn botones_ajustes w-100" onClick={onSubmitDeleteUser}>
            <i className="fa-solid fa-trash pe-2"></i> Sí, Eliminar
          </Button>
        )}
        <Button variant="primary" className="btn botones_ajustes w-100" onClick={onClose}>
          <i className="fa-solid fa-times pe-2"></i> Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
