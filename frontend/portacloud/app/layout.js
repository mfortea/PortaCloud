import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "./globals.css";                       
import { AuthProvider } from "../context/AuthContext";
import ClientLayout from "../components/ClientLayout";
import ThemeColor from "../components/ThemeColor";
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
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
      </head>
      
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <FontAwesomeLoader />
          <ClientLayout>{children}</ClientLayout>
          <ThemeColor />
        </AuthProvider>

        <Script 
          src="https://cdn.jsdelivr.net/npm/ios-pwa-splash@1.0.0/cdn.min.js" 
          strategy="beforeInteractive" 
        />
        <Script id="ios-pwa-splash-init" strategy="afterInteractive">
          {`iosPWASplash('logo.png', '#090f19');`}
        </Script>
      </body>
    </html>
  );
}