import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import IIMAm from "./images/IIMAm.png";
import ABC from "./images/ABC.png";

const CountdownTimer = () => {
  const START_COUNT = 10000000;
  const DURATION = 480;
  const PASSCODE = "3086";
  const INTERVAL = 1000 / (START_COUNT / DURATION); // Time per decrement

  const [count, setCount] = useState(START_COUNT);
  const [input, setInput] = useState("");
  const [stopped, setStopped] = useState(false);
  const [incorrect, setincorrect] = useState("");
  const [src, setsrc] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (count > 0 && !stopped && started) {
      const interval = setInterval(() => {
        setCount((prevCount) => Math.max(0, prevCount - 1));
      }, INTERVAL);
      return () => clearInterval(interval);
    }
  }, [count, stopped, started]);

  useEffect(() => {
    if (started === true) {
      setincorrect(false);
    }
  }, [started]);

  useEffect(() => {
    if (incorrect === true) {
      setsrc(
        "https://www.youtube.com/embed/cvh0nX08nRw?autoplay=1&enablejsapi=0&iv_load_policy=3&modestbranding=1&showinfo=0&controls=0&loop=1"
      );
    } else if (incorrect === false) {
      setsrc(
        "https://www.youtube.com/embed/R8lHaEZYpCU?autoplay=1&enablejsapi=0&iv_load_policy=3&modestbranding=1&showinfo=0&controls=0&loop=1"
      );
    }
  }, [incorrect]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const checkPasscode = () => {
    if (input === PASSCODE) {
      setStopped(true);
      setincorrect(false);
    } else {
      setInput("");
      setincorrect(true);
    }
  };

  return (
    <div className="position-relative vh-100 overflow-hidden">
      <iframe
        className="position-absolute top-0 start-0 w-100 h-100"
        src={src}
        title="YouTube video background"
        frameBorder="0"
        allow="autoplay; fullscreen"
      ></iframe>

      <div
        className="position-relative d-flex flex-column align-items-center justify-content-center vh-100 text-center text-white"
        style={{ backgroundColor: "#3f4e0744", width: "100%" }}
      >
        <Row>
          <Col>
            <Image
              alt="IIMAm"
              src={IIMAm}
              width="80"
              className="d-inline-block align-top brandImage"
            />
            <Image
              alt="ABC"
              src={ABC}
              width="120"
              className="d-inline-block align-top brandImage"
            />
          </Col>
        </Row>
        <h1 className="mb-1">Money left in the Vault</h1>
        <h1 className="mb-4">${count}</h1>
        {!started && (
          <Button variant="success" onClick={() => setStarted(true)}>
            Start DecodeX
          </Button>
        )}
        {started && !stopped && (
          <Form className="mt-4">
            <Form.Group>
              <Form.Control
                type="password"
                placeholder="Enter passcode"
                value={input}
                onChange={handleInputChange}
                className="mb-2"
              />
            </Form.Group>
            <Button variant="primary" onClick={checkPasscode}>
              Decode
            </Button>
          </Form>
        )}
        {incorrect === false && (
          <div>
            <h4 style={{ color: "" }}>
              Be Careful, you might not like entering the wrong passcode!
            </h4>
          </div>
        )}
        {incorrect && (
          <div>
            <h4 style={{ color: "" }}>
              Enter the right passcode to stop the Rick Roll :p
            </h4>
          </div>
        )}
        {stopped && <h4>Vault Decoded!</h4>}
      </div>
    </div>
  );
};

export default CountdownTimer;
