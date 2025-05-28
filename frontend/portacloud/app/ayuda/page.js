

import { MdUpdate } from "react-icons/md";

export const metadata = {
    title: 'Ayuda | PortaCloud',
    description: 'Manual de uso de PortaCloud',
};

export default function NotSupported() {
    return (
        <div className="container py-5 text-center mt-2 zoom-al_cargar">
            <h1><i className="fa-solid fa-circle-question"></i> Ayuda</h1>
            <br></br>
            <div className="table-responsive">
                <h2> <i className="fa-solid fa-bars pe-2"></i>Menú de navegación</h2>
                <br></br>
                <table className="tabla_ayuda mx-auto" style={{ maxWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th>Botón</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="boton_logo" title="Volver a inicio">

                                    <img src="/logo.png" alt="Logo" className="logo_ppal" />{" "}
                                    <span className="logo_letras">
                                        <span className="negrita">PORTA</span>CLOUD
                                    </span>
                                    <br></br>
                                    <br></br>
                                    <div className="nav-link"><i className="fa-solid fa-gauge"></i> Dashboard</div>



                                </div>
                            </td>
                            <td>Vuelve a la pantalla principal (dashboard)</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="nav-link"><i className="fa-solid fa-star"></i> Guardados</div>
                            </td>
                            <td>Muestra los elementos que se hayan guardado del portapapeles</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="nav-link"><i className="fa-solid fa-gear"></i> Ajustes</div>
                            </td>
                            <td>Gestiona distintos ajustes del usuario actual</td>
                        </tr>

                    </tbody>
                </table>
            </div>
            <br></br>
            <hr></hr>
            <br></br>
            <h2><i className="fa-solid fa-toggle-on pe-2"></i> Significado de los botones</h2>
            <br></br>
            <div className="table-responsive">
                <table className="tabla_ayuda mx-auto" style={{ maxWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th>Botón</th>
                            <th>Ubicación</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-primary" >
                                    <i className="fa fa-refresh" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Dashboard, Guardados</td>
                            <td>Actualiza el contenido.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-success" >
                                    <i className="fa fa-download" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Dashboard</td>
                            <td>Descarga el contenido a un archivo.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-warning" >
                                    <i className="fa fa-star" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Dashboard</td>
                            <td>Guarda el contenido actual del portapapeles para acceder a él más tarde.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-danger" >
                                    <i className="fa fa-remove" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Dashboard, Guardados</td>
                            <td>Limpia el contenido del portapapeles / Borra un elemento guardado.</td>
                        </tr>
                        <tr>
                            <td className="d-flex justify-content-center">
                                <button
                                    className="btn boton_aux btn-secondary d-flex align-items-center"
                                    title="Activa o desactiva la actualización automática del portapapeles"
                                >
                                    <MdUpdate size={30} />
                                </button>
                            </td>
                            <td>Dashboard</td>
                            <td>Activa o desactiva la actualización automática del portapapeles.</td>
                        </tr>
                        <tr>
                            <td>
                                <button
                                    className="boton_aux boton_mostrar p-0 text-decoration-none"
                                    title="Mostrar/Ocultar el texto completo"
                                ><i className="fa fa-eye pe-2"></i>Mostrar más</button>
                                <button
                                    className="boton_aux boton_mostrar p-0 text-decoration-none"
                                    title="Mostrar/Ocultar el texto completo"
                                ><i className="fa fa-eye pe-2"></i>Mostrar menos</button>
                            </td>
                            <td>Dashboard, Guardados</td>
                            <td>Se muestra cuando el texto guardado supera los 500 caracteres. Pliega/despliega la totalidad del texto.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-primary" >
                                    <i className="fa fa-eye" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Guardados</td>
                            <td>Muestra una vista previa del contenido si éste es una imagen</td>
                        </tr>
                    </tbody>
                </table>
                <br></br>
            </div>
            <hr></hr>
            <br></br>
            <h2><i className="fa-solid fa-tower-broadcast pe-2"></i> ¿Cómo ver el portapapeles de mis dispositivos?</h2>
            <p>Para poder ver el contenido del portapapeles de otro dispositivo ajeno al actual debe iniciar sesión en la misma cuenta en otro dispositivo, acceder al Dashboard y esperar a que aparezca automáticamente en la sección de "Dispositivos conectados".</p>
            <p>Desde aquí se mostrará el tipo de dispositivo que se ha conectado (smartphone, tablet u ordenador de escritorio) y el sistema operativo y navegador desde el que se está conectando</p>
            <img src="/dispositivo_conectado.png" alt="Captura de un dispositivo conectado en el Dashboard" className="img-fluid mb-3"
                style={{ width: 350 }} />
            <br></br>
            <hr></hr>
            <br></br>
            <h2><i className="fa-solid fa-clipboard pe-2"></i> Copiado directo al portapapeles</h2>
            <p>Si queremos copiar el contenido de otro dispositivo conectado (también aplica a algo que tengamos en Guardados) simplemente debemos hacer clic sobre el contenido y éste se copiará a nuestro portapapeles local</p>
            <img src="/copiar.png" alt="Captura del funcionamiento del copiado al portapapeles local de otro portapapeles" className="img-fluid mb-3"
                style={{ width: 350 }} />

            <br></br>
            <hr></hr>
            <br></br>
            <h2><i className="fa-brands fa-safari pe-2"></i><i className="fa-brands fa-firefox pe-2"></i> Limitaciones de Safari y Firefox</h2>

            <br></br>
            <p>Estos navegadores no soportan funciones como la actualización automática del portapapeles y el soporte para copiar imágenes al portapapeles. Para leer el contenido del portapapeles deberá utilizar el botón de lectura de portapapeles siguiente: </p>

            <button className="btn boton_aux btn-primary" >
                <i className="fa-regular fa-clipboard"></i>
            </button>
            <p>Una vez pulsado deberemos esperar que el navegador lea el contenido del portapapeles y pulsar en "Pegar" cuando esta opción se habilite, como se muestra en la siguiente imagen:</p>
            <img src="/pegar.png" alt="Captura del funcionamiento en navegadores no compatibles" className="img-fluid mb-3"
                style={{ width: 350 }} />
            <br></br>
            <hr></hr>
            <br></br>
            <h2><i className="fa-solid fa-circle-check pe-2"></i> Navegadores compatibles</h2>
            <br></br>
            <p>PortaCloud hace uso de la API Clipboard, para que todas las funciones funcionen plenamente se deberán utilizar alguno de los siguientes navegadores</p>
            <div className="mt-2 row justify-content-center">
                <img src="/chrome.png" alt="Google Chrome" className="img-fluid mb-3"
                    style={{ width: 80 }} />
                <img src="/edge.png" alt="Microsoft Edge" className="img-fluid mb-3"
                    style={{ width: 80 }} />
                <img src="/safari.png" alt="Apple Safari" className="img-fluid mb-3"
                    style={{ width: 80 }} />*
                <img src="/firefox.png" alt="Mozilla Firefox" className="img-fluid mb-3"
                    style={{ width: 80 }} />*
            </div>
            <br></br>
            <p className="cursiva small">* En Safari y Firefox funciones como la actualización automática del portapapeles y el soporte para imágenes no está soportado. Se deberá leer manualmente el contenido del portapaples con el botón indicado anteriormente</p>
            <p>Para una mejor experiencia se recomienda utilizar Google Chrome o Microsoft Edge</p>
        </div>
    );
}