"use client";

import { useEffect } from "react";

export default function ThemeColor() {
  useEffect(() => {
    let metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }

    const updateThemeColor = () => {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      metaThemeColor.setAttribute("content", isDarkMode ? "#222222" : "#f8f9fa");
    };

    updateThemeColor();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateThemeColor);

    return () => {
      mediaQuery.removeEventListener("change", updateThemeColor);
    };
  }, []);

  return null;
}
