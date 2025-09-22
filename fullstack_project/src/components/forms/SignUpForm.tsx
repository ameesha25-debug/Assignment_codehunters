import React, { useState } from "react";
import { api } from "../../lib/api";
import "./SignInForm.css";

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7}$/;

export default function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "");
    const trimmed = input.slice(0, 10);
    setMobile(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      setMessage("Mobile number must be exactly 10 digits");
      return;
    }

    if (!passwordRegex.test(password)) {
      setMessage(
        "Password must be exactly 7 characters, include one uppercase letter and one special symbol."
      );
      return;
    }

    try {
      const response = await api.registerUser(mobile, password);
      setMessage(response.message || "Registration successful");
    } catch (error: any) {
      setMessage(error.message || "An error occurred");
    }
  };

  return (
    <div className="signin-container">
      <form onSubmit={handleSubmit} className="signin-form">
        <label htmlFor="mobile">
          <b>Mobile Number</b>
        </label>
        <input
          id="mobile"
          type="tel"
          placeholder="Enter 10-digit mobile number"
          value={mobile}
          onChange={handleMobileChange}
          required
          pattern="\d{10}"
          title="Enter exactly 10 digits"
          autoComplete="tel"
        />
        <label htmlFor="password">
          <b>Password</b>
        </label>
        <input
          id="password"
          type="password"
          placeholder="7-character password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          maxLength={7}
          title="Password must be exactly 7 characters, include one uppercase and one special symbol"
          autoComplete="new-password"
        />
        <button type="submit" className="btn-primary">
          Sign Up
        </button>
        {message && <p className="message">{message}</p>}
        <div className="signup-link-container">
          <span>Already have an account? </span>
          <button
            type="button"
            className="signup-link"
            onClick={onSwitch}
            style={{
              background: "none",
              border: "none",
              color: "#6a67ce",
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
