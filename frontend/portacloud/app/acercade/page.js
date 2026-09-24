import Link from 'next/link';
import { FaGithub } from "react-icons/fa";

export const metadata = {
  title: 'Acerca de | PortaCloud',
  description: 'Información sobre este proyecto',
};

export default function AcercaDe() {
  return (
    <div className="container py-5 zoom-al_cargar" style={{ maxWidth: "800px" }}>
      
      {/* Cabecera */}
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-3">
          <i className="fa-solid fa-circle-info" style={{ color: "var(--portal-blue)" }}></i> Acerca de
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>
          Información legal y detalles técnicos del proyecto.
        </p>
      </div>

      {/* Tarjeta Principal de Información */}
      <div className="p-4 p-md-5 mb-4 shadow-sm text-center" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
        <img src="/logo.png" alt="Logo PortaCloud" className="logo_acercade mb-4" style={{ width: "120px" }} />
        <h2 className="h4 fw-bold mb-3" style={{ color: "var(--foreground)" }}>Proyecto Universitario</h2>
        <p className="text-muted mb-4" style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
          Este proyecto (<strong>PortaCloud</strong>) es el resultado de un Trabajo de Fin de Grado (TFG) para la <strong>Universidad de Córdoba</strong>. Su propósito es estrictamente académico y experimental, sin fines comerciales ni de lucro.
        </p>

        <hr style={{ borderColor: "var(--border-color)", opacity: 1 }} className="my-4" />

        <h3 className="h5 fw-bold mb-3"><i className="fa-solid fa-code pe-2" style={{ color: "var(--portal-blue)" }}></i> Código Fuente</h3>
        <p className="text-muted mb-4">Puedes auditar, revisar o descargar el código fuente del proyecto en el siguiente repositorio oficial:</p>
        
        <Link
          href="https://github.com/mfortea/PortaCloud"
          target="_blank"
          rel="noopener noreferrer"
          className="btn boton_aux btn-secondary d-inline-flex justify-content-center align-items-center gap-3 px-4 m-0 text-decoration-none"
          style={{ width: "auto", height: "60px", fontSize: "1.1rem", borderRadius: "16px", fontWeight: "600" }}
        >
          <FaGithub size={28} /> mfortea/PortaCloud
        </Link>
      </div>

      {/* Tarjeta de Licencia */}
      <div className="p-4 p-md-5 shadow-sm" style={{ background: "var(--surface-bg)", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
        <div className="text-center mb-4">
          <h2 className="h4 fw-bold mb-2">
            <i className="fa-solid fa-scale-balanced pe-2" style={{ color: "var(--portal-blue)" }}></i> Licencia de uso
          </h2>
          <p className="text-muted">Distribuido bajo la Licencia MIT de código abierto.</p>
        </div>

        <p className="text-muted small text-center mb-4">
          Esto significa que puedes usarlo, modificarlo y distribuirlo libremente, siempre que incluyas el aviso de copyright original.
        </p>

        {/* Bloque de código de licencia moderno */}
        <div className="p-4 custom-scrollbar" style={{ background: "var(--surface-alt)", borderRadius: "16px", border: "1px solid var(--border-color)", overflowX: "auto" }}>
          <pre className="m-0 text-muted" style={{ whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.85rem", lineHeight: "1.6", textAlign: "justify" }}>
{`MIT License

Copyright (c) 2025 Mateo Fortea

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
        </div>
      </div>
      
    </div>
  );
}