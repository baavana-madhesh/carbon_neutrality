import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold" to="/">
          {" "}
          Carbon Tracker{" "}
        </NavLink>{" "}
        <button
          className="navbar-toggler"
          type="button"
          aria
          expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon"> </span>{" "}
        </button>{" "}
        <motion.div
          className={`collapse navbar-collapse ${open ? "show" : ""}`}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.28,
          }}
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to="/"
              >
                {" "}
                Dashboard{" "}
              </NavLink>{" "}
            </li>{" "}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to="/data-entry"
              >
                {" "}
                Data Entry{" "}
              </NavLink>{" "}
            </li>{" "}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to="/historical-records"
              >
                {" "}
                History{" "}
              </NavLink>{" "}
            </li>{" "}
            <li className="nav-item">
              <button className="btn btn-outline-danger ms-2" onClick={logout}>
                {" "}
                Logout{" "}
              </button>{" "}
            </li>{" "}
          </ul>{" "}
        </motion.div>{" "}
      </div>{" "}
    </nav>
  );
};

export default Navbar;
