import { Modal, Button, Form } from "react-bootstrap";

export default function PasswordModal({
  show,
  onClose,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSave,
  isLoading
}) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="fa fa-lock me-2"></i> Cambiar contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="small">La contraseña debe contener al menos:</p>
        <ul className="mt-2 small">
          <li>12 caracteres</li>
          <li>Una letra mayúscula</li>
          <li>Un número</li>
          <li>Un símbolo especial (!,#,$, etc)</li>
        </ul>
        <br />
        <Form.Control
          type="password"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className="mb-3"
        />
        <Form.Control
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="mb-3"
        />
        <Form.Control
          type="password"
          placeholder="Repetir nueva contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn botones_ajustes w-100 btn-success"
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="text-center text-white spinner"></div>
          ) : (
            "Cambiar contraseña"
          )}
        </Button>
        <Button className="btn botones_ajustes w-100 btn-primary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
