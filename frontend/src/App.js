import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataEntry from "./pages/DataEntry";
import HistoricalRecords from "./pages/HistoricalRecords";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatWidget from "./components/ChatWidget";

function NavbarVisibility() {
  const location = useLocation();
  return location.pathname !== "/login" ? <Navbar /> : null;
}

function App() {
  return (
    <Router>
      <NavbarVisibility />
      <Routes>
        <Route path="/login" element={<Login />} />{" "}
        <Route
          path="/"
          element={
            <PrivateRoute>
              {" "}
              <Dashboard />{" "}
            </PrivateRoute>
          }
        />{" "}
        <Route
          path="/data-entry"
          element={
            <PrivateRoute>
              {" "}
              <DataEntry />{" "}
            </PrivateRoute>
          }
        />{" "}
        <Route
          path="/historical-records"
          element={
            <PrivateRoute>
              {" "}
              <HistoricalRecords />{" "}
            </PrivateRoute>
          }
        />{" "}
      </Routes>{" "}
      <ChatWidget />
    </Router>
  );
}

export default App;
