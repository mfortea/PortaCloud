"use client";

import { useEffect } from "react";

export default function ThemeColor() {
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");

    const updateThemeColor = () => {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      metaThemeColor?.setAttribute("content", isDarkMode ? "#222222" : "#f8f9fa");
    };

    updateThemeColor(); // Aplicar en la carga inicial
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateThemeColor);

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", updateThemeColor);
    };
  }, []);

  return null; // No renderiza nada, solo ejecuta el efecto
}
