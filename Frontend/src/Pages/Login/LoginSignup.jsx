import React, { useState } from "react";
import { sendOtp, farmerLogin } from "../api/auth";
import { useNavigate } from "react-router-dom";
import "../Login.css";

export default function LoginSignup() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      const res = await farmerLogin({
        email: form.email,
        password: form.password,
      });

      // ✅ Save JWT token
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      setMessage("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  const handleSendOtp = async () => {
    try {
      await sendOtp({ ...form, role: "farmer", mode: "signup" });
      localStorage.setItem("pendingUser", JSON.stringify(form));
      setMessage("OTP sent to email!");
      navigate("/otp");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP");
    }
  };

  return (
    <div className={`main-container ${isSignup ? "signup-mode" : ""}`}>
      <div className="left-panel">
        {!isSignup ? (
          <div className="form-box login-form active">
            <h2>Login</h2>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" onChange={handleChange} />
            </div>
            <button className="b" onClick={handleLogin}>
              Login
            </button>
            <button
              className="form-toggle-btn signup-btn"
              onClick={() => setIsSignup(true)}
            >
              Signup
            </button>
            <p style={{ color: "red" }}>{message}</p>
          </div>
        ) : (
          <div className="form-box signup-form active">
            <h2>Signup</h2>
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input type="tel" name="phone" onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" onChange={handleChange} />
            </div>
            <button className="send-otp-btn" onClick={handleSendOtp}>
              Send OTP
            </button>
            <button
              className="form-toggle-btn login-btn"
              onClick={() => setIsSignup(false)}
            >
              Login
            </button>
            <p style={{ color: "red" }}>{message}</p>
          </div>
        )}
      </div>
      <div className="right-panel">
        <div className="image-box active">
          <img src="farmer.png" alt="Farmer" />
        </div>
      </div>
    </div>
  );
}
