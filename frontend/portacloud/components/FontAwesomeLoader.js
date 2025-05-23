"use client"; // Indica que es componente cliente

import { useEffect } from "react";

export default function FontAwesomeLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return null; // No renderiza nada visible
}
