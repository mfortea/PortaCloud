import { Modal, Button, Form } from "react-bootstrap";

export default function DeleteSavedModal({
  show,
  onClose,
  deletePassword,
  setDeletePassword,
  onDeleteSaved
}) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title><i className="fa fa-exclamation-triangle me-2"></i> Eliminar todos los guardados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-danger">
          ¡Esta acción no se puede deshacer! Todos el contenido que tienes en guardados será eliminado (tanto imágenes como texto)
        </p>
        <Form.Control
          type="password"
          placeholder="Ingresa tu contraseña para confirmar"
          value={deletePassword}
          onChange={e => setDeletePassword(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn botones_ajustes w-100 btn-danger" onClick={onDeleteSaved}>
          Eliminar todos mis guardados
        </Button>
        <Button className="btn botones_ajustes w-100 btn-primary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
