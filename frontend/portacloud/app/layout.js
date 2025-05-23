import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "../context/AuthContext";
import ClientLayout from "../components/ClientLayout";
import ThemeColor from "../components/ThemeColor";
import Head from 'next/head';

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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F8F9FA" />
        
        {/* Preload para fuentes críticas */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap"
          as="style"
        />

        {/* Meta tags de SEO y redes sociales */}
        <meta name="description" content="PortaCloud: Gestor de Portapapeles Multiplataforma con Sincronización en la Nube" />
        <meta property="og:title" content="PortaCloud" />
        <meta property="og:description" content="Gestor de portapapeles multiplataforma con sincronización en la nube." />
        <meta property="og:image" content="/path/to/your/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* PWA y splash screen (debería cargarse de manera asíncrona para no bloquear el renderizado) */}
        <script
          src="https://cdn.jsdelivr.net/npm/ios-pwa-splash@1.0.0/cdn.min.js"
          async
        ></script>
        <script>iosPWASplash('logo.png', '#000000');</script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
          <ThemeColor />
        </AuthProvider>
      </body>
    </html>
  );
}
