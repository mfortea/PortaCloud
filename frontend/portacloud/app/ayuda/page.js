import { MdUpdate } from "react-icons/md";

export const metadata = {
  title: 'Ayuda | PortaCloud',
  description: 'Manual de uso de PortaCloud',
};

export default function Ayuda() {
  return (
    <div className="container py-5 mt-2 zoom-al_cargar">
      {/* Cabecera principal */}
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-3">
          <i className="fa-solid fa-circle-question" style={{ color: "var(--portal-blue)" }}></i> Centro de Ayuda
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>
          Todo lo que necesitas saber para sacarle el máximo partido a tu portapapeles.
        </p>
      </div>

      <div className="row g-4">
        {/* --- COLUMNA IZQUIERDA (Tablas de referencia) --- */}
        <div className="col-lg-6">
          
          {/* Bloque 1: Menú de navegación */}
          <div className="p-4 h-100" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)", boxShadow: "0 8px 24px -6px rgba(2, 132, 199, 0.06)" }}>
            <h3 className="h4 fw-bold mb-4" style={{ color: "var(--foreground)" }}>
              <i className="fa-solid fa-bars pe-2" style={{ color: "var(--portal-blue)" }}></i> Menú principal
            </h3>
            
            <div className="table-responsive">
              <table className="table table-borderless align-middle m-0">
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="py-3" style={{ width: "40%" }}>
                      <div className="d-inline-flex flex-column gap-2 p-3 rounded" style={{ background: "var(--surface-alt)" }}>
                        <div className="d-flex align-items-center gap-2">
                          <img src="/logo.png" alt="Logo" style={{ width: "24px" }} />
                          <span className="fw-bold m-0" style={{ fontSize: "14px" }}>PORTACLOUD</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: "14px" }}>
                          <i className="fa-solid fa-gauge"></i> Dashboard
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted">Vuelve a la pantalla principal de sincronización.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="py-3">
                      <div className="d-inline-flex align-items-center gap-2 p-2 rounded fw-medium" style={{ background: "var(--surface-alt)", color: "var(--foreground)" }}>
                        <i className="fa-solid fa-star" style={{ color: "var(--portal-blue)" }}></i> Guardados
                      </div>
                    </td>
                    <td className="py-3 text-muted">Colección de textos o imágenes que has archivado para no perderlos.</td>
                  </tr>
                  <tr>
                    <td className="py-3">
                      <div className="d-inline-flex align-items-center gap-2 p-2 rounded fw-medium" style={{ background: "var(--surface-alt)", color: "var(--foreground)" }}>
                        <i className="fa-solid fa-gear" style={{ color: "var(--portal-blue)" }}></i> Ajustes
                      </div>
                    </td>
                    <td className="py-3 text-muted">Preferencias de tu cuenta, cambio de contraseña y cierre de sesión.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA (Botones de acción) --- */}
        <div className="col-lg-6">
          <div className="p-4 h-100" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)", boxShadow: "0 8px 24px -6px rgba(2, 132, 199, 0.06)" }}>
            <h3 className="h4 fw-bold mb-4" style={{ color: "var(--foreground)" }}>
              <i className="fa-solid fa-toggle-on pe-2" style={{ color: "var(--portal-blue)" }}></i> Botones de acción
            </h3>
            
            <div className="table-responsive">
              <table className="table table-borderless align-middle m-0">
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="py-2" style={{ width: "20%" }}>
                      <button className="btn boton_aux btn-primary m-0" style={{ width: "45px", height: "45px" }}><i className="fa fa-refresh"></i></button>
                    </td>
                    <td className="py-2 text-muted small"><strong>Dashboard / Guardados:</strong> Actualiza y sincroniza el contenido manualmente.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="py-2">
                      <button className="btn boton_aux btn-success m-0" style={{ width: "45px", height: "45px" }}><i className="fa fa-download"></i></button>
                    </td>
                    <td className="py-2 text-muted small"><strong>Dashboard:</strong> Descarga el texto como <code>.txt</code> o la imagen como <code>.png</code>.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="py-2">
                      <button className="btn boton_aux btn-warning m-0" style={{ width: "45px", height: "45px" }}><i className="fa fa-star"></i></button>
                    </td>
                    <td className="py-2 text-muted small"><strong>Dashboard:</strong> Guarda el contenido actual en la nube de forma permanente.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="py-2">
                      <button className="btn boton_aux btn-danger m-0" style={{ width: "45px", height: "45px" }}><i className="fa fa-remove"></i></button>
                    </td>
                    <td className="py-2 text-muted small"><strong>Global:</strong> Limpia el portapapeles local o borra un elemento de guardados.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="py-2">
                      <button className="btn boton_aux btn-secondary m-0" style={{ width: "45px", height: "45px" }}><MdUpdate size={24} /></button>
                    </td>
                    <td className="py-2 text-muted small"><strong>Dashboard:</strong> Pausa o reanuda la escucha automática del portapapeles.</td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <button className="boton_aux boton_mostrar p-2 m-0 text-decoration-none" style={{ fontSize: "12px" }}>
                        <i className="fa fa-eye"></i> Más
                      </button>
                    </td>
                    <td className="py-2 text-muted small"><strong>Global:</strong> Despliega textos que superen los 500 caracteres o muestra vista previa de imagen.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN INFERIOR COMPLETA (Guías visuales) --- */}
        <div className="col-12 mt-4">
          <div className="p-4 p-md-5" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)", boxShadow: "0 8px 24px -6px rgba(2, 132, 199, 0.06)" }}>
            
            <div className="row g-5 align-items-center mb-5">
              <div className="col-md-7">
                <h3 className="h4 fw-bold mb-3"><i className="fa-solid fa-tower-broadcast pe-2" style={{ color: "var(--portal-blue)" }}></i> Multidispositivo</h3>
                <p className="text-muted">Para ver el portapapeles de otro dispositivo ajeno al actual, simplemente inicia sesión con tu misma cuenta en ese equipo. Accede al Dashboard y espera a que aparezca automáticamente.</p>
                <p className="text-muted">Podrás identificar cada conexión gracias a los iconos de sistema operativo (Windows, Mac, iOS, Android) y el tipo de dispositivo que se muestra.</p>
                <h3 className="h4 fw-bold mb-3 mt-4"><i className="fa-solid fa-clipboard pe-2" style={{ color: "var(--portal-blue)" }}></i> Copiado rápido</h3>
                <p className="text-muted mb-0">Para llevarte el contenido de otro equipo conectado a tu ordenador actual, simplemente <strong>haz clic sobre la caja de texto o imagen</strong>. Se copiará a tu portapapeles local de inmediato.</p>
              </div>
              <div className="col-md-5 text-center">
                <img src="/dispositivo_conectado.png" alt="Dispositivo conectado" className="img-fluid rounded" style={{ border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", maxWidth: "280px" }} />
              </div>
            </div>

            <hr style={{ borderColor: "var(--border-color)", opacity: 1 }} className="my-5" />

            {/* Aviso de navegadores problemáticos */}
            <div className="row g-5 align-items-center">
              <div className="col-md-7 order-md-2">
                <h3 className="h4 fw-bold mb-3">
                  <i className="fa-brands fa-safari pe-2 text-warning"></i>
                  <i className="fa-brands fa-firefox pe-2 text-warning"></i> 
                  Limitaciones de Seguridad
                </h3>
                <p className="text-muted">Las políticas de privacidad de <strong>Safari</strong> y <strong>Firefox</strong> bloquean la lectura silenciosa del portapapeles y el pegado directo de imágenes.</p>
                <p className="text-muted">Para poder usar PortaCloud en estos navegadores, debes pulsar el <strong>botón especial de lectura manual</strong>:</p>
                <button className="btn boton_aux btn-primary mb-3 mt-1"><i className="fa-regular fa-clipboard"></i></button>
                <p className="text-muted mb-0">Tras pulsarlo, el navegador pedirá un permiso de "Pegar". Acéptalo para sincronizar tus datos.</p>
              </div>
              <div className="col-md-5 order-md-1 text-center">
                <img src="/pegar.png" alt="Aviso de pegar" className="img-fluid rounded" style={{ border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", maxWidth: "280px" }} />
              </div>
            </div>

            <hr style={{ borderColor: "var(--border-color)", opacity: 1 }} className="my-5" />

            {/* Fila de navegadores */}
            <div className="text-center">
              <h3 className="h4 fw-bold mb-4"><i className="fa-solid fa-circle-check pe-2" style={{ color: "var(--portal-success)" }}></i> Navegadores Recomendados</h3>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: "600px" }}>PortaCloud utiliza la API moderna de <em>Clipboard</em>. Para una experiencia sin interrupciones y actualización automática, te recomendamos utilizar los siguientes navegadores:</p>
              
              <div className="d-flex justify-content-center flex-wrap gap-4 mb-4">
                <div className="text-center">
                  <img src="/chrome.png" alt="Google Chrome" style={{ width: "70px", height: "70px" }} className="mb-2 drop-shadow" />
                  <p className="fw-semibold small m-0">Chrome</p>
                </div>
                <div className="text-center">
                  <img src="/edge.png" alt="Microsoft Edge" style={{ width: "70px", height: "70px" }} className="mb-2 drop-shadow" />
                  <p className="fw-semibold small m-0">Edge</p>
                </div>
                <div className="text-center" style={{ opacity: 0.6 }}>
                  <img src="/safari.png" alt="Apple Safari" style={{ width: "70px", height: "70px" }} className="mb-2" />
                  <p className="fw-semibold small m-0">Safari <span className="text-danger">*</span></p>
                </div>
                <div className="text-center" style={{ opacity: 0.6 }}>
                  <img src="/firefox.png" alt="Mozilla Firefox" style={{ width: "70px", height: "70px" }} className="mb-2" />
                  <p className="fw-semibold small m-0">Firefox <span className="text-danger">*</span></p>
                </div>
              </div>
              <p className="small text-muted mb-0"><span className="text-danger fw-bold">*</span> Requieren acción manual para sincronizar debido a sus políticas de seguridad.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}