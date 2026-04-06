import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DataEntry from "./pages/DataEntry";
import HistoricalRecords from "./pages/HistoricalRecords";

import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";

import "bootstrap/dist/css/bootstrap.min.css";

function Layout() {
  const location = useLocation();

  const hiddenRoutes = ["/login", "/signup"];
  const hideComponents = hiddenRoutes.includes(location.pathname);

  return (
    <>
      {!hideComponents && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/data-entry"
          element={
            <PrivateRoute>
              <DataEntry />
            </PrivateRoute>
          }
        />

        <Route
          path="/historical-records"
          element={
            <PrivateRoute>
              <HistoricalRecords />
            </PrivateRoute>
          }
        />
      </Routes>

      {!hideComponents && <ChatWidget />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;