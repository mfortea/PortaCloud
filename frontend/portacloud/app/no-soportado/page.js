"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotSupported() {
    const router = useRouter();

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (!userAgent.includes("firefox")) {
            router.push("/dashboard");
        }
    }, [router]);

    return (

        <div className="login-landing-page">
            <div className="hero-section">
                <div className="hero-content">
                    <img src="/logo.png" alt="Logo" className="logo" />
                    <h1>Bienvenido a PortaCloud</h1>
                    <p>Gestor de Portapapeles Multiplataforma con Sincronización en la Nube</p>
                </div>
            </div>
            <div className="container py-5 text-center mt-2">
                <h1 className="no_soportado mb-4"><i className="fa-solid fa-ban"></i> Navegador no compatible</h1>
                <h3>
                    Lo sentimos, tu navegador no es compatible con la funcionalidad de
                    portapapeles (clipboard-API).
                </h3>
                <br></br>
                <h3>Los navegadores compatibles son:</h3>
                <div className="row justify-content-center">
                    <img src="/chrome.png" alt="Google Chrome" className="img-fluid mb-3"
                        style={{ width: 80 }} />
                    <img src="/edge.png" alt="Microsoft Edge" className="img-fluid mb-3"
                        style={{ width: 80}} />
                    <img src="/safari.png" alt="Apple Safari" className="img-fluid mb-3"
                        style={{ width: 80}} />*
                </div>
                <br></br>
                <h3>Por favor, utiliza uno de estos navegadores para acceder a la aplicación.</h3>
                <br></br>
                <p className="font-italic">* La funcionalidad en Safari puede estar limitada</p>
            </div>
        </div>
    );
}