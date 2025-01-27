// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "../components/Footer"; // Importa el footer
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Portacloud",
  description: "Aplicación de ejemplo en Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <main>{children}</main>
        <Footer /> {}
      </body>
    </html>
  );
}
