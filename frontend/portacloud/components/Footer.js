"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  // Inicializamos vacío para evitar el guion colgando antes de hidratar
  const [yearString, setYearString] = useState("");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    // Solo añade "-202X" si el año actual es superior al de creación
    if (currentYear > 2025) {
      setYearString(`-${currentYear}`);
    }
  }, []);

  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const commit = process.env.NEXT_PUBLIC_GIT_COMMIT;

  return (
    <footer className="footer py-4 mt-auto text-center">
      <div className="container">
        <p className="mb-0 text-center text-muted" style={{ fontSize: "0.95rem" }}>
          © 2025{yearString} PortaCloud
          {version && (
            <span className="texto-aviso ms-2" style={{ fontSize: "0.85em", fontWeight: "600" }}>
              v{version}{commit ? ` (${commit})` : ''}
            </span>
          )}
          <span className="mx-2 opacity-50">|</span>
          <Link 
            href="https://github.com/mfortea/portacloud" 
            target="_blank" 
            rel="noopener noreferrer"
            className="enlace_github fw-medium"
          >
            <FaGithub size={18} className="me-1 align-text-bottom" /> mfortea/PortaCloud
          </Link>
        </p>
      </div>
    </footer>
  );
}