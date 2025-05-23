// components/LoadingSpinner.js
"use client"; // Asegúrate que es componente cliente

import { RingLoader } from "react-spinners";

const spinnerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 9999,
};

export default function LoadingSpinner({ loading = true }) {
  return (
    <div
      style={spinnerStyle}
      role="alert"
      aria-busy={loading}
      aria-label="Cargando contenido"
    >
      <RingLoader
        color="#007bff"
        loading={loading}
        size={80}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}
