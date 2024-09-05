import React from "react";
import "./Navigation.css";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

export const Navigation = () => {
  return (
    <>
      <Navbar expand="lg" className="bg-warning fixed-top navbarContainer">
        <Container>
          <Navbar.Brand href="/">Foodie Delight</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Link to="/" className="px-3 nav-link">
                Home
              </Link>
              <Link to="/add-restaurant" className="px-3 nav-link">
                Add Restaurant
              </Link>
              <Link to="/add-menu" className="px-3 nav-link">
                Add Menu
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  );
};
export default Navigation;
