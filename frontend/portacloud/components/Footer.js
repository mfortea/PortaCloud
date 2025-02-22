"use client";

import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(null);

  // Calcula el año solo en el cliente
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer bg-light text-black py-4 mt-auto">
      <div className="container">
        <p className="mb-0 text-center">
          © {currentYear || ''} PortaCloud
        </p>
      </div>
    </footer>
  );
}