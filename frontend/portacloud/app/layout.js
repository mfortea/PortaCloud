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
      <Head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F8F9FA" />

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

        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="/path/to/your/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />

        <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />

        <script
          src="https://cdn.jsdelivr.net/npm/ios-pwa-splash@1.0.0/cdn.min.js"
          async
        ></script>
        <script>iosPWASplash('logo.png', '#000000');</script>
      </Head>
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
