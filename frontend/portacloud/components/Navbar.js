// components/Navbar.js
"use client";

import React, { useEffect } from "react";
import { Navbar, Nav, Offcanvas, Container } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // Importa el contexto

export default function AppNavbar() {
  const { user, logout } = useAuth(); // Usa el contexto
  const router = useRouter();

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;

    fetch(`${serverUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceId }),
    }).finally(() => {
      logout(); // Llama a la función de logout del contexto
      router.push("/login");
    });
  };

  // Si no hay usuario, no se renderiza la Navbar
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Menú para móviles */}
      <Navbar bg="light" expand="lg" className="p-3 border-bottom d-lg-none">
        <Container fluid>
          <Navbar.Brand href="/dashboard">
            <img src="/logo.png" alt="Logo" className="logo_ppal" />{" "}
            <span className="logo_letras">
              <span className="negrita">PORTA</span>CLOUD
            </span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="start"
          >
            <Offcanvas.Header closeButton></Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                <Nav.Link className="fw-bold usuario">
                  <i className="fa-solid fa-user"></i>&nbsp;
                  {user ? user.username : "Cargando..."}
                </Nav.Link>
                <Nav.Link href="/dashboard">
                  <i className="fa-solid fa-house"></i> Inicio
                </Nav.Link>
                <Nav.Link href="/guardados">
                  <i className="fa-solid fa-star"></i> Guardados
                </Nav.Link>
                <Nav.Link href="/ajustes">
                  <i className="fa-solid fa-gear"></i> Ajustes
                </Nav.Link>
                <Nav.Link onClick={handleLogout} className="text-danger">
                  <i className="fa-solid fa-right-from-bracket"></i> Cerrar
                  sesión
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      {/* Menú para escritorio */}
      <div
        className="d-none d-lg-flex flex-column vh-100 p-3 bg-light position-fixed"
        style={{ width: "250px" }}
      >
        <Navbar.Brand href="/dashboard" className="mb-4 p-2">
          <img src="/logo.png" alt="Logo" className="logo_ppal" />{" "}
          <span className="logo_letras">
            <span className="negrita">PORTA</span>CLOUD
          </span>
        </Navbar.Brand>
        <Nav className="flex-column">
          <Nav.Link className="fw-bold usuario">
            <i className="fa-solid fa-user"></i>&nbsp;&nbsp;
            {user ? user.username : "Cargando..."}
          </Nav.Link>
          <Nav.Link href="/dashboard">
            <i className="fa-solid fa-house"></i> Inicio
          </Nav.Link>
          <Nav.Link href="/guardados">
            <i className="fa-solid fa-star"></i> Guardados
          </Nav.Link>
          <Nav.Link href="/ajustes">
            <i className="fa-solid fa-gear"></i> Ajustes
          </Nav.Link>
          <Nav.Link onClick={handleLogout} className="text-danger">
            <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
          </Nav.Link>
        </Nav>
      </div>
    </>
  );
}