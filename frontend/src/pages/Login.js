import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login",{email,password});
      localStorage.setItem("token",res.data.token);
      navigate("/");
    } catch(err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return (
    <motion.div className="d-flex justify-content-center align-items-center vh-100"
      initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}>
      <form onSubmit={handleSubmit} className="p-4 rounded shadow" style={{minWidth:"300px",backgroundColor:"#f5f7fa"}}>
        <h2 className="mb-3 text-center">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <input type="email" placeholder="Email" className="form-control mb-3" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input type="password" placeholder="Password" className="form-control mb-3" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button type="submit" className="btn btn-success w-100">Login</button>
      </form>
    </motion.div>
  );
};

export default Login;
