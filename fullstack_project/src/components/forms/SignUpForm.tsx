// components/forms/SignUpForm.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";

import { useNavigate } from "react-router-dom";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return setError(error.message);

    navigate("/");
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Sign Up</button>
    </form>
  );
}
