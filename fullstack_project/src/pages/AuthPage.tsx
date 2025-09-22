import React, { useState } from 'react';
import SignInForm from '../components/forms/SignInForm';
import SignUpForm from '../components/forms/SignUpForm';

export default function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
        {showSignUp ? "Create your account" : "Sign In to your account"}
      </h2>
      {showSignUp ? (
        <SignUpForm onSwitch={() => setShowSignUp(false)} />
      ) : (
        <SignInForm onSwitch={() => setShowSignUp(true)} />
      )}
    </div>
  );
}
