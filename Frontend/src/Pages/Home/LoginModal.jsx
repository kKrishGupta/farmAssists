import React, { useState } from "react";
import { farmerLogin, farmerSignup, sendOtp } from "../../api/auth";

function LoginModal({ mode = "login", onClose }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false); // track OTP step
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!otpSent) {
          // Step 1: send OTP
          await sendOtp({
            email: form.email,
            phone: form.phone,
            name: form.name,
            password: form.password,
            role: "farmer",
          });
          alert("OTP sent to your email/phone. Enter it below.");
          setOtpSent(true);
        } else {
          // Step 2: complete signup with OTP
          await farmerSignup({
            email: form.email,
            phone: form.phone,
            name: form.name,
            password: form.password,
            otp: form.otp,
          });
          alert("Signup successful! You can now log in.");
          setOtpSent(false);
          onClose();
        }
      } else {
        // Login
        const res = await farmerLogin({
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{mode === "signup" ? "Farmer Sign Up" : "Farmer Login"}</h2>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {mode === "signup" && otpSent && (
            <input
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? otpSent
                ? "Complete Signup"
                : "Send OTP"
              : "Login"}
          </button>
        </form>

        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
