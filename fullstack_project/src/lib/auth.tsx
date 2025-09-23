import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; mobile?: string; name?: string };

type AuthState = {
  user: User | null;
  token: string | null;
  signIn: (token: string, user?: User) => void;
  signOut: () => void;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t) setToken(t);
    if (u) {
      try { setUser(JSON.parse(u)); } catch {}
    }
  }, []);

  const signIn = (t: string, u?: User) => {
    localStorage.setItem("token", t);
    setToken(t);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
      setUser(u);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, signIn, signOut }), [user, token]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
