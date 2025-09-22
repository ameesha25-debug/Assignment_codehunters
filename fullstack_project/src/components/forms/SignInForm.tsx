// components/forms/SignInForm.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input"; // ✅ update based on your project structure

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ Basic client-side validation
    if (!validateEmail(email)) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return setError(error.message);

    // ✅ You can optionally close modal/drawer here if needed
    // Or set some "isAuthenticated" state

    // Removed navigate("/") to prevent route change
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Sign In
      </button>
    </form>
  );
}
