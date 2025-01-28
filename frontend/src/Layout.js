import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import "./Layout.css";
import { useCallback } from "react";

const Layout = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div>
      <div>
        <Header />
        <div className="layout">
          <div
            style={{
              minHeight: "100vh",
              paddingTop: "2vh",
            }}
          >
            <div style={{ position: "absolute", zIndex: "0" }}></div>
            <Outlet />
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
