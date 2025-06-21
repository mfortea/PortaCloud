import { Modal, Button, Form } from "react-bootstrap";

export default function DownloadLogsModal({ show, onClose, downloadFormat, setDownloadFormat, onDownload, loading }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="fa-solid fa-scroll pe-2"></i> Descargar listado de logs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="downloadFormat">
          <Form.Label>Selecciona el formato para descargar el registro de actividades:</Form.Label>
          <Form.Control as="select" value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
            <option value="json">JSON</option>
            <option value="csv">CSV (Excel)</option>
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" className="btn botones_ajustes w-100" onClick={onDownload} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Generando fichero...
            </>
          ) : (
            <>
              <i className="fa fa-download pe-2"></i> Descargar
            </>
          )}
        </Button>
        <Button variant="primary" className="btn botones_ajustes w-100" onClick={onClose} disabled={loading}>
          <i className="fa-solid fa-times pe-2"></i> Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
