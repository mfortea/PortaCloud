// layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "../components/Footer";
import AppNavbar from "../components/Navbar";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastContainer } from "react-toastify"; // Importa ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importa los estilos de Toastify

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PortaCloud",
  description: "Aplicación de ejemplo en Next.js",
};

export default function RootLayout({ children, user }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider> 
          <AppNavbar />
          <div className="content">
            <main>{children}</main>
            <Footer />
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000} 
            hideProgressBar={false} 
            newestOnTop={false} 
            closeOnClick 
            rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
          />
        </AuthProvider>
      </body>
    </html>
  );
}