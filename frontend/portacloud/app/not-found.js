export const metadata = {
    title: 'Error 404 | PortaCloud',
};

export default function NotFound() {
    return (
        <div className="container py-5 d-flex justify-content-center align-items-center zoom-al_cargar" style={{ minHeight: "75vh" }}>
            
            <div className="p-4 p-md-5 shadow-sm text-center d-flex flex-column align-items-center" style={{ 
                background: "var(--surface-bg)", 
                borderRadius: "24px", 
                border: "1px solid var(--border-color)", 
                maxWidth: "450px", 
                width: "100%" 
            }}>
                
                {/* Logo con la animación de rotación de color que ya tienes en CSS */}
                <img src="/logo.png" alt="Logo" className="logo_404 mb-4" />
                
                <h1 className="mb-2 texto_404" style={{ fontSize: "3.5rem" }}>
                    404
                </h1>
                
                <h3 className="h5 fw-bold mb-3" style={{ color: "var(--foreground)" }}>
                    ¡Vaya! Página no encontrada
                </h3>
                
                <p className="text-muted mb-5" style={{ fontSize: "0.95rem" }}>
                    Parece que la página que buscas no existe, ha sido movida o no tienes permisos para acceder a ella.
                </p>
                
                <a 
                    href="/dashboard"
                    className="btn botones_ajustes btn-primary m-0 d-flex justify-content-center align-items-center gap-2"
                    style={{ height: "56px" }}
                >
                    <i className="fa fa-arrow-left"></i>
                    Volver al inicio
                </a>
            </div>

        </div>
    );
}