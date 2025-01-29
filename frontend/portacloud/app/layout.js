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
  title: "PortaCloud",
  description: "Aplicación de ejemplo en Next.js",
};


export default function RootLayout({ children }) {
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
        <br></br>
        <br></br>
        <div className="logo_div">
          <img id="logo_ppal" src="/logo.png" />{" "}
          <span className="logo_letras">
            <span className="negrita">PORTA</span>CLOUD
          </span>
        </div>
        <main>{children}</main>
        <Footer /> {}
      </body>
    </html>
  );
}
