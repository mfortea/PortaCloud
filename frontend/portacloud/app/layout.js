import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "../context/AuthContext";
import ClientLayout from "../components/ClientLayout";
import ThemeColor from "../components/ThemeColor";
import Head from "next/head";
import FontAwesomeLoader from "../components/FontAwesomeLoader"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "PortaCloud",
  description: "Gestor de Portapapeles Multiplataforma con Sincronización en la Nube",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <FontAwesomeLoader />
          <ClientLayout>{children}</ClientLayout>
          <ThemeColor />
        </AuthProvider>
      </body>
    </html>
  );
}
