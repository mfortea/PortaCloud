"use client";

import React, { useState } from "react";
import { Navbar, Nav, Offcanvas, Container, NavDropdown, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Navbar para móviles*/}
      <Navbar expand="lg" className="p-3 d-lg-none">
        <Container fluid>
          <div className="boton_logo">
            <Navbar.Brand href="/dashboard" className="d-flex align-items-center gap-2">
              <img src="/logo.png" alt="Logo" className="logo_ppal m-0" />
              <span className="logo_letras m-0">
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
                <Navbar.Brand href="/dashboard" className="d-flex align-items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="logo_ppal m-0" />
                  <span className="logo_letras m-0">
                    <span className="negrita">PORTA</span>CLOUD
                  </span>
                </Navbar.Brand>
              </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column gap-1">
                <Nav.Link href="/dashboard" className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-gauge"></i> Dashboard
                </Nav.Link>
                {user.role === "admin" && (
                  <Nav.Link className="nav-link d-flex align-items-center gap-2" href="/admin">
                    <i className="fa-solid fa-user-shield"></i> Administración
                  </Nav.Link>
                )}
                <Nav.Link href="/guardados" className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-star"></i> Guardados
                </Nav.Link>
                <Nav.Link href="/ayuda" className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-question"></i> Ayuda
                </Nav.Link>
                
                <div className="div_usuario mt-4">
                  <p className="fw-bold usuario_movil d-flex align-items-center gap-2">
                    <i className="fa-solid fa-user"></i>
                    {user.username || "Cargando..."}
                  </p>
                  <Nav.Link href="/ajustes" className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-gear"></i> Ajustes
                  </Nav.Link>
                  <Nav.Link onClick={logout} className="text-danger d-flex align-items-center gap-2 mt-1">
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
            <Navbar.Brand href="/dashboard" className="d-flex align-items-center gap-2">
              <img src="/logo.png" alt="Logo" className="logo_ppal m-0" />
              <span className="logo_letras m-0">
                <span className="negrita">PORTA</span>CLOUD
              </span>
            </Navbar.Brand>
          </div>
          <Nav className="me-auto gap-2 ms-3">
            <Nav.Link href="/dashboard" className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-gauge"></i> Dashboard
            </Nav.Link>
            {user.role === "admin" && (
              <Nav.Link href="/admin" className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-user-shield"></i> Administración
              </Nav.Link>
            )}
            <Nav.Link href="/guardados" className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-star"></i> Guardados
            </Nav.Link>
            <Nav.Link href="/ayuda" className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-circle-question"></i> Ayuda
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown 
              className="usuario" 
              title={<span className="d-inline-flex align-items-center gap-2"><i className="fa-solid fa-user"></i> {user.username}</span>} 
              id="user-dropdown" 
              align="end"
            >
              <NavDropdown.Item href="/ajustes" className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-gear"></i> Ajustes
              </NavDropdown.Item>
              <NavDropdown.Item onClick={logout} className="text-danger d-flex align-items-center gap-2 mt-1">
                <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}