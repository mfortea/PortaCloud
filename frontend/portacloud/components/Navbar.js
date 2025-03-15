"use client";

import React, { useState } from "react";
import { Navbar, Nav, Offcanvas, Container, NavDropdown, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

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
      logout();
      router.push("/login");
    });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Navbar para móviles*/}
      <Navbar expand="lg" className="p-3 d-lg-none">
        <Container fluid>
        <div className="boton_logo">
            <Navbar.Brand href="/dashboard">
              <img src="/logo.png" alt="Logo" className="logo_ppal" />
              <span className="logo_letras">
                <span className="negrita">PORTA</span>CLOUD
              </span>
            </Navbar.Brand>
          </div>
          <Button title="Abrir menú" className="menu-button" onClick={() => setShowOffcanvas(true)}>
            <i className="fa-solid fa-bars"></i>
          </Button>
          <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start">
            <Offcanvas.Header closeButton>
            <div className="boton_logo">
            <Navbar.Brand href="/dashboard">
              <img src="/logo.png" alt="Logo" className="logo_ppal" />
              <span className="logo_letras">
                <span className="negrita">PORTA</span>CLOUD
              </span>
            </Navbar.Brand>
          </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                {user.role === "admin" && (
                  <Nav.Link className="nav-link" href="/admin">
                    <i className="fa-solid fa-user-shield"></i> Administración
                  </Nav.Link>
                )}
                <Nav.Link href="/guardados">
                  <i className="fa-solid fa-star"></i> Guardados
                </Nav.Link>
                <Nav.Link href="/ayuda">
                  <i className="fa-solid fa-circle-question"></i> Ayuda
                </Nav.Link>
                <div className="div_usuario mt-3">
                  <p className="fw-bold usuario_movil">
                    <i className="fa-solid fa-user"></i>&nbsp;&nbsp;
                    {user.username || "Cargando..."}
                  </p>
                  <Nav.Link href="/ajustes">
                    <i className="fa-solid fa-gear"></i> Ajustes
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout} className="text-danger">
                    <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
                  </Nav.Link>
                </div>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>
        </Container>
      </Navbar>

      {/* Navbar para escritorio */}
      <Navbar expand="lg" className="p-3 d-none d-lg-block">
        <Container fluid>
          <div className="boton_logo">
            <Navbar.Brand href="/dashboard">
              <img src="/logo.png" alt="Logo" className="logo_ppal" />
              <span className="logo_letras">
                <span className="negrita">PORTA</span>CLOUD
              </span>
            </Navbar.Brand>
          </div>
          <Nav className="me-auto">
            {user.role === "admin" && (
              <Nav.Link href="/admin">
                <i className="fa-solid fa-user-shield"></i> Administración
              </Nav.Link>
            )}
            <Nav.Link href="/guardados">
              <i className="fa-solid fa-star"></i> Guardados
            </Nav.Link>
            <Nav.Link href="/ayuda">
              <i className="fa-solid fa-circle-question"></i> Ayuda
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown className="usuario" title={<><i className="fa-solid fa-user"></i> {user.username}</>} id="user-dropdown" align="end">
              <NavDropdown.Item href="/ajustes">
                <i className="fa-solid fa-gear"></i> Ajustes
              </NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}
