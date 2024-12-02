import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function Layout() {
  const location = useLocation();
  const isLoginRoute = location.pathname === '/login';

  return (
    <div>
      {!isLoginRoute && (
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">Minha Loja</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/products">Produtos</Nav.Link>
                <Nav.Link as={Link} to="/categories">Categorias</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      <Container className="mt-3">
        <Outlet />
      </Container>
    </div>
  );
}