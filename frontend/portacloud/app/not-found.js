
export const metadata = {
    title: 'Error 404 | PortaCloud',
  };

export default function NotFound() {

    return (
        <div className="container py-5">
            <div className="d-flex flex-column align-items-center">
                <img src="/logo.png" alt="Logo" className="logo_404 mb-4" />
                <h1 className="text-center mb-3 texto_404">
                    Error 404
                </h1>
                <h3 className="text-center">¡Vaya! Parece que la página que buscas no existe</h3>
            </div>


        </div>
    );
}