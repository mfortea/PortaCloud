import { Modal, Button, Form } from "react-bootstrap";

export default function UsernameModal({ show, onClose, newUsername, setNewUsername, onSave }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="fa fa-user-edit me-2"></i> Cambiar nombre de usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="text"
          placeholder="Nuevo nombre de usuario"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn botones_ajustes w-100 btn-success" onClick={onSave}>
          Guardar cambios
        </Button>
        <Button className="btn botones_ajustes w-100 btn-primary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
