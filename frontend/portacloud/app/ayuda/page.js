"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdUpdate } from "react-icons/md";

export default function NotSupported() {
    const router = useRouter();

    return (
        <div className="container py-5 text-center mt-2">
            <h1><i className="fa-solid fa-circle-question"></i> Ayuda</h1>
            <br></br>
            <h2>Significado de los botones</h2>
            <br></br>
            <div className="table-responsive">
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
                                <button className="btn boton_aux btn-primary" >
                                    <i className="fa fa-refresh" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Actualiza el contenido del portapapeles manualmente.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-success" >
                                    <i className="fa fa-download" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Descarga el contenido del portapapeles a un archivo.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-warning" >
                                    <i className="fa fa-star" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Guarda el contenido actual del portapapeles para acceder a él más tarde.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn boton_aux btn-danger" >
                                    <i className="fa fa-remove" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td>Limpia el contenido del portapapeles.</td>
                        </tr>
                        <tr>
                            <td>
                                <button className="btn  btn-primary" >
                                    <i className="fa fa-clipboard" aria-hidden="true"></i> Leer portapapeles en Safari
                                </button>
                            </td>
                            <td>Lee el contenido del portapapeles manualmente en Safari, ya que este navegador no soporta la actualización automática.</td>
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
                            <td>Activa o desactiva la actualización automática del portapapeles.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br></br>
            <br></br>
            <h2>Navegadores compatibles</h2>
            <div className="mt-2 row justify-content-center">
                <img src="/chrome.png" alt="Google Chrome" className="img-fluid mb-3"
                    style={{ width: 80 }} />
                <img src="/edge.png" alt="Microsoft Edge" className="img-fluid mb-3"
                    style={{ width: 80 }} />
                <img src="/safari.png" alt="Apple Safari" className="img-fluid mb-3"
                    style={{ width: 80 }} />*
            </div>
            <br></br>
            <p className="font-italic">* La funcionalidad en Safari puede estar limitada</p>
        </div>
    );
}