import React, { useState } from "react";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import netzero from "../assets/netzero.jpg"; // ✅ put image here

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="container-fluid h-100">
        <div className="row h-100 align-items-center">

          {/* LEFT SIDE: LOGIN CARD */}
          <div className="col-12 col-md-5 d-flex justify-content-center align-items-center">
            <div className="login-card p-5">
              <h2 className="mb-4 text-center">Login</h2>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <label className="form-label mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="form-control mb-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="form-label mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="form-control mb-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button type="submit" className="btn btn-success w-100 py-2">
                  Login
                </button>
                <p className="mt-3 text-center">
   Don’t have an account? <Link to="/signup">Signup</Link>
</p>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: IMAGE */}
          <div className="col-12 col-md-7 d-flex justify-content-center align-items-center">
            <img src={netzero} alt="Net Zero" className="login-image" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
