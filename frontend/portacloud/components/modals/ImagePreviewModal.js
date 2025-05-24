import { Modal } from "react-bootstrap";

export default function ImagePreviewModal({ show, onClose, imageUrl }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="fa fa-eye pe-2"></i> Vista previa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img
          src={imageUrl}
          alt="Vista previa"
          className="img-fluid"
          style={{ maxHeight: '70vh', maxWidth: '100%' }}
        />
      </Modal.Body>
    </Modal>
  );
}
