import { Modal } from "react-bootstrap";

export default function TermsModal({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa-solid fa-scale-balanced pe-2"></i> Términos y condiciones
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Recopilación de Datos:</strong></p>
        <p>Al registrarte en nuestro sitio web, aceptas que recopilamos y procesamos los siguientes datos de forma automática:</p>
        <ul>
          <li><strong>Dirección IP:</strong> Usamos tu dirección IP para identificar tu ubicación geográfica y mejorar la seguridad de nuestro sitio en caso de un uso indebido.</li>
          <li><strong>Tipo de dispositivo, navegador web y sistema operativo utilizado</strong> para acceder a Porta Cloud. Esta información nos ayuda a optimizar la experiencia de usuario y garantizar la compatibilidad con diferentes plataformas así como tener un mecanismo de diferenciación de los dispositivos conectados.</li>
        </ul>
        <p>Esta información es utilizada exclusivamente para mejorar la funcionalidad del sitio y la experiencia de usuario, así como para fines de seguridad. Nos comprometemos a proteger tu información personal.</p>
      </Modal.Body>
    </Modal>
  );
}
