import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "./login.css";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { userActions } from "./actions/user.actions";
import { useDispatch } from "react-redux";
import jwt from "jwt-decode";
import { useSelector } from "react-redux";

function Login() {
  const user = useSelector((state) => state.authentication.user);
  const location = useLocation();

  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleUserNameChange = (e) => {
    const { value } = e.target;
    setUsername(value);
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPassword(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitted(true);
    if (username && password) {
      login(username, password);
    }
  };

  // useEffect(() => {
  //   checkFormStatus();
  // }, []);

  async function login(username, password) {
    let formField = new FormData();

    const user = username.toString();
    const pass = password.toString();

    formField.append("username", user);
    formField.append("password", pass);

    await axios({
      method: "post",
      url: "/api/login/jwt-token/",
      data: formField,
    })
      .then((res) => {
        const user = jwt(String(res.data.access));
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(userActions.login(user));
        // checkFormStatus(user.user_id);
        navigate("/");
      })
      .catch((err) => {
        console.log("LoginError", err);
        setErrorMsg("Invalid User Name and Password");
      });
  }

  return (
    <div>
      <div className="login-box">
        <Container>
          <Row>
            <Col>
              <h2>Sign In</h2>
              <p className="loginTag">Login to access the world of Vyapaar</p>
              <Form onSubmit={handleSubmit}>
                <Form.Group
                  className={
                    "user-box" + (submitted && !username ? " has-error" : "")
                  }
                  controlId="formBasicEmail"
                >
                  <Form.Label className="customLabel">Email Id</Form.Label>
                  <Form.Control
                    name="username"
                    className="customInput"
                    placeholder="Username"
                    value={username}
                    onChange={handleUserNameChange}
                  />
                  {submitted && !username && (
                    <div className="help-block">Username is required</div>
                  )}
                </Form.Group>

                <Form.Group
                  className={
                    "user-box" + (submitted && !password ? " has-error" : "")
                  }
                  controlId="formBasicPassword"
                >
                  <Form.Label className="customLabel">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    className="customInput"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {submitted && !password && (
                    <div className="help-block">Password is required</div>
                  )}
                </Form.Group>
                <Row>
                  <Col>
                    <Button className="btn--outline" type="submit">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      Submit
                    </Button>
                  </Col>
                  <Col>
                    <Link to="/forgot-password">
                      <p className="signUpLinks">Forgot Password</p>
                    </Link>
                    <Link to="/register">
                      <p className="signUpLinks">New User? Register here</p>
                    </Link>
                  </Col>
                </Row>
                <div className="has-error">
                  <div className="help-block">{errorMsg}</div>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default Login;
