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
  /* Efecto Glassmorphism sutil para tapar la app mientras carga */
  backgroundColor: "rgba(248, 250, 252, 0.4)", 
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

export default function LoadingSpinner({ loading = true }) {
  return (
    <div
      className="loading-spinner" /* Se vincula al CSS de modo oscuro que ya creamos */
      style={spinnerStyle}
      role="alert"
      aria-busy={loading}
      aria-label="Cargando contenido"
    >
      <RingLoader
        color="#0284c7" /* Actualizado a tu azul portal en lugar del azul genérico */
        loading={loading}
        size={80}
        speedMultiplier={1.2} /* Le da un toque más rápido y fluido */
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}