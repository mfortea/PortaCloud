import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "../context/AuthContext";
import Footer from "../components/Footer";
import ClientLayout from "../components/ClientLayout";

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
  description: "Tu plataforma en la nube",
};

export default function RootLayout({ children }) {
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    
    const updateThemeColor = () => {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      metaThemeColor.setAttribute("content", isDarkMode ? "#262626" : "#F5F5F5");
    };

    updateThemeColor(); // Aplicar en la carga inicial
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateThemeColor);

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", updateThemeColor);
    };
  }, []);

  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F5F5F5" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
