import { Modal, Button, Form } from "react-bootstrap";

export default function DownloadUsersModal({ show, onClose, downloadFormat, setDownloadFormat, onDownload }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="fa-solid fa-users pe-2"></i> Descargar lista de usuarios</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="downloadFormat">
          <Form.Label>Selecciona el formato para descargar la lista de usuarios:</Form.Label>
          <Form.Control as="select" value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
            <option value="json">JSON</option>
            <option value="csv">CSV (Excel)</option>
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" className="btn botones_ajustes w-100" onClick={onDownload}>
          <i className="fa fa-download pe-2"></i> Descargar
        </Button>
        <Button variant="primary" className="btn botones_ajustes w-100" onClick={onClose}>
          <i className="fa-solid fa-times pe-2"></i> Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
