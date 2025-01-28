import React, { useState, useEffect } from "react";
import {
  Container,
  Navbar,
  Nav,
  NavDropdown,
  Row,
  Col,
  Button,
  Image,
} from "react-bootstrap";
import "./Header.css";
import IIMAm from "./images/IIMAm.png";
import ABC from "./images/ABC.png";
import { useSelector, useDispatch } from "react-redux";
import { userActions } from "./actions/user.actions";
import { useNavigate, Link } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const signoutSession = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    dispatch(userActions.login({}));
    navigate("/");
  };

  const dispatch = useDispatch();
  const user = useSelector((state) => state.authentication.user);

  let initialsString = ""; // Initialize initialsString outside the condition

  if (user && user.full_name) {
    const words = user.full_name.split(" ");
    const initials = words.map((word) => word.charAt(0).toUpperCase());
    initialsString = initials.join("");
  }

  return (
    <div>
      <Navbar
        sticky="top"
        collapseOnSelect
        className="navbarBg"
        expand="lg"
        variant="dark"
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            <Image
              alt="IIMAm"
              src={IIMAm}
              width="80"
              className="d-inline-block align-top brandImage"
            />
          </Navbar.Brand>
          <Navbar.Brand as={Link} to="/">
            <Image
              alt="ABC"
              src={ABC}
              width="80"
              className="d-inline-block align-top brandImage"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto">
              {(() => {
                if (
                  typeof user !== "undefined" &&
                  typeof user.username !== "undefined"
                ) {
                  return (
                    <Nav.Link as={Link} to="/login" onClick={signoutSession}>
                      Sign Out
                    </Nav.Link>
                  );
                } else
                  return (
                    <Nav.Link as={Link} to="/login">
                      Login
                    </Nav.Link>
                  );
              })()}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
