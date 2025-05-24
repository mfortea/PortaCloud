import { Modal, Button } from "react-bootstrap";

export default function BackupModal({ show, onClose, onDownload }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="fa fa-download me-2"></i> Realizar una copia de seguridad</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Se descargará un copia de seguridad completa de todos los guardados del usuario, tanto el texto como imágenes en un fichero ZIP</p>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn botones_ajustes w-100 btn-success" onClick={onDownload}>
          <i className="fa fa-download me-2"></i> Descargar ZIP
        </Button>
        <Button className="btn botones_ajustes w-100 btn-primary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
