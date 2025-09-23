import React, { useState } from "react";
import "./SignInForm.css"; // Reuse CSS for consistent styling

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7}$/;

interface Props {
  onSwitch: () => void;
  onSubmit: (form: { mobile: string; password: string }) => void;
}

export default function SignUpForm({ onSwitch, onSubmit }: Props) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "");
    setMobile(input.slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setMessage("");
    onSubmit({ mobile, password });
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
        />
        <button type="submit" className="btn-primary">
          Sign Up
        </button>
        {message && <p className="message">{message}</p>}
        <div className="signup-link-container">
          <span>Already have an account? </span>
          <button type="button" className="signup-link" onClick={onSwitch}>
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
