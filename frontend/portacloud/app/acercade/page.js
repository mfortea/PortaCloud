import Link from 'next/link';
import { FaGithub } from "react-icons/fa";

export const metadata = {
    title: 'Acerca de | PortaCloud',
    description: 'Información sobre este proyecto',
  };

export default function AcercaDe() {
    return (
        <div className="container py-5">
            <h1 className="text-center mb-4"><i className="fa-solid fa-circle-question"></i> Acerca de este proyecto</h1>
            <img src="/logo.png" alt="Logo" className="logo_acercade" />
            <p>
                Este proyecto (PortaCloud) es el resultado de un Trabajo de Fin de Grado (TFG) para la Universidad de Córdoba
                Su propósito es académico y experimental, sin fines comerciales ni de lucro.
            </p>
            <br></br>
            <h2 className="mt-4 text-center"><i className="fa-solid fa-scale-balanced"></i> Licencia</h2>
            <p>
                Este software está distribuido bajo la licencia MIT, lo que significa que puedes usarlo, modificarlo
                y distribuirlo libremente, siempre que incluyas el aviso de copyright original.
            </p>
            <div className="licencia mt-3 p-3 border rounded">
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", textAlign: "justify" }}>
                    MIT License

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
                    SOFTWARE.
                </pre>
            </div>
            <br></br>
            <h2 className="mt-4 text-center"><i className="fa-solid fa-code"></i> Código Fuente</h2>
            <p className="text-center">
                Puedes acceder al código fuente del proyecto en el siguiente enlace:
            </p>
            <h4 className="text-center">
                <Link
                    href="https://github.com/mfortea/PortaCloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className='enlace_github'
                >
                    <FaGithub size={40} /> mfortea/PortaCloud
                </Link>
            </h4>
        </div>
    );
}
