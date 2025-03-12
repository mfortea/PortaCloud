"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(null);

  // Calcula el año solo en el cliente
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer py-4 mt-auto text-center">
      <div className="container">
        <p className="mb-0 text-center">
          © {currentYear || ''} PortaCloud  &nbsp; | &nbsp; <Link 
          href="https://github.com/mfortea/TFG" 
          target="_blank" 
          rel="noopener noreferrer"
          className='enlace_github'
        >
          <FaGithub size={20} /> mfortea/TFG
        </Link>
        </p>

      </div>
    </footer>
  );
}