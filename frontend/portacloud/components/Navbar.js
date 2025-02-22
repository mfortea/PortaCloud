"use client";

import React, { useEffect, useState } from "react";
import { Navbar, Nav, Offcanvas, Container } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function AppNavbar() {
  const [user, setUser] = useState(null);
  
  const router = useRouter();
    // Función para cerrar sesión
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
        localStorage.removeItem("token");
        localStorage.removeItem("deviceId");
        router.push("/login");
      });
    };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_IP;
    fetch(`${serverUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setUser(data);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  return (
    <>
      {/* Menú para móviles */}
      <Navbar bg="light" expand="lg" className="p-3 border-bottom d-lg-none">
        <Container fluid>
          <Navbar.Brand href="/">
            <img src="/logo.png" alt="Logo" style={{ height: "40px" }} /> PortaCloud
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="start"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">Menú</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                <Nav.Link href="#" className="fw-bold">
                  <i className="fa-solid fa-user"></i>&nbsp;
                  {user ? user.username : "Cargando..."}
                </Nav.Link>
                <Nav.Link href="/">Inicio</Nav.Link>
                <Nav.Link href="/guardados">Guardados</Nav.Link>
                <Nav.Link href="/ajustes">Ajustes</Nav.Link>
                <Nav.Link onClick={handleLogout} className="text-danger">Cerrar sesión</Nav.Link>
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
        <Navbar.Brand href="/" className="mb-4">
          <img src="/logo.png" alt="Logo" style={{ height: "40px" }} /> PortaCloud
        </Navbar.Brand>
        <Nav className="flex-column">
          <Nav.Link href="#" className="fw-bold">
            <i className="fa-solid fa-user"></i>&nbsp;&nbsp;
            {user ? user.username : "Cargando..."}
          </Nav.Link>
          <Nav.Link href="/"><i className="fa-solid fa-house"></i> Inicio</Nav.Link>
          <Nav.Link href="/guardados"><i className="fa-solid fa-star"></i> Guardados</Nav.Link>
          <Nav.Link href="/ajustes"><i className="fa-solid fa-gear"></i> Ajustes</Nav.Link>
          <Nav.Link onClick={handleLogout} className="text-danger"><i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión</Nav.Link>
        </Nav>
      </div>
    </>
  );
}